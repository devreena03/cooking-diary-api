const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryPhotoUpload,
} = require("../controllers/categories");

const router = express.Router();

router.route("/").get(getAllCategories).post(createCategory);
router
  .route("/:id")
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);
router.route("/:id/photo").put(categoryPhotoUpload);

module.exports = router;
