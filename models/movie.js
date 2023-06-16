const mongoose = require("mongoose");
const Joi = require("joi");
const { genreSchema } = require("./genre");

const Movie = mongoose.model(
  "Movie",
  new mongoose.Schema({
    title: { type: String, required: true, minlength: 3, maxlength: 255 },
    genre: { type: genreSchema, required: true },
    numberInStock: { type: Number, required: true, min: 0, max: 255 },
    dailyRentalRate: { type: Number, required: true, min: 0, max: 255 },
  })
);

function validateMovies(movie) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    genre: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required(),
  });

  return schema.validate(movie);
}

module.exports.Movie = Movie;
module.exports.validate = validateMovies;
