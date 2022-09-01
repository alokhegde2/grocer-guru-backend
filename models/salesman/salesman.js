const mongoose = require("mongoose");

//User Schema
const salesManSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 255,
    },
    area: {
        type: String,
        required: true,
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
        default: ""
    },
    createdDate: {
        type: Date,
        default: Date.now(),
    },
});

//Creating virtual id
salesManSchema.virtual("id").get(function () {
    return this._id.toHexString();
});

salesManSchema.set("toJSON", {
    virtuals: true,
});

//Exporting modules
module.exports = mongoose.model("Salesman", salesManSchema);