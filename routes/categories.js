const express = require("express");
const recipiesRouter = require("./recipies");
const Category = require("../models/Category");

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  categoryPhotoUpload,
} = require("../controllers/categories");
const advancedResults = require("../middlewares/advancedResult");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.use("/:categoryId/recipies", recipiesRouter);

router.use(protect);

// Routes
/**
 * @swagger
 * /api/v1/categories :
 *  get:
 *    description: Use to request all categories
 *    responses:
 *      '200':
 *        description: A successful response
 */
router
  .route("/")
  .get(advancedResults(Category), getAllCategories)
  .post(createCategory);
router
  .route("/:id")
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);
router.route("/:id/photo").put(categoryPhotoUpload);

module.exports = router;
