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
  retailerLoginValidation,
  phoneNumberValidation,
  passwordCreationValidation,
  profileCompletionValidation,
} = require("../../validation/retailer/retailer_validation");

// JWT verification middleware
const verify = require("../../helpers/verify");
const logger = require("../../helpers/logger");

// CREATING THE RETAILER
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

/**
 * Reatiler login
 */

app.post("/login", async (req, res) => {
  //
  const { code, password } = req.body;
  //
  logger.log({
    level: "info",
    message: `Retailer| Logging In | Retailer Code: ${code}|`,
  });
  //Validating the data before logging in the Retailer

  const { error } = retailerLoginValidation(req.body);
  if (error) {
    logger.log({
      level: "error",
      message: `Retailer| Validation Failed | Retailer Code: ${code}| Message:${error.details[0].message} `,
    });
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  //Check the user existance
  const retailerData = await Retailer.findOne({ code: code });

  if (!retailerData) {
    logger.log({
      level: "error",
      message: `Retailer| Logging In | Retailer Code: ${code}| Retailer Not Found`,
    });
    return res
      .status(400)
      .json({ status: "error", message: "Retailer not found" });
  }

  // if (!retailerData["isApproved"]) {
  //   logger.log({
  //     level: "error",
  //     message: `Retailer| Logging In | Retailer Code: ${code}|Retailer is not approved`,
  //   });
  //   return res.status(400).json({
  //     status: "error",
  //     message: "You're account is not approved. Please wait for the approval.",
  //   });
  // }

  //Check if passoword created
  if (retailerData["hashedPassword"] === "") {
    logger.log({
      level: "error",
      message: `Retailer| Logging In | Retailer Code: ${code}|Password not created`,
    });
    return res
      .status(400)
      .json({ status: "error", message: "Password is not created" });
  }

  //comparing two passwords one is user entered and another one is the actual password
  const validPass = await bcrypt.compare(
    password,
    retailerData["hashedPassword"]
  );

  //If passwords do not match
  if (!validPass) {
    logger.log({
      level: "info",
      message: `Retailer| Logging In | Retailer Code: ${code}|Invalid Password`,
    });
    return res
      .status(400)
      .json({ status: "error", message: "Invalid password" });
  }

  //importing secret password
  const secret = process.env.SECRET;

  //Creating jwt
  const token = jwt.sign(
    {
      id: retailerData["_id"],
      code: retailerData["code"],
    },
    secret,
    { expiresIn: "7d" }
  );

  if (!retailerData["isApproved"]) {
    logger.log({
      level: "info",
      message: `Retailer| Logged In | Retailer Code: ${code}| Retailer Not Approved till now`,
    });
    //returning succes with header auth-token
    return res
      .status(200)
      .header("auth-token", token)
      .json({ status: "success-not-approved", authToken: token });
  }
  logger.log({
    level: "info",
    message: `Retailer| Logged In | Retailer Code: ${code}|`,
  });
  //returning succes with header auth-token
  return res
    .status(200)
    .header("auth-token", token)
    .json({ status: "success", authToken: token });
});

/**
 * Verify number before sending otp
 */

app.post("/verifynumber", async (req, res) => {
  const { code, phoneNumber } = req.body;
  logger.log({
    level: "info",
    message: `Retailer| Verify Number | Retailer Code: ${code}| Phone Number: ${phoneNumber}`,
  });

  //Validating the data before logging in the retailer

  const { error } = phoneNumberValidation(req.body);
  if (error) {
    logger.log({
      level: "error",
      message: `Retailer| Verify Number | Retailer Code: ${code}`,
    });
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  try {
    const statusResponse = await Retailer.findOne({
      code: code,
      phoneNumber: phoneNumber,
    });

    if (statusResponse === null) {
      logger.log({
        level: "error",
        message: `Retailer| Verify Number | Retailer Code: ${code}| Phone Number: ${phoneNumber}| Invalid Credentials`,
      });
      return res
        .status(400)
        .json({ status: "error", message: "Invalid credentials." });
    } else if (statusResponse.hashedPassword != "") {
      logger.log({
        level: "error",
        message: `Retailer| Verify Number | Retailer Code: ${code}| Phone Number: ${phoneNumber}| Password is already created`,
      });
      return res
        .status(400)
        .json({ status: "error", message: "Password is already created" });
    }

    logger.log({
      level: "info",
      message: `Retailer| Verify Number | Retailer Code: ${code}| Phone Number: ${phoneNumber} | Verified`,
    });

    return res
      .status(200)
      .json({ status: "success", message: "Proper credentials" });
  } catch (error) {
    console.error(error);
    logger.log({
      level: "error",
      message: `Retailer| Verify Number | Retailer Code: ${code}| Phone Number: ${phoneNumber}|${e}`,
    });
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

/**
 * Setting up the password for the retailer
 */

app.post("/createPassword", async (req, res) => {
  //GEtting data from body

  const { code, password } = req.body;

  logger.log({
    level: "info",
    message: `Retailer| Creating Password | Retailer Code: ${code}`,
  });

  //Validating the data

  const { error } = passwordCreationValidation(req.body);
  if (error) {
    logger.log({
      level: "error",
      message: `Retailer| Creating Password | Retailer Code: ${code}| ${error.details[0].message}`,
    });

    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  //Check the user existance
  const retailerData = await Retailer.findOne({ code: code });

  if (!retailerData) {
    logger.log({
      level: "error",
      message: `Retailer| Creating Password | Retailer Code: ${code}| Retailer not found`,
    });

    return res
      .status(400)
      .json({ status: "error", message: "Retailer not found" });
  }

  //Check if passoword created
  if (retailerData["hashedPassword"] !== "") {
    logger.log({
      level: "error",
      message: `Retailer| Creating Password | Retailer Code: ${code}| Password is already created`,
    });

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

    await Retailer.findByIdAndUpdate(retailerData["_id"], update);

    logger.log({
      level: "info",
      message: `Retailer| Creating Password | Retailer Code: ${code}| Password created Succefully`,
    });

    return res
      .status(200)
      .json({ status: "success", message: "Password Created Succefully" });
  } catch (error) {
    logger.log({
      level: "error",
      message: `Retailer| Creating Password | Retailer Code: ${code}| ${error}`,
    });

    console.error(error);

    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

/**
 * Profile Completion
 */

app.post("/complete-profile", verify, async (req, res) => {
  //Getting data from body
  const {
    gstNumber,
    bankName,
    accountName,
    accountNumber,
    ifscCode,
    upiId,
    panCardCopy,
    gstCopy,
    retailerCode,
    retailerId,
    longitude,
    latitude,
  } = req.body;

  logger.log({
    level: "info",
    message: `Retailer| Profile Completion | Retailer Code: ${retailerCode}, Id: ${retailerId}, gstCopy: ${gstCopy}, panCardCopy: ${panCardCopy}, upiId: ${upiId}, ifscCode: ${ifscCode}, accountNumber: ${accountNumber}, accountName: ${accountName},bankName: ${bankName}, gstNumber:${gstNumber}`,
  });

  //Validating the data

  const { error } = profileCompletionValidation(req.body);
  if (error) {
    logger.log({
      level: "error",
      message: `Retailer| Profile Completion | Retailer Code: ${retailerCode}| ${error.details[0].message}`,
    });

    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  //Verify the retailer id is proper
  const retailerStatus = await Retailer.findOne({ code: retailerCode });

  if (!retailerStatus) {
    logger.log({
      level: "error",
      message: `Retailer| Profile Completion | Retailer Code: ${retailerCode}| Invalid retailer code`,
    });

    return res
      .status(400)
      .json({ status: "error", message: "Retailer not found" });
  }

  if(retailerStatus["_id"]!=retailerId){
    logger.log({
      level: "error",
      message: `Retailer| Profile Completion | Retailer Code: ${retailerCode}| Invalid retailer id`,
    });

    return res
      .status(400)
      .json({ status: "error", message: "Retailer not found" });
  }

  //Updating the data
  const updateData = {
    gstNumber: gstNumber,
    bankName: bankName,
    accountName: accountName,
    accountNumber: accountNumber,
    ifscCode: ifscCode,
    upiId: upiId,
    panCardCopy: panCardCopy,
    gstCopy: gstCopy,
    longitude: longitude,
    latitude: latitude,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
  };

  try {
    await Retailer.findByIdAndUpdate(retailerStatus["_id"], updateData);

    logger.log({
      level: "info",
      message: `Retailer| Profile Completion | Retailer Code: ${retailerCode}| Profile Completed! We're sending your profile for admin verification.Please wait untill you're profile got verified`,
    });

    return res.status(200).json({
      status: "success",
      message:
        "Profile Completed! We're sending your profile for admin verification.Please wait untill you're profile got verified",
    });
  } catch (error) {
    console.error(error);
    logger.log({
      level: "error",
      message: `Retailer| Profile Completion | Retailer Code: ${retailerCode}| ${error}`,
    });

    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

module.exports = app;
