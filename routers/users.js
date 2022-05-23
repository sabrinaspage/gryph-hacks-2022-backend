const express = require("express");
const router = express.Router();

//CockroachDB
const Pool = require("pg").Pool;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// User ROUTE
router.get("/", (req, res) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

router.get("/:id", (req, res) => {
  pool.query(
    "SELECT * FROM users WHERE id = $1",
    [req.params.id],
    (error, results) => {
      if (error) {
        throw error;
      }
      console.log(results);
      res.status(200).send(results.rows);
    }
  );
});

//s
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  pool.query(
    "SELECT * FROM users WHERE email = $1 AND password = $2",
    [email || "", password || ""],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows && results.rows.length > 0) {
        res.status(200).send(results.rows[0]);
      } else {
        res.status(404).send({ error: "Invalid email or password" });
      }
    }
  );
});

router.post("/", (req, res) => {
  const { name, email, password, type } = req.body;

  pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email || ""],
    (error, results) => {
      if (error) {
        throw error;
      }

      if (results.rows && results.rows.length > 0) {
        res.status(404).send({
          error: "Email already exists",
        });
      } else {
        pool.query(
          "INSERT INTO users (name, email, password, type) VALUES ($1, $2, $3, $4)",
          [name || "", email || "", password || "", type || ""],
          (error, results) => {
            if (error) {
              throw error;
            }
            res.status(201).send(results);
          }
        );
      }
    }
  );

  /*
  pool.query(
    "INSERT INTO users (name, email, password, type) VALUES ($1, $2, $3, $4)",
    [name, email, password, type],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(201).send(results);
    }
  );
  */
});

router.get("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).send(`User deleted with ID: ${id}`);
  });
});

module.exports = router;
