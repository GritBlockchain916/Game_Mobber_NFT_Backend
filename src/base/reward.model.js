const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const BaseSchema = require("../base/BaseSchema")

const RewardSchema = new BaseSchema({
    rate: {
        type: Number,
        required: true,
        default: 0.25 // token reward rate for game score 
    },
    mode: {
        type: String,
        default: 'PVE' // reward mode: PVP :: rate = 0.25
    }
});

const Reward = mongoose.model('reward', RewardSchema);

module.exports = {
    Reward
}