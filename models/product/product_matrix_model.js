// This Contains model of the categories uploaded by the admin

const mongoose = require("mongoose");

//Distributor Schema
const productMatrixSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  productImageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CategoryMatrix",
    required: true,
  },
  isDeleted: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdDate: {
    type: Date,
    default: Date.now(),
  },
  modifiedDate: {
    type: Date,
    default: Date.now(),
  },
});

//Creating virtual id
productMatrixSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productMatrixSchema.set("toJSON", {
  virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("ProductMatrix", productMatrixSchema);
