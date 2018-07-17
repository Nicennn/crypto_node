const https = require("https");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const keys = require("../config/keys");

var requestResult = null;
var body = "";

const options = {
	protocol: "https:",
	hostname: "api.coinmarketcap.com",
	path: "/v2/ticker/?convert=EUR&limit=20",
	port: 443 , //http: 80, https: 443
	method: "GET",
	json: true
};

module.exports = (currencies, User, transporter) => {
	const u = {};

	u.sendMail = (currencies, User) => {
		const transp = transporter.t();

		User.find({}, (error, users) =>{
			if (error) {
				console.log("ERROR: ", error);
			} else {
				//console.log(users);
				users.forEach(user => {
					//console.log("User: ", user.email);
					user.coins.forEach(coin => {
						//console.log("coin: ", coin.name, "minValue: ", coin.minValue);
						currencies.forEach(curr => {
							if (curr.name == coin.name) {
								if (curr.quotes.EUR.price < coin.minValue) {
									transporter.mailOptions.from = keys.from;
									transporter.mailOptions.to = user.email;
									let text = curr.name + ": " + String(curr.quotes.EUR.price) + " < " + String(coin.minValue) + "!";
									console.log("TEXT: ", text);
									transporter.mailOptions.text = text;
									console.log("SEND MAIL\noptions: ", transporter.mailOptions);
									transp.sendMail(transporter.mailOptions, (error, info) => {
										if (error)
											return console.log(error);
									console.log("message Sent: %s", info.messageId);
									console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
									});
								}
							}
						})
					})
				})
			}
		})
	}

	u.updateList = () => {
		console.log("UPDATE LIST");
		https.get(options, (res) => {
			res.on("data", data =>  { body += data });
			// Data has been consumed
			res.on("end", () => {
				requestResult = JSON.parse(body);
				let data = requestResult.data;

				for (var key in data) {
					if (data.hasOwnProperty(key)) {
						let coin = data[key];
						currencies.push(Object.assign(coin));
					}
				}
				u.sendMail(currencies, User);
				requestResult = null;
				body = "";
			})
		}).on("error", (e) => {
			console.log("ERROR WHILE FETCHING DATA FROM API: ", error);
			console.log("Wait until next update");
		})	
	}
	u.updateList();
	//setInterval(u.updateList, 1000 * 60 * 60);
	setInterval(u.updateList, 1000 * 20);

	u.updateSession = (req, name, symbol, minValue) => {
		let coins = req.session.coins;
		for (let i = 0; i < coins.length; i++) {
			if (coins[i].name == name) {
				coins[i].symbol = symbol;
				coins[i].minValue = minValue;
				return ( coins );
			}
		}
		coins.push({name: name, symbol: symbol, minValue: minValue});
		return (coins);
	}

	u.addCoin = (req, res, newCoin) => {
		User.findOne({email: req.session.email}, (err, user) => {
			if (err) {
				console.log("ERROR: ", error);
			} else if (user) {
				let coins = user.coins.toObject();
				let flag = true;
				for (var i = 0; i < coins.length; i++) {
					if (coins[i].name == newCoin.name) {
						flag = false;
						break ;
					}
				}
				if (flag) {
					user.coins.push({name: newCoin.name, symbol: newCoin.symbol, minValue: 0});
					user.save();
				}
			} else {
				console.log("No such user");
			}
		})
	};

	u.removeCoin = (req) => {
		let targetCoin = req.body.rmCoin;
		try {
			User.update({"email": req.session.email}, {$pull: {"coins": {"name": targetCoin}}}).exec();
		} catch (error) {
			console.log("ERROR: ", error);
		}
	}

	u.removeCoinSession = (req) => {
		for (let i = 0;  i < req.session.coins.length; i++) {
			if (req.session.coins[i].name == req.body.rmCoin) {
				req.session.coins.splice(i, 1);
				break ;
			}
		}
	}

	u.updateMinValue = (req) => {
		let targetCoin = req.body.currCoinName;
		let minValue = req.body.update;
		let email = req.session.email;
		try {
			User.update({"email": email, "coins.name": targetCoin}, {$set: {"coins.$.minValue": minValue}}).exec();
		} catch (e) {
			console.log("ERROR: ", e);
		}
	}

	return u;
}
