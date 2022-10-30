// This Contains model of the categories uploaded by the admin

const mongoose = require("mongoose");

//Distributor Schema
const categoryMatrixSchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  categoryImageUrl: {
    type: String,
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
categoryMatrixSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

categoryMatrixSchema.set("toJSON", {
  virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("CategoryMatrix", categoryMatrixSchema);
