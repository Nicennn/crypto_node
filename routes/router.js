const https = require("https");
const ejs = require("ejs");

const options = {
	protocol: "https:",
	hostname: "api.coinmarketcap.com",
	path: "/v2/ticker/?convert=EUR&limit=20",
	port: 443 , //http: 80, https: 443
	method: "GET",
	json: true
};

module.exports = (app, passport, currencies, addCoin) => {
	const location_css = "css";
	const location_js = "js";
	const location_images = "images";
	const location_router = "/routes/router";
	var httpsRequestResult;

	app.get("/", 
		(req, res) => {
			//console.log("ROOT: session: ", req.session);
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
		req.logout();
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
		if (req.body && req.body.newCoin) {
			addCoin(req, res, req.body.coin);
			req.session.coins.push(req.body.coin);
		} else {
			console.log("no  new coin to add");
		}
		res.redirect("/profile");
	});
};
