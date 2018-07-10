const express = require("express");
const ejs = require("ejs");
const https = require("https");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const keys = require("./config/keys");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;
const currencies = [];

mongoose.connect(keys.mongoURI, { useNewUrlParser: true });

// Serialize for session
passport.serializeUser((user, done) => {
	done(null, user.id);
});
// Deserialize for session
passport.deserializeUser((id, done) => {
	user.findById(id, (err, user) => {
		done(err, user);
	});
});
passport.use("local-signup", new LocalStrategy(
	{
		usernameField: "email",
		passwordField: "password",
		passReqToCallback: true
	},
	(req, email, password, done) => {
		User.findOne({email: email}, (err, user) => {
			if (err) { 
				return done(err); 
			} else if (user) {
				return done(null, false, {message: "User already exists"});
			} else {
				var newUser = new User();
				newUser.email = email;
				newUser.password = newUser.hash(password);
				newUser.save((err) => {
					if (err) throw err;
					return done(null, newUser);
				});
			}
		});
	})
);
passport.use("local-login", new LocalStrategy(
	{
		usernameField: "email",
		passwordField: "password",
		passReqToCallback: true
	},
	(req, email, password, done) => {
		User.findOne({email: email}, (err, user) => {
			if (err) {
				return (done(err));
			} else if (!user) {
				return done(null, false, {message: "user does not exist"});
			} else {
				console.log(user);
				if (user.checkPassword(password, user.password)) {
					return done(null, user);
				} else {
					return done(null, false, {message: "bad password"});
				}
			}
		});
	}
));

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/static"));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// passport
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieSession({
	name: "session",
	keys: keys.session_secret,
	maxAge: 30 * 24 * 60 * 60 * 1000
}));

require("./routes/router")(app, passport, currencies);

app.listen(PORT, () => console.log("App listening on port ", PORT));
