const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const validate = require("../middleware/validate");
const Joi = require("joi");

router.post("/", [auth, validate(validateReturns)], async (req, res) => {
  const rental = await Rental.lookUp(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send("Rental not found.");

  if (rental.dateReturned)
    return res.status(400).send("rental already processed");

  rental.return();
  await rental.save();

  await Movie.findByIdAndUpdate(
    { _id: rental.movie._id },
    {
      $inc: {
        numberInStock: 1,
      },
    }
  );

  res.send(rental);
});

function validateReturns(req) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return schema.validate(req);
}

module.exports = router;
