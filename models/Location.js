const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    deviceId: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    accuracy: { type: String },
    battery: { type: String },
    network: { type: String },
    ipAddress: { type: String }, // NAYA: Internet IP Address
    photoUrl: { type: String },  // NAYA: Chor ki Photo (Base64 format mein)
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
