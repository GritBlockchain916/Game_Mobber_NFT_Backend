const mongoose = require("mongoose");

const NFT = mongoose.model(
    "NFT",
    new mongoose.Schema({
        address: String,
        name: String,
        symbol: String,
        image: String,
        model: String,
    }, { timestamps: true })
);
module.exports = NFT;