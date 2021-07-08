const express = require("express");
const { getAllCategories } = require("../controllers/categories");

const router = express.Router();

router.route("/").get(getAllCategories);

module.exports = router;
