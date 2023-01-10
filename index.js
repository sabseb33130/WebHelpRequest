//imports;
const express = require("express");
require("dotenv").config();

const { Client } = require("pg");

const app = express();
const port = 8000;
const client = new Client({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

client.connect();

app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000 ");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});

// routes

app.get("/api/tickets", async (req, res) => {
  try {
    const data = await client.query("SELECT * from tickets ");

    data.rowCount >= 1
      ? res
          .status(200)
          .json({ status: "200 - Success", data: { post: data.rows } })
      : res.status(200).json({
          status: "200 - Success",
          data: "Pas de données de saisie pour l'instant",
        });
  } catch (err) {
    if (err.severity == "ERREUR") {
      res.status(404).json({ status: "404 - Error - Not Found", data: null });
    } else {
      res.status(500).json({
        status: "500 - Fail - Internal Server Error",
        data: data.rows,
      });
    }
  }
});
app.get("/api/tickets/:id", async (req, res) => {
  const id = req.params.id;
  const data = await client.query("SELECT * FROM tickets where id = $1 ", [id]);

  try {
    data.rowCount === 1
      ? res
          .status(200)
          .json({ status: "200 - Success", data: { post: data.rows } })
      : err;
  } catch (err) {
    if (id !== data.rows.id) {
      res.status(400).json({
        status: "400 - Error",
        data: "Bad Request - Veuillez vérifier votre ID",
      });
    } else {
      res.status(500).json({
        status: "500 - Fail - Internal Server Error",
        data: { post: "Problème de connection" },
      });
    }
  }
});
app.post("/api/tickets", async (req, res) => {
  const message = req.body.message;
  const data = await client.query(
    "INSERT INTO tickets (message) VALUES ($1) Returning * ",
    [message]
  );

  if (message === message.toString()) {
    res.status(201).json({ status: "201 - Create", data: { post: data.rows } });
  } else {
    res.status(400).json({
      status: "400 - Fail -Bad Request ",
      data: "Format des données non pris en charge",
    });
  }
});

app.put("/api/tickets/:id", async (req, res) => {
  const id = req.params.id;
  const message = req.body.message;

  const data = await client.query(
    "UPDATE tickets SET (message,done) = ($2,true) WHERE id = $1 returning *",
    [id, message]
  );

  if (data.rowCount === 1) {
    res
      .status(200)
      .json({ status: "200 - Modified", data: { post: data.rows } });
  } else {
    if (data.rowCount === 0) {
      res.status(404).json({
        status: "404 - Error - Not Found",
        data: null + " Ticket inexistant",
      });
    } else {
      res.status(500).json({
        status: "500 - Fail - Internal Server Error",
        data: data.rows,
      });
    }
  }
});

app.delete("/api/tickets/:id", async (req, res) => {
  const id = req.params.id;

  const data = await client.query(
    "DELETE FROM tickets WHERE id = $1 returning *",
    [id]
  );

  if (data.rowCount === 1) {
    res.status(200).json({ status: "200 - Deleted", data: data.rows });
  } else {
    if (data.rowCount === 0) {
      res.status(404).json({ status: "404 - Not Found", data: null });
    } else {
      res
        .status(500)
        .json({ status: "500 - Fail - Internal Server Error", data: null });
    }
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
