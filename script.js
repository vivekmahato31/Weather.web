const apiKey = "730434b37d0227b78d93b3c43194acaa";
const apiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon img");
const weatherVideo = document.getElementById("weatherVideo");
const forecastContainer = document.querySelector('.forecast-container');

const unitToggle = document.getElementById("unitToggle");
let isFahrenheit = false;

const videos = {
  clear: "assets/videos/clear.mp4",
  clouds: "assets/videos/clouds.mp4",
  drizzle: "assets/videos/Drizzle.mp4",
  mist: "assets/videos/mist.mp4",
  rain: "assets/videos/rain.mp4",
  snow: "assets/videos/snow.mp4",
  thunderstorm: "assets/videos/Thunderstorm.mp4"
};

function getCondition(main) {
  main = main.toLowerCase();
  if (main.includes("cloud")) return "clouds";
  if (main.includes("rain")) return "rain";
  if (main.includes("snow")) return "snow";
  if (main.includes("thunderstorm")) return "thunderstorm";
  if (main.includes("drizzle")) return "drizzle";
  if (main.includes("mist") || main.includes("haze") || main.includes("fog")) return "mist";
  return "clear";
}

function convertTemp(temp) {
  return isFahrenheit ? (temp * 9) / 5 + 32 : temp;
}

async function checkWeatherCity(city) {
  const loader = document.querySelector('.loader');
  loader.style.display = "flex";

  const response = await fetch(apiUrl + `q=${city}&appid=${apiKey}`);
  if (response.status == 404) {
    loader.style.display = "none";
    alert("Invalid City Name");
  } else {
    const data = await response.json();
    showWeather(data);
    loader.style.display = "none";
  }
}

async function checkWeatherCoords(lat, lon) {
  const loader = document.querySelector('.loader');
  loader.style.display = "flex";

  const response = await fetch(apiUrl + `lat=${lat}&lon=${lon}&appid=${apiKey}`);
  const data = await response.json();
  showWeather(data);
  loader.style.display = "none";
}

function showWeather(data) {
  document.querySelector(".city").innerHTML = data.city.name;
  document.querySelector(".temp").innerHTML = Math.round(convertTemp(data.list[0].main.temp)) + (isFahrenheit ? "°F" : "°C");
  document.querySelector(".humidity").innerHTML = data.list[0].main.humidity + "%";
  document.querySelector(".wind").innerHTML = data.list[0].wind.speed + " km/h";
  document.querySelector(".weather-desc").innerHTML = data.list[0].weather[0].main;

  const condition = getCondition(data.list[0].weather[0].main);
  weatherIcon.src = `assets/images/${condition}.png`;
  weatherVideo.src = videos[condition];
  weatherVideo.play();

  forecastContainer.innerHTML = '';
  const usedDays = [];
  const today = new Date().getDate();

  for (let i = 0; i < data.list.length; i++) {
    const date = new Date(data.list[i].dt * 1000);
    const dayNum = date.getDate();
    const day = date.toLocaleDateString(undefined, { weekday: 'short' });
    if (dayNum !== today && !usedDays.includes(day)) {
      usedDays.push(day);
      const temp = convertTemp(data.list[i].main.temp);
      const condition = getCondition(data.list[i].weather[0].main);

      forecastContainer.innerHTML += `
        <div class="forecast-day">
          <img src="assets/images/${condition}.png" alt="icon" />
          <p>${day}</p>
          <p>${Math.round(temp)}${isFahrenheit ? "°F" : "°C"}</p>
        </div>
      `;
    }
    if (usedDays.length === 5) break;
  }

  document.querySelector(".weather").classList.add("active");
}

window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => checkWeatherCoords(pos.coords.latitude, pos.coords.longitude),
      () => console.log("User denied geolocation.")
    );
  }
};

searchBtn.addEventListener("click", () => {
  if (confirm("Use your current location? Click 'Cancel' to enter city.")) {
    navigator.geolocation.getCurrentPosition(
      pos => checkWeatherCoords(pos.coords.latitude, pos.coords.longitude),
      () => alert("Location access denied.")
    );
  } else {
    checkWeatherCity(searchBox.value);
  }
});

searchBox.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    checkWeatherCity(searchBox.value);
  }
});

const voiceBtn = document.getElementById("voiceBtn");
const listening = document.querySelector('.listening');
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

voiceBtn.addEventListener("click", () => {
  recognition.start();
  listening.style.display = "block";
});

recognition.onresult = (event) => {
  const city = event.results[0][0].transcript;
  searchBox.value = city;
  checkWeatherCity(city);
  listening.style.display = "none";
};

recognition.onend = () => {
  listening.style.display = "none";
};

const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("change", () => {
  document.documentElement.setAttribute("data-theme", themeToggle.checked ? "dark" : "light");
});

unitToggle.addEventListener("change", () => {
  isFahrenheit = unitToggle.checked;
  if (searchBox.value) {
    checkWeatherCity(searchBox.value);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => checkWeatherCoords(pos.coords.latitude, pos.coords.longitude)
    );
  }
});
