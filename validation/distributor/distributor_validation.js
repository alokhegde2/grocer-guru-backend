const Joi = require("joi");

//Register validation

const distributorCreationValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    address: Joi.string().required(),
    phoneNumber: Joi.string().min(10).required(),
    panCardNumber: Joi.string().required(),
    gstNumber: Joi.string().required(),
    bankName: Joi.string().required(),
    accountName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    ifscCode: Joi.string().required(),
    upiId: Joi.string().required(),
    gstFileUrl: Joi.string().required(),
    panFileUrl: Joi.string().required(),
    salesPersonId: Joi.string().required(),
  });

  return schema.validate(data);
};

//Exporting modules
module.exports.distributorCreationValidation = distributorCreationValidation;
