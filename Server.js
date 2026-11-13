const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Apne banaye hue models import kar rahe hain
const Location = require('./models/Location');
const User = require('./models/User');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 1. MONGODB CLOUD DATABASE CONNECTION
// ==========================================
const mongoURI = "mongodb+srv://priyanshurajthakur5634_db_user:6SO3JcNKgDLWjwhm@cluster0.yb3flx7.mongodb.net/SecureTraceDB?retryWrites=true&w=majority";
mongoose.connect(mongoURI)
    .then(() => console.log("[+] DATABASE CONNECTED SUCCESSFULLY!"))
    .catch(err => console.log("[-] DATABASE CONNECTION FAILED:", err));


// ==========================================
// 2. ACCOUNT CREATION (SIGN UP)
// ==========================================
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username already taken!" });
        }

        // Ek unique secret tracking key banana (Jaise TRK-849302)
        const uniqueKey = "TRK-" + Math.floor(Math.random() * 1000000);

        const newUser = new User({ username, password, trackingKey: uniqueKey });
        await newUser.save();

        res.json({ success: true, message: "Account Created! Your Tracking Key is: " + uniqueKey });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ success: false, message: "Server Error during registration" });
    }
});


// ==========================================
// 3. SECURE LOGIN
// ==========================================
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username: username, password: password });
        
        if (user) {
            console.log(`[+] SYSTEM UNLOCKED BY: ${username}`);
            res.json({ success: true, message: "ACCESS GRANTED", trackingKey: user.trackingKey });
        } else {
            console.log(`[-] UNAUTHORIZED ACCESS ATTEMPT BY: ${username}`);
            res.status(401).json({ success: false, message: "Incorrect Username or Password!" });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ success: false, message: "Server Error during login" });
    }
});


// ==========================================
// 4. PHONE SE LOCATION RECEIVE KARNA
// ==========================================
app.post('/api/update-location', async (req, res) => {
    const { trackingKey, lat, lng, accuracy } = req.body; // Ab phone ko trackingKey bhi bhejni padegi
    
    if (trackingKey && lat && lng) {
        try {
            const newLocation = new Location({
                trackingKey: trackingKey,
                latitude: lat,
                longitude: lng,
                accuracy: accuracy
            });
            await newLocation.save();

            console.log(`[!] LOCATION SAVED FOR KEY [${trackingKey}]: Lat ${lat}, Lng ${lng}`);
            res.json({ success: true, message: "Location secured in Database." });
        } catch (error) {
            console.error("Database Save Error:", error);
            res.status(500).json({ success: false, message: "Error saving to DB." });
        }
    } else {
        res.status(400).json({ success: false, message: "Invalid data or missing Tracking Key." });
    }
});


// ==========================================
// 5. DASHBOARD PAR LOCATION BHEJNA
// ==========================================
app.post('/api/get-location', async (req, res) => {
    const { trackingKey } = req.body; // Dashboard sirf apni key wali location mangega

    try {
        // Sirf usi user ki location dhundhega jiski trackingKey match hogi
        const latestLocation = await Location.findOne({ trackingKey: trackingKey }).sort({ timestamp: -1 });
        
        if (latestLocation) {
            res.json({
                lat: parseFloat(latestLocation.latitude),
                lng: parseFloat(latestLocation.longitude),
                accuracy: parseFloat(latestLocation.accuracy),
                status: "ONLINE (TRACKING ACTIVE)",
                lastUpdated: latestLocation.timestamp
            });
        } else {
            res.json({ status: "TARGET OFFLINE" });
        }
    } catch (error) {
        console.error("Database Fetch Error:", error);
        res.status(500).json({ status: "ERROR" });
    }
});


// Server Start Karna
app.listen(PORT, () => {
    console.log(`\n[+] SYS.SECURE_TRACE ONLINE`);
    console.log(`[+] SERVER RUNNING ON: http://localhost:${PORT}`);
});
