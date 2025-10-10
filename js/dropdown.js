// ================= SHOW THE LIST FUNCTION ================= //
const toggleListBtn = document.querySelector(".toggleList");
const unitsList = document.querySelector(".units .list");

function showDropDown(list,toggle) {
    toggle.addEventListener("click",()=>{
        list.classList.toggle("showOptions");
    });
    document.addEventListener("click",(e)=>{
        if (!toggle.contains(e.target) && !list.contains(e.target)) {
            list.classList.remove("showOptions");
        }
    });
    document.addEventListener("keydown",(e)=> {
        if(e.key === "Escape") list.classList.remove("showOptions");
    })
}

showDropDown(unitsList,toggleListBtn);

// ================= PUT THE DATA TO LOCALSTORGE ================= //
// Default weather units object
let weatherUnit = {
    temperature: "celsius",
    windSpeed: "kmh",
    precipitation: "mm",
};

// Select all unit options for temperature, wind speed, and precipitation
const tempItems = document.querySelectorAll(".temperature .item");
const windItems = document.querySelectorAll(".wind__speed .item");
const precItems = document.querySelectorAll(".precipitation .item");

// Set initial active values based on the element that already has the "active" class
document.querySelectorAll(".item.active").forEach(item => {
    weatherUnit[item.dataset.type] = item.dataset.unit;
});

// Function to handle option activation and update weatherUnit
function activateOptions(nodeList) {
    nodeList.forEach(item => {
        item.addEventListener("click", () => {
            // Remove "active" from all items in this group
            nodeList.forEach(it => it.classList.remove("active"));
            // Add "active" to the clicked item
            item.classList.add("active");

            // Get type (temperature, windSpeed, precipitation) and unit from dataset
            const type = item.dataset.type;   
            const unit = item.dataset.unit;   
            // Update weatherUnit object
            weatherUnit[type] = unit;

            // Re-check and update all active items (in case multiple groups are changed)
            document.querySelectorAll(".item.active").forEach(item => {
                weatherUnit[item.dataset.type] = item.dataset.unit;
            });

            // Save current selection in localStorage
            localStorage.setItem("weatherUnits", JSON.stringify(weatherUnit))
        });
    });
}
if(!localStorage.getItem("weatherUnits")) {
    // set defults settings if user didn't choose anything
    localStorage.setItem("weatherUnits", JSON.stringify(weatherUnit))
}

// Activate functionality for all groups
activateOptions(tempItems);
activateOptions(windItems);
activateOptions(precItems);

// ================= LOAD DATA FROM LOCALSTORAGE ================= //
const savedUnits = JSON.parse(localStorage.getItem("weatherUnits"));
if (savedUnits) {
    weatherUnit = savedUnits;

    // Update the UI to reflect saved units
    document.querySelectorAll(".item").forEach(item => {
        const type = item.dataset.type;
        const unit = item.dataset.unit;

        if (weatherUnit[type] === unit) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

// ============== HOURLY FORECAST DROPDOWN =============== //
const hourlyToggleList = document.querySelector(".choose__day .toggleList");
const hourlyDropDown = document.querySelector(" .choose__day .list");
const hourlyDropDownOptions = document.querySelectorAll(".choose__day .list li");
const hourlyHeadDay = document.querySelector(".hourly__forecast .toggleList .day");

showDropDown(hourlyDropDown,hourlyToggleList);

let day = "Tuesday";

hourlyDropDownOptions.forEach(it => {
    it.addEventListener("click",()=>{
        hourlyDropDownOptions.forEach(it => it.classList.remove("active"));
        it.classList.add("active");
        hourlyHeadDay.innerHTML = it.innerHTML;

        day = it.innerHTML;
        localStorage.setItem("day",day);
    })
})

if(localStorage.getItem("day")) {
    day = localStorage.getItem("day");

    hourlyDropDownOptions.forEach(opt => {
        if(opt.dataset.day === day) {
            hourlyDropDownOptions.forEach(opt => opt.classList.remove("active"));
            opt.classList.add("active");
            hourlyHeadDay.innerHTML = opt.innerHTML
        }
    })
}

if(!localStorage.getItem("day")) {
    localStorage.setItem("day", day);
}