const fs = require("fs");

const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Load models
const Category = require("./models/Category");
const Recipe = require("./models/Recipe");
const User = require("./models/User");
const Review = require("./models/Review");

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

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8")
);

//Import into db
const importData = async () => {
  try {
    await Category.create(categories);
    await Recipe.create(recipies);
    await User.create(users);
    await Review.create(reviews);
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
    await User.deleteMany();
    await Review.deleteMany();

    Category.collection.dropIndexes(function (err, results) {
      console.log(`index dropping error ${err}`);
    });

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
