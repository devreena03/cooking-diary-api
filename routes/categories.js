const express = require("express");
const recipiesRouter = require("./recipies");

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryPhotoUpload,
} = require("../controllers/categories");

const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.use("/:categoryId/recipies", recipiesRouter);
router.route("/").get(protect, getAllCategories).post(protect, createCategory);
router
  .route("/:id")
  .get(protect, getCategoryById)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);
router.route("/:id/photo").put(protect, categoryPhotoUpload);

module.exports = router;
