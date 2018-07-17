const nodemailer = require("nodemailer");
const keys = require("../config/keys");

module.exports = () => {
	const transporter = {};

	transporter.mailOptions = {
		from: keys.from,
		to: keys.to,
		subject: "CryptoNode",
		text: "updated values"
	};

	transporter.t = () => {
		console.log("2");
		return nodemailer.createTransport({
			sendmail: true,
			newline: "unix",
			path: "/usr/sbin/sendmail"
		});
	}

	//transporter.t = () => {
	//	console.log("2");
	//	return nodemailer.createTransport({
	//		host: keys.host,
	//		port: 587,
	//		auth: {
	//			user: keys.mailUser,
	//			pass: keys.mailPassword
	//		}
	//	});
	//}

	return transporter;
}
