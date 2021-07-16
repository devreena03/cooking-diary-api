const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [true, "Please provide your comment"],
    trim: true,
    maxlength: [500, "comment can't be more than 500 character"],
  },
  tips: {
    type: String,
    maxlength: [
      500,
      "Tips/Suggestion for future can't be more than 500 character",
    ],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, "Please add a rating between 1 and 5"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  recipe: {
    type: mongoose.Schema.ObjectId,
    ref: "Recipe",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (recipeId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: recipeId },
    },
    {
      $group: {
        _id: "$recipe",
        personalRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Recipe").findByIdAndUpdate(recipeId, {
      personalRating: obj[0].personalRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
ReviewSchema.post("save", async function () {
  await this.constructor.getAverageRating(this.recipe);
});

// Call getAverageCost before remove
ReviewSchema.post("remove", async function () {
  await this.constructor.getAverageRating(this.recipe);
});

module.exports = mongoose.model("Review", ReviewSchema);
