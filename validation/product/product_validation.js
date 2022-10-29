const Joi = require("joi");

//Register validation

const productMatrixCreationValidation = (data) => {
  const schema = Joi.object({
    productName: Joi.string().min(2).required(),
    productImageUrl: Joi.string().required(),
    categoryId: Joi.string().required(),
  });

  return schema.validate(data);
};

//Exporting modules
module.exports.productMatrixCreationValidation =
  productMatrixCreationValidation;
