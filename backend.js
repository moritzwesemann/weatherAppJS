const express = require("express");
const cors = require("cors");
require("dotenv").config();

const apiKey = process.env.TOMORROW_API_KEY;
const app = express();
app.use(cors());
const port = 3001;

const baseUrl = "https://api.tomorrow.io/v4/weather/forecast?location=";

const apiKeyURL = "&apikey=" + apiKey;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/weather", (req, res) => {
  const city = req.query.city;
  const street = req.query.street;
  const state = req.query.state;

  const fullURL = baseUrl + street + "%20" + city + "%20" + state + apiKeyURL;

  fetch(fullURL)
    .then((response) => {
      //catches normal http errors
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      console.log("Fetched data:" + data);
      res.json(data);
    })
    //catches all other errors. even something like json parsing or so on
    .catch((error) => {
      res.status(500).json({ error: error.message || "Internal Server Error" });
      console.error("Error fetching data: " + error);
    });
});

app.listen(port, () => {
  console.log(`Express server running on port: ${port}`);
});
