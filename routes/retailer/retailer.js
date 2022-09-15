const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

//importing dot env
require("dotenv/config");

//Importing model
const Distributor = require("../../models/distributor/distributor");
const Retailer = require("../../models/retailer/retailer");

// Validation
const {
  retailerCreationValidation,
} = require("../../validation/retailer/retailer_validation");

// JWT verification middleware
const verify = require("../../helpers/verify");

/// CREATING THE DISTRIBUTOR
app.post("/", verify, async (req, res) => {
  const {
    name,
    address,
    phoneNumber,
    concernedPartyName,
    tradeLicenceCopy,
    distributorId,
    shopImages,
  } = req.body;

  // VERIFYING SALESPERSON ID
  if (!mongoose.isValidObjectId(distributorId)) {
    return res.status(400).json({ message: "Invalid Distributor Id" });
  }

  //Validating the data before creating the salesman
  const { error } = retailerCreationValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  try {
    // CHECKING FOR DISTRIBUTOR IS THERE OR NOT
    var distributorStatus = await Distributor.findById(distributorId);

    if (!distributorStatus) {
      return res
        .status(400)
        .json({ status: "error", message: "Distributor Not Found!" });
    }

    //CHECK IF RETAILER EXISTS OR NOT
    var retailerStatus = await Retailer.findOne({
      phoneNumber: phoneNumber,
    });

    if (retailerStatus) {
      return res
        .status(400)
        .json({ status: "error", message: "Mobile Number Already Exists" });
    }

    //GENERATING THE RETAILER CODE
    var retailerCount = await Retailer.find({
      distributorId: distributorId,
    }).count();

    var distributorCode = distributorStatus["code"];

    var retailerCode = distributorCode + "-" + (retailerCount + 1);

    // CREATING THE RETAILER INSTANCE
    var retailerData = new Retailer({
      name: name,
      address: address,
      phoneNumber: phoneNumber,
      concernedPartyName: concernedPartyName,
      tradeLicenceCopy: tradeLicenceCopy,
      distributorId: distributorId,
      shopPhoto: shopImages,
      code: retailerCode,
    });

    await retailerData.save();

    // EVERYTHING WENT WELL
    // RETURN RESPONSE
    return res.status(200).json({
      status: "success",
      message: "Retailer Created Successfully!",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

module.exports = app;
