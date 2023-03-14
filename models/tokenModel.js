const mongoose = require("mongoose");


const tokenSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            ref: "user"
        },
        verifyToken: {
            type: String,
            default: "",
        },
        resetToken: {
            type: String,
            default: "",
        },
        loginToken: {
            type: String,
            default: "",
        },
        createAt: {
            type: Date,
            require: true
        },
        expireAt: {
            type: Date,
            require: true
        },
    }
);



const Token = mongoose.model("Token", tokenSchema);
module.exports = Token;