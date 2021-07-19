const mongoose = require("mongoose");
const slugify = require("slugify");

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 charcters"],
  },
  slug: String,
  description: {
    type: String,
    maxlength: [500, "Description can not be more than 500 characters"],
  },
  ingrediants: {
    type: [String],
    required: [true, "Please add ingreduants"],
  },
  process: {
    type: [String],
    required: [true, "Please add process"],
  },
  links: [String],
  tags: [String],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
  },
  preprationTime: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  visibility: {
    type: String,
    required: true,
    enum: ["Public", "Private"],
    default: "Private",
  },
  todo: {
    type: Boolean,
    default: false,
  },
  personalRating: Number,
  publicRating: Number,
});

RecipeSchema.index({ name: 1, user: 1 }, { unique: true });

RecipeSchema.pre("save", function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  this.updatedAt = Date.now;
  next();
});

module.exports = mongoose.model("Recipe", RecipeSchema);
