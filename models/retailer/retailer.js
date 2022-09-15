const mongoose = require("mongoose");

//Distributor Schema
const retailerSchema = new mongoose.Schema({
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
    required: false,
  },
  concernedPartyName: {
    type: String,
    default: "",
    required: true,
  },
  gstNumber: {
    type: String,
    default: "",
    required: false,
  },
  bankName: {
    type: String,
    default: "",
    required: false,
  },
  accountName: {
    type: String,
    default: "",
    required: false,
  },
  accountNumber: {
    type: String,
    default: "",
    required: false,
  },
  ifscCode: {
    type: String,
    default: "",
    required: false,
  },
  upiId: {
    type: String,
    default: "",
    required: false,
  },
  tradeLicenceCopy: {
    type: String,
    default: "",
    required: false,
  },
  panCardCopy: {
    type: String,
    default: "",
    required: false,
  },
  gstCopy: {
    type: String,
    default: "",
    required: false,
  },

  shopPhoto: [
    {
      type: String,
      default: "",
      required: true,
    },
  ],
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Distributors",
    required: true,
  },
  longitude: {
    type: Number,
    default: "",
    required: false,
  },
  latitude: {
    type: Number,
    default: "",
    required: false,
  },
  isApproved: {
    type: Boolean,
    required: false,
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
  isResubmitted: {
    type: Boolean,
    default: false,
  },
  createdDate: {
    type: Date,
    default: Date.now(),
  },
});

//Creating virtual id
retailerSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

retailerSchema.set("toJSON", {
  virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("Retailer", retailerSchema);
