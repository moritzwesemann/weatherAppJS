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

const tempchart_element = document.getElementById("highcharts");
const metegoram_element = document.getElementById("meteogram");

let temp_chart = [];

let hourly_data = [];

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

  const dd_section = document.getElementById("daily-details-section");

  week_table.classList.add("hidden");
  todays_card.classList.add("hidden");
  week_table.replaceChildren(table_header);
  dd_section.classList.add("hidden");

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
    console.log(url);
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
      temp_chart = prepDataTempChart(data);
      hourly_data = data.timelines.hourly;
      generateTempChart();
      renderMeteogram();
    })
    .catch((error) => {
      console.error(`Error trying to fetch the data: ${error}`);
    });
});

clear_btn.addEventListener("click", (e) => {
  e.preventDefault;

  const dd_section = document.getElementById("daily-details-section");

  week_table.classList.add("hidden");
  todays_card.classList.add("hidden");
  dd_section.classList.add("hidden");
  tempchart_element.classList.add("hidden");
  metegoram_element.classList.add("hidden");

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
    const date = day.time;
    const temp_high = day.values.temperatureMax;
    const temp_low = day.values.temperatureMin;
    const wind = day.values.windSpeedAvg;
    const weather_code = day.values.weatherCodeMax;

    const row_clone = table_row.cloneNode(true);

    const ps = row_clone.querySelectorAll("p");
    const img = row_clone.querySelector("img");

    ps[0].textContent = date_transfomer(date);
    ps[1].textContent = WEATHER_CODE_MAP[weather_code];
    ps[2].textContent = temp_high;
    ps[3].textContent = temp_low;
    ps[4].textContent = wind;

    img.src = "/Images/weather_symbols/" + WEATHER_ICON_MAP[weather_code];

    row_clone.addEventListener("click", () => {
      table_row_click(day);
    });

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

function table_row_click(data) {
  const todays_card = document.getElementById("todays-card");
  const week_table = document.getElementById("week-table");
  const dd_section = document.getElementById("daily-details-section");

  console.log(data);

  todays_card.classList.add("hidden");
  week_table.classList.add("hidden");
  dd_section.classList.remove("hidden");

  const top_card_ps = document
    .getElementById("dd-card-top")
    .querySelectorAll("p");
  const top_card_img = document
    .getElementById("dd-card-top")
    .querySelector("img");

  const bottom_card_spans = document
    .getElementById("dd-card-bottom")
    .querySelectorAll("span");

  top_card_ps[0].textContent = date_transfomer(data.time);
  top_card_ps[1].textContent = WEATHER_CODE_MAP[data.values.weatherCodeMax];
  top_card_ps[2].textContent =
    data.values.temperatureMax + "°F/" + data.values.temperatureMin + "°F";

  top_card_img.src =
    "/Images/weather_symbols/" + WEATHER_ICON_MAP[data.values.weatherCodeMax];

  bottom_card_spans[0].innerHTML =
    data.values.rainAccumulationSum === 0
      ? "N/A"
      : data.values.rainAccumulationSum;
  bottom_card_spans[1].innerHTML =
    data.values.precipitationProbabilityMax + "%";
  bottom_card_spans[2].innerHTML = data.values.windSpeedMax + "mph";
  bottom_card_spans[3].innerHTML = data.values.humidityAvg + "%";
  bottom_card_spans[4].innerHTML = data.values.visibilityMax + "mi";
  bottom_card_spans[5].innerHTML =
    formatHourAmPm(data.values.sunriseTime) +
    "/" +
    formatHourAmPm(data.values.sunsetTime);

  wireArrowToggle();

  wireBackButton();
}

function date_transfomer(isoString, timeZone) {
  const d = new Date(isoString);
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(timeZone ? { timeZone } : {}),
  }).formatToParts(d);

  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${byType.weekday}, ${byType.day} ${byType.month}, ${byType.year}`;
}

function formatHourAmPm(isoString, timeZone) {
  const d = new Date(isoString);

  const options = {
    hour: "numeric",
    hour12: true,
    ...(timeZone ? { timeZone } : {}),
  };

  const formatted = new Intl.DateTimeFormat("en-US", options).format(d);

  return formatted.replace(" ", "");
}

function toDateString(datetime) {
  if (!datetime) return "";
  return datetime.split("T")[0];
}

function prepDataTempChart(data) {
  const {
    timelines: { daily },
  } = data;

  let dates = [];
  let tempMin = [];
  let tempMax = [];

  for (const el of daily) {
    dates.push(toDateString(el.time));
    tempMin.push(el.values.temperatureMin);
    tempMax.push(el.values.temperatureMax);
  }

  let final_array = dates.map((_, i) => [dates[i], tempMin[i], tempMax[i]]);

  console.log(final_array);

  return dates.map((_, i) => [dates[i], tempMin[i], tempMax[i]]);
}

const highcharts_container = document.getElementById("highcharts");

function generateTempChart() {
  const chart = Highcharts.chart(highcharts_container, {
    chart: {
      type: "arearange",
      zooming: {
        type: "x",
      },
      scrollablePlotArea: {
        minWidth: 600,
        scrollPositionX: 1,
      },
    },
    title: {
      text: "Temperature Ranges (Min, Max)",
      align: "center",
    },
    xAxis: {
      type: "datetime",
      accessibility: {
        rangeDescription: "Range: Jan 1st 2023 to Jan 1st 2024.",
      },
    },
    yAxis: {
      title: {
        text: null,
      },
    },
    tooltip: {
      fixed: false,
      crosshairs: true,
      shared: true,
      valueSuffix: "°F",
      xDateFormat: "%A, %b %e",
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      arearange: {
        marker: {
          enabled: true, // show a dot at every point (not just on hover)
          radius: 3,
          symbol: "circle",
          fillColor: "#57acf8", // blue fill
          lineColor: "#FFFFFF", // blue outline
          lineWidth: 1,
        },
      },
    },
    series: [
      {
        name: "Temperatures",
        data: temp_chart,
        color: {
          linearGradient: {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 1,
          },
          stops: [
            [0, "#f6aa2b"],
            [1, "#cce8fc"],
          ],
        },
      },
    ],
  });
}

// simple-meteogram.js
// If you load Highcharts via <script> tags in HTML, Highcharts is global.
// If you're bundling (Vite/Webpack), see Option B for imports.

// --- REQUIRED ONLY IF YOU BUNDLE AND IMPORT MODULES ---
// import Highcharts from 'highcharts';
// import Windbarb from 'highcharts/modules/windbarb';
// Windbarb(Highcharts);

// Shapes Highcharts expects:
// temperatures: [{ x: msSinceEpoch, y: number }, ...]
// precipitations: [{ x: msSinceEpoch, y: number }, ...]
// winds: [{ x: msSinceEpoch, value: speedMps, direction: degCWFromNorth }, ...]

function createMeteogram(
  { temperatures, precipitations, winds, pressure },
  containerId = "container"
) {
  const options = {
    chart: {
      renderTo: containerId,
      height: 320,
      marginRight: 40,
      marginBottom: 60,
      plotBorderWidth: 1,
    },
    title: { text: "Hourly Meteogram" },
    legend: { enabled: false },
    tooltip: { shared: true },
    xAxis: {
      type: "datetime",
      tickLength: 0,
      gridLineWidth: 1,
      offset: 0,
      labels: {
        y: 35,
      },
    },
    yAxis: [
      {
        // Temperature (left)
        title: { text: null },
        labels: { format: "{value}°" },
        gridLineColor: "rgba(128,128,128,0.1)",
      },
      {
        // Precip (right)
        title: { text: null },
        labels: { enabled: false },
        min: 0,
        opposite: true,
        gridLineWidth: 0,
      },
      {
        // Air pressure
        allowDecimals: false,
        title: {
          // Title on top of axis
          text: "inHg",
          offset: 0,
          align: "high",
          rotation: 0,
          style: {
            color: "#FFB000",
          },
          textAlign: "left",
          x: 3,
        },
        labels: {
          style: {
            fontSize: "8px",
            color: "#FFB000",
          },
          y: 2,
          x: 3,
        },
        gridLineWidth: 0,
        opposite: true,
        showLastLabel: false,
      },
    ],
    plotOptions: {
      series: { pointPlacement: "between", turboThreshold: 0 },
    },
    series: [
      {
        name: "Temperature",
        type: "spline",
        data: temperatures,
        marker: { enabled: false },
        tooltip: { valueSuffix: " °F" },
        zIndex: 2,
        color: "#E63946",
      },
      {
        name: "Air pressure",
        dashStyle: "shortdot",
        data: pressure,
        marker: { enabled: false },
        tooltip: { valueSuffix: " inHg" },
        zIndex: 2,
        color: "#FFB000",
        yAxis: 2,
      },
      {
        name: "Precipitation",
        type: "column",
        data: precipitations,
        yAxis: 1,
        tooltip: { valueSuffix: " mm" },
        groupPadding: 0,
        pointPadding: 0,
        zIndex: 1,
      },
      {
        name: "Wind",
        type: "windbarb",
        data: winds,
        yOffset: 12,
        vectorLength: 14,
        lineWidth: 1,
        tooltip: { valueSuffix: " m/s" },
        zIndex: 1,
        color: "#205fb9ff",
      },
    ],
  };

  return new Highcharts.Chart(options);
}

function renderMeteogram() {
  console.log(hourly_data);

  const times = [];
  const temp = [];
  const percipi = [];

  const press = [];

  const wind_d = [];
  const wind_s = [];

  for (const i in hourly_data) {
    times.push(Date.parse(hourly_data[i].time) - 7 * 60 * 60 * 1000);
    temp.push(Math.round(hourly_data[i].values.temperature));
    percipi.push(hourly_data[i].values.precipitationProbability);
    wind_d.push(Math.round(hourly_data[i].values.windDirection));
    wind_s.push(Math.round(hourly_data[i].values.windSpeed));
    press.push(hourly_data[i].values.pressureSeaLevel);
  }

  const temperatures = times.map((x, i) => ({ x, y: temp[i] }));
  const precipitations = times.map((x, i) => ({ x, y: percipi[i] }));
  const pressure = times.map((x, i) => ({ x, y: press[i] }));

  const winds = times.map((x, i) => ({
    x,
    value: wind_s[i],
    direction: wind_d[i],
  }));

  const t = (h) =>
    Date.parse(`2025-10-27T${String(h).padStart(2, "0")}:00:00Z`);

  createMeteogram(
    { temperatures, precipitations, winds, pressure },
    "meteogram"
  );
}

function wireArrowToggle() {
  const arrow = document.getElementById("arrow-toggle");
  if (!arrow || arrow.dataset.toggleWired) return; // avoid duplicates

  arrow.dataset.toggleWired = "true";
  arrow.addEventListener("click", (event) => {
    const el = event.currentTarget;
    const isDown = el.src.endsWith("point-down-512.png");

    el.src = isDown ? "/Images/point-up-512.png" : "/Images/point-down-512.png";

    tempchart_element.classList.toggle("hidden", !isDown);
    metegoram_element.classList.toggle("hidden", !isDown);

    if (isDown) {
      tempchart_element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function wireBackButton() {
  const back_button = document.getElementById("back-button");
  if (!back_button || back_button.dataset.toggleWired) return;
  back_button.dataset.toggleWired = "true";
  const dd_sec = document.getElementById("daily-details-section");

  back_button.addEventListener("click", (event) => {
    tempchart_element.classList.add("hidden");
    metegoram_element.classList.add("hidden");
    todays_card.classList.remove("hidden");
    week_table.classList.remove("hidden");
    dd_sec.classList.add("hidden");
  });
}
