//const Pool = require("pg").Pool;
//const { Client } = require("pg");
//var fs = require("fs");
require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const app = express();
const bodyParse = require("body-parser");
const users = require("./routers/users");

//MiddleWare
app.use(bodyParse.urlencoded({ extended: false }));
app.use(bodyParse.json());
app.use(morgan("dev"));

/*
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

//Prevent CORS And Allow PUT,POST,DELETE,PATCH,GET
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"),
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, PATCH, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/users", users);

app.get("/", (req, res) => {
  res.status(200).send({ msg: "Hello" });
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Running Server at " + port));
