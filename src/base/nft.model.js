const mongoose = require('mongoose');
const { Schema } = mongoose;
const BaseSchema = require("./BaseSchema")
const NFTSchema = new BaseSchema({
    address: {
        required: true,
        type: String,
        unique: true,
    }, // nft mint address
    character: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: "character",
        require: true
    }
});

const NFT = mongoose.model('nft', NFTSchema);

module.exports = {
    NFT,
}