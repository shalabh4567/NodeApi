const BigPromise = require("../middleware/bigPromise");

exports.home = BigPromise(async (req, res) => {
  // const db = await something()
  res.status(201).json({
    success: true,
    greeting: "Hello from api",
  });
});

exports.homeDummy = (req, res) => {
  res.status(201).json({
    success: true,
    greeting: "This is the dummy route",
  });
};
