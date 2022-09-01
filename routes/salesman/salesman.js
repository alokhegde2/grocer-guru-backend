const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//importing dot env
require("dotenv/config");

//Importing model
const Salesman = require("../../models/salesman/salesman");

// Validation
const {
  salesmanCreationValidation,
  salesmanLoginValidation,
  passwordCreationValidation,
} = require("../../validation/salesman/salesman_validation");

// JWT verification middleware
const verify = require("../../helpers/verify");

// Creating the salesman id
// This is done by the admin

app.post("/create", verify, async (req, res) => {
  //Validating the data before creating the salesman

  const { error } = salesmanCreationValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  const { name, area, address, phoneNumber } = req.body;

  //Checking for the number exists or not
  const phoneNumberExists = await Salesman.findOne({
    phoneNumber: phoneNumber,
  });

  if (phoneNumberExists) {
    return res
      .status(400)
      .json({ status: "error", message: "Phone number already in use" });
  }

  // Creating sales person Id
  const salesmanCount = await Salesman.count();

  // Creating the salesman data
  const data = {
    name: name,
    area: area,
    code: salesmanCount + 1,
    address: address,
    phoneNumber: phoneNumber,
  };

  var salesman = new Salesman(data);

  try {
    await salesman.save();
    return res
      .status(200)
      .json({ status: "success", message: "Salesman created successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

// Login of the sales man
// Data collected is Salesman Code (code) and Password
app.post("/login", async (req, res) => {
  //Validating the data before logging in the salesman

  const { error } = salesmanLoginValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  const { code, password } = req.body;

  //Check the user existance
  const salesmanData = await Salesman.findOne({ code: code });

  if (!salesmanData) {
    return res
      .status(400)
      .json({ status: "error", message: "Salesman not found" });
  }

  //Check if passoword created
  if (salesmanData["hashedPassword"] === "") {
    return res
      .status(400)
      .json({ status: "error", message: "Password is not created" });
  }

  //comparing two passwords one is user entered and another one is the actual password
  const validPass = await bcrypt.compare(
    password,
    salesmanData["hashedPassword"]
  );

  //If passwords do not match
  if (!validPass) {
    return res.status(400).json({ message: "Invalid password" });
  }

  //importing secret password
  const secret = process.env.SECRET;

  //Creating jwt
  const token = jwt.sign(
    {
      id: salesmanData["_id"],
      code: salesmanData["code"],
    },
    secret,
    { expiresIn: "7d" }
  );

  //returning succes with header auth-token
  return res
    .status(200)
    .header("auth-token", token)
    .json({ status: "success", authToken: token });
});

//Creating password if not created

app.post("/createPassword", async (req, res) => {
  //Validating the data before logging in the salesman

  const { error } = passwordCreationValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  //GEtting data from body

  const { code, password } = req.body;

  //Check the user existance
  const salesmanData = await Salesman.findOne({ code: code });

  if (!salesmanData) {
    return res
      .status(400)
      .json({ status: "error", message: "Salesman not found" });
  }

  //Check if passoword created
  if (salesmanData["hashedPassword"] !== "") {
    return res
      .status(400)
      .json({ status: "error", message: "Password is already created" });
  }

  //Hashing the password
  //creating salt for hashing
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  // Running update query to update the document
  try {
    const update = { hashedPassword: hashPassword };

    const updateStatus = await Salesman.findByIdAndUpdate(
      salesmanData["_id"],
      update
    );

    return res
      .status(200)
      .json({ status: "success", message: "Password Created Succefully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

// GETTING THE LIST OF SALESPERSON
app.get("/", verify, async (req, res) => {});

module.exports = app;
