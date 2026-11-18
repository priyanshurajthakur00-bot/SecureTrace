const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    deviceId: { type: String, required: true },
    actionCommand: { type: String, default: "NONE" } // NAYA: Command system
});

module.exports = mongoose.model('User', userSchema);
