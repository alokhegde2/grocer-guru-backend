const Joi = require("joi");

//Register validation

const salesmanCreationValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    area: Joi.string().required(),
    address: Joi.string().required(),
    phoneNumber: Joi.string().min(10).required(),
  });

  return schema.validate(data);
};

//login validation

const salesmanLoginValidation = (data) => {
  const schema = Joi.object({
    code: Joi.string().required(),
    password: Joi.string().min(5),
  });

  return schema.validate(data);
};

//login validation

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
module.exports.salesmanCreationValidation = salesmanCreationValidation;
module.exports.salesmanLoginValidation = salesmanLoginValidation;
module.exports.passwordCreationValidation = passwordCreationValidation;
module.exports.phoneNumberValidation = phoneNumberValidation;
