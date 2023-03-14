const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const parser = require("ua-parser-js");

const User = require("../models/userModel");
const { generateToken, hashToken } = require("../utils");
const sendEmail = require("../utils/sendEmail");
const Token = require("../models/tokenModel");

// Register USER
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
        res.status(400)
        throw new Error("Please fill in all the require fields.");
    }
    if (password.length < 6) {
        res.status(400)
        throw new Error("Password must not less than 6 characters.");
    }


    // check if the user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400)
        throw new Error("User exist already login instead");
    }

    // Get UserAgent
    const ua = parser(req.headers['user-agent']);
    const userAgent = [ua.ua]


    // Create new user 
    const user = await User.create({
        name,
        email,
        password,
        userAgent
    })

    // Generate Token 
    const token = generateToken(user._id);

    // Send HTTP 
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: "none",
        secure: true,
    })

    if (user) {
        const { _id, name, email, number, bio, photo, role, isVerified } = user;

        res.status(201).json({
            _id,
            name,
            email,
            number,
            bio,
            photo,
            role,
            isVerified,
            token
        })
    } else {
        res.status(400)
        throw new Error("Invalid user input");
    }


});

// Login USERS
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // verification

    if (!email || !password) {
        res.status(400)
        throw new Error("please enter email and password");
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404)
        throw new Error("user does't exist");
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (!passwordIsCorrect) {
        res.status(400)
        throw new Error("Invalid email or password");
    }

    //  Trigger 2FA for unknow userAgent

    // Generate Token 
    const token = generateToken(user._id);
    if (user && passwordIsCorrect) {
        // Send HTTP 
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            sameSite: "none",
            secure: true,
        });
        const { _id, name, email, number, bio, photo, role, isVerified } = user;

        res.status(201).json({
            _id,
            name,
            email,
            number,
            bio,
            photo,
            role,
            isVerified,
            token
        });

    } else {
        res.status(500)
        throw new Error("Something went wrong");
    }
});

//  Send verification Email
const sendVerificationEmail = asyncHandler(async (req, res) => {
    const user = User.findById(req.user._id);
    if (!user) {
        res.status(404)
        throw new Error("user not found");
    }
    if (user.isVerified) {
        res.status(400)
        throw new Error("user already verified");
    }
    // Delete token if its exist in Database
    let token = await Token.findOne({ userId: user._id })
    if (token) {
        await token.deleteOne()
    }
    // Create verification Token and Save
    const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;

    // Hash token and save 
    const hashToken = hashToken(verificationToken);

    await new Token({
        userId: user._id,
        verifyToken: hashToken,
        createAt: Date.now(),
        expireAt: Date.now() + 60 * (60 * 1000) // 1hr
    }).save();


    // Construction verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

    // Send Email tomy user
    const subject = 'Verify your Account Globapilot'
    const send_to = user.email
    const sent_from = process.env.EMAIL_USER
    const reply_to = "noreply"
    const template = 'verifyEmail'
    const name = user.name
    const link = verificationUrl

    try {
        await sendEmail(
            subject,
            send_to,
            sent_from,
            reply_to,
            template,
            name,
            link);
        res.status(200).json({ message: "Email sent" });
    } catch (error) {
        res.status(500)
        throw new Error("Email not send please try again");
    }
})
// LOGOUT USERS
const logOut = asyncHandler(async (req, res) => {

    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: "none",
        secure: true,
    });
    return res.status(200).json({
        message: "Logout successful"
    })
});

// Get all USERS
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { _id, name, email, number, bio, photo, role, isVerified } = user;

        res.status(201).json({
            _id,
            name,
            email,
            number,
            bio,
            photo,
            role,
            isVerified,

        })
    } else {
        res.status(400)
        throw new Error("user not found");
    }
});

// Update USERS
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const { _id, name, email, number, bio, photo, role, isVerified } = user;

        user.name = req.body.name || name
        user.email = email
        user.number = req.body.number || number
        user.bio = req.body.bio || bio
        user.photo = req.body.photo || photo

        const updatedUser = await user.save();

        res.status(201).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            number: updatedUser.number,
            bio: updatedUser.bio,
            photo: updatedUser.photo,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,

        })
    } else {
        res.status(400)
        throw new Error("user not found");
    }

});

// Delete USERS
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(400)
        throw new Error("user not found");
    }
    try {
        await user.remove();
    } catch (err) {
        res.status(400)
        throw new Error("user delete not successfully");
    }
    res.status(200).json({
        message: "user delete successfully"
    });

});

// Get All USERS
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().sort("-createdAt").select("-password");
    if (!users) {
        res.status(500).json({
            message: "Something went wrong"
        });
    }
    res.status(200).json(users);
});

// Get All USERS
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false)
    }
    // verified token
    const verified = jwt.verify(token, process.env.JWT_SECTRET || 'glopilot');
    if (verified) {
        return res.json(true)
    } else {
        return res.json(false)
    }
});

// Get All USERS
const upgradeUser = asyncHandler(async (req, res) => {
    const { role, id } = req.body;

    const user = await User.findById(id);
    if (!user) {
        res.status(404).json({
            message: "User not found"
        });
    }
    user.role = role;
    await user.save();

    res.status(200).json({
        message: `User role updated to ${role}`
    });
});

// Send Automated Email to All USERS
const sendAutomatedEmail = asyncHandler(async (req, res) => {
    const { subject, send_to, reply_to, template, url } = req.body;

    if (!subject || !send_to || !reply_to || !template) {
        res.status(500)
        throw new Error("Missing Email parameter");
    }

    // Get user
    const user = User.findOne({ email: send_to });
    if (!user) {
        res.status(404)
        throw new Error("user not found");
    }
    const sent_from = process.env.EMAIL_USER || 'Adebayour66265@gmail.com';
    const name = user.name;
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}${url}`;

    try {
        await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);
        res.status(200).json({ message: "Email sent" });
    } catch (error) {
        res.status(500)
        throw new Error("Email not send please try again");
    }

});


module.exports = {
    register,
    loginUser,
    logOut,
    getUser,
    updateUser,
    deleteUser,
    getAllUsers,
    loginStatus,
    upgradeUser,
    sendAutomatedEmail,
    sendVerificationEmail
}