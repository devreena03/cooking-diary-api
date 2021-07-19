const path = require("path");
const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

//load config file
dotenv.config({ path: "./config/config.env" });

//loads local files
const connectDb = require("./config/db");
const categoriesRouter = require("./routes/categories");
const recipiesRouter = require("./routes/recipies");
const authRouter = require("./routes/auth");
const reviewRouter = require("./routes/reviews");
const userRouter = require("./routes/users");

const errorHandler = require("./middlewares/error");
const app = express();

//connect db
connectDb();

//body parser
app.use(express.json());
// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileupload());

// Sanitize data - nosql injection prevent
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent cross site scripting XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 mins
  max: 10,
});
//all request togather
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/recipies", recipiesRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/users", userRouter);
//errorhandler
app.use(errorHandler);

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${port}!`.yellow
      .bold
  );
});

//UnhandledPromiseRejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    console.log("closing server");
    process.exit(1);
  });
});
