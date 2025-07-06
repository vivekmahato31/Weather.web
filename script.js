const apiKey = "730434b37d0227b78d93b3c43194acaa";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const voiceBtn = document.getElementById("voiceBtn");
const themeToggle = document.getElementById("themeToggle");
const weatherIcon = document.querySelector(".weather-icon img");
const weatherVideo = document.getElementById("weatherVideo");
const loader = document.getElementById("loader");
const weatherSection = document.querySelector(".weather");
const errorMsg = document.querySelector(".error-msg");
const forecastSection = document.querySelector(".forecast");

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

async function checkWeather(city) {
  loader.style.display = "flex";
  errorMsg.innerText = "";
  weatherSection.classList.remove("active");
  forecastSection.innerHTML = "";

  const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
  if (response.status == 404) {
    loader.style.display = "none";
    errorMsg.innerText = "City not found!";
  } else {
    const data = await response.json();
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
    document.querySelector(".weather-desc").innerHTML = data.weather[0].main;

    const condition = getCondition(data.weather[0].main);
    weatherIcon.src = `assets/images/${condition}.png`;
    weatherVideo.src = videos[condition];
    weatherVideo.play();

    weatherSection.classList.add("active");

   
    const forecastRes = await fetch(forecastUrl + city + `&appid=${apiKey}`);
    const forecastData = await forecastRes.json();
    const daily = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));
    daily.slice(0,5).forEach(day => {
      const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
      const temp = Math.round(day.main.temp) + "°C";
      forecastSection.innerHTML += `<div class="forecast-card">${date}<br>${temp}</div>`;
    });

    loader.style.display = "none";
  }
}

searchBtn.addEventListener("click", () => {
  checkWeather(searchBox.value);
});

searchBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    checkWeather(searchBox.value);
  }
});


if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const geoUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const res = await fetch(geoUrl);
    const data = await res.json();
    checkWeather(data.name);
  });
}


themeToggle.addEventListener("click", () => {
  document.documentElement.toggleAttribute("data-theme");
});


voiceBtn.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.onresult = (e) => {
    searchBox.value = e.results[0][0].transcript;
    checkWeather(searchBox.value);
  };
  recognition.start();
});


window.addEventListener("offline", () => {
  alert("You're offline. Weather cannot update.");
});
