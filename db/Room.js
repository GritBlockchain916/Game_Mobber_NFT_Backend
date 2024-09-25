const mongoose = require("mongoose");

const Room = mongoose.model(
    "Room",
    new mongoose.Schema({
        player1: String,
        player1_id: String,
        player2: String,
        player2_id: String,
        model: String,
        bet: String,
        winner: Number,
        rewarded: Boolean,
    }, { timestamps: true })
);
module.exports = Room;
