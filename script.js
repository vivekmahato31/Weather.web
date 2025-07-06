const apiKey = "730434b37d0227b78d93b3c43194acaa";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button:nth-of-type(1)");
const voiceBtn = document.getElementById("voiceBtn");
const weatherIcon = document.querySelector(".weather-icon img");
const weatherVideo = document.getElementById("weatherVideo");
const loader = document.querySelector(".loader");
const themeToggle = document.getElementById("themeToggle");
const listening = document.querySelector(".listening");

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
  const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
  if (response.status == 404) {
    alert("Invalid City Name");
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
    document.querySelector(".weather").classList.add("active");
  }
  loader.style.display = "none";
}

searchBtn.addEventListener("click", () => {
  if (searchBox.value.trim() !== "") checkWeather(searchBox.value);
});

searchBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && searchBox.value.trim() !== "") checkWeather(searchBox.value);
});

if (!themeToggle.checked) {
  document.documentElement.removeAttribute("data-theme");
}

themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
});

voiceBtn.addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    listening.style.display = "block";
    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      searchBox.value = transcript;
      checkWeather(transcript);
      listening.style.display = "none";
    };
    recognition.onend = function () {
      listening.style.display = "none";
    };
  } else {
    alert("Speech Recognition not supported in this browser.");
  }
});
