const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
const port = 3001;

const baseUrl =
  "https://api.tomorrow.io/v4/weather/forecast?timezon=auto&location=";
const apiKeyURL = "&apikey=" + process.env.TOMORROW_API_KEY;

const googleLocationURL =
  "https://maps.googleapis.com/maps/api/geocode/json?latlng="; //40.714224,-73.961452
const googleAPIKey = "&key=" + process.env.GOOGLE_API_KEY;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/weather", (req, res) => {
  const city = req.query.city;
  const street = req.query.street;
  const state = req.query.state;

  const full_address = req.query.full_address;

  console.log(full_address);

  let fullURL = "";

  if (full_address) {
    fullURL = baseUrl + full_address + "&units=imperial" + apiKeyURL;
  } else {
    fullURL =
      baseUrl +
      street +
      "%20" +
      city +
      "%20" +
      state +
      "&units=imperial" +
      apiKeyURL;
  }

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

app.get("/location", (req, res) => {
  const latitude = req.query.lat;
  const longitude = req.query.lon;

  const googleURL =
    googleLocationURL + latitude + "," + longitude + googleAPIKey;

  fetch(googleURL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! code: ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      res.json(data.results[0].formatted_address);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message || "Internal Server Error" });
      console.error("Error fetching data: " + error);
    });
});

app.listen(port, () => {
  console.log(`Express server running on port: ${port}`);
});
