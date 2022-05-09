const session = require('express-session')
const cloudinary = require("cloudinary").v2;


const mypostpass = async (req, res, next) => {
  console.log(req.body);
  //console.log(req.files);

  let file = req.files.samplefile;

  //console.log(file);
  result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "users",
  });

  console.log(result);

  req.session.context = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    public_id: result.public_id,
    secure_url: result.secure_url,
  };

  return next();
};

module.exports = mypostpass;
