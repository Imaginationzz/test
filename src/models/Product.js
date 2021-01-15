const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    imageUrl: String,

    reviews: [{ type: Schema.Types.ObjectId, ref: "reviews" }],
  },

  {
    timestamps: true,
  }
);

const productModel = model("products", productSchema);

module.exports = productModel;
