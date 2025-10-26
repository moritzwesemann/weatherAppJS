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
const checkbox = document.getElementById("check-box");

const todays_card = document.getElementById("todays-card");
const week_table = document.getElementById("week-table");
const table_header = document.getElementById("table-header");
const table_row = document.querySelector(".table-row");

checkbox.addEventListener("change", (e) => {
  const street_input = document.getElementById("street-input");
  const city_input = document.getElementById("city-input");
  const state_input = document.getElementById("state-input");

  if (checkbox.checked) {
    street_input.classList.add("disabled");
    city_input.classList.add("disabled");
    state_input.classList.add("disabled");
  } else {
    street_input.classList.remove("disabled");
    city_input.classList.remove("disabled");
    state_input.classList.remove("disabled");
  }
});

submit_btn.addEventListener("click", async (e) => {
  e.preventDefault();

  week_table.classList.add("hidden");
  todays_card.classList.add("hidden");
  week_table.replaceChildren(table_header);

  let geo_address = "";

  if (checkbox.checked) {
    if (navigator.geolocation) {
      try {
        const position = await getPosition();
        const { latitude, longitude } = position.coords;

        const url = `http://127.0.0.1:3001/location?lat=${encodeURIComponent(
          latitude
        )}&lon=${encodeURIComponent(longitude)}`;

        await fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error. Code: ${response.status}`);
            }

            return response.json();
          })
          .then((data) => {
            geo_address = data;
          })
          .catch((error) => {
            console.error(`Error trying to fetch the data: ${error}`);
          });
      } catch (error) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            console.error("The request to get user location timed out.");
            break;
          case error.UNKNOWN_ERROR:
            console.error("An unknown error occurred.");
            break;
        }
      }
    }
  }

  const street = document.getElementById("street-input").value;
  const city = document.getElementById("city-input").value;
  const state = document.getElementById("state-input").value;

  let url = "";

  if (
    (!street || !city || state === "Select your State") &&
    !checkbox.checked
  ) {
    console.log(
      "Bro you have to put in some stuff or check the auto detect button"
    );
    return;
  }

  if (checkbox.checked) {
    url = `http://127.0.0.1:3001/weather?full_address=${encodeURIComponent(
      geo_address
    )}`;
  } else {
    url = `http://127.0.0.1:3001/weather?street=${encodeURIComponent(
      street
    )}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
  }

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error. Code: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      updateUI(data);
    })
    .catch((error) => {
      console.error(`Error trying to fetch the data: ${error}`);
    });
});

clear_btn.addEventListener("click", (e) => {
  e.preventDefault;

  week_table.classList.add("hidden");
  todays_card.classList.add("hidden");

  const street = document.getElementById("street-input");
  const city = document.getElementById("city-input");
  const state = document.getElementById("state-input");

  city.value = "";
  street.value = "";
  state.selectIndex = 0;
  street.classList.remove("disabled");
  city.classList.remove("disabled");
  state.classList.remove("disabled");
  checkbox.checked = false;
});

function updateUI(data) {
  const todays_temp = document.getElementById("todays-temp");
  const todays_humidity = document.getElementById("todays_humidity");
  const todays_pressure = document.getElementById("todays_pressure");
  const todays_wind = document.getElementById("todays_wind");
  const todays_visbility = document.getElementById("todays_visbility");
  const todays_cloud = document.getElementById("todays_cloud");
  const todays_uv = document.getElementById("todays_uv");
  const todays_location = document
    .getElementById("todays-card")
    .querySelector("h1");
  const todays_weather_symbole = document.getElementById(
    "todays-weather-symbole"
  );
  const todays_weather_code = document.getElementById("todays-weather-text");

  const {
    timelines: { daily, hourly, minutley },
  } = data;
  const today = daily[0];

  todays_temp.textContent =
    String(Math.round(today.values.temperatureMax)) + "°";
  todays_humidity.textContent = String(today.values.humidityAvg) + "%";
  todays_pressure.textContent =
    String(today.values.pressureSeaLevelAvg) + "inHg";
  todays_wind.textContent = String(today.values.windSpeedAvg) + "mph";
  todays_visbility.textContent = String(today.values.visibilityAvg) + "mi";
  todays_cloud.textContent = String(today.values.cloudCoverAvg) + "%";
  todays_uv.textContent = String(today.values.uvIndexAvg);
  todays_location.textContent = String(data.location.name)
    .split(",")
    .slice(0, 2)
    .join(",");

  todays_weather_code.textContent =
    WEATHER_CODE_MAP[today.values.weatherCodeMax];
  todays_weather_symbole.src =
    "/Images/weather_symbols/" + WEATHER_ICON_MAP[today.values.weatherCodeMax];

  //Cloning the table row and implementing it for each day we get

  for (const day of daily) {
    const isoDate = new Date(day.time);
    const date = isoDate.toLocaleDateString();
    const temp_high = day.values.temperatureMax;
    const temp_low = day.values.temperatureMin;
    const wind = day.values.windSpeedAvg;
    const weather_code = day.values.weatherCodeMax;

    const row_clone = table_row.cloneNode(true);

    const ps = row_clone.querySelectorAll("p");
    const img = row_clone.querySelector("img");

    ps[0].textContent = date;
    ps[1].textContent = WEATHER_CODE_MAP[weather_code];
    ps[2].textContent = temp_high;
    ps[3].textContent = temp_low;
    ps[4].textContent = wind;

    img.src = "/Images/weather_symbols/" + WEATHER_ICON_MAP[weather_code];

    row_clone.classList.remove("hidden");

    week_table.appendChild(row_clone);
  }
  week_table.classList.remove("hidden");
  todays_card.classList.remove("hidden");
}

function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
