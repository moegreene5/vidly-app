const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 4, maxlength: 50 },
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 4,
    maxlength: 255,
  },
  password: { type: String, required: true, minlength: 4, maxlength: 1024 },
  isAdmin: Boolean,
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, name: this.name, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUsers(user) {
  const schema = Joi.object({
    name: Joi.string().min(4).max(50).required(),
    email: Joi.string().min(4).max(255).required().email(),
    password: Joi.string().min(4).max(255).required(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validateUsers = validateUsers;
