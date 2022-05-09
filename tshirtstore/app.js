const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const app = express();
const morgan = require("morgan");

//just for testing
app.set("view engine", "ejs");

//regular middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

//morgan middleware
app.use(morgan("tiny"));

//import all routes here

const home = require("./routes/home");
const user = require("./routes/user");
const product = require("./routes/product");

app.use("/api/v1", home);
app.use("/api/v1", user);
app.use("/api/v1", product);

app.get("/signuptest", (req, res) => {
  res.render("signuptest");
});

module.exports = app;
