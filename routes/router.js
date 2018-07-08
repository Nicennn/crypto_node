const https = require("https");

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

				res.on("data", data =>  { body += data });

				res.on("end", () => {
					requestResult = JSON.parse(body);
					console.log(requestResult);
				});
			});

			rqst.on("error", (error) => {
				console.log("ERROR: ", error.message);
			});

			res.render("pages/list", {
				currencies: currencies
			});
		}
	);
};


