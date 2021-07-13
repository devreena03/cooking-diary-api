const ErrorResponse = require("../utils/ErrorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.log(err.name.blue);
  console.log(err.stack.red.bold);

  //mongoose bad obectid
  if (err.name === "CastError") {
    error = new ErrorResponse(`Resource not found`, 404);
  }

  //mongoose duplicate key error
  if (err.code === 11000) {
    error = new ErrorResponse("Duplicate field value entered", 400);
  }

  //mongoose Input field validation
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    console.log(message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
