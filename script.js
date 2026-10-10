var data = {
    transport: {
        label:"Transport",
        unit: "km",
        activities: {
            walk: {label:"Walk", co2PerUnit:0},
            bike: {label: "Bicycle", co2PerUnit:0},
            bus: {label: "Bus", co2PerUnit: 0.10},
            train: {label: "Train", co2PerUnit: 0.04},
            motorbike: {label: "Motorbike", co2PerUnit: 0.12},
            car: {label: "car", co2PerUnit: 0.21},
        }
    },
    food: {
        label: "food",
        unit: "meals",
        activities:{
            vegan:{label:"Vegan meal", co2PerUnit: 1.5},
            vegetarian:{label: "Vegetarian meal", co2PerUnit: 2.5},
            fish:{label:"Fish", co2PerUnit: 3.5},
            chicken:{label:"Chicken", co2PerUnit:5.0},
            beef:{label:"Beef", co2PerUnit:15.0},
        }
    },
    energy:{
        label:"Home energy",
        unit: "kWh",
        activities:{
            electricity: {label: "Electricity", co2PerUnit: 0.45},
        }
    }
}
var categorySelect = document.getElementById("category");
var activitySelect = document.getElementById("activity");
var logForm = document.getElementById("log-form");
var dateInput= document.getElementById("date");
var activitylist = document.getElementById("activity-list");
var todaydisplay = document.getElementById(".summary .card:nth-child(1) .big");
var totaldisplay = document.getElementById(".summary .card:nth-child(2) .big");

var entries = [];

dateInput.valueAsDate = new Date();

function fillcategories(){
    categorySelect.innerHTML = "";

    for (var key in data) {
    var option = document.createElement("option");
    option.value = key;
    option.textContent = data[key].label;
    categorySelect.appendChild(option);
    }
    fillActivities();
}

function fillActivities(){
    var selectedCategory = categorySelect.value;
    activitySelect.innerHTML = "";

    if (selectedCategory && data[selectedCategory]){
        var activities = data[selectedCategory].activities;
        for (var actKey in activities){
            var option = document.createElement("option");
            option.value = actKey;
            option.textContent = activities[actkey].label;
            activitySelect.appendChild(option);
        }
    }
}
function updateSummary(){
    var todayStr = new Date().toISOstring().split('T')[0];
    var todayTotal = 0;
    var allTotal = 0;

    for(var i = 0; i<entries.length; i++) {
        allTotal += entries[i].co2Total;
        if (entries[i].date === todayStr){
            todayTotal += entries[i].co2Total;
        }
    }
    todaydisplay.textContent = todayTotal.toFixed(2) + "kg CO2";
    totaldisplay.textContent = allTotal.toFixed(2) + "kg CO2";
}
function renderEntities(){
    activitylist.innerHTML ="";
    if (entries.length ===0){
        activitylist.innerHTML = '<p style="color:grey;">No activities logged yet.</p>';
        return;
    }
    for (var i =0; i<entries.length; i++){
        var entry =entries[i];
        var li = document.createElement("li");
        li.style.padding = "8px 0";
        li.style.borderBottom = "1px solid #eee";
        var categoryLabel = data[entry.category].label;
        var activityLabel = data[entry.category].activities[entry.activity].label;
        var unit = data[entry.category].unit;
        li.textContent = `${entry.date}: ${categoryLabel}-${activitylabel} (${entry.amount} ${unit}) -> ${entry.co2Total.toFixed(2)} kgCO2`;
        activityList.appendChild(li);
    }
    updateSummary();
}
categorySelect.addEventListener("submit",function(e) {e.preventDefault()});
    var category = categorySelect.value;
    var activity = activitySelect.value;
    var amount = parseFloat(document.getElementById("amount").value);

    var co2PerUnit = data[category].activities[activity].co2PerUnit;
    var co2Total = amount * co2PerUnit;

    var newEntry = {
        category: category,
        activity: activity,
        amount: amount,
        date: dateInputa.value,
        co2Total: co2Total,
    };
    entries.push(newEntry);
    renderEntities();
    document.getElementById("amount").value = 1;
fillcategories();