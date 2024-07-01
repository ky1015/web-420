/*
Name: Kylie Struhs
Date: 06/27/2024
File Name: app.spec.js
Description: Test Suite for app.js
*/

// require statements for app.js and supertest
const app = require("../src/app");
const request = require("supertest");

// define a test suite for API endpoint
describe("Chapter 3: API Tests", () => {
  it("it should return an array of books", async () => {
    const res = await request(app).get("/api/books");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach((book) => {
      expect(book).toHaveProperty("id");
      expect(book).toHaveProperty("title");
      expect(book).toHaveProperty("author");
    });
  });

  // test to return a single book
  it("should return a single book", async () => {
    const res = await request(app).get("/api/books/1");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", 1);
    expect(res.body).toHaveProperty("title", "The Fellowship of the Ring");
    expect(res.body).toHaveProperty("author", "J.R.R. Tolkien");
  });
});

// test to see if id is a number (valid id)
it("should return a 400 error if the id is not a number", async () => {
  const res = await request(app).get("/api/books/foo");
  expect(res.statusCode).toEqual(400);
  expect(res.body.message).toEqual("Input must be a number");
});

// Chapter 4 Tests
describe("Chapter 4: API Tests", () => {
  it("should return a 201 status code when adding a new book", async () => {
    const res = await request(app).post("/api/books").send({
      id: 99,
      title: "The Lightning Thief",
      author: "Rick Riordan",
    });
    expect(res.statusCode).toEqual(201);
  });

  it("should return a 400 status code when adding a new book with missing title", async () => {
    const res = await request(app).post("/api/books").send({
      id: 100,
      author: "Rick Riordan",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

  it("should return a 204 status code when deleting a book", async () => {
    const res = await request(app).delete("/api/books/99");
    expect(res.statusCode).toEqual(204);
  });
});
