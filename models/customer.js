const Joi = require("joi");
const mongoose = require("mongoose");

const Customer = mongoose.model(
  "Customer",
  new mongoose.Schema({
    name: { type: String, required: true },
    isGold: { type: Boolean, required: true, default: false },
    phone: { type: String, required: true },
  })
);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    isGold: Joi.boolean().required(),
    phone: Joi.string().required(),
  });

  return schema.validate(customer);
}

module.exports.Customer = Customer;
module.exports.validateCustomer = validateCustomer;
