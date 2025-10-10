// ===================== GET USER PREFERENCES =====================
// Get saved weather units from localStorage (if user has set them)
let weatherUnits = JSON.parse(localStorage.getItem("weatherUnits"));
let {precipitation, temperature, windSpeed} = weatherUnits;

// Get saved selected day (if user has chosen a day for hourly forecast)
let theDay = localStorage.getItem("day");

// Default coordinates and city name in case the user hasn't selected anything yet
let latitude = 30.06263; // Default latitude (Cairo)
let longitude = 31.24967; // Default longitude (Cairo)
let cityName = "Cairo, Egypt"; // Default city name

// ===================== WEATHER ICONS MAPPING =====================
// Map weather codes from Open-Meteo API to local icon images
const weatherIcons = {
    "0": "../assests/weather_icons/Clear-sunny.png",
    "1": "../assests/weather_icons/Partly Cloudy.png",
    "2": "../assests/weather_icons/Partly Cloudy.png",
    "3": "../assests/weather_icons/Overcast.png",
    "45": "../assests/weather_icons/Fog.png",
    "48": "../assests/weather_icons/Fog.png",
    "51": "../assests/weather_icons/Drizzle.png",
    "53": "../assests/weather_icons/Drizzle.png",
    "55": "../assests/weather_icons/Drizzle.png",
    "56": "../assests/weather_icons/Drizzle.png",
    "57": "../assests/weather_icons/Drizzle.png",
    "61": "../assests/weather_icons/Rain.png",
    "63": "../assests/weather_icons/Rain.png",
    "65": "../assests/weather_icons/Rain.png",
    "66": "../assests/weather_icons/Rain.png",
    "67": "../assests/weather_icons/Rain.png",
    "80": "../assests/weather_icons/Rain.png",
    "81": "../assests/weather_icons/Rain.png",
    "82": "../assests/weather_icons/Rain.png",
    "71": "../assests/weather_icons/Snow.png",
    "73": "../assests/weather_icons/Snow.png",
    "75": "../assests/weather_icons/Snow.png",
    "77": "../assests/weather_icons/Snow.png",
    "85": "../assests/weather_icons/Snow.png",
    "86": "../assests/weather_icons/Snow.png",
    "95": "../assests/weather_icons/Snow.png",
    "96": "../assests/weather_icons/Snow.png",
    "99": "../assests/weather_icons/Snow.png"
};

// ===================== GET DOM ELEMENTS =====================
// Weather info elements
const theLocation = document.querySelector(".location .city");
const date = document.querySelector(".location .date");
const weatherInfoIcon = document.querySelector(".weather__info .temperature img");
const weatherInfoTem = document.querySelector(".weather__info .temperature span");

// Weather details elements
const feelsLike = document.querySelector(".weather__details .feels__like h3");
const humidity = document.querySelector(".weather__details .humidity h3");
const wind = document.querySelector(".weather__details .wind h3");
const precipitationItem = document.querySelector(".weather__details .precipitation h3");

// Daily forecast elements
const dailyForecast = document.querySelectorAll(".daily__forecast .week .day .temperature > span");
const dailyForecastImgs = document.querySelectorAll(".daily__forecast .week .day img");

// Hourly forecast elements
const hourlyForecast = document.querySelector(".cards__container");

// ========================== SELECT DOM ELEMENTS FOR AUTOCOMPLETE ==========================
const searchInp = document.querySelector("#search-input"); // City input field
const suggtions = document.querySelector(".suggutions__container"); // Container for suggestions
const suggtionsList = document.querySelector(".suggutions__container .list"); // UL where suggestions will be added

// ========================== FETCH CITY DATA ==========================
// Function to fetch city data from Open-Meteo Geocoding API
async function getCity() {
    let city = searchInp.value.trim().toLowerCase(); // Get input value, trim spaces and convert to lowercase
    let encodedQuery = encodeURIComponent(city); // Encode city name for URL
    let respones = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodedQuery}`);
    let data = await respones.json(); // Convert response to JSON
    return data || []; // Return data or empty array if nothing is returned
}

// ========================== AUTOCOMPLETE SUGGESTIONS ==========================
searchInp.addEventListener("input", async () => {
    let data = await getCity(); // Fetch city data
    suggtions.classList.add("showSug"); // Show suggestions container
    suggtionsList.innerHTML = ""; // Clear previous suggestions

    if (data.results && data.results.length > 0) { // If there are results
        let cities = data.results.slice(0,5); // Take the first 5 results
        cities.forEach(ci => {
            const li = document.createElement("li"); // Create a new list item
            li.innerHTML = `${ci.name}, ${ci.country}`; // Set text content
            li.classList.add("sugItem")

            // Click event to select this city
            li.addEventListener("click", () => {
                suggtions.classList.remove("showSug"); // Hide suggestions
                searchInp.value = li.innerHTML; // Update input
                cityName = li.innerHTML; // Update cityName variable

                // Save selected city and coordinates to localStorage
                localStorage.setItem("cityName", li.innerHTML);
                localStorage.setItem("longitude", ci.longitude);
                localStorage.setItem("latitude", ci.latitude);
            });

            suggtionsList.appendChild(li); // Append list item to container
        });
    } else { 
        // If no results found, show a message
        const li = document.createElement("li");
        li.textContent = "No results found!";
        li.style.pointerEvents = "none"; // Prevent clicking
        suggtionsList.appendChild(li);
    }
});

// ========================== HIDE SUGGESTIONS WHEN CLICKING OUTSIDE ==========================
document.addEventListener("click", () => {
    if(event.target != suggtions) {
        suggtions.classList.remove("showSug"); // Hide suggestions container
    }
});

// ========================== LOAD USER PREFERENCES FROM LOCALSTORAGE ==========================
if (localStorage.getItem("longitude") && localStorage.getItem("latitude") && localStorage.getItem("cityName")) {
    latitude = Number(localStorage.getItem("latitude")); // Convert stored string to number
    longitude = Number(localStorage.getItem("longitude")); // Convert stored string to number
    cityName = localStorage.getItem("cityName"); // Load city name
} else {
    localStorage.setItem("longitude", longitude);
    localStorage.setItem("latitude", latitude);
    localStorage.setItem("cityName", cityName);
}

// ======================================= SET INFORMATION ========================================= //
let url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,weathercode,apparent_temperature,precipitation,cloud_cover,wind_speed_10m&precipitation_unit=${precipitation}&temperature_unit=${temperature}&windspeed_unit=${windSpeed}&&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`;
let resDate, resTemperature, resWeatherCode, resFeelsLike, resWind, resPrecipitation;

