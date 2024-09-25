const mongoose = require("mongoose");

const PVP = mongoose.model(
    "PVP",
    new mongoose.Schema({
        player1: String,
        player2: String,
        score1: Number,
        score2: Number,
        date: Date,
    }, { timestamps: true })
);
module.exports = PVP;