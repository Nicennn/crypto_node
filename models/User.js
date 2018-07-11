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

userSchema.methods.checkPassword = (password, userPassword) => {
	return bcrypt.compareSync(password, userPassword);
}

module.exports = mongoose.model("User", userSchema);
