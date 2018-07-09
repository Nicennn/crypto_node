const https = require("https");
const ejs = require("ejs");
const passport = require("passport");

const options = {
	protocol: "https:",
	hostname: "api.coinmarketcap.com",
	path: "/v2/ticker/?convert=EUR&limit=20",
	port: 443 , //http: 80, https: 443
	method: "GET",
	json: true
};

module.exports = (app, currencies) => {
	const location_css = "css";
	const location_js = "js";
	const location_images = "images";
	const location_router = "/routes/router";
	var httpsRequestResult;

	app.get("/", 
		(req, res) => res.render("pages/index", {
			css: location_css,
			js: location_js,
			images: location_images
		})
	);

	app.get("/list",
		(req, res) => {
			var requestResult = null;
			var body = "";

			const rqst = https.get(options, (res) => {
				console.log("status code: ", res.statusCode); 
				console.log("headers: ", res.headers);

				// Reconstitute the body from multiple data chunks
				res.on("data", data =>  { body += data });

				// Data has been consumed
				res.on("end", () => {
					requestResult = JSON.parse(body);
					let data = requestResult.data;
					console.log(data);

					for (var key in data) {
						if (data.hasOwnProperty(key)) {
							let coin = data[key];
							console.log("coin: ", coin);
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

	app.get("/login", (req, res) => { res.render("pages/login") });

	app.get("/signin", (req, res) => { res.render("pages/signin") });
};
