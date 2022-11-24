import request from "supertest";

import app from "../src/app";

describe("Test app.ts", () => {
  test("Get response is correct", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual("Welcome to SkillReactor");
  });
});