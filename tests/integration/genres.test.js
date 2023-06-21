const { Genre } = require("../../models/genre");
const request = require("supertest");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
let server;

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({});
  });

  describe("GET /", () => {
    beforeEach(async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
    });

    it("should return all genres", async () => {
      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let genre;

    beforeEach(async () => {
      genre = new Genre({ name: "genre1" });
      await genre.save();
    });

    it("should return genre of the given param Id", async () => {
      const res = await request(server).get("/api/genres/" + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return a 404 error if invalid id is passed", async () => {
      const res = await request(server).get("/api/genres/1");
      expect(res.status).toBe(404);
    });

    it("should return 404 if the genre with the given req.params.id is not found", async () => {
      const _id = new mongoose.Types.ObjectId();

      const res = await request(server).get("/api/genres/" + _id);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    // cleaning up repetitive code

    let token;
    let name;

    const exec = () => {
      return request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("should return 401 status if client is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 400 status if genre is less than 5 characters", async () => {
      name = "genr";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 status if genre is more than 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 status if genre already exists in the database", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      const res = await exec();

      const genre = await Genre.find({ name: "genre1" });

      expect(genre).not.toBeNull();
    });

    it("should return the genre if it is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });

  describe("PUT /:id", () => {
    let token;
    let name;
    let genre;

    const exec = () => {
      return request(server)
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      genre = new Genre({ name: "genre1" });
      genre.save();

      token = new User().generateAuthToken();
      name = "genre2";
    });

    it("should return 401 status if client is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 status if genre is less than 5 characters", async () => {
      name = "genr";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 status if genre is more than 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if the genre with the given req.params.id is not found", async () => {
      const _id = new mongoose.Types.ObjectId();

      const res = await request(server)
        .put("/api/genres/" + _id)
        .set("x-auth-token", token)
        .send({ name });

      expect(res.status).toBe(404);
    });

    it("should find if genre with the given id exists", async () => {
      const res = await exec();

      const genre = await Genre.find({ name: "genre2" });

      expect(genre).not.toBeNull();
    });

    it("should return the genre if it is valid", async () => {
      name = "genre2";
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre2");
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let genre;

    const exec = () => {
      return request(server)
        .delete("/api/genres/" + genre._id)
        .set("x-auth-token", token);
    };

    beforeEach(() => {
      genre = new Genre({ name: "genre1" });
      genre.save();

      token = new User().generateAuthToken();
    });

    it("should return 401 status if client is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 404 if genre with the given id does not exist", async () => {
      genre = { name: "cunt", _id: new mongoose.Types.ObjectId() };

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("check if the deleted genre does not in the database", async () => {
      const res = await exec();
      const exists = await Genre.findById({ _id: genre._id });

      expect(exists).toBeNull();
    });

    it("should return the genre deleted to the client", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });
});
