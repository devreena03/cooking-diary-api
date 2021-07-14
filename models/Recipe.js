const mongoose = require("mongoose");
const slugify = require("slugify");

const RecipeSchema = new mongoose.Schema({
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
});

RecipeSchema.pre("save", function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

module.exports = mongoose.model("Recipe", RecipeSchema);
