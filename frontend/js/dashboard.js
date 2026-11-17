const map = L.map('map').setView([20.0, 0.0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker, circle;
let trackingInterval;

const myDeviceId = localStorage.getItem('sys_device_id');
const myUsername = localStorage.getItem('sys_username');

if(myUsername) {
    document.querySelector('.top-nav h2').innerText = `SYS.SECURE_TRACE // COMMAND_CENTER [AGENT: ${myUsername.toUpperCase()}]`;
}

if(myDeviceId) {
    document.getElementById('display-key').innerText = myDeviceId;
}

document.getElementById('track-btn').addEventListener('click', function() {
    const statusText = document.getElementById('status');
    statusText.innerText = "SCANNING DEVICE ID: " + myDeviceId;
    statusText.style.color = "#00f3ff";

    trackingInterval = setInterval(fetchTargetLocation, 3000);
    fetchTargetLocation();
});

function fetchTargetLocation() {
    fetch('/api/get-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: myDeviceId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.lat && data.lng) {
            document.getElementById('lat').innerText = data.lat.toFixed(5);
            document.getElementById('lng').innerText = data.lng.toFixed(5);
            document.getElementById('acc').innerText = Math.round(data.accuracy) + " meters";
            document.getElementById('status').innerText = data.status;
            document.getElementById('status').style.color = "#00ff41";

            if (marker) {
                map.removeLayer(marker);
                map.removeLayer(circle);
            }

            marker = L.marker([data.lat, data.lng]).addTo(map);
            circle = L.circle([data.lat, data.lng], { radius: data.accuracy, color: 'red' }).addTo(map);

            map.setView([data.lat, data.lng], 16);
        } else {
            document.getElementById('status').innerText = "TARGET OFFLINE";
            document.getElementById('status').style.color = "#ff003c";
        }
    })
    .catch(err => console.error("Server connection failed", err));
}
