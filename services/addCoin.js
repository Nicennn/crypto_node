module.exports = (app, User) => {

	const addCoin = newCoin => {
		User.findOne({email: req.session.email}, (err, user) => {
			console.log(user);
			if (err) {
				console.log("ERROR: ", error);
			} else if (user) {
				user.coins.push(newCoin).save();
			} else {
				console.log("No such user")
			}
		});
	};
};
