const mongoose =  require("mongoose");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const userSchema = mongoose.Schema({
	email: String,
	password: String,
	coins: [String]
});

userSchema.methods.hash = (password) => {
	return bcrypt.hashSync(password, saltRounds);
};

//userSchema.methods.hash = (password, saltRounds) => {
//	bcrypt.hash(password, saltRounds).then(
//		function(hash) {
//			console.log(this);
//		}
//	);
//};

userSchema.methods.comparePasswdHash = password => {
	return bcrypt.compare(password, this.local.password);
}

module.exports = mongoose.model("User", userSchema);
