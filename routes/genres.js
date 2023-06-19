const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const router = express.Router();
const { Genre, validateGenre } = require("../models/genre");
const validateObjectId = require("../middleware/validateObjectId");
const validate = require("../middleware/validate");

router.get("/", async (req, res) => {
  const genres = await Genre.find().sort("name");
  res.send(genres);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await Genre.findById({ _id: req.params.id });

  if (!genre)
    return res.status(404).send("The Genre with the given ID was not Found");

  res.send(genre);
});

router.post("/", [auth, validate(validateGenre)], async (req, res) => {
  let genre = await Genre.findOne({
    name: { $regex: req.body.name, $options: "i" },
  });
  if (genre)
    return res.status(400).send("Genre already exists in the Database.");

  genre = new Genre({
    name: req.body.name,
  });
  await genre.save();
  res.send(genre);
});

router.put("/:id", [auth, validate(validateGenre)], async (req, res) => {
  const genre = await Genre.findByIdAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        name: req.body.name,
      },
    },
    { new: true }
  );

  if (!genre)
    return res.status(404).send("The Genre with the given ID was not Found");

  res.send(genre);
});

router.delete("/:id", auth, async (req, res) => {
  const genre = await Genre.findByIdAndRemove({ _id: req.params.id });

  if (!genre)
    return res.status(404).send("The Genre with the given ID was not Found");

  res.send(genre);
});

module.exports = router;
