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
    res.status(200).json({
      success: true,
      count: recipies.length,
      data: recipies,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
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

  // Make sure user is recipe owner
  if (recipe.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access the resource`,
        403
      )
    );
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

  req.body.user = req.user.id;
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

  let recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse("resource not found", 404));
  }

  // Make sure user is recipe owner
  if (recipe.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access the resource`,
        403
      )
    );
  }

  recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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

  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    return next(new ErrorResponse("resource not found", 404));
  }

  // Make sure user is recipe owner
  if (recipe.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access the resource`,
        403
      )
    );
  }
  recipe.remove();
  res.sendStatus(202);
});
