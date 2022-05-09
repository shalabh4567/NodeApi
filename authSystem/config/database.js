const mongoose = require("mongoose");

const { MONGODB_URL } = process.env;

exports.connect = () => {
  mongoose
    .connect(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log(`DataBase connected successfuly`))
    .catch((error) => {
      console.log(`connection to mongodb failed`);
      console.log(error);
      //process.exit(1);
    });
};
