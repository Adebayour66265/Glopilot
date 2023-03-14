const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECTRET || 'glopilot', { expiresIn: "1d" })
};
//  HashToken 
const hashToken = (token) => {
    return crypto.createHash("sha256").update(token.toString()).digest("hex");
}
module.exports = {
    generateToken,
    hashToken
}