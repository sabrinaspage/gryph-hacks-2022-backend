require("dotenv").config();
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const multer = require("multer");
const app = express();
const bodyParse = require("body-parser");
const users = require("./routers/users");
const { Storage } = require("@google-cloud/storage");
const speech = require("@google-cloud/speech");
const fs = require("fs");
const fsExtra = require("fs-extra");
const { exec } = require("child_process");

//MiddleWare
app.use(cors());
app.use(bodyParse.urlencoded({ extended: true }));
app.use(bodyParse.json());
app.use(morgan("dev"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Creates a client
const gcpStorage = new Storage({
  projectId: "sunlit-theory-351023",
  keyFilename: "sunlit-theory-351023-08460d392cea.json",
});

app.post("/upload-video-test", upload.single("my-blob"), async (req, res) => {
  const data = req.body;
  console.log(data);
});

const transcribeAudioAPI = async (audioName) => {
  const bucketURL = "gs://gryph-hack-2022-ee";

  const client = new speech.SpeechClient({
    projectId: "sunlit-theory-351023",
    keyFilename: "sunlit-theory-351023-08460d392cea.json",
  });

  const encoding = "LINEAR16";
  const languageCode = "en-US";

  const config = {
    enableWordTimeOffsets: true,
    encoding: encoding,
    languageCode: languageCode,
  };

  const audio = {
    uri: bucketURL + "/" + audioName,
  };

  const request = {
    config: config,
    audio: audio,
  };

  const [operation] = await client.longRunningRecognize(request);

  console.log("Getting results ...");

  // Get a Promise representation of the final result of the job
  const [response] = await operation.promise();
  response.results.forEach((result) => {
    console.log(`Transcription: ${result.alternatives[0].transcript}`);
    result.alternatives[0].words.forEach((wordInfo) => {
      const startSecs =
        `${wordInfo.startTime.seconds}` +
        "." +
        wordInfo.startTime.nanos / 100000000;
      const endSecs =
        `${wordInfo.endTime.seconds}` +
        "." +
        wordInfo.endTime.nanos / 100000000;
      console.log(`Word: ${wordInfo.word}`);
      console.log(`\t ${startSecs} secs - ${endSecs} secs`);
    });
  });

  // Clear temp upload files
  fsExtra.emptyDirSync("uploads");
};

app.post("/upload-video", upload.single("my-video"), async (req, res) => {
  const bucketURL = "gs://gryph-hack-2022-ee";
  try {
    // Uploading video to GCP bucket
    const uploadedBuffer = await fs.promises.readFile(req.file.path);

    const timestamp = Date.now();
    const newFileName = `${timestamp}-screen-record.mp4`;
    const writePath = __dirname + `\\uploads\\${newFileName}`;

    await fs.promises.writeFile(writePath, uploadedBuffer, {});

    const audioName = `${timestamp}-audio.wav`;
    const outputAudioPath = __dirname + `\\uploads\\${audioName}`;

    await gcpStorage.bucket(bucketURL).upload(writePath, {
      destination: newFileName,
    });

    exec(`ffmpeg -i ${writePath} -ac 1 ${outputAudioPath}`, async (error) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      } else {
        await gcpStorage.bucket(bucketURL).upload(outputAudioPath, {
          destination: audioName,
        });
        // Creates a speech client to transcribe timestamp
        await transcribeAudioAPI(audioName);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

//START  RUNNING MANUAL SQL

const Pool = require("pg").Pool;

var queries = fs
  .readFileSync("./database/schema.sql")
  .toString()
  .replace(/(\r\n|\n|\r)/gm, " ") // remove newlines
  .replace(/\s+/g, " ") // excess white space
  .split(";") // split into all statements
  .map(Function.prototype.call, String.prototype.trim)
  .filter(function (el) {
    return el.length != 0;
  });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
(async () => {
  queries.forEach(async (sql) => {
    const res = await pool.query(sql);
    //console.log(res.rows[0].message); // Hello world!
  });
})();

//END RUNNING MANUAL SQL

app.use("/users", users);

app.get("/", (req, res) => {
  res.status(200).send({ msg: "Hello" });
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Running Server at " + port));
