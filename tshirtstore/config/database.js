const mongoose = require("mongoose");

const connectWithDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log(`DB Connected Successfully`))
    .catch((error) => {
      console.log("DB Connection Issues");
      console.log(error);
      process.exit(1);
    });
};

module.exports = connectWithDB;
