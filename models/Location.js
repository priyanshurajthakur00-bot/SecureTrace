const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    deviceId: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    accuracy: { type: String },
    battery: { type: String },      // NAYA ADD KIYA
    network: { type: String },      // NAYA ADD KIYA
    ipAddress: { type: String },    // NAYA ADD KIYA
    photoUrl: { type: String },     // NAYA ADD KIYA
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
