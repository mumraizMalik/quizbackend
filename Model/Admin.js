const mongoose = require("mongoose");

const Admin = new mongoose.Schema(
  {
    userName: { type: String, require: true },
    password: { type: String, require: true },
  },
  { Collection: "AdminData" }
);

const model = mongoose.model("AdminDataModel", Admin);
module.exports = model;
