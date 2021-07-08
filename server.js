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
const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${port}!`.yellow
      .bold
  );
});
