const advancedResult = (model, userFlag) => async (req, res, next) => {
  let query;
  //copy req.query
  let reqQuery = { ...req.query };
  console.log(reqQuery);

  let removeFields = ["select", "sort", "pageSize", "page"]; //limit = pageSize
  removeFields.forEach((field) => delete reqQuery[field]);

  //get the request Param field
  if (req.params.categoryId) {
    reqQuery.category = req.params.categoryId;
  } else if (req.params.recipeId) {
    reqQuery.recipe = req.params.recipeId;
  }
  //search results only for logged in user
  if (req.user.role !== "admin") {
    reqQuery.user = req.user.id;
  }

  console.log(reqQuery);

  let queryStr = JSON.stringify(reqQuery);

  //filtering query -> ?state=MA&housing=false
  queryStr = queryStr.replace(
    /\b(lt|gt|gte|lte|in)\b/g,
    (match) => `$${match}`
  );

  console.log(queryStr);
  query = model.find(JSON.parse(queryStr));

  //Select query -> ?select=name, description
  if (req.query.select) {
    let str = req.query.select.split(",").join(" ");
    console.log(str);
    query = query.select(str);
  }

  //sort
  if (req.query.sort) {
    let sortBy = req.query.sort.split(",").join(" ");
    console.log(sortBy);
    query = query.sort(sortBy);
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.pageSize, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  //exec query
  const result = await query;

  //create pagination obj for response

  const pagination = { total, page, pageSize: limit };

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      pageSize: limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      pageSize: limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: result.length,
    data: result,
    pagination,
  };

  next();
};

module.exports = advancedResult;
