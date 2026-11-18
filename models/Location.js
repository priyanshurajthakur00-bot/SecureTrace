const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    deviceId: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    accuracy: { type: String },
    battery: { type: String },  // NAYA: Battery ke liye
    network: { type: String },  // NAYA: Network (4G/WiFi) ke liye
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
