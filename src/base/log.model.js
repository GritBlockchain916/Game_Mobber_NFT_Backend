const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const BaseSchema = require("./BaseSchema")

const AdminLogSchema = new BaseSchema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "character",
    },
    model: String,
    wallet: String,
    action: String,
    result: String,
});

const AdminLog = mongoose.model('admin_log', AdminLogSchema);

const UserLogSchema = new BaseSchema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "character",
    },
    model: String,
    wallet: String,
    action: String,
    result: String,
});

const UserLog = mongoose.model('user_log', UserLogSchema);

module.exports = {
    AdminLog, UserLog
}