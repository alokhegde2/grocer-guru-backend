const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//importing dot env
require("dotenv/config");

//Importing model
const Salesman = require("../../models/salesman/salesman");
const Distributor = require("../../models/distributor/distributor");

// Validation
const {
  salesmanCreationValidation,
  salesmanLoginValidation,
  passwordCreationValidation,
  phoneNumberValidation,
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

// Verify phone number before sendin otp
app.post("/verifynumber", async (req, res) => {
  //Validating the data before logging in the salesman

  const { error } = phoneNumberValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  const { code, phoneNumber } = req.body;

  try {
    const statusResponse = await Salesman.findOne({
      code: code,
      phoneNumber: phoneNumber,
    });

    if (statusResponse.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid credentials." });
    } else if (statusResponse.hashedPassword != "") {
      return res
        .status(400)
        .json({ status: "error", message: "Password is already created" });
    }

    return res
      .status(200)
      .json({ status: "success", message: "Proper credentials" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
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
app.get("/", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  // GETTING ALL THE SALESPERSON

  try {
    var salesmanData = await Salesman.find()
      .sort({ createdDate: "desc" })
      .limit(limit)
      .skip(startIndex);

    if (!salesmanData) {
      return res.send(200).json({ status: "success", distributors: [] });
    }

    var salesmanCount = await Salesman.count();

    return res.status(200).json({
      status: "success",
      salesmans: salesmanData,
      salesmanCount: salesmanCount,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

// GETTING SINGLE SALESMAN DATA
app.get("/:id", verify, async (req, res) => {
  const { id } = req.params;

  // VERIFYING SALESMAN ID
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Salesperson Id" });
  }

  // GETTING THE SALESPERSON DATA
  try {
    var salesmanData = await Salesman.findById(id);

    if (!salesmanData) {
      return res
        .status(400)
        .json({ status: "error", message: "Salesman not found" });
    }

    return res.status(200).json({ status: "success", salesman: salesmanData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

app.get("/dashboard/:id", verify, async (req, res) => {
  const { id } = req.params;

  // VERIFYING SALESMAN ID
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Salesperson Id" });
  }

  //GETTING DATAS
  try {
    // GETTING TOTAL DISTRIBUTOR THAT THE CURRENT SALESMAN CREATED
    var totalDistributorCount = await Distributor.find({
      salesPersonId: id,
    }).count();
    // GETTING THE APPROVED DISTRIBUTOR
    var approvedDistributorCount = await Distributor.find({
      salesPersonId: id,
      isApproved: true,
    }).count();
    // GETTING THE REJECTED DISTRIBUTOR
    var rejectedDistributorCount = await Distributor.find({
      salesPersonId: id,
      isApproved: false,
      rejectionReason: { $ne: "" },
    }).count();

    return res.status(200).json({
      status: "success",
      allCounts: {
        totalDistributorCount: totalDistributorCount,
        approvedDistributorCount: approvedDistributorCount,
        rejectedDistributorCount: rejectedDistributorCount,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

module.exports = app;
