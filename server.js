require("dotenv").config();
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const app = express();
const bodyParse = require("body-parser");
const users = require("./routers/users");
const sessions = require("./routers/sessions");

//MiddleWare
app.use(bodyParse.urlencoded({ extended: true }));
app.use(bodyParse.json());
app.use(morgan("dev"));
app.use(cors());
app.use("/sessions", sessions);
app.use(cors());
app.use("/users", users);

// HELLo
app.use(cors());
app.get("/", (req, res) => {
  res.status(200).send({ msg: "Hello" });
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Running Server at " + port));
