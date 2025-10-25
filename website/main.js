const submit_btn = document.getElementById("submit-button");
const clear_btn = document.getElementById("clear-button");

submit_btn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("submit button pressed!");
  const street = document.getElementById("street-input").value;
  const city = document.getElementById("city-input").value;
  const state = document.getElementById("state-input").value;

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
        console.log(data);
      })
      .catch((error) => {
        console.error(`Error trying to fetch the data: ${error}`);
      });
  }
});

clear_btn.addEventListener("click", (e) => {
  e.preventDefault;
  console.log("clear button pressed!");
});
