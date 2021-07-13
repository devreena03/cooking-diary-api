const path = require("path");
const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const fileupload = require("express-fileupload");

//load config file
dotenv.config({ path: "./config/config.env" });

//loads local files
const connectDb = require("./config/db");
const categoriesRouter = require("./routes/categories");
const recipiesRouter = require("./routes/recipies");
const errorHandler = require("./middlewares/error");
const app = express();

//connect db
connectDb();

//body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/recipies", recipiesRouter);
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
