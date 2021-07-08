const path = require("path");
const Category = require("../models/Category");
const ErrorResponse = require("../utils/ErrorResponse");
const manager = require("simple-node-logger").createLogManager();

manager.createConsoleAppender();
const log = manager.createLogger("Category controller");

// @desc    GET all categories
// @route   GET /api/v1/categories
// @access  Private
exports.getAllCategories = async (req, res, next) => {
  const categories = await Category.find();

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
};

// @desc    GET single category
// @route   GET /api/v1/categories/:id
// @access  Private
exports.getCategoryById = async (req, res, next) => {
  log.info("id: ", req.params.id);
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "resource not found",
    });
  }

  res.status(200).json({
    success: true,
    data: category,
  });
};

// @desc    Create a category
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
  log.info("body data", req.body);
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category,
  });
};

// @desc    Update a category
// @route   PUT /api/v1/categories
// @access  Private
exports.updateCategory = async (req, res, next) => {
  log.info("body data", req.body);

  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "resource not found",
    });
  }

  res.status(200).json({
    success: true,
    data: category,
  });
};

// @desc    Delete a category
// @route   Delete /api/v1/categories
// @access  Private
exports.deleteCategory = async (req, res, next) => {
  log.info(" id : ", req.params.id);

  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "resource not found",
    });
  }

  res.sendStatus(202);
};

// @desc      Upload photo for category
// @route     PUT /api/v1/categories/:id/photo
// @access    Private
exports.categoryPhotoUpload = async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "resource not found",
    });
  }

  if (!req.files) {
    return res.status(400).json({
      success: false,
      message: "Please upload a file",
    });
    // return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.image;

  // Make sure the image is a photo
  // if (!file.mimetype.startsWith("image")) {
  //   Please upload a file
  //   return next(new ErrorResponse(`Please upload an image file`, 400));
  // }

  // Check filesize
  // console.log(
  //   `file size ${file.size / (1024 * 1024)} MB and max size ${
  //     process.env.MAX_FILE_UPLOAD / (1024 * 1024)
  //   } MB`
  // );
  // if (file.size > process.env.MAX_FILE_UPLOAD) {
  //   return next(
  //     new ErrorResponse(
  //       `Please upload an image less than ${
  //         process.env.MAX_FILE_UPLOAD / (1024 * 1024)
  //       } MB`,
  //       400
  //     )
  //   );
  // }

  // Create custom filename
  file.name = `photo_${category._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      // return next(new ErrorResponse(`Problem with file upload`, 500));
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
};