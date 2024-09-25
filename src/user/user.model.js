const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const BaseSchema = require("../base/BaseSchema")

const UserSchema = new BaseSchema({
    // email: {
    //     type: String,
    //     // required: true,
    //     // unique: true,
    //     // validate: {
    //     //     validator: function(value) {
    //     //         // Regular expression for validating email
    //     //         return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    //     //     },
    //     //     message: 'Invalid email address format'
    //     // }
    // },
    name: String,
    password: {
        type: String,
        default: ""
    },
    wallet: String,
    wallets: [ String ],
    role: {
        type: String,
        default: "user" // role: "admin", "user", ...
    },
    scores: {
        type: Number,
        default: 0,
    },
    nft: {
        type: String,
    } // nft collection
});
// Hash the password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Check password validity
UserSchema.methods.comparePassword = function (inputPassword) {
    return bcrypt.compare(inputPassword, this.password);
};

const User = mongoose.model('user', UserSchema);

module.exports = {
    User,
}