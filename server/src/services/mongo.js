const mongoose = require("mongoose");
//for jest
require("dotenv").config();

const MONGODB_URL = process.env.MONGODB_URL;

mongoose.connection.once("on", () => console.log("MongoDB connection ready!"));
mongoose.connection.on("error", (err) => console.error(err));

module.exports = {
  connectDB: async () => await mongoose.connect(MONGODB_URL),
  closeDB: async () => await mongoose.disconnect(),
};
