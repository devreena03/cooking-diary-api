const fs = require("fs");

const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Load models
const Category = require("./models/Category");
const Recipe = require("./models/Recipe");

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Read JSON files
const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/categories.json`, "utf-8")
);

const recipies = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/recipies.json`, "utf-8")
);

//Import into db
const importData = async () => {
  try {
    await Category.create(categories);
    await Recipe.create(recipies);
    console.log("Data Imported...".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

//delete from db
const deleteData = async () => {
  try {
    await Category.deleteMany();
    await Recipe.deleteMany();
    console.log("Data Destroyed...".red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
