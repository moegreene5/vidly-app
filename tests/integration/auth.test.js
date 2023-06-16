const { User } = require("../../models/user");
const request = require("supertest");
const { Genre } = require("../../models/genre");
let server;

describe("auth middleware", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    server.close();
    await Genre.deleteMany({});
  });

  let token;

  const exec = () => {
    return request(server)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  it("should return 401 if no token provided", async () => {
    token = "";
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it("should return 400 if invalid token is provided", async () => {
    token = "ifeanyi is good";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 200 if valid token is provided", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });
});
