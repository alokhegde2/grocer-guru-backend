const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const verify = require("../../helpers/verify");

//Importing models
const ProductMatrix = require("../../models/product/product_matrix_model");
const Product = require("../../models/product/product_model");

//Importing validations
const {
  productMatrixCreationValidation,
  productCreationValidation,
} = require("../../validation/product/product_validation");

// Use the express-fileupload middleware
app.use(
  fileUpload({
    limits: {
      fileSize: 10000000, // Around 10MB
    },
    abortOnLimit: true,
  })
);

app.use(express.static("public"));

//Creating the product matrix
//This route is mainly used by the admin
app.post("/create-matrix", verify, async (req, res) => {
  //Data recived from body
  const { productName, productImageUrl, categoryId } = req.body;

  //Verify the data came from the body
  const { error } = productMatrixCreationValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  // VERIFYING category ID
  if (!mongoose.isValidObjectId(categoryId)) {
    return res.status(400).json({ message: "Invalid Category" });
  }

  //Creating category
  var newMatrix = new ProductMatrix({
    productName: productName,
    productImageUrl: productImageUrl,
    category: categoryId,
  });

  //Saving the data
  try {
    await newMatrix.save();

    return res.status(200).json({
      status: "success",
      message: "Product Matrix Created Successfully!",
      productMatrix: newMatrix,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: "error",
      message: "Unable to create product matrix",
      error: error,
    });
  }
});

//Getting Product List
app.get("/", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  //Getting the category list
  try {
    var productList = await ProductMatrix.find()
      .populate({
        path: "category",
        select: ["categoryName", "categoryImageUrl", "_id"],
      })
      .sort({ createdDate: "desc" })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json({ status: "success", products: productList });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ status: "error", message: "Some error occured", error: error });
  }
});

//Getting Product List on the basis of category
app.get("/category-product/:categoryId", verify, async (req, res) => {
  const { categoryId } = req.params;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  // VERIFYING category ID
  if (!mongoose.isValidObjectId(categoryId)) {
    return res.status(400).json({ message: "Invalid Category" });
  }

  //Getting the category list
  try {
    var productList = await ProductMatrix.find({ category: categoryId })
      .populate({
        path: "category",
        select: ["categoryName", "categoryImageUrl", "_id"],
      })
      .sort({ createdDate: "desc" })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json({ status: "success", products: productList });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ status: "error", message: "Some error occured", error: error });
  }
});

//Route to add the product by retailer
app.post("/add", verify, async (req, res) => {
  const {
    productId,
    categoryId,
    retailerId,
    availableQuantity,
    availableVarients,
  } = req.body;

  //Verify the data came from the body
  const { error } = productCreationValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  //Verifying all id's
  if (!mongoose.isValidObjectId(categoryId)) {
    return res
      .status(400)
      .json({ message: "Invalid Category,please contact admin" });
  }
  if (!mongoose.isValidObjectId(productId)) {
    return res
      .status(400)
      .json({ message: "Invalid Product,please contact admin" });
  }
  if (!mongoose.isValidObjectId(retailerId)) {
    return res
      .status(400)
      .json({ message: "Invalid Shop,please contact admin" });
  }

  var newProduct = new Product({
    availableVarients: availableVarients,
    availableQuantity: availableQuantity,
    category: categoryId,
    product: productId,
    retailer: retailerId,
  });

  //Saving the data to db
  try {
    await newProduct.save();

    return res.status(200).json({
      status: "success",
      message: "Product Created Successfully!",
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: "error",
      message: "Unable to create product!",
      error: error,
    });
  }
});

//Uploading images related to the category
app.post("/upload", async (req, res) => {
  const files = req.files;

  //Checking if file is present or not
  if (!files)
    return res
      .status(400)
      .json({ status: "error", message: "File not found!" });

  //Getting image from the request
  const { image } = req.files;

  // If does not have image mime type prevent from uploading
  if (!/^image/.test(image.mimetype))
    return res
      .status(400)
      .json({ status: "error", message: "Please choose the image." });

  // Move the uploaded image to our upload folder
  image.mv(__dirname + "/../.." + "/upload/product/" + image.name);

  // All good
  return res.status(200).json({
    status: "success",
    message: "Image uploaded successfully!",
    image_path: `http://${req.hostname}/upload/product/${image.name}`,
  });
});

module.exports = app;
