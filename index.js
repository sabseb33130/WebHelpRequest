//imports;
const express = require("express");
require("dotenv").config();

const { Client } = require("pg");

//declarations;
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
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000 ");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middlew
  next();
  console.log(res.statusCode);
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
    res.status(400).json({ status: "400 - Error", data: "Bad Request" });
    res
      .status(500)
      .json({ status: "500 - Fail - Internal Server Error", data: data.rows });
  }
});
app.get("/api/tickets/:id", async (req, res) => {
  const id = req.params.id;
  console.log(parseInt(id));
  const data = await client.query("SELECT * FROM tickets where id = $1 ", [id]);
  if (data.rowCount === 1) {
    res
      .status(200)
      .json({ status: "200 - Success", data: { post: data.rows } });
  } else {
    res.status(400).json({ status: "400 - Error", data: "Bad Request" });
    res.status(500).json({
      status: "500 - Fail - Internal Server Error",
      data: { post: data.rows },
    });
  }
});
app.post("/api/tickets", async (req, res) => {
  try {
    const message = req.body.message;
    const data = await client.query(
      "INSERT INTO tickets (message) VALUES ($1) Returning * ",
      [message]
    );

    res.status(201).json({ status: "201 - Create", data: { post: data.rows } });
  } catch (err) {
    res.status(404).json({ status: "404 - Fail -Not Found", data: data.rows });
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
      .status(201)
      .json({ status: "201 - Modified", data: { post: data.rows } });
  } else {
    res.status(404).json({ status: "404 - Not Found", data: data.rows });
    res
      .status(500)
      .json({ status: "500 - Fail - Internal Server Error", data: data.rows });
  }
});

app.delete("/api/tickets/:id", async (req, res) => {
  const id = req.params.id;

  const data = await client.query(
    "DELETE FROM tickets WHERE id = $1 returning *",
    [id]
  );

  if (data.rows.length === 1) {
    //console.log(dato.rows);
    res.status(200).json({ status: "204 - Deleted", data: id });
  } else {
    res.status(404).json({ status: "404 - Not Found", data: null });
    res
      .status(500)
      .json({ status: "500 - Fail - Internal Server Error", data: null });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
