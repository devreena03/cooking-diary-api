const express = require("express");
const Recipe = require("../models/Recipe");
const {
  getAllrecipies,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipies");
const advancedResults = require("../middlewares/advancedResult");

const router = express.Router({ mergeParams: true });
const reviewRouter = require("./reviews");
const { protect } = require("../middlewares/auth");
router.use("/:recipeId/reviews", reviewRouter);

router.use(protect);

router
  .route("/")
  .get(advancedResults(Recipe), getAllrecipies)
  .post(createRecipe);
router.route("/:id").get(getRecipeById).put(updateRecipe).delete(deleteRecipe);

module.exports = router;
