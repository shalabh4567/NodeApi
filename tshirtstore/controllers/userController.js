const User = require("../model/user");
const BigPromise = require("../middleware/bigPromise");
const mailHelper = require("../utils/emailHelper");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  let result;

  if (req.files) {
    let file = req.files.photo;

    result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "user",
      width: 150,
      crop: "scale",
    });
  }

  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return next(new CustomError("All fields are required", 400));
  }

  // check for existing user

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).send("User with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (result) {
    user.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };

    await user.save();
  }

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  //check if all the fields are there

  if (!email || !password) {
    return next(new customError("please provide email and password", 400));
  }

  //collect the user details

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next("email or password doesn't match or exists", 400);
  }

  //password validation

  const isPassordCorrect = await user.isValidatedPassword(password);

  if (!isPassordCorrect) {
    return next("password or email is not correct or doesn't exists", 400);
  }

  // if everything goes right, then send the cookie token

  cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  //simply expire the cookie token if this route is hit

  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });

  //send the json response of successful logout

  res.json({
    success: true,
    message: "Successfully logged out",
  });
});

exports.forgotpassword = BigPromise(async (req, res, next) => {
  //grab the email address for the user
  const { email } = req.body;

  //find for the user in the database
  const user = await User.findOne({ email });

  //check if the user is their or not
  if (!user) {
    return next(new CustomError("user doesnot exists"), 400);
  }

  //generate the forgot password token

  const forgotToken = user.getForgotPasswordToken();

  //save the user in the database

  await user.save({ validateBeforeSave: false });

  //set the url for the user to reset the password
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  //wirte the message for the user to click or copy the link in the browser

  const message = `clink on the link below or copy paste the url in the browser \n \n ${myUrl}`;

  //sed the email to the user using try and catch block

  try {
    //call the helper method to send the email
    await mailHelper({
      email: "shalabhpandeyjsr13@gmail.com",
      subject: "TStore resent password",
      message,
    });

    res.status(200).json({
      succsess: true,
      message: "Email sent succesfully please check your mail",
    });

    console.log("helper method executed");
  } catch (error) {
    //catch the error and make the filed undefined in the database
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    //return the error regarding the mail not send

    return next(new CustomError(error.message), 500);
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  //get the token form the url using params
  const token = req.params.token;

  //encrypt the token to compare with the token present in the database
  const encryptToken = crypto.createHash("sha256").update(token).digest("hex");

  //check for the user with that token in the database

  const user = await User.findOne({
    encryptToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  //if no user in the database then return the error

  if (!user) {
    return next(new CustomError("Token is invalid or expired"), 400);
  }

  //else compare the password and the user password

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("Password and confirm password do not match"),
      400
    );
  }

  //set the password field for the user

  user.password = req.body.password;

  //make the tokens for the reset as undefined

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  //save the user into the database

  await user.save();

  //send the token the user

  cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.passwordChange = BigPromise(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  const isPassordCorrect = await user.isValidatedPassword(req.body.oldPassword);

  if (!isPassordCorrect) {
    return next(new CustomError("old password doesnot match", 400));
  }

  user.password = req.body.password;

  await user.save();

  cookieToken(user, res);
});

exports.userDetailsUpdate = BigPromise(async (req, res, next) => {
  newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (!newData.email) {
    return next(
      new CustomError("Email is required for the data to be updated")
    );
  }

  if (req.files) {
    const user = User.findById(req.user.id);

    const imageId = user.photo.id;

    const resp = await cloudinary.uploader.destroy(imageId);

    const result = await cloudinary.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "user",
        width: 150,
        crop: scale,
      }
    );

    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true });
});

exports.adminAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({ success: true, users });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("User doesnot exists", 400));
  }

  res.status(200).json({ user });
});

exports.adminOneUserDetailsUpdate = BigPromise(async (req, res, next) => {
  newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  if (!newData.email) {
    return next(
      new CustomError("Email is required for the data to be updated")
    );
  }

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true, user });
});

exports.adminOneUserDetailsDelete = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("User doeesnot exists", 400));
  }

  console.log(user);

  if(user.hasOwnProperty('photo')){
    const imageId = user.photo.id;
    await cloudinary.uploader.destroy(imageId);
  }

  console.log("user initiated");



  await user.remove();

  console.log("user deleted");

  res.status(200).json({ success: true, message: "user deleted successfully" });
});








//manager only route
exports.managerAllUsers = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });

  res.status(200).json({ success: true, users });
});
