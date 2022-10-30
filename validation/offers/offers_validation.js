const Joi = require("joi");

const offerCreationValidation = (data) => {
  const schema = Joi.object({
    productsId: Joi.array().items(Joi.string()).required(),
    categoryId: Joi.string().required(),
    retailerId: Joi.string().required(),
    offerPercent: Joi.number().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  });

  return schema.validate(data);
};

//Exporting modules
module.exports.offerCreationValidation = offerCreationValidation;
