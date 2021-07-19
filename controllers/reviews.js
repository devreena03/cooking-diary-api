const Review = require("../models/Review");
const Recipe = require("../models/Recipe");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");

// @desc    GET all Reviews for a recipe
// @route   GET /api/v1/recipes/:recipeId/reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviewsForRecipe = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    GET single Review by Id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReviewById = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "recipe",
    select: "name description",
  });
  if (!review) {
    return next(
      new ErrorResponse(`No Review with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: review });
});

// @desc    Add a review for recipe
// @route   POST /api/v1/recipies/:recipeId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  const recipeid = req.params.recipeId;
  req.body.recipe = recipeid;
  req.body.user = req.user.id;
  console.log(req.body);

  const recipe = await Recipe.findById(recipeid);
  if (!recipe) {
    return next(new ErrorResponse(`No recipe found with id ${recipeid}`, 404));
  }

  if (recipe.visibility == "Private" && recipe.user != req.user.id) {
    return next(new ErrorResponse(`Not authorized to rate this recipe`, 403));
  }
  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    body: review,
  });
});

// @desc    Update a review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(`Not found ${req.params.id}`, 404));
  }

  if (review.user != req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to update the resource`, 403)
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: review });
});

// @desc    Delete a Reviews
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new ErrorResponse(`Not found ${req.params.id}`, 404));
  }
  if (review.user != req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to delete the resource `, 403)
    );
  }
  review.remove();
  res.status(202).json({ success: true, data: {} });
});
