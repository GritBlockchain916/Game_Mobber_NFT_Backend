const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const BaseSchema = require("../base/BaseSchema")

const SocialSchema = new BaseSchema({
    message: {
        type: String
    },
});

const Social = mongoose.model('social', SocialSchema);

module.exports = {
    Social
}