//
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const { Movie } = require("../../models/movie");
const mongoose = require("mongoose");
const request = require("supertest");
const moment = require("moment");
const { object, array } = require("joi");
let server;

describe("/api/returns", () => {
  let customerId;
  let movieId;
  let rental;
  let token;
  let movie;

  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    server = require("../../index");

    customerId = new mongoose.Types.ObjectId();
    movieId = new mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: "12345",
      numberInStock: 10,
      dailyRentalRate: 10,
      genre: { name: "12345" },
    });

    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "moeey",
        phone: "08121299978",
      },
      movie: {
        _id: movieId,
        title: "Stranger Things",
        dailyRentalRate: 10,
      },
    });

    await rental.save();
  });

  afterEach(async () => {
    server.close();
    await Rental.deleteMany({});
    await Movie.deleteMany({});
  });

  it("if the client is not logged in we want to return a 401 error", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return status 400 if customerId not provided", async () => {
    customerId = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return status 400 if movieId not provided", async () => {
    movieId = "";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental for this customerId is found", async () => {
    await Rental.deleteMany({});

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it("should return 400 if rental is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if valid request", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it("should set the returnDate if input is valid", async () => {
    const res = await exec();

    const rentalFake = await Rental.findById(rental._id);

    const diff = new Date() - rentalFake.dateReturned;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should calculate the rental fee", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();

    const res = await exec();

    const rentalFake = await Rental.findById(rental._id);

    expect(rentalFake.rentalFee).toBe(70);
  });

  it("should increase the movie stock if input is valid", async () => {
    const res = await exec();

    const movieFake = await Movie.findById(movieId);
    expect(movieFake.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the rental in the body of the response", async () => {
    const res = await exec();

    const rentalFake = await Rental.findById(rental._id);

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "dateOut",
        "rentalFee",
        "customer",
        "movie",
        "dateReturned",
      ])
    );

    // expect(res.body).toHaveProperty("dateOut");
    // expect(res.body).toHaveProperty("dateReturned");
    // expect(res.body).toHaveProperty("rentalFee");
    // expect(res.body).toHaveProperty("customer");
    // expect(res.body).toHaveProperty("movie");
  });
});
