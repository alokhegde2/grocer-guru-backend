const mongoose = require("mongoose");

//Distributor Schema
const distributorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  code: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    default: "",
  },
  panCardNumber: {
    type: String,
    default: "",
    required: true,
  },
  gstNumber: {
    type: String,
    default: "",
    required: true,
  },
  bankName: {
    type: String,
    default: "",
    required: true,
  },
  accountName: {
    type: String,
    default: "",
    required: true,
  },
  accountNumber: {
    type: String,
    default: "",
    required: true,
  },
  ifscCode: {
    type: String,
    default: "",
    required: true,
  },
  upiId: {
    type: String,
    default: "",
    required: true,
  },
  gstFileUrl: {
    type: String,
    default: "",
    required: true,
  },
  panFileUrl: {
    type: String,
    default: "",
    required: true,
  },
  salesPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salesmans",
    required: true,
  },
  isApproved: {
    type: Boolean,
    required: true,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  rejectionReason: {
    type: String,
    required: false,
    default: "",
  },
  createdDate: {
    type: Date,
    default: Date.now(),
  },
});

//Creating virtual id
distributorSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

distributorSchema.set("toJSON", {
  virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("Distributor", distributorSchema);
