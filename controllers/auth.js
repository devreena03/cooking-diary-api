const User = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middlewares/async");
const log = require("../utils/Logger")("Auth controller");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc    POST registerUser
// @route   GET /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  log.info("body data", req.body);
  const user = await User.create(req.body);

  const emailtoken = user.generateEmailConfirmToken();
  //send mail
  const confirmEmailURL = `${req.protocol}://${req.headers.host}/api/v1/auth/confirmemail/${emailtoken}`;
  console.log(confirmEmailURL);

  const message = `Thanks for registering with us, please confirm your email. Please make a PUT request to: \n\n ${confirmEmailURL}`;

  await user.save({ validateBeforeSave: false });
  try {
    await sendEmail({
      email: user.email,
      subject: "Email confirmation",
      message,
    });

    res.status(201).json({
      success: true,
      message: "please confirm your email",
      email: user.isEmailConfirmed,
    });
  } catch (err) {
    console.log(err);
    user.confirmEmailToken = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Confirm email
// @route   PUT /api/v1/auth/confirmemail/:emailtoken
// @access  Public
exports.confirmEmail = asyncHandler(async (req, res, next) => {
  log.info(req.params.emailtoken);

  const emailtoken = req.params.emailtoken.split(".")[0];
  log.info("email token ", emailtoken);

  const confirmEmailToken = crypto
    .createHash("sha256")
    .update(emailtoken)
    .digest("hex");

  const user = await User.findOne({
    confirmEmailToken,
  });

  if (!user) {
    return next(new ErrorResponse(`Invalid token`, 400));
  }

  user.isEmailConfirmed = true;
  user.confirmEmailToken = undefined;

  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Login a User
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorResponse(`Please provide an email and password `, 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  //check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get login user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  console.log(req.user.id);
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Forget password
// @route   GET /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse(`There is no account with email ${req.body.email}`, 404)
    );
  }
  //get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //send mail
  const resetUrl = `${req.protocol}://${req.headers.host}/api/v1/auth/resetpassword/${resetToken}`;
  console.log(resetUrl);

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  console.log(req.params.resettoken);

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse(`Invalid token`, 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  console.log(req.user.id);

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    update user password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  console.log(req.user.id);

  const user = await User.findById(req.user.id).select("+password");

  //check if password matches
  const isMatch = await user.matchPassword(req.body.oldpassword);
  if (!isMatch) {
    return next(new ErrorResponse(`Password is not correct`, 401));
  }

  user.password = req.body.password;
  user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Get logout user / clear cookies
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  const option = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };

  res.status(200).cookie("token", "none", option).json({
    success: true,
    data: {},
  });
});

//Get token from  model, create cookies and send in response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedToken();

  const option = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, option)
    .json({
      success: true,
      token,
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
    });
};
