const nodemailer = require("nodemailer");
const hsb = require("nodemailer-express-handlebars");
const path = require("path");

const sendEmail = async (subject, send_to, sent_from, reply_to, template, name, link) => {
    // create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        // host: process.env.EMAIL_HOST || 'smtp.zoho.com',
        port: 578,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD

        },
        tls: {
            rejectUnauthorized: false
        }
    })

    // const handlebarOption = {
    //     viewEngine: {
    //         extName: ".handlebars",
    //         // partialsDir: path.resolve("../views"),
    //         partialsDir: path.join(__dirname, "../views"),
    //         defaulLayout: false
    //     },
    //     // viewPath: path.resolve("../views"),
    //     viewPath: path.join(__dirname, "../views"),
    //     extName: ".handlebars",
    // }
    const viewPath = path.join(__dirname, "../views")

    // transporter.use("compile", hsb(handlebarOption));
    transporter.use("compile", hsb({
        viewEngine: {
            defaultLayout: false
        },
        viewPath: viewPath
    }));
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