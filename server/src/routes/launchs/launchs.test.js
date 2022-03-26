const request = require("supertest");
const app = require("../../app.js");
const { loadPlanetData } = require("../../models/planets.model.js");
const { connectDB, closeDB } = require("../../services/mongo");

beforeAll(async () => {
  await connectDB();
  await loadPlanetData();
  return;
});

afterAll(async () => await closeDB());

describe("Test GET /v1/launchs", () => {
  test("It should respond with 200 success", async () => {
    const res = await request(app).get("/v1/launchs");
    expect(res.statusCode).toBe(200);
  });
});

describe("Test POST /v1/launch", () => {
  test("It should respond with 201 created", async () => {
    const res = await request(app)
      .post("/v1/launchs")
      .send({
        mission: "ZTM155",
        rocket: "from jest",
        target: "Kepler-442 b",
        launchDate: "January 17, 2030",
      })
      .expect("Content-Type", /json/)
      .expect(201);
    expect(res.body.mission).toEqual("ZTM155");
  });
  test("It should catch missing required properties", async () => {
    const res = await request(app).post("/v1/launchs").send({}).expect(400);
    expect(res.body.error).toEqual("Missing required launch property");
  });
  test("It should catch invalid date", async () => {
    const res = await request(app)
      .post("/v1/launchs")
      .send({
        mission: "ZTM155",
        rocket: "ZTM experimental IS1",
        target: "Kleper-186 f",
        launchDate: "hello",
      })
      .expect("Content-Type", /json/)
      .expect(400);
    expect(res.body.error).toEqual("Invalid launch date");
  });
});

describe("Test DELETE /v1/launch/:id", () => {
  test("It should delete latestFlight", async () => {
    const { body } = await request(app).get("/v1/launchs");
    const launch = body.find((el) => {
      if (el.rocket === "from jest") {
        return el;
      }
    });
    // console.log(launch);
    await request(app).delete(`/v1/launchs/${launch.flightNumber}`).expect(204);
  });
  test("It should delete latestFlight", async () => {
    const res = await request(app).delete(`/v1/launchs/99999`).expect(400);
    expect(res.body.error).toEqual("launch doesn't exists");
  });
});
