const User = require("../model/user");
const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const jwt = require("jsonwebtoken");

exports.isloggedIn = BigPromise(async (req, res, next) => {
  //grab the token from the cookie or the headers
  const token =
    req.cookies.token ||
    (req.header("Authorization") ? req.header("Authorization") : null);

  //check for the existence of the token, if not return the error

  if (!token) {
    return next(new CustomError("Login first to access this page"), 400);
  }

  //decode the token using the jwt

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  //set the req.user field

  req.user = await User.findById(decoded.id);

  next();
});

exports.customRoles = (...roles) => {
  return BigPromise((req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError("You are not allowed to use this resource", 400)
      );
    }

    next();
  });
};
