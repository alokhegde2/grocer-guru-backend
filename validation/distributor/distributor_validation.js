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

//login validation

const distributorLoginValidation = (data) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    password: Joi.string().min(5),
  });

  return schema.validate(data);
};

//Password Creation

const passwordCreationValidation = (data) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    password: Joi.string().min(5),
  });

  return schema.validate(data);
};

const phoneNumberValidation = (data) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    phoneNumber: Joi.string().min(10).max(15),
  });

  return schema.validate(data);
};

//Exporting modules
module.exports.distributorCreationValidation = distributorCreationValidation;
module.exports.distributorLoginValidation = distributorLoginValidation;
module.exports.passwordCreationValidation = passwordCreationValidation;
module.exports.phoneNumberValidation = phoneNumberValidation;
