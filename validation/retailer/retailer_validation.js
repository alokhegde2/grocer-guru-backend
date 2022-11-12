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

//Password creation validatio
const passwordCreationValidation = (data) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    password: Joi.string().min(5),
  });

  return schema.validate(data);
};

module.exports.retailerCreationValidation = retailerCreationValidation;
module.exports.retailerLoginValidation = retailerLoginValidation;
module.exports.phoneNumberValidation = phoneNumberValidation;
module.exports.passwordCreationValidation = passwordCreationValidation;
