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

module.exports.retailerCreationValidation = retailerCreationValidation;
