const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(
    `mongo db connected : ${conn.connection.host}`.cyan.underline.bold
  );
};
module.exports = connectDB;
