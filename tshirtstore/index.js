const app = require("./app");
const connectWithDB = require("./config/database");
const cloudinary = require("cloudinary");
require("dotenv").config();

//Database connection
connectWithDB();

//cloudinary connection

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at ${process.env.PORT} ...`);
});
