const express = require("express");
const {
  getReviewsForRecipe,
  getReviewById,
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews");

const Review = require("../models/Review");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middlewares/advancedResult");

const { protect, authorize } = require("../middlewares/auth");

router
  .route("/")
  .get(protect, advancedResults(Review), getReviewsForRecipe)
  .post(protect, addReview);

router
  .route("/:id")
  .get(protect, getReviewById)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
