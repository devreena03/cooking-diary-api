const Category = require("../models/Category");

// @desc    GET all categories
// @route   GET /api/v1/categories
// @access  Public
exports.getAllCategories = async (req, res, next) => {
  const categories = await Category.find();

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
};
