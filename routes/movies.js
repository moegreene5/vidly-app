const express = require("express");
const router = express.Router();
const { Movie, validate } = require("../models/movie");
const { Genre } = require("../models/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", async (req, res) => {
  const movies = await Movie.find().sort("title");

  res.send(movies);
});

router.get("/:id", async (req, res) => {
  const movie = await Movie.findById({ _id: req.params.id });

  if (!movie)
    return res.status(404).send("The Movie with The Given ID Does not Exist");

  res.send(movie);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let movie = await Movie.findOne({
    title: { $regex: req.body.title, $options: "i" },
  });

  if (movie)
    return res.status(400).send("This movie already exists in the database");

  const genre = await Genre.findById({ _id: req.body.genreid });
  if (!genre) return res.status(400).send("Invalid Genre");

  movie = new Movie({
    title: req.body.title,
    genre: { _id: genre._id, name: genre.name },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  });

  await movie.save();

  res.send(movie);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById({ _id: req.body.genre });
  if (!genre) return res.status(400).send("Invalid Genre");

  const movie = await Movie.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        title: req.body.title,
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
      },
    },
    { new: true }
  );

  if (!movie)
    res.status(404).send("The Movie with The Given ID Does not Exist");

  res.send(movie);
});

router.delete("/:id", async (req, res) => {
  const movie = await Movie.findByIdAndRemove({ _id: req.params.id });

  if (!movie)
    res.status(404).send("The Movie with The Given ID Does not Exist");

  res.send(movie);
});

module.exports = router;
