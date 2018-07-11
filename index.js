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

const addCoin = (req, res, newCoin) => {
	User.findOne({email: req.session.email}, (err, user) => {
		if (err) {
			console.log("ERROR: ", error);
		} else if (user) {
			if (!user.coins.includes(newCoin)) {
				user.coins.push(newCoin);
				user.save();
			}
		} else {
			console.log("No such user")
		}
	});
};

require("./services/passport")(passport, LocalStrategy, User);
//const addCoin = require("./services/addCoin")();
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

require("./routes/router")(app, passport, currencies, addCoin);

app.listen(PORT, () => console.log("App listening on port ", PORT));
