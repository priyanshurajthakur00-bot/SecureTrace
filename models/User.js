const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    deviceId: { type: String, required: true } // Saves Phone Number or IMEI
});

module.exports = mongoose.model('User', userSchema);
