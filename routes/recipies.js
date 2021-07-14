const express = require("express");
const {
  getAllrecipies,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipies");

const router = express.Router({ mergeParams: true });

router.route("/").get(protect, getAllrecipies).post(protect, createRecipe);
router
  .route("/:id")
  .get(protect, getRecipeById)
  .put(protect, updateRecipe)
  .delete(protect, deleteRecipe);

module.exports = router;
