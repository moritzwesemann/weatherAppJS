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

        todays_temp.textContent = String(today.values.temperatureMaxqI) + "°";
        todays_humidity.textContent = String(today.values.humidityAvg) + "%";
        todays_pressure.textContent =
          String(today.values.pressureSeaLevelAvg) + "hPa";
        todays_wind.textContent = String(today.values.windSpeedAvg) + "m/s";
        todays_visbility.textContent =
          String(today.values.visibilityAvg) + "km";
        todays_cloud.textContent = String(today.values.visibilityAvg) + "%";
        todays_uv.textContent = String(today.values.uvIndexAvg);

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
