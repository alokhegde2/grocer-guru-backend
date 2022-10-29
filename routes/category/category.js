const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");

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
app.post("/create-matrix", async (req, res) => {
  // Log the files to the console
  console.log(req.files);

  // All good
  res.sendStatus(200);
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
    image_path: `http://127.0.0.1:3000/upload/category/${image.name}`,
  });
});

module.exports = app;
