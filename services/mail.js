const nodemailer = require("nodemailer");
const keys = require("./config/keys");

module.exports = () => {
	const transporter = {};

	transporter.mailOptions = {
		from: keys.from
		to: keys.to,
		subject: "Test",
		text: "updated MinValue"
	};

	transporter.t = () => {
		console.log("2");
		return nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			auth: {
				user: keys.mailUser,
				pass: keys.mailPassword
			}
		});
	}

	return transporter;
}
