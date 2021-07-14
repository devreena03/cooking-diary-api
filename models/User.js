const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//const randomize = require('randomatic');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  role: {
    type: String,
    enum: ["user", "chef", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: [6, "Password should be minimum of 6 character"],
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  confirmEmailToken: String,
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedToken = function () {
  var token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  return token;
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email confirm token
UserSchema.methods.generateEmailConfirmToken = function () {
  // email confirmation token
  const confirmationToken = crypto.randomBytes(20).toString("hex");

  this.confirmEmailToken = crypto
    .createHash("sha256")
    .update(confirmationToken)
    .digest("hex");

  const confirmTokenExtend = crypto.randomBytes(100).toString("hex");
  const confirmTokenCombined = `${confirmationToken}.${confirmTokenExtend}`;
  return confirmTokenCombined;
};

module.exports = mongoose.model("User", UserSchema);
