const { Rental, validateRentals } = require("../models/rental");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const express = require("express");
const mongoose = require("mongoose");
const validate = require("../middleware/validate");
const router = express.Router();

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.post("/", validate(validateRentals), async (req, res) => {
  const customer = await Customer.findById({ _id: req.body.customerId });
  if (!customer) return res.status(400).send("Invalid Customer");

  const movie = await Movie.findById({ _id: req.body.movieId });
  if (!movie)
    return res
      .status(400)
      .send("The selected Movie does not exist in the Database");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie is Unavailabe at the moment");

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    rental = await rental.save();
    movie.numberInStock--;
    movie.save();
    res.send(rental);

    await session.commitTransaction();
  } catch (ex) {
    res.status(500).send(ex.message);
  } finally {
    session.endSession();
  }
});

module.exports = router;
