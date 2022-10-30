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

const productCreationValidation = (data) => {
  const schema = Joi.object({
    productId: Joi.string().required(),
    categoryId: Joi.string().required(),
    retailerId: Joi.string().required(),
    availableQuantity: Joi.number().required(),
    availableVarients: Joi.array().items({
      amount: Joi.number().required(),
      availableQuantity: Joi.number().required(),
      unit: Joi.string().required(),
      varient: Joi.string().required(),
    }),
  });

  return schema.validate(data);
};

//Exporting modules
module.exports.productMatrixCreationValidation =
  productMatrixCreationValidation;
module.exports.productCreationValidation = productCreationValidation;
