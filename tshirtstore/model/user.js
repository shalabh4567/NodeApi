const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [40, "Name should be less than 40 char"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    validate: [validator.isEmail, "Please enter an email in correct format"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [6, "Password should be at least 6 characters"],
    select: true,
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    id: {
      type: String,
      require: true,
    },
    secure_url: {
      type: String,
      require: true,
    },
  },
  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//encrypt password before saving

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//Validate password while checking

userSchema.methods.isValidatedPassword = async function (userSendPassword) {
  return await bcrypt.compare(userSendPassword, this.password);
};

//Generate JWT token for the usage

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

//generate forgot password token for the usage

userSchema.methods.getForgotPasswordToken = function () {
  //generate string from crypto
  const forgotToken = crypto.randomBytes(20).toString("hex");

  //getting hash from crypto: make sure to get a hash

  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  // setting a expiry for the forgot password token

  this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000;

  //ensure to return forgotPasswordToken

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
