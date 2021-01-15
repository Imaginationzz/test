const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const ReviewSchema = new Schema(
  { comment: String, rate: String },
  { timestamps: true }
);

module.exports = mongoose.model("Author", ReviewSchema); // bounded to Users collections
