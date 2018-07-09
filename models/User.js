const mongoose =  require("mongoose");

const userSchema = mongoose.Schema({
	email: String,
	password: String,
	coins: [String]
});

mongoose.model("users", userSchema);
