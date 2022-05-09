const express = require("express");
const fileUpload = require("express-fileupload");
const session = require("express-session");
require("dotenv").config();
const mypostpass = require("./middleware/mypostpass");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({ secret: "mySecret", resave: false, saveUninitialized: false })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.get("/myget", (req, res) => {
  console.log(req.body);

  res.send(req.body);
});

app.post("/mypost", mypostpass, (req, res) => {
  //console.log(details);

  //res.send(details);

  // res.json({details}).redirect("/details");
  res.redirect("/details");
});

app.get("/details",  (req, res) => {
  console.log(req.session.context);
  let result =  req.session.context;
  // req.session.context = null;
  console.log(result, "shalabh");
  // req.session.details = null;
  res.render("details", { result: result });
});

app.get("/mygetform", (req, res) => {
  res.render("getform");
});

app.get("/mypostform", (req, res) => {
  res.render("postform");
});

app.listen(3000, () => console.log(`server is running at port 3000`));
