/*
Name: Kylie Struhs
Date: 06/22/2024
File Name: app.spec.js
Description:
*/

// require statements for app.js and supertest
const app = require("../src/app");
const request = require("supertest");

// define a test suite for API endpoint
describe("Chapter 3: API Tests", () => {
    it("it should return an array of recipes", async () => {
      const res = await request(app).get("/api/recipes");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      res.body.forEach((recipe) => {
        expect(recipe).toHaveProperty("id");
        expect(recipe).toHaveProperty("name");
        expect(recipe).toHaveProperty("ingredients");
      });
    });
  });

// test to return a single recipe
it("should return a single recipe", async () => {
  const res = await request(app).get("/api/recipes/1");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", 1);
    expect(res.body).toHaveProperty("name", "Pancakes");
    expect(res.body).toHaveProperty("ingredients", ["flour", "milk", "eggs"]);
  });

// test if input is a number
  it("should return a 400 error if the id is not a number", async () => {
    const res = await request(app).get("/api/recipes/foo");
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Input must be a number");
    });