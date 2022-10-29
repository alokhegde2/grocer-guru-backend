const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const verify = require("../../helpers/verify");

//Importing models
const CategoryMatrix = require("../../models/category/category_matrix_model");

//Importing validations
const {
  categoryMatrixCreationValidation,
} = require("../../validation/category/category_validation");

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

//Creating the category matrix
//This route is mainly used by the admin
app.post("/create-matrix", verify, async (req, res) => {
  //Data recived from body
  const { categoryName, categoryImageUrl } = req.body;

  //Verify the data came from the body
  const { error } = categoryMatrixCreationValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  //Creating category
  var newMatrix = new CategoryMatrix({
    categoryImageUrl: categoryImageUrl,
    categoryName: categoryName,
  });

  //Saving the data
  try {
    await newMatrix.save();

    return res.status(200).json({
      status: "success",
      message: "Category Matrix Created Successfully!",
      categoryMatrix: newMatrix,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: "error",
      message: "Unable to create category matrix",
      error: error,
    });
  }
});

//Getting Category List
app.get("/", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  //Getting the category list
  try {
    var categoryList = await CategoryMatrix.find()
      .sort({ createdDate: "desc" })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json({ status: "success", category: categoryList });
  } catch (error) {
    return res
      .status(400)
      .json({ status: "error", message: "Some error occured", error: error });
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
  image.mv(__dirname + "/../.." + "/upload/category/" + image.name);

  // All good
  return res.status(200).json({
    status: "success",
    message: "Image uploaded successfully!",
    image_path: `http://${req.hostname}/upload/category/${image.name}`,
  });
});

module.exports = app;
