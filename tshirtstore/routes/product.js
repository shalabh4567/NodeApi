const express = require("express");
const router = express.Router();
const {  } = require("../controllers/productController");

router.route("/testproduct").get();

module.exports = router;
