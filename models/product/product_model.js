// This Contains model of the categories uploaded by the admin

const mongoose = require("mongoose");

//Product Schema
const productSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "ProductMatrix",
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
  isAvailable: {
    type: Boolean,
    default: true,
  },
  availableQuantity: {
    type: Number,
    required: true,
  },
  retailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Retailer",
    required: true,
  },
  availableVarients: [
    {
      amount: {
        type: Number,
        required: true,
        default: 0,
      },
      availableQuantity: {
        type: Number,
        required: true,
        default: 0,
      },
      unit: {
        type: String,
        required: true,
      },
      varient: {
        type: String,
        required: true,
      },
    },
  ],
  offerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offers",
    required: false,
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
productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productSchema.set("toJSON", {
  virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("Products", productSchema);
