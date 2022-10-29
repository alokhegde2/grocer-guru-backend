const Joi = require("joi");

//Register validation

const categoryMatrixCreationValidation = (data) => {
  const schema = Joi.object({
    categoryName: Joi.string().min(2).required(),
    categoryImageUrl: Joi.string().required(),
  });

  return schema.validate(data);
};

//Exporting modules
module.exports.categoryMatrixCreationValidation =
  categoryMatrixCreationValidation;
