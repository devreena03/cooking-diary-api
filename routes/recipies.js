const express = require("express");
const {
  getAllrecipies,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipies");

const router = express.Router({ mergeParams: true });

router.route("/").get(getAllrecipies).post(createRecipe);
router.route("/:id").get(getRecipeById).put(updateRecipe).delete(deleteRecipe);

module.exports = router;
