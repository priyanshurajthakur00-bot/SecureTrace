const mongoose = require('mongoose');
const locationSchema = new mongoose.Schema({
    deviceId: { type: String, required: true }, // Kis device ki location hai
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    accuracy: { type: String },
    timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Location', locationSchema);
