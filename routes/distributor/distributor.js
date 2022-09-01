const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//importing dot env
require("dotenv/config");

//Importing model
const Distributor = require("../../models/distributor/distributor");
const Salesperson = require("../../models/salesman/salesman");

// Validation
const {
  distributorCreationValidation,
} = require("../../validation/distributor/distributor_validation");

// JWT verification middleware
const verify = require("../../helpers/verify");

// CREATING THE DISTRIBUTOR
app.post("/", verify, async (req, res) => {
  const {
    name,
    address,
    phoneNumber,
    panCardNumber,
    gstNumber,
    bankName,
    accountName,
    accountNumber,
    ifscCode,
    upiId,
    gstFileUrl,
    panFileUrl,
    salesPersonId,
  } = req.body;

  // VERIFYING SALESPERSON ID
  if (!mongoose.isValidObjectId(salesPersonId)) {
    return res.status(400).json({ message: "Invalid Salesperson Id" });
  }

  //Validating the data before creating the salesman
  const { error } = distributorCreationValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  try {
    // CHECKING FOR SLAESPERSON IS THERE OR NOT
    var salesPersonSatus = await Salesperson.findById(salesPersonId);

    if (!salesPersonSatus) {
      return res
        .status(400)
        .json({ status: "error", message: "Salesperson Not Found!" });
    }

    //CHECK IF DISTRIBUTOR EXISTS OR NOT
    var distributorStatus = await Distributor.findOne({
      phoneNumber: phoneNumber,
    });

    if (distributorStatus) {
      return res
        .status(400)
        .json({ status: "error", message: "Mobile Number Already Exists" });
    }

    //GENERATING THE DISTRIBUTOR CODE
    var distributorCount = await Distributor.find({
      salesPersonId: salesPersonId,
    }).count();

    var salesmanCode = salesPersonSatus["code"];

    var distributorCode = salesmanCode + "-" + (distributorCount + 1);

    // CREATING THE DISTRIBUTOR INSTANCE
    var distributorData = new Distributor({
      name: name,
      address: address,
      code: distributorCode,
      phoneNumber: phoneNumber,
      panCardNumber: panCardNumber,
      gstNumber: gstNumber,
      bankName: bankName,
      accountName: accountName,
      accountNumber: accountNumber,
      ifscCode: ifscCode,
      upiId: upiId,
      gstFileUrl: gstFileUrl,
      panFileUrl: panFileUrl,
      salesPersonId: salesPersonId,
    });

    // SAVING DISTRIBUTOR DATA
    await distributorData.save();

    // EVERYTHING WENT WELL
    // RETURN RESPONSE
    return res.status(200).json({
      status: "success",
      message: "Distributor Created Successfully!",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

// GETTING ALL DISTRIBUTOR ON THE BASIS OF THE SALESPERSON ID
app.get("/salesperson/:id", verify, async (req, res) => {
  const { id } = req.params;

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  // VERIFYING SALESPERSON ID
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Salesperson Id" });
  }

  // GETTING ALL THE SALESPERSON CREATED DISTRIBUTOR
  try {
    var distributorData = await Distributor.find({ salesPersonId: id })
      .limit(limit)
      .skip(startIndex);

    if (!distributorData) {
      return res.send(200).json({ status: "success", distributors: [] });
    }

    return res
      .status(200)
      .json({ status: "success", distributors: distributorData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

// GETTING ALL DISTRIBUTOR FOR ADMIN
app.get("/", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  // GETTING ALL THE SALESPERSON CREATED DISTRIBUTOR
  try {
    var distributorData = await Distributor.find()
      .limit(limit)
      .skip(startIndex);

    if (!distributorData) {
      return res.send(200).json({ status: "success", distributors: [] });
    }

    return res
      .status(200)
      .json({ status: "success", distributors: distributorData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

// GETTING SINGLE DISTRIBUTOR
app.get("/:id", verify, async (req, res) => {
  const { id } = req.params;

  // VERIFYING DISTRIBUTOR ID
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Salesperson Id" });
  }

  // GETTING THE DISTRIBUTOR DATA
  try {
    var distributorData = await Distributor.findById(id);

    if (!distributorData) {
      return res
        .status(400)
        .json({ status: "error", message: "Distributor not found" });
    }

    return res
      .status(200)
      .json({ status: "success", distributor: distributorData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

module.exports = app;
