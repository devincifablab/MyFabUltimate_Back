const nodemailer = require('nodemailer');
const config = require('../config.json');


module.exports.sendMail = async (userMail, subject, text) => {
    if (!config.mail) {
        console.log("Mail configuration not configured");
        return;
    }
    return await new Promise((resolve) => {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.mail.user,
                pass: config.mail.pass
            }
        });

        var mailOptions = {
            from: config.mail.user,
            to: userMail,
            subject: subject,
            text: text
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                resolve();
            } else {
                resolve();
            }
        });
    })
}