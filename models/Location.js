const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    deviceId: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    accuracy: { type: String },
    battery: { type: String },      // NAYA: Battery save karne ke liye
    network: { type: String },      // NAYA: Network save karne ke liye
    ipAddress: { type: String },
    photoUrl: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
