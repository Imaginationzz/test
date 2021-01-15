const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../lib/cloudinary");

const mongoose = require("mongoose");
const productModel = require("../../models/Product");

const productRouter = express.Router();

const { check, validationResult } = require("express-validator");
const uniqid = require("uniqid");

productRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new productModel(req.body);

    const { _id } = await newProduct.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

productRouter.get("/", async (req, res, next) => {
  try {
    const products = await productModel.find();
    res.send(products);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id);
    res.send(product);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.put("/:id", async (req, res, next) => {
  try {
    const modifiedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    if (modifiedProduct) {
      res.send(modifiedProduct);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.delete("/:id", async (req, res, next) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);
    if (product) {
      res.send(product);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.post("/:id/reviews", async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId, { _id: 0 });
    const review = { ...product.toObject(), ...req.body, date: new Date() };

    const updated = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          reviews: review,
        },
      },
      { runValidators: true, new: true }
    );
    res.status(201).send(updated);
  } catch (error) {
    next(error);
  }
});
productRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const { reviews } = await productModel.findById(req.params.id, {
      reviews: 1,
      _id: 0,
    });
    res.send(reviews);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.get("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const { reviews } = await productModel.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    );

    if (reviews && reviews.length > 0) {
      res.send(reviews[0]);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.delete("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const modifiedProduct = await productModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          reviews: {
            _id: mongoose.Types.ObjectId(req.params.reviewId),
          },
        },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    res.send(modifiedProduct);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productRouter.put("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const { reviews } = await productModel.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    );

    if (reviews && reviews.length > 0) {
      const reviewToEdit = { ...reviews[0].toObject(), ...req.body };

      const modifiedReview = await productModel.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
          "reviews._id": mongoose.Types.ObjectId(req.params.reviewId),
        },
        { $set: { "reviews.$": reviewToEdit } },
        {
          runValidators: true,
          new: true,
        }
      );
      res.send(modifiedReview);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// cloudinary endPoint

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce",
  },
});

const cloudinaryMulter = multer({ storage: storage });

productRouter.post(
  "/",
  cloudinaryMulter.single("product_image"),

  async (req, res, next) => {
    try {
      const validationErrors = validationResult(req);

      const whiteList = ["name", "description"];

      if (!validationErrors.isEmpty()) {
        const error = new Error();
        error.httpStatusCode = 400;
        error.message = validationErrors;
        next(error);
      } else {
        const products = await getProducts();

        products.push({
          _id: uniqid(),
          ...req.body,
          imageUrl: req.file.path,
          createdAt: new Date(),
          updatedAt: new Date(),

          reviews: [],
        });
        await writeProducts(products);
        res.status(201).send();
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = productRouter;
