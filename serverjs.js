const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require ("body-parser");
const router = express.Router();
const bcrypt = require("bcrypt");

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



app.listen(3000, () => {
    console.log("Server is running on http://localhost");
})