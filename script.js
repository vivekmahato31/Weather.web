const apiKey = "730434b37d0227b78d93b3c43194acaa";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon img");
const weatherVideo = document.getElementById("weatherVideo");
const forecastContainer = document.querySelector('.forecast-container');
const errorMessage = document.querySelector('.error-message');
const loader = document.querySelector('.loader');
const fullLoader = document.querySelector('.full-loader');

const unitToggle = document.getElementById("unitToggle");
let isFahrenheit = false;

const videos = {
  clear: "assets/videos/clear.mp4",
  clouds: "assets/videos/clouds.mp4",
  drizzle: "assets/videos/Drizzle.mp4",
  mist: "assets/videos/mist.mp4",
  rain: "assets/videos/rain.mp4",
  snow: "assets/videos/snow.mp4",
  thunderstorm: "assets/videos/Thunderstorm.mp4",
  night: "assets/videos/night.mp4"
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

function getUnitTemp(temp) {
  return isFahrenheit ? Math.round(temp * 9/5 + 32) + "°F" : Math.round(temp) + "°C";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function checkWeather(city) {
  loader.style.display = "flex";
  errorMessage.innerHTML = "";

  try {
    const weatherRes = await fetch(weatherApiUrl + city + `&appid=${apiKey}`);
    if (!weatherRes.ok) throw new Error("City not found");
    const weatherData = await weatherRes.json();

    const forecastRes = await fetch(forecastApiUrl + city + `&appid=${apiKey}`);
    if (!forecastRes.ok) throw new Error("City not found");
    const forecastData = await forecastRes.json();

    localStorage.setItem("lastCity", city);

    document.querySelector(".city").innerHTML = capitalize(weatherData.name);
    document.querySelector(".temp").innerHTML = getUnitTemp(weatherData.main.temp);
    document.querySelector(".humidity").innerHTML = weatherData.main.humidity + "%";
    document.querySelector(".wind").innerHTML = weatherData.wind.speed + " km/h";
    document.querySelector(".weather-desc").innerHTML = weatherData.weather[0].main;

    const condition = getCondition(weatherData.weather[0].main);
    const hour = new Date().getHours();
    weatherVideo.src = (hour >= 19 || hour <= 5) ? videos.night : videos[condition];
    weatherIcon.src = `assets/images/${condition}.png`;
    weatherVideo.play();

    forecastContainer.innerHTML = '';
    const usedDays = [];
    const today = new Date().toLocaleDateString(undefined, { weekday: 'short' });

    for (let i = 0; i < forecastData.list.length; i++) {
      const date = new Date(forecastData.list[i].dt * 1000);
      const day = date.toLocaleDateString(undefined, { weekday: 'short' });
      if (!usedDays.includes(day) && day !== today) {
        usedDays.push(day);
        const temp = forecastData.list[i].main.temp;
        const dayCondition = getCondition(forecastData.list[i].weather[0].main);
        forecastContainer.innerHTML += `
          <div class="forecast-day">
            <img src="assets/images/${dayCondition}.png" alt="icon" />
            <p>${day}</p>
            <p>${getUnitTemp(temp)}</p>
          </div>
        `;
      }
      if (usedDays.length === 5) break;
    }

    document.querySelector(".weather").classList.add("active");
  } catch (err) {
    errorMessage.innerHTML = "Invalid city name. Please try again!";
    document.querySelector(".weather").classList.remove("active");
  }
  loader.style.display = "none";
}

function getUserLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      const data = await response.json();
      checkWeather(data.name);
    }, () => {
      if (localStorage.getItem("lastCity")) {
        checkWeather(localStorage.getItem("lastCity"));
      }
    });
  } else {
    if (localStorage.getItem("lastCity")) {
      checkWeather(localStorage.getItem("lastCity"));
    }
  }
}

searchBtn.addEventListener("click", () => {
  checkWeather(searchBox.value);
});

searchBox.addEventListener("keypress", e => {
  if (e.key === "Enter") {
    checkWeather(searchBox.value);
  }
});

const voiceBtn = document.getElementById("voiceBtn");
const listening = document.querySelector('.listening');
const stopListeningBtn = document.getElementById("stopListening");
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

voiceBtn.addEventListener("click", () => {
  recognition.start();
  listening.style.display = "block";
});

stopListeningBtn?.addEventListener("click", () => {
  recognition.stop();
});

recognition.onresult = (event) => {
  const city = event.results[0][0].transcript;
  searchBox.value = city;
  checkWeather(city);
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
  if (localStorage.getItem("lastCity")) {
    checkWeather(localStorage.getItem("lastCity"));
  }
});

window.addEventListener("load", () => {
  fullLoader.style.display = "none";
  getUserLocation();
});
