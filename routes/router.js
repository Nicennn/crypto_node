const https = require("https");
const ejs = require("ejs");
const nodemailer = require("nodemailer");

const options = {
	protocol: "https:",
	hostname: "api.coinmarketcap.com",
	path: "/v2/ticker/?convert=EUR&limit=20",
	port: 443 , //http: 80, https: 443
	method: "GET",
	json: true
};

module.exports = (app, passport, currencies, addCoin, removeCoin, updateSession, 
	removeCoinSession, updateMinValue, transporter) => {
	const location_css = "css";
	const location_js = "js";
	const location_images = "images";
	const location_router = "/routes/router";
	var httpsRequestResult;

	app.get("/", 
		(req, res) => {
			res.render("pages/index", {
				session: req.session,
				currencies: currencies
			});
		}
	);

	app.get("/list", (req, res) => {
		res.render("pages/list", {
			session: req.session,
			currencies: currencies
		});
	}
	);

	app.get("/login", (req, res) => { 
		res.render("pages/login", {
			session: req.session,
			currencies: currencies
		}) 
	});
	app.post("/login", 
		passport.authenticate("local-login", {
			successRedirect: "/",
			failureRedirect: "/login"
		})
	);

	app.get("/signup", (req, res) => { 
		res.render("pages/signup", {
			session: req.session,
			currencies: currencies
		}) 
	});
	app.post("/signup", passport.authenticate("local-signup", {
		successRedirect: "/",
		failureRedirect: "/signup"
	}));

	app.get("/logout", (req, res) => {
		req.session.destroy();
		res.redirect("/");
	});

	app.get("/profile", (req, res) => {
		res.render("pages/profile", {
			session: req.session,
			currencies: currencies
		})
	});
	app.post("/profile", (req, res) => {
		console.log(req.body);
		if (req.body && req.body.newCoin && req.body.coin) {
			console.log("add new coin");
			let json = JSON.parse(req.body.coin);
			addCoin(req, res, json);
			req.session.coins = updateSession(req, json.name, json.symbol, 0);
		} else if (req.body && req.body.rmCoin) {
			console.log("remove coin");
			removeCoin(req);
			removeCoinSession(req);
		} else if (req.body && req.body.update) {
			console.log("update coin minValue: ", req.body.update);
			let coin = req.body.currCoinName;
			let minValue = req.body.update;
			let symbol = req.body.currCoinSymbol;
			updateMinValue(req);
			req.session.coins = updateSession(req, coin, symbol, minValue)
			// For test purposes only
			//console.log(transporter);
			//const transp = transporter.t();
			//transp.sendMail(transporter.mailOptions, (error, info) => {
			//	if (error)
			//		return console.log(error);
			//	console.log("message Sent: %s", info.messageId);
			//	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
			//});
		}
		res.redirect("/profile");
	});
};
