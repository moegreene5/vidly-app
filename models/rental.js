const Joi = require("joi");
const moment = require("moment");
const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: { type: String, required: true, minlength: 5, maxlength: 50 },
      isGold: { type: Boolean },
      phone: { type: String, required: true },
    }),
    required: true,
  },
  movie: {
    type: new mongoose.Schema({
      title: { type: String, required: true, minlength: 3, maxlength: 255 },
      dailyRentalRate: { type: Number, required: true, min: 0, max: 255 },
    }),
    required: true,
  },

  dateOut: {
    type: Date,
    required: true,
    default: Date.now,
  },

  dateReturned: {
    type: Date,
  },

  rentalFee: {
    type: Number,
    min: 0,
  },
});

rentalSchema.statics.lookUp = function (customer, movie) {
  return this.findOne({
    "customer._id": customer,
    "movie._id": movie,
  });
};

rentalSchema.methods.return = function () {
  this.dateReturned = new Date();

  const rentalDays = moment().diff(this.dateOut, "days");
  this.rentalFee = rentalDays * this.movie.dailyRentalRate;
};

const Rental = mongoose.model("Rental", rentalSchema);

function validateRentals(rental) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return schema.validate(rental);
}

exports.validate = validateRentals;
exports.Rental = Rental;
