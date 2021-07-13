const Recipe = require("../models/Recipe");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middlewares/async");
const log = require("../utils/Logger")("Recipe controller");

// @desc    GET all recipies
// @route   GET /api/v1/recipies
// @route   GET /api/v1/categories/:categoryId/recipies
// @access  Private
exports.getAllrecipies = asyncHandler(async (req, res, next) => {
  let recipies;
  if (req.params.categoryId) {
    log.info("categoryId :", req.params.categoryId);
    recipies = await Recipe.find({ category: req.params.categoryId });
  } else {
    recipies = await Recipe.find();
  }

  res.status(200).json({
    success: true,
    count: recipies.length,
    data: recipies,
  });
});

// @desc    GET single Recipe
// @route   GET /api/v1/recipies/:id
// @access  Private
exports.getRecipeById = asyncHandler(async (req, res, next) => {
  log.info("id: ", req.params.id);
  const recipe = await Recipe.findById(req.params.id).populate({
    path: "category",
  });

  if (!recipe) {
    return next(new ErrorResponse("resource not found", 404));
  }

  res.status(200).json({
    success: true,
    data: recipe,
  });
});

// @desc    Create a recipe
// @route   POST /api/v1/recipies
// @access  Private
exports.createRecipe = asyncHandler(async (req, res, next) => {
  log.info("body data", req.body);
  const recipe = await Recipe.create(req.body);

  res.status(201).json({
    success: true,
    data: recipe,
  });
});

// @desc    Update a recipe
// @route   PUT /api/v1/recipies
// @access  Private
exports.updateRecipe = asyncHandler(async (req, res, next) => {
  log.info("body data", req.body);

  const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!recipe) {
    return next(new ErrorResponse("resource not found", 404));
  }

  res.status(200).json({
    success: true,
    data: recipe,
  });
});

// @desc    Delete a recipe
// @route   Delete /api/v1/recipies
// @access  Private
exports.deleteRecipe = asyncHandler(async (req, res, next) => {
  log.info(" id : ", req.params.id);

  const recipe = await Recipe.findByIdAndDelete(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse("resource not found", 404));
  }
  res.sendStatus(202);
});