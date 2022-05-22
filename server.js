require("dotenv").config();
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const app = express();
const bodyParse = require("body-parser");
const users = require("./routers/users");
const sessions = require("./routers/sessions");
const fs = require("fs");
//MiddleWare
app.use(cors());
app.use(bodyParse.urlencoded({ extended: true }));
app.use(bodyParse.json());
app.use(morgan("dev"));

//START  RUNNING MANUAL SQL
/*
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
*/

//END RUNNING MANUAL SQL

app.use("/sessions", sessions);
app.use("/users", users);

app.get("/", (req, res) => {
  res.status(200).send({ msg: "Hello" });
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Running Server at " + port));
