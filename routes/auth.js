const express = require("express");
const {
  register,
  confirmEmail,
  loginUser,
  forgotPassword,
  getMe,
  resetPassword,
  logout,
} = require("../controllers/auth");

const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(loginUser);
router.route("/logout").get(protect, logout);
router.route("/me").get(protect, getMe);
router.route("/forgotpassword").get(forgotPassword);
router.route("/resetpassword/:resettoken").put(resetPassword);
router.route("/confirmemail/:emailtoken").put(confirmEmail);

//router.route("/:id").get(getRecipeById).put(updateRecipe).delete(deleteRecipe);

module.exports = router;
