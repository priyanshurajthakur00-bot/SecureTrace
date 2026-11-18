const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    deviceId: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    accuracy: { type: String },
    battery: { type: String },      // YAHAN BATTERY SAVE HOGI
    network: { type: String },      // YAHAN NETWORK SAVE HOGA
    ipAddress: { type: String },
    photoUrl: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', locationSchema);
