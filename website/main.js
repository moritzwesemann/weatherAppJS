const WEATHER_CODE_MAP = {
  0: "Unknown",
  1000: "Clear, Sunny",
  1100: "Mostly Clear",
  1101: "Partly Cloudy",
  1102: "Mostly Cloudy",
  1001: "Cloudy",
  2000: "Fog",
  2100: "Light Fog",
  4000: "Drizzle",
  4001: "Rain",
  4200: "Light Rain",
  4201: "Heavy Rain",
  5000: "Snow",
  5001: "Flurries",
  5100: "Light Snow",
  5101: "Heavy Snow",
  6000: "Freezing Drizzle",
  6001: "Freezing Rain",
  6200: "Light Freezing Rain",
  6201: "Heavy Freezing Rain",
  7000: "Ice Pellets",
  7101: "Heavy Ice Pellets",
  7102: "Light Ice Pellets",
  8000: "Thunderstorm",
};

const WEATHER_ICON_MAP = {
  0: "cloudy.svg", // fallback for Unknown
  1000: "clear_day.svg",
  1100: "mostly_clear_day.svg",
  1101: "partly_cloudy_day.svg",
  1102: "mostly_cloudy.svg",
  1001: "cloudy.svg",
  2000: "fog.svg",
  2100: "fog_light.svg",
  4000: "drizzle.svg",
  4001: "rain.svg",
  4200: "rain_light.svg",
  4201: "rain_heavy.svg",
  5000: "snow.svg",
  5001: "flurries.svg",
  5100: "snow_light.svg",
  5101: "snow_heavy.svg",
  6000: "freezing_drizzle.svg",
  6001: "freezing_rain.svg",
  6200: "freezing_rain_light.svg",
  6201: "freezing_rain_heavy.svg",
  7000: "ice_pellets.svg",
  7101: "ice_pellets_heavy.svg",
  7102: "ice_pellets_light.svg",
  8000: "tstorm.svg",

  // If you later include wind codes (Tomorrow.io 3000–3002), you can use:
  // 3000: "light_wind.jpg",
  // 3001: "wind.png",
  // 3002: "strong-wind.png",
};

const submit_btn = document.getElementById("submit-button");
const clear_btn = document.getElementById("clear-button");

submit_btn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("submit button pressed!");
  const street = document.getElementById("street-input").value;
  const city = document.getElementById("city-input").value;
  const state = document.getElementById("state-input").value;

  const todays_temp = document.getElementById("todays-temp");
  const todays_humidity = document.getElementById("todays_humidity");
  const todays_pressure = document.getElementById("todays_pressure");
  const todays_wind = document.getElementById("todays_wind");
  const todays_visbility = document.getElementById("todays_visbility");
  const todays_cloud = document.getElementById("todays_cloud");
  const todays_uv = document.getElementById("todays_uv");

  const todays_weather_symbole = document.getElementById(
    "todays-weather-symbole"
  );

  const todays_weather_code = document.getElementById("todays-weather-text");

  if (!street || !city || state === "Select your State") {
    console.log(
      "Bro you have to put in some stuff or check the auto detect button"
    );
  } else {
    const url = `http://127.0.0.1:3001/weather?street=${encodeURIComponent(
      street
    )}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;

    console.log(url);
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error. Code: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        const {
          timelines: { daily, hourly, minutley },
        } = data;
        console.log(data);
        console.log(daily);
        const today = daily[0];
        console.log(today);

        todays_temp.textContent =
          String(Math.round(today.values.temperatureMax)) + "°";
        todays_humidity.textContent = String(today.values.humidityAvg) + "%";
        todays_pressure.textContent =
          String(today.values.pressureSeaLevelAvg) + "hPa";
        todays_wind.textContent = String(today.values.windSpeedAvg) + "m/s";
        todays_visbility.textContent =
          String(today.values.visibilityAvg) + "km";
        todays_cloud.textContent = String(today.values.cloudCoverAvg) + "%";
        todays_uv.textContent = String(today.values.uvIndexAvg);

        todays_weather_code.textContent =
          WEATHER_CODE_MAP[today.values.weatherCodeMax];
        todays_weather_symbole.src =
          "/Images/weather_symbols/" +
          WEATHER_ICON_MAP[today.values.weatherCodeMax];

        console.log(todays_temp.value);
      })
      .catch((error) => {
        console.error(`Error trying to fetch the data: ${error}`);
      });
  }
});

clear_btn.addEventListener("click", (e) => {
  e.preventDefault;
  console.log("clear button pressed!");

  const street = document.getElementById("street-input");
  const city = document.getElementById("city-input");
  const state = document.getElementById("state-input");

  city.value = "";
  street.value = "";
  state.selectIndex = 0;
});
