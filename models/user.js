const mongoose = require(`mongoose`);
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema ({
    email: {
        type: String,
        required: true,
    },
});

userSchema.plugin(passportLocalMongoose); //This plugin set a username and password in hash form 

const User = mongoose.model("User", userSchema);
module.exports = User;
