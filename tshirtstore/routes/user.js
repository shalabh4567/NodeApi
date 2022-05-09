const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  forgotpassword,
  passwordReset,
  getLoggedInUserDetails,
  passwordChange,
  userDetailsUpdate,
  adminAllUsers,
  managerAllUsers,
  adminGetOneUser,
  adminOneUserDetailsUpdate,
  adminOneUserDetailsDelete,
} = require("../controllers/userController");
const { isloggedIn, customRoles } = require("../middleware/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotpassword").post(forgotpassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isloggedIn, getLoggedInUserDetails);
router.route("/password/update").get(isloggedIn, passwordChange);
router.route("/userdashboard/update").post(isloggedIn, userDetailsUpdate);

//admin only route
router
  .route("/admin/users")
  .post(isloggedIn, customRoles("admin"), adminAllUsers);

router
  .route("/admin/user/:id")
  .get(isloggedIn, customRoles("admin"), adminGetOneUser)
  .post(isloggedIn, customRoles("admin"), adminOneUserDetailsUpdate)
  .delete(isloggedIn, customRoles("admin"), adminOneUserDetailsDelete);

//manger only route
router
  .route("/manager/users")
  .post(isloggedIn, customRoles("manager"), managerAllUsers);

module.exports = router;
