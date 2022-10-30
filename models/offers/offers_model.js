// This Contains model of the categories uploaded by the admin

const mongoose = require("mongoose");

//Product Schema
const offersSchema = new mongoose.Schema({
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Products",
    },
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CategoryMatrix",
    required: true,
  },
  retailer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Retailer",
    required: true,
  },
  offerPercent: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
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
offersSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

offersSchema.set("toJSON", {
  virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("Offers", offersSchema);
