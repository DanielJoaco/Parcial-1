const infElement = document.getElementById('information');
const ltdElement = document.getElementById('latitude');
const lngElement = document.getElementById('longitude');
const tempElement = document.getElementById('temperature');
const humElement = document.getElementById('humidity');
const windElement = document.getElementById('wind-speed');
const precElement = document.getElementById('precipitation');

let map;
let marker;
let tempChart;

function initMap() {
    // Coordenadas iniciales: Bucaramanga, Santander
    const initialCoords = [7.1193, -73.1227];

    // Crear el mapa
    map = L.map('map').setView(initialCoords, 13);

    // Cargar capa de OpenStreetMap
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Crear el marcador inicial
    marker = L.marker(initialCoords).addTo(map);

    // EJECUCIÓN DEL EVENTO CLICK
    map.on('click', function(e) {
        const { lat, lng } = e.latlng;

        // Mover el marcador
        marker.setLatLng([lat, lng]);
        
        // Centrar suavemente
        map.panTo([lat, lng]);

        // Llamar a la API de Clima con las nuevas coordenadas
        fetchWeatherData(lat, lng);
    });

    // Carga inicial de clima para Bucaramanga
    fetchWeatherData(initialCoords[0], initialCoords[1]);
}

/**
 * 2. LÓGICA DE PETICIÓN METEOROLÓGICA (Open Meteo)
 */
async function fetchWeatherData(lat, lon) {
    const apiURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,precipitation_probability&forecast_days=2`;

    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        
        updateWeatherUI(data);
        renderTemperatureChart(data.hourly);
    } catch (error) {
        console.error("Error en la telemetría meteorológica:", error);
    }
}

function renderTemperatureChart(hourlyData) {
    const ctx = document.getElementById('tempChart').getContext('2d');

    // 1. Sincronización temporal: Encontrar el índice de la hora actual
    const now = new Date();
    const currentHourISO = new Date(now.setMinutes(0,0,0)).toISOString().slice(0, 16);
    const startIndex = hourlyData.time.findIndex(t => t.includes(currentHourISO)) || 0;

    // 2. Extracción de la ventana de 24 horas
    const next24HoursLabels = hourlyData.time.slice(startIndex, startIndex + 24).map(t => t.split('T')[1]);
    const next24HoursTemps = hourlyData.temperature_2m.slice(startIndex, startIndex + 24);

    // 3. Cálculo de límites del eje Y (Padding de 0.5°C)
    const minTemp = Math.min(...next24HoursTemps);
    const maxTemp = Math.max(...next24HoursTemps);

    // Destruir instancia previa para evitar fugas de memoria
    if (tempChart) tempChart.destroy();

    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: next24HoursLabels,
            datasets: [{
                label: 'Temperatura Próximas 24h (°C)',
                data: next24HoursTemps,
                borderColor: '#EBD5AB',
                backgroundColor: '#8bae666b',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#EBD5AB', 

                    }
                }
            },
            scales: {
                y: {
                    min: minTemp - 0.5,
                    max: maxTemp + 0.5,
                    ticks: { 
                        stepSize: 0.5,
                        color: '#EBD5AB',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)' 
                    }
                },
                x: {
                    ticks: {
                        color: '#EBD5AB',
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * 3. ACTUALIZACIÓN DE LA UI
 */
function updateWeatherUI(data) {
    // 'current' ahora contiene las métricas específicas solicitadas
    const current = data.current;

    if(data.latitude === undefined || data.longitude === undefined) {
        const p = document.createElement('p');
        p.textContent = "No information available.";
        infElement.appendChild(p);
        return;
    }
    
    // 1. Las coordenadas están en la raíz del JSON
    ltdElement.textContent = `Latitude: ${data.latitude.toFixed(4)}`;
    lngElement.textContent = `Longitude: ${data.longitude.toFixed(4)}`;
    
    // 2. El clima actual (usando los nombres de variables de Open-Meteo)
    tempElement.textContent = `Temperature: ${current.temperature_2m}°C`;
    humElement.textContent = `Humidity: ${current.relative_humidity_2m}%`;
    windElement.textContent = `Wind Speed: ${current.wind_speed_10m} km/h`;
    
    // 3. Probabilidad de precipitación (primer índice del bloque hourly)
    const probPrecip = data.hourly?.precipitation_probability?.[0] ?? 0;
    precElement.textContent = `Precipitation Probability: ${probPrecip}%`;
}

// Iniciar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initMap);