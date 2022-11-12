const Joi = require("joi");

//Register validation

const retailerCreationValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    address: Joi.string().required(),
    phoneNumber: Joi.string().min(10).required(),
    concernedPartyName: Joi.string().required(),
    tradeLicenceCopy: Joi.string().required(),
    shopImages: Joi.array().length(3).required(),
    distributorId: Joi.string().required(),
  });

  return schema.validate(data);
};

//login validation
const retailerLoginValidation = (data) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    password: Joi.string().min(5),
  });

  return schema.validate(data);
};

//Phone number validation
const phoneNumberValidation = (data) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    phoneNumber: Joi.string().min(10).max(15),
  });

  return schema.validate(data);
};

//Password creation validatiom
const passwordCreationValidation = (data) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    password: Joi.string().min(5),
  });

  return schema.validate(data);
};

//Password creation validation
const profileCompletionValidation = (data) => {
  const schema = Joi.object({
    gstNumber: Joi.string().required(),
    bankName: Joi.string().required(),
    accountName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    ifscCode: Joi.string().required(),
    upiId: Joi.string().required(),
    panCardCopy: Joi.string().required(),
    gstCopy: Joi.string().required(),
    retailerCode: Joi.string().required(),
    retailerId: Joi.string().required(),
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
  });

  return schema.validate(data);
};

module.exports.retailerCreationValidation = retailerCreationValidation;
module.exports.retailerLoginValidation = retailerLoginValidation;
module.exports.phoneNumberValidation = phoneNumberValidation;
module.exports.passwordCreationValidation = passwordCreationValidation;
module.exports.profileCompletionValidation = profileCompletionValidation;
