const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key

const searchInput = document.getElementById('searchInput');
const aqiValue = document.getElementById('aqiValue');
const cityName = document.getElementById('cityName');
const description = document.getElementById('description');
const detailsGrid = document.getElementById('detailsGrid');
const themeToggle = document.getElementById('themeToggle');
const aqiChartCanvas = document.getElementById('aqiChart');
let chart;

// AQI Level Description
function getAQIDescription(aqi) {
  if (aqi <= 50) return "Good 🌿";
  if (aqi <= 100) return "Moderate 🌤️";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups 😷";
  if (aqi <= 200) return "Unhealthy 🚫";
  if (aqi <= 300) return "Very Unhealthy ☠️";
  return "Hazardous 💀";
}

// Theme Toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '🌞 Light Mode' : '🌙 Dark Mode';
});

// Render Chart
function renderChart(labels, data) {
  if (chart) chart.destroy();
  chart = new Chart(aqiChartCanvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'AQI',
        data: data,
        fill: false,
        borderColor: '#10b981',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Fetch AQI Data
async function fetchAQI(city = '') {
  try {
    let url = city
      ? `https://api.openweathermap.org/data/2.5/air_pollution?&q=${city}&appid=${apiKey}`
      : `https://api.openweathermap.org/data/2.5/air_pollution?lat=${userCoords.lat}&lon=${userCoords.lon}&appid=${apiKey}`;

    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    const { lat, lon, name, country } = geoData[0];

    const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const data = await res.json();
    const aqi = data.list[0].main.aqi;

    aqiValue.textContent = aqi;
    cityName.textContent = `${name}, ${country}`;
    description.textContent = getAQIDescription(aqi);

    detailsGrid.innerHTML = `
      <div class="item"><h4>CO</h4><p>${data.list[0].components.co} μg/m3</p></div>
      <div class="item"><h4>NO</h4><p>${data.list[0].components.no} μg/m3</p></div>
      <div class="item"><h4>NO₂</h4><p>${data.list[0].components.no2} μg/m3</p></div>
      <div class="item"><h4>O₃</h4><p>${data.list[0].components.o3} μg/m3</p></div>
      <div class="item"><h4>PM2.5</h4><p>${data.list[0].components.pm2_5} μg/m3</p></div>
      <div class="item"><h4>PM10</h4><p>${data.list[0].components.pm10} μg/m3</p></div>
      <div class="item"><h4>SO₂</h4><p>${data.list[0].components.so2} μg/m3</p></div>
    `;

    // Simulate AQI history data for the chart
    const labels = ['7d ago', '6d', '5d', '4d', '3d', '2d', '1d', 'Today'];
    const fakeData = Array.from({ length: 8 }, () => Math.floor(Math.random() * 300));
    fakeData[7] = aqi;
    renderChart(labels, fakeData);

  } catch (error) {
    alert("City not found or error fetching data.");
    console.error(error);
  }
}

// Search Handler
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    fetchAQI(searchInput.value.trim());
  }
});

// Detect User Location
let userCoords = {};
navigator.geolocation.getCurrentPosition(async position => {
  userCoords.lat = position.coords.latitude;
  userCoords.lon = position.coords.longitude;
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${userCoords.lat}&lon=${userCoords.lon}&appid=${apiKey}`);
    const data = await res.json();
    const aqi = data.list[0].main.aqi;
    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${userCoords.lat}&lon=${userCoords.lon}&limit=1&appid=${apiKey}`);
    const geoData = await geoRes.json();
    const { name, country } = geoData[0];

    aqiValue.textContent = aqi;
    cityName.textContent = `${name}, ${country}`;
    description.textContent = getAQIDescription(aqi);

    detailsGrid.innerHTML = `
      <div class="item"><h4>CO</h4><p>${data.list[0].components.co} μg/m3</p></div>
      <div class="item"><h4>NO</h4><p>${data.list[0].components.no} μg/m3</p></div>
      <div class="item"><h4>NO₂</h4><p>${data.list[0].components.no2} μg/m3</p></div>
      <div class="item"><h4>O₃</h4><p>${data.list[0].components.o3} μg/m3</p></div>
      <div class="item"><h4>PM2.5</h4><p>${data.list[0].components.pm2_5} μg/m3</p></div>
      <div class="item"><h4>PM10</h4><p>${data.list[0].components.pm10} μg/m3</p></div>
      <div class="item"><h4>SO₂</h4><p>${data.list[0].components.so2} μg/m3</p></div>
    `;

    // Fake chart data
    const labels = ['7d ago', '6d', '5d', '4d', '3d', '2d', '1d', 'Today'];
    const fakeData = Array.from({ length: 8 }, () => Math.floor(Math.random() * 300));
    fakeData[7] = aqi;
    renderChart(labels, fakeData);

  } catch (err) {
    console.log("Error with geolocation fallback:", err);
  }
});
