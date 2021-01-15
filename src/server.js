const express = require("express");
const listEndpoints = require("express-list-endpoints");
const cors = require("cors");
const mongoose = require("mongoose");
const { join } = require("path");
require("dotenv").config();
const productsRouter = require("./services/products");
const reviewsRouter = require("./services/reviews");
const cartsRouter = require("./services/carts");

const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  badRequestHandler,
  catchAllHandler,
} = require("./errorHandlers");

const server = express();

const port = process.env.PORT || 3001;

const staticFolderPath = join(__dirname, "../public");
server.use(express.static(staticFolderPath));
server.use(express.json());

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`);
  next();
};

server.use(cors());
server.use(express.json());
server.use(loggerMiddleware);
server.use(express.static(staticFolderPath));

server.get("/", (req, res, next) => res.send("Server is running..."));
server.use("/products", productsRouter);
server.use("/reviews", reviewsRouter);
server.use("/carts", cartsRouter);

// ERROR HANDLERS
server.use(notFoundHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(badRequestHandler);
server.use(catchAllHandler);

console.log(listEndpoints(server));
const mongo_db = process.env.MONGO_URI;
console.log(mongo_db);
mongoose
  .connect(mongo_db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(port, () => {
      if (process.env.NODE_ENV === "production") {
        console.log("Running on cloud on port", port);
      } else {
        console.log("Running locally on port", port);
      }
    })
  )
  .catch((err) => console.log(err));
