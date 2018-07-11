module.exports = (passport, LocalStrategy, User) => {

	// Serialize for session
	passport.serializeUser((user, done) => {
		done(null, user.email);
	});

	// Deserialize for session
	passport.deserializeUser((email, done) => {
		User.find({ email: email }, (err, user) => {
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
						req.session.email = newUser.email;
						req.session.coins = [];
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
					if (user.checkPassword(password, user.password)) {
						req.session.email = user.email;
						req.session.coins = user.coins;
						return done(null, user);
					} else {
						return done(null, false, {message: "bad password"});
					}
				}
			});
		}
	));
};
