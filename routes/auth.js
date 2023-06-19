const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { User } = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const validate = require("../middleware/validate");

router.post("/", validate(validateBody), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid Email or Password");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid Email or Password");

  const token = user.generateAuthToken();

  res.send(token);
});

function validateBody(req) {
  const schema = Joi.object({
    email: Joi.string().min(4).max(255).required(),
    password: Joi.string().min(4).max(255).required(),
  });

  return schema.validate(req);
}

module.exports = router;