async function setInfo() {
    let respone = await fetch(url);
    let data = await respone.json();
    console.log(data)
    // ====== set weather info ===== //
    // set location and date
    theLocation.innerHTML = cityName;
    resDate = new Date(data.current_weather.time);
    let dayName = resDate.toLocaleDateString("en-US",{weekday: "long"});
    let month = resDate.toLocaleDateString("en-US",{month: "short"});
    let dayNum = resDate.getDate().toString();
    let year = resDate.getFullYear().toString();

    let fullDate = `${dayName}, ${month} ${dayNum}, ${year}`;
    
    date.innerHTML = fullDate

    // set temperature and weather icon
    weatherInfoTem.innerHTML = `${data.current_weather.temperature}${data.current_weather_units.temperature}`;
    weatherInfoIcon.src = weatherIcons[data.current_weather.weathercode];

    // ====== set weather details ====== //
    // set feels like now
    let now = new Date().toISOString().slice(0, 13) + ":00"; // مثال: "2025-10-09T13:00"
    let index = data.hourly.time.indexOf(now);

    feelsLike.innerHTML = data.hourly.apparent_temperature[index] + data.hourly_units.apparent_temperature;

    // set humidity now
    humidity.innerHTML = data.hourly.relative_humidity_2m[index] + data.hourly_units.relative_humidity_2m;

    // set wind speed now
    wind.innerHTML = data.hourly.wind_speed_10m[index] + data.hourly_units.wind_speed_10m;

    // set precipitation now
    precipitationItem.innerHTML = data.hourly.precipitation[index] + data.hourly_units.precipitation;

    // ====== set weather daily ====== //
    dailyForecast.forEach((day,index) => {
        let max = data.daily.temperature_2m_max[index];
        let min = data.daily.temperature_2m_min[index];
        day.innerHTML = Math.floor((max+min) / 2) + data.current_weather_units.temperature;

    })
    dailyForecastImgs.forEach((img,index) => {
        img.src = weatherIcons[data.daily.weathercode[index]]
    })

    // ====== set hourly forecast ===== //
    // get the day date in yyy-mm-dd
    let dayOfTheWeeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    let today = new Date();
    let todayIndex = today.getDay();

    let targetDay = localStorage.getItem("day");
    let targetDayIndex = dayOfTheWeeek.indexOf(targetDay);

    let diff = (targetDayIndex - todayIndex + 7) % 7;

    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);

    // تحويل للتنسيق YYYY-MM-DD
    const formattedDate = targetDate.toISOString().slice(0,10);

    let temperature = [];
    let weathercode = [];

    let time = data.hourly.time.filter(it => it.includes(formattedDate)).map((it, ind) => {
        temperature.push(data.hourly.temperature_2m[data.hourly.time.indexOf(it)]);
        weathercode.push(data.hourly.weathercode[data.hourly.time.indexOf(it)]);
        let hours = it.split("T")[1].split(":")[0];
        let period = +hours >= 12 ? "PM" : "AM"; // Determine AM or PM
        hours = +hours % 12 || 12;
        return `${hours}${period}`
    })

    hourlyForecast.innerHTML = ""
    time.forEach((date,i) => {
        const card = document.createElement("div");
        card.classList.add("card");

        const hourly = document.createElement("div");
        hourly.classList.add("hourly");

        const img = document.createElement("img");
        img.src = weatherIcons[weathercode[i]];
        
        const timeSpan = document.createElement("span");
        timeSpan.innerHTML = date;

        hourly.appendChild(img);
        hourly.appendChild(timeSpan);

        const tempSpan = document.createElement("span");
        tempSpan.innerHTML = temperature[i] + data.current_weather_units.temperature;
        tempSpan.classList.add("temperature");

        card.appendChild(hourly);
        card.appendChild(tempSpan);

        hourlyForecast.appendChild(card)
    })
    console.log(time)
}

const searchBtn = document.querySelector("#search-city");
searchBtn.addEventListener("click",async()=>{
    let respones = await getCity();
    // update data
    latitude = respones.results[0].latitude;
    longitude = respones.results[0].longitude;
    url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,weathercode,apparent_temperature,precipitation,cloud_cover,wind_speed_10m&precipitation_unit=${precipitation}&temperature_unit=${temperature}&windspeed_unit=${windSpeed}&&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`;

    setInfo()
})

setInfo()