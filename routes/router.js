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

				// Reconstitute the body from multiple data chunks
				res.on("data", data =>  { body += data });

				// Data has been consumed
				res.on("end", () => {
					requestResult = JSON.parse(body);
					let data = requestResult.data;
					console.log(data);
					console.log("\n##############END DATA#############\n");


					for (var key in data) {
						if (data.hasOwnProperty(key)) {
							let coin = data[key];
							//console.log("requestResult.data[key]: ", typeof(requestResult.data[key] ));
							//console.log("data[key]: ", typeof(data[key] ));
							//console.log("coin: ", coin);
							//console.log("reqestResult: ", typeof(requestResult));
							//console.log("coin.id: ", coin.id);
							//currencies.push(Object.assign(requestResult.key));
						}
					}
					console.log(currencies);
					currencies.forEach(elem => {
						console.log(elem.name);
					})
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


