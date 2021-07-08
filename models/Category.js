const mongoose = require("mongoose");
const slugify = require("slugify");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
    maxlength: [50, "Name cannot be more than 50 charcters"],
  },
  slug: String,
  description: {
    type: String,
    maxlength: [500, "Description can not be more than 500 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  //   user: {
  //     type: mongoose.Schema.ObjectId,
  //     ref: "User",
  //     required: true,
  //   },
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
});

module.exports = mongoose.model("Category", CategorySchema);
