const express = require("express");
const router = express.Router();
const { User, validateUsers } = require("../models/user");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");

router.get("/:id", async (req, res) => {
  const user = await User.findById({ _id: req.params.id }).select("-password");
  res.status(200).json(user);
});

router.post("/", validate(validateUsers), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).json("User already Registered");

  user = new User(_.pick(req.body, ["name", "email", "password"]));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  console.log(token);

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["name", "email"]));
});

module.exports = router;
