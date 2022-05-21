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
  const id = parseInt(req.params.id);

  pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

router.post("/", (req, res) => {
  const { name, email, password, type } = req.body;

  pool.query(
    "INSERT INTO users (name, email, password, type) VALUES ($1, $2, $3, $4)",
    [name, email, password, type],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(201).send(`User added with ID: ${results.insertId}`);
    }
  );
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
