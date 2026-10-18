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
var todaydisplay = document.querySelector(".summary .card:nth-child(1) .big");
var totaldisplay = document.querySelector(".summary .card:nth-child(2) .big");
var clearBtn = document.getElementById("clear-btn");
var historyFilter = document.getElementById("")

var entries = [];

var savedEntries = localStorage.getItem("carbonEntries");
if (savedEntries) {
    entries = JSON.parse(savedEntries);
}

dateInput.valueAsDate = new Date();

function fillCategories(){
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
            option.textContent = activities[actKey].label;
            activitySelect.appendChild(option);
        }
    }
}
function updateSummary(){
    var todayStr = new Date().toISOString().split('T')[0];
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
    var selectedFilter = historyFilter ? historyFilter.value: "all";
    var filteredEntries = []
    for (var k=0; k < entries.length; k++){
        if (selectedFilter === "all" || entries[k].category === selectedFilter){
            filteredEntries.push({ entry: entries[k], originalIndex: k});
        }
    }
    if (filteredEntries.length === 0){
        activitylist.innerHTML = `<p style="color:grey;"> No matching activities found.<p>`;
        updateSummary();
        renderCustomChart();
        updateBudgetCheck();
        updatestreak();
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
        li.textContent = `${entry.date}: ${categoryLabel}-${activityLabel} (${entry.amount} ${unit}) -> ${entry.co2Total.toFixed(2)} kgCO2`;
        activitylist.appendChild(li);
    }
    updateSummary();
    renderCustomChart();
    updateBudgetCheck();
    updatestreak();
}
if (historyFilter){
    historyFilter.addEventListener("change",function(){
        renderEntities();
    });
}
var budgetInput = document.getElementById("budget-input");
var budgetStatus = document.getElementById("budget-status");
var savedBudget = localStorage.getItem("carbonBudget");
if (savedBudget && budgetInput){
    budgetInput.value = savedBudget;
}
updateBudgetCheck();
function updateBudgetCheck(){
    if (!budgetInput || !budgetStatus) return;
    var maxBudget = parseFloat(budgetInput.value) || 50;
    var totalEmissions = 0;
    for(var i =0; i<entries.length; i++){
        totalEmissions += entries[i].co2Total;
    }
    if(totalEmissions >maxBudget){
        budgetStatus.textContent = `⚠️ You are over budget by ${(totalEmissions - maxBudget).toFixed(1)} kg CO2`;
        budgetStatus.style.color = "#f73232";
    } else {
        budgetStatus.textContent = `✅ You are within your budget! ${(maxBudget - totalEmissions).toFixed(1)} kg remaining)`;
        budgetStatus.style.color = "#43c947";
    }
}
if (budgetInput){
    budgetInput.addEventListener("input",function(){
        localStorage.setItem("carbonBudget", budgetInput.value);
        updateBudgetCheck();
    });
}
var streakDisplay = document.getElementById("streak-display");
function updatestreak(){
    if (!streakDisplay) return;
    if (entries.length === 0){
        streakDisplay.textContent = "0 days 🔥";
        return;
    }

    var uniqueDates = [];
    for (var i = 0; i<entries.length; i++){
        var d = entries[i].date;
        if (uniqueDates.indexOf(d)=== -1){
            uniqueDates.push(d);
        }
    }
    uniqueDates.sort().reverse();
    var streak = 0
    var todayStr = new Date().toISOString().split('T')[0];
    var checkDate = new Date();
    var checkDateStr = checkDate.toISOString().split('T')[0];
    if (uniqueDates.indexOf(checkDateStr) === -1){
        checkDate.setDate(checkDate.getDate() -1);
        checkDateStr = checkDate.toISOString().split('T')[0];
    } 
    for (var j = 0; j< uniqueDates.length; j++){
        var expectedDateStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.indexOf(expectedDateStr) !== -1){
            streak++;
            checkDate.setDate(checkDate.getDate()-1);
        } else {
            break;
        }
    }
    streakDisplay.textContent = streak + (streak === 1? "Day 🔥": "Days 🔥");
}
function renderCustomChart(){
    let totals = {
        transport : 0,
        energy : 0,
        food : 0
    };
    for (let i=0; i< entries.length; i++){
        let entry = entries[i];
        if (totals[entry.category] !== undefined){
            totals[entry.category] += entry.co2Total;
        }
    }
    let maxVal = Math.max(totals.transport, totals.energy, totals.food, 10);
    let transportHeight = (totals.transport/maxVal) * 100;
    document.getElementById('bar-transport').style.height = transportHeight + '%';
    document.getElementById('val-transport').textContent = totals.transport.toFixed(1) + ' kg';
    let energyHeight = (totals.energy/maxVal) * 100;
    document.getElementById('bar-energy').style.height = energyHeight + '%';
    document.getElementById('val-energy').textContent = totals.energy.toFixed(1) + ' kg';
    let foodHeight = (totals.food/maxVal) * 100;
    document.getElementById('bar-food').style.height = foodHeight + '%';
    document.getElementById('val-food').textContent = totals.food.toFixed(1) + ' kg';
}
function showToast(message){
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(()=>{
        toast.classList.remove('show');
    }, 3000);
}
if (categorySelect) {
    categorySelect.addEventListener("change", fillActivities);
}
if (logForm){
    logForm.addEventListener("submit", function(e){
        e.preventDefault();

        var category = categorySelect.value;
        var activity = activitySelect.value;
        var amountInput = document.getElementById("amount");
        var amount = amountInput ? parseFloat(amountInput.value) :1;
        if(!category || !activity || !data[category] || !data[category].activities[activity]){
            alert("Please select a valid category and activity.");
            return;
        }
        var co2PerUnit = data[category].activities[activity].co2PerUnit;
        var co2Total = amount * co2PerUnit;

        var newEntry = {
            category: category,
            activity: activity,
            amount: amount,
            date: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
            co2Total: co2Total,
        };
        entries.push(newEntry);
        localStorage.setItem("carbonEntries", JSON.stringify(entries));
        renderEntities();
        showToast("Logged activity successfully!")

        if (amountInput) amountInput.value = 1;
    });
}
if (clearBtn) {
    clearBtn.addEventListener("click", function(){
        if (confirm("Are you sure that you want to clear all history?")){
            entries = [];
            localStorage.removeItem("carbonEntries");
            renderEntities();
        }
    });
}

document.addEventListener("DOMContentLoaded", function(){
    fillCategories();
    renderEntities();
});

const themeToggleBtn = document.getElementById("theme-toggle")
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (themeToggleBtn) {
        themeToggleBtn.textContent = savedTheme === "dark" ? "☀️ light mode": "🌙 dark mode";
    }
}
if (themeToggleBtn){
    themeToggleBtn.addEventListener("click",function(){
        const currentTheme = document.documentElement.getAttribute("data-theme");
        let newTheme = "light";
        if (currentTheme !== "dark"){
            newTheme = "dark";
            themeToggleBtn.textContent = "☀️ light mode";
        }else{
            themeToggleBtn.textContent = "🌙 dark mode";
        }
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme",newTheme);
    })
}