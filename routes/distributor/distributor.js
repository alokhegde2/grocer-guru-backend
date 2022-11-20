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
  distributorLoginValidation,
  passwordCreationValidation,
  phoneNumberValidation,
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
      .sort({ createdDate: "desc" })
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
      .sort({ createdDate: "desc" })
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
    const statusResponse = await Distributor.findOne({
      code: code,
      phoneNumber: phoneNumber,
    });
    console.log(statusResponse);
    if (statusResponse === null) {
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

// Login of the distributor
// Data collected is Distributor Code (code) and Password
app.post("/login", async (req, res) => {
  //Validating the data before logging in the salesman

  const { error } = distributorLoginValidation(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  const { code, password } = req.body;

  //Check the user existance
  const distributorData = await Distributor.findOne({ code: code });

  if (!distributorData) {
    return res
      .status(400)
      .json({ status: "error", message: "Distributor not found" });
  }

  if (!distributorData["isApproved"]) {
    return res.status(400).json({
      status: "error",
      message: "You're account is not approved. Please wait for the approval.",
    });
  }

  //Check if passoword created
  if (distributorData["hashedPassword"] === "") {
    return res
      .status(400)
      .json({ status: "error", message: "Password is not created" });
  }

  //comparing two passwords one is user entered and another one is the actual password
  const validPass = await bcrypt.compare(
    password,
    distributorData["hashedPassword"]
  );

  //If passwords do not match
  if (!validPass) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid password" });
  }

  //importing secret password
  const secret = process.env.SECRET;

  //Creating jwt
  const token = jwt.sign(
    {
      id: distributorData["_id"],
      code: distributorData["code"],
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
  const distributorData = await Distributor.findOne({ code: code });

  if (!distributorData) {
    return res
      .status(400)
      .json({ status: "error", message: "Distributor not found" });
  }

  //Check if passoword created
  if (distributorData["hashedPassword"] !== "") {
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

    await Distributor.findByIdAndUpdate(distributorData["_id"], update);

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

// GETTING ALL DISTRIBUTOR ON THE BASIS OF THE SALESPERSON ID MAINLY APPROVED
app.get("/approved-salesperson/:id", verify, async (req, res) => {
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
    var distributorData = await Distributor.find({
      salesPersonId: id,
      isApproved: true,
    })
      .sort({ createdDate: "desc" })
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

// GETTING ALL DISTRIBUTOR ON THE BASIS OF THE SALESPERSON ID MAINLY REJECTED
app.get("/rejected-salesperson/:id", verify, async (req, res) => {
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
    var distributorData = await Distributor.find({
      salesPersonId: id,
      isApproved: false,
      rejectionReason: { $ne: "" },
    })
      .sort({ createdDate: "desc" })
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

// GETTING PENDING APPROVAL DISTRIBUTOR
app.get("/admin/pending", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  try {
    var pendingDistributorCount = await Distributor.find({
      isApproved: false,
    }).count();

    var pendingDistributors = await Distributor.find({
      isApproved: false,
    })
      .sort({ createdDate: "desc" })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json({
      status: "success",
      distributors: pendingDistributors,
      count: pendingDistributorCount,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

// APPROVING THE DISTRIBUTOR

app.put("/admin/approve/:id", verify, async (req, res) => {
  const { id } = req.params;
  // VERIFYING SALESPERSON ID
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Salesperson Id" });
  }

  try {
    await Distributor.findByIdAndUpdate(id, { isApproved: true });

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

// REJECTING THE DISTRIBUTOR

app.put("/admin/reject/:id", verify, async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  // VERIFYING SALESPERSON ID
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid Salesperson Id" });
  }

  try {
    await Distributor.findByIdAndUpdate(id, {
      isApproved: false,
      rejectionReason: rejectionReason,
    });

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

// GETTING ALL APPROVED DISRIBUTOR (FOR ADMIN)
app.get("/admin/approved", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  // GETTING ALL THE SALESPERSON CREATED DISTRIBUTOR
  try {
    var distributorData = await Distributor.find({
      isApproved: true,
    })
      .sort({ createdDate: "desc" })
      .limit(limit)
      .skip(startIndex);

    var count = await Distributor.find({
      isApproved: true,
    }).count();

    if (!distributorData) {
      return res
        .send(200)
        .json({ status: "success", distributors: [], count: 0 });
    }

    return res
      .status(200)
      .json({ status: "success", distributors: distributorData, count: count });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

/**
 * Getting rejeted distributor (For the admin)
 */
app.get("/admin/rejected", verify, async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;

  // GETTING ALL THE SALESPERSON CREATED DISTRIBUTOR
  try {
    var distributorData = await Distributor.find({
      isApproved: false,
      $or: [
        { rejectionReason: { $ne: "" } },
        { rejectionReason: { $ne: null } },
      ],
    })
      .sort({ createdDate: "desc" })
      .limit(limit)
      .skip(startIndex);

    var distCount = await Distributor.find({
      isApproved: false,
      $or: [
        { rejectionReason: { $ne: "" } },
        { rejectionReason: { $ne: null } },
      ],
    }).count();

    if (!distributorData) {
      return res
        .send(200)
        .json({ status: "success", distributors: [], count: 0 });
    }

    return res.status(200).json({
      status: "success",
      distributors: distributorData,
      count: distCount,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

module.exports = app;
