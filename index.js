const express = require("express");
const ejs = require("ejs");
const https = require("https");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const keys = require("./config/keys");
const User = require("./models/User");

const session = require("express-session");
const FileStore = require("session-file-store")(session);

mongoose.connect(keys.mongoURI, { useNewUrlParser: true });

const app = express();
const PORT = process.env.PORT || 5000;


var requestResult = null;
var body = "";
// TEST
const options = {
	protocol: "https:",
	hostname: "api.coinmarketcap.com",
	path: "/v2/ticker/?convert=EUR&limit=20",
	port: 443 , //http: 80, https: 443
	method: "GET",
	json: true
};
const updateList = https.get(options, (res) => {
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
updateList.on("error", (error) => {
	console.log("ERROR", error.message);
})

const currencies = [];

app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.locals.retrieveUser = (email, coins) => {
	User.findOne({email: email}, (err, user) => {
		console.log(user);
		if (err) {
			console.log("ERROR: ", err);
		} else if (user) {
			coins = user.password;
			console.log("COINS: ", coins);
		} else {
			console.log("No Such user");
		}
	});
};

const updateSession = (req, name, symbol, minValue) => {
	let coins = req.session.coins;
	console.log("COINS: ", coins);
	for (let i = 0; i < coins.length; i++) {
		if (coins[i].name == name) {
			coins[i].symbol = symbol;
			coins[i].minValue = minValue;
			return ( coins );
		}
	}
	console.log("minValue: ", minValue);
	coins.push({name: name, symbol: symbol, minValue: minValue});
	return (coins);
}

const addCoin = (req, res, newCoin) => {
	User.findOne({email: req.session.email}, (err, user) => {
		if (err) {
			console.log("ERROR: ", error);
		} else if (user) {
			let coins = user.coins.toObject();
			let flag = true;
			for (var i = 0; i < coins.length; i++) {
				if (coins[i].name == newCoin.name) {
					flag = false;
					console.log("COIN ALREADY IN DB");
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
	}
	)};

const removeCoin = (req) => {
	let targetCoin = req.body.rmCoin;
	console.log("TARGET COIN: ", targetCoin);
	console.log("SESSION REQ: ", req.session);
	console.log("EMAIL: ", req.session.email);
	//User.update({"email": req.session.email}, {$pull: {"coins.name": {$eq: targetCoin}}})
	try {
		User.update({"email": req.session.email}, {$pull: {"coins": {"name": targetCoin}}}).exec();
		//User.save();
	} catch (error) {
		console.log("ERROR: ", error);
	}
	console.log("DELETED COIN?");
	//User.update({email: req.session.email}, {"$pull": {"coins": {"name": targetCoin}}});
	//User.update({"email": req.session.email, "coins": {$elemMatch: {"name": targetCoin}}}, $unset);
}

const removeCoinSession = (req) => {
	for (let i = 0;  i < req.session.coins.length; i++) {
		if (req.session.coins[i].name == req.body.rmCoin) {
			req.session.coins.splice(i, 1);
			break ;
		}
	}
}

require("./services/passport")(passport, LocalStrategy, User);
app.use(session({
	name: "cryptoNodeCookie",
	secret: keys.session_secret,
	saveUninitialized: true,
	resave: true,
	store: new FileStore()
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + "/static"));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require("./routes/router")(app, passport, currencies, addCoin, removeCoin, updateSession, removeCoinSession);

app.listen(PORT, () => console.log("App listening on port ", PORT));
