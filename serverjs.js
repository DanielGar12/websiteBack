const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require ("body-parser");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/yourAppDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema ({
    firstname: String,
    lastname: String,
    username: {type: String, unique: true},
    password: String,
})

const User = mongoose.model("User", userSchema);

app.post("/api/register", async (req,res) => {
    const {firstname, lastname, username, password} = req.body;

    if(!firstname || !lastname || !username || !password) {
        return res.json({success: false, message: "All fields required"});
    }

    try {
        const existingUser = await User.findOne({username});
        if (existingUser){
            return res.json({success: false, message: "Username already exists"});
        }
        const newUser = new User({ firstname, lastname, username, password});
        await newUser.save();
        res.json({success: true});
    }
    catch(error) {
        console.error("Registration error", error);
        res.status(500).json({success: false, message: "Server error."})
    }
})

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.json({ success: false, message: "All fields are required" });

    try {
        const user = await User.findOne({ username });
        if (!user)
            return res.json({ success: false, message: "User not found" });

        const match =  bcrypt.compare(password, user.password);
        if (!match)
            return res.json({ success: false, message: "Incorrect password" });

        // Optional: Generate session/token here
        res.json({ success: true });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.post('/send-email', async (req, res) => {
    const {name, email, message} = req.body;

    let transporter = nodemailer.createTransport ({
        service: 'gmail',
        auth: {
            user: 'garcia.daniel23256@gmail.com',
            pass: 'Danny4504'
        }
    });

    try {
        await transporter.sendMail({
            from: email,
            to: 'garcia.daniel23256@gmail.com',
            subject: `Contact Form: ${name}`,
            text: message
        })
        res.send("Message delievered successfully");
    }
    catch(err){
        console.error(err);
        res.status(500).send('Failed to send message.');
    }
});



app.listen(3000, () => {
    console.log("Server is running on http://localhost");
})