const express = require("express");
const { register, loginUser, logOut,
    getUser, updateUser,
    deleteUser, getAllUsers, loginStatus,
    upgradeUser, sendAutomatedEmail, sendVerificationEmail
} = require("../controller/userController");
const { protect, adminOnly, authorOnly } = require("../middleware/authmiddleware");
const router = express.Router();

router.post("/register", register);
router.get("/login", loginUser);
router.get("/logOut", logOut);
router.get("/getUser", protect, getUser);
router.patch("/updateUser", protect, updateUser);

router.delete("/:id", protect, adminOnly, deleteUser);
router.get("/getAllUsers", protect, authorOnly, getAllUsers);
router.get("/loginStatus", loginStatus);
router.post("/upgradeUser", protect, adminOnly, upgradeUser);
router.post("/sendAutomatedEmail", protect, sendAutomatedEmail);
router.post("/verificationEmail", protect, sendVerificationEmail);


module.exports = router;