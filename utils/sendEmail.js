const nodemailer = require('nodemailer');
const hsb = require("nodemailer-express-handlebars");
const path = require("path");

const sendEmail = async (subject, send_to, sent_from, reply_to, template, name, link) => {
    // create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp-mail.outlook.com',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER || 'Adebayour66265@gmail.com',
            pass: process.env.EMAIL_PASSWORD || 'Mustapha678@'
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    const handlebarOption = {
        viewEngine: {
            extName: ".handlebars",
            partialsDir: path.resolve("../views"),
            defaulLayout: false
        },
        viewPath: path.resolve("../views"),
        extName: ".handlebars",
    }


    transporter.use("compile", hsb(handlebarOption));
    console.log(handlebarOption);
    // option for sending email
    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        subject,
        template,
        context: {
            name,
            link
        }
    }

    // Send Email
    transporter.sendMail(options, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    })
}


module.exports = sendEmail;