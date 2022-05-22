const express = require("express");
const router = express.Router();
const { Storage } = require("@google-cloud/storage");
const speech = require("@google-cloud/speech");
const fs = require("fs");
const fsExtra = require("fs-extra");
const { exec } = require("child_process");
const multer = require("multer");
//CockroachDB
const Pool = require("pg").Pool;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const gcpStorage = new Storage({
  projectId: "sunlit-theory-351023",
  keyFilename: "./credentials/sunlit-theory-351023-08460d392cea.json",
});

const transcribeAudioAPI = async (audioName) => {
  const bucketURL = "gs://gryph-hack-2022-ee";

  const client = new speech.SpeechClient({
    projectId: "sunlit-theory-351023",
    keyFilename: "./credentials/sunlit-theory-351023-08460d392cea.json",
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

// ROUTE START HERE
router.post("/upload-video", upload.single("my-video"), async (req, res) => {
  const { user_id, session_name } = req.body;

  const bucketURL = "gs://gryph-hack-2022-ee";
  try {
    const results = await pool.query(
      "INSERT INTO sessions (user_id , name) VALUES ($1, $2)",
      [user_id, session_name]
    );

    console.log(results);
    /*
    // Uploading video to GCP bucket
    const uploadedBuffer = await fs.promises.readFile(req.file.path);

    const timestamp = Date.now();
    const newFileName = `${timestamp}-screen-record.mp4`;
    const writePath = __dirname + `/../uploads/${newFileName}`;

    await fs.promises.writeFile(writePath, uploadedBuffer, {});

    const audioName = `${timestamp}-audio.wav`;
    const outputAudioPath = __dirname + `/../uploads/${audioName}`;

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
    */
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res) => {
  const { user_id, session_name } = req.body;
  try {
    const results = await pool.query(
      "INSERT INTO sessions (user_id , name) VALUES ($1, $2)",
      [user_id, session_name]
    );

    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
});
module.exports = router;
