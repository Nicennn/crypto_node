const express = require("express");
const ejs = require("ejs");
const https = require("https");
const passport = require("passport");
const mongoose = require("mongoose");

require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;
mongoose.connect("http;//127.0.0.1:27017/cryptonode");

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/static"));

const currencies = [];

require("./routes/router")(app, currencies);

app.listen(PORT, () => console.log("App listening on port ", PORT));
