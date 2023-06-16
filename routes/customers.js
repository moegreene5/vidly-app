const express = require("express");
const router = express.Router();
const { Customer, validateCustomer } = require("../models/customer");

router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.send(customers);
});

router.get("/:id", async (req, res) => {
  const customer = await Customer.find({ _id: req.params.id });
  if (!customer)
    return res
      .status(404)
      .send("The Customer with the given ID does not exist");

  res.send(customer);
});

router.post("/", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone,
  });

  customer = await customer.save();
  res.send(customer);
});

router.put("/:id", async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone,
      },
    },
    { new: true }
  );

  if (!customer)
    return res
      .status(404)
      .send("The Customer with the Given ID Does not Exist ");

  res.send(customer);
});

router.delete("/:id", async (req, res) => {
  const customer = await Customer.findByIdAndRemove({ _id: req.params.id });

  if (!customer)
    return res
      .status(404)
      .send("The Customer with the Given ID Does not Exist ");

  res.send(customer);
});

module.exports = router;
