const path = require("path");
const Category = require("../models/Category");
const ErrorResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middlewares/async");
const log = require("../utils/Logger")("Category controller");

// @desc    GET all categories
// @route   GET /api/v1/categories
// @access  Private
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    GET single category
// @route   GET /api/v1/categories/:id
// @access  Private
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  log.info("id: ", req.params.id);
  const category = await Category.findById(req.params.id).populate(
    "recipies",
    "name preprationTime "
  );

  if (!category) {
    return next(new ErrorResponse("resource not found", 404));
  }

  // Make sure user is category owner
  if (category.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access the resource`,
        403
      )
    );
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Create a category
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = asyncHandler(async (req, res, next) => {
  log.info("body data", req.body);
  req.body.user = req.user.id;
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Update a category
// @route   PUT /api/v1/categories
// @access  Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  log.info("body data", req.body);

  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse("resource not found", 404));
  }

  // Make sure user is category owner
  if (category.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this category`,
        403
      )
    );
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Delete a category
// @route   Delete /api/v1/categories
// @access  Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  log.info(" id : ", req.params.id);

  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse("resource not found", 404));
  }
  // Make sure user is category owner
  if (category.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this category`,
        403
      )
    );
  }

  category.remove();

  res.sendStatus(202);
});

// @desc      Upload photo for category
// @route     PUT /api/v1/categories/:id/photo
// @access    Private
exports.categoryPhotoUpload = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) return next(new ErrorResponse("resource not found", 404));

  // Make sure user is category owner
  if (category.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this category`,
        403
      )
    );
  }

  if (!req.files) return next(new ErrorResponse("Please upload a file", 400));

  const file = req.files.image;

  //Make sure the image is a photo
  if (!file.mimetype.startsWith("image"))
    return next(new ErrorResponse(`Please upload an image file`, 400));

  // Check filesize
  console.log(
    `file size ${file.size / (1024 * 1024)} MB and max size ${
      process.env.MAX_FILE_UPLOAD / (1024 * 1024)
    } MB`
  );
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${
          process.env.MAX_FILE_UPLOAD / (1024 * 1024)
        } MB`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${category._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Category.findByIdAndUpdate(req.params.id, { photo: file.name });

    const fileUrl = `${req.protocol}://${req.headers.host}/uploads/${file.name}`;
    console.log(fileUrl);

    res.status(200).json({
      success: true,
      data: file.name,
      link: {
        type: "GET",
        url: fileUrl,
      },
    });
  });
});
