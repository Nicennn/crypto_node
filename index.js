const express = require("express");
const ejs = require("ejs");
const https = require("https");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const keys = require("./config/keys");
// Session
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const User = require("./models/User");
const nodemailer = require("nodemailer");

mongoose.connect(keys.mongoURI, { useNewUrlParser: true });

const app = express();
const PORT = process.env.PORT || 5000;

const currencies = [];
const u = require("./services/utilities")(currencies, User);
const transporter = require("./services/mail")();

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

require("./routes/router")(app, passport, currencies, u.addCoin, u.removeCoin, 
	u.updateSession, u.removeCoinSession, u.updateMinValue, transporter);

app.listen(PORT, () => console.log("App listening on port ", PORT));
