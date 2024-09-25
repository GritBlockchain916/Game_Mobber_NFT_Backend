const mongoose = require("mongoose");

const PVE = mongoose.model(
    "PVE",
    new mongoose.Schema({
        player: String,
        score: Number,
        date: Date,
    }, { timestamps: true })
);

module.exports = PVE;
