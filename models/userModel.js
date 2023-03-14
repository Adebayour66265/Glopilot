const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: [true, "please add your name"]
        },
        email: {
            type: String,
            require: [true, "please add an email"],
            unique: true,
            trim: true,
            match: [
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                "Please enter a valid emaial",
            ],
        },
        password: {
            type: String,
            require: [true, "please add your password"]
        },
        photo: {
            type: String,
            default: "images"
        },
        number: {
            type: String,
            default: "+234"
        },
        bio: {
            type: String,
            default: "bio"
        },
        role: {
            type: String,
            require: true,
            default: "User",
            // user, admin, rider, (suspendend)
        },
        isVerify: {
            type: Boolean,
            default: false,
        },
        userAgent: {
            type: Array,
            require: true,
            default: [],
        },
    },
    {
        timestamps: true,
        minimize: false
    }
);

//  Encrypt password before saved
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()
    }
    //  Hash password

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
    next();
})

const User = mongoose.model("User", userSchema);
module.exports = User;