const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const protect = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(400)
            throw new Error("you are not Authorized, please login");
        }

        //  verify token
        const verified = jwt.verify(token, process.env.JWT_SECTRET);
        // Get user id frrom token 
        const user = await User.findById(verified.id).select("-password");

        if (!user) {
            res.status(404)
            throw new Error("user not find");
        }
        if (user.role === "suspended") {
            res.status(400)
            throw new Error("user suspended, please contact support");
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401)
        throw new Error("you are not Authorized, please login");
    }
});


const adminOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role === "admin") {
        next()
    } else {
        res.status(401)
        throw new Error("you are not Authorized, as admin");
    }
})
const authorOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role === "author" || req.user.role === "admin") {
        next()
    } else {
        res.status(401)
        throw new Error("you are not Authorized, as author");
    }
})
const riderOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role === "rider") {
        next()
    } else {
        res.status(401)
        throw new Error("you are not Authorized, as rider");
    }
})
const vendorOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role === "vendor") {
        next()
    } else {
        res.status(401)
        throw new Error("you are not Authorized, as rider");
    }
})


const verifiedOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isVerified) {
        next()
    } else {
        res.status(401)
        throw new Error("you are not Authorized account not verified");
    }
})

module.exports = {
    protect,
    adminOnly,
    riderOnly,
    verifiedOnly,
    authorOnly,
    vendorOnly
}