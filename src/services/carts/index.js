const express = require("express");
const { check, validationResult } = require("express-validator");
const uniqid = require("uniqid");
const { getCarts, writeCarts } = require("../../lib/fsUtilities");
const { getProducts, writeProducts } = require("../../lib/fsUtilities");

const cartsRouter = express.Router();

const cartsValidation = [
  check("name").exists().withMessage("First name is required!"),
  check("surname").exists().withMessage("Surname is required!"),
];

const productsValidation = [
  check("name").exists().withMessage("Product Name is required!"),
  check("brand").exists().withMessage("Brand is required!"),
  check("price").exists().withMessage("Price is required!"),
];

cartsRouter.get("/:cartId", async (req, res, next) => {
  try {
    const carts = await getCarts();

    const cartFound = carts.find((cart) => cart._id === req.params.cartId);

    if (cartFound) {
      res.send(cartFound);
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

cartsRouter.post(
  "/:cartId/add-to-cart/:productId",
  productsValidation,
  async (req, res, next) => {
    try {
      const carts = await getCarts();
      const products = await getProducts();

      const productIndex = products.findIndex(
        (product) => product._id === req.params.productId
      );

      // const cartIndex = carts.findIndex(
      //   (cart) => cart._id === req.params.cartId
      // );

      if (productIndex !== -1) {
        // cart found
        carts.push({
          _id: uniqid(),
          ...req.body,
          products: [
            {
              name: products[productIndex].name,
              brand: products[productIndex].brand,
              description: products[productIndex].description,
              price: products[productIndex].price,
              _id: products[productIndex]._id,
            },
          ],
        });
        await writeCarts(carts);
        res.status(201).send(carts);
      } else {
        // cart not found
        const error = new Error();
        error.httpStatusCode = 404;
        next(error);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

cartsRouter.delete(
  "/:cartId/remove-from-cart/:productId",
  async (req, res, next) => {
    try {
      const carts = await getcarts();

      const cartIndex = carts.findIndex(
        (cart) => cart._id === req.params.cartId
      );

      if (cartIndex !== -1) {
        carts[cartIndex].products = carts[cartIndex].products.filter(
          (product) => product._id !== req.params.productId
        );

        await writeCarts(carts);
        res.send(carts);
      } else {
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

module.exports = cartsRouter;
