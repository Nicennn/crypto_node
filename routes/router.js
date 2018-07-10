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

module.exports = (app, passport, currencies) => {
	const location_css = "css";
	const location_js = "js";
	const location_images = "images";
	const location_router = "/routes/router";
	var httpsRequestResult;

	app.get("/", 
		(req, res) => {
			console.log("ROOT: session: ", req.session);

			res.render("pages/index", {
				css: location_css,
				js: location_js,
				images: location_images
			});
		}
	);

	app.get("/list",
		(req, res) => {
			var requestResult = null;
			var body = "";

			const rqst = https.get(options, (res) => {
				//console.log("status code: ", res.statusCode); 
				//console.log("headers: ", res.headers);

				// Reconstitute the body from multiple data chunks
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
				});
			});

			rqst.on("error", (error) => {
				console.log("ERROR: ", error.message);
			});

			res.render("pages/list", {
				currencies: currencies,
				css: location_css,
				router: location_router
			});
		}
	);

	app.get("/login", (req, res) => { 
		console.log("C'est un GET!!!!!");
		res.render("pages/login") 
	});
	app.post("/login", 
		passport.authenticate("local-login", {
			successRedirect: "/",
			failureRedirect: "/login"
		})
	);

	app.get("/signup", (req, res) => { res.render("pages/signup") });
	app.post("/signup", passport.authenticate("local-signup", {
		successRedirect: "/",
		failureRedirect: "/signup"
	}));

	app.get("/logout", (req, res) => {
		req.logout();
		res.redirect("/");
	})
};
