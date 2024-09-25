const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        id: String,
        name: String,
        wallet: String,
        model: String,
        highScore: Number,
        room: String,
    }, { timestamps: true })
);
module.exports = User;
