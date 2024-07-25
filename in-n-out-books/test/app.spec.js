/*
Name: Kylie Struhs
Date: 07/17/2024
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

// Chapter 5 Tests
describe("Chapter 5: API Tests", () => {
  it("should return a 204 status code when updating a book", async () => {
    const res = await request(app).put("/api/books/1").send({
      title: "Warrior Cats: Book 1",
      author: "Erin Hunter",
    });
    expect(res.statusCode).toEqual(204);
  });

  it("should return a 400 status code when updating a book with a non-numeric id", async () => {
    const res = await request(app).put("/api/books/foo").send({
      title: "Test Book",
      author: "Test Author",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Input must be a number");
  });

  it("should return a 400 status code when updating a book with a missing title", async () => {
    const res = await request(app).put("/api/books/1").send({
      title: "Test Book",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });
});

// Chapter 6 Tests
describe("Chapter 6: API Tests", () => {
  it("should log a user in and return a 200 status with the message 'Authentication successful'", async () => {
    const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu",
      password: "potter",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Authentication successful");
  });

  it("should return a 401 status code for invalid password", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "harry@hogwarts.edu", password: "wrongpassword" });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should return a 400 status code when trying to login with too many or too few parameter values", async () => {
    const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu",
      password: "potter",
      extraKey: "extra",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
    const res2 = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu",
    });
    expect(res2.statusCode).toEqual(400);
    expect(res2.body.message).toEqual("Bad Request");
  });
});

// Week 8 Tests
describe("Chapter 7: API Tests", () => {
  it("should return a 200 status code with a message of 'Security questions successfully answered'", async () => {
    const res = await request(app)
      .post("/api/users/harry@hogwarts.edu/verify-security-question")
      .send({
        securityQuestions: [
          { answer: "Hedwig" },
          { answer: "Quidditch Through the Ages" },
          { answer: "Evans" },
        ],
        newPassword: "password",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Password reset successful");
  });

  it("should return a 400 status code with a message of 'Bad Request' when the request body fails ajv validation", async() => {
    const res = await request(app).post("/api/users/harry@hogwarts.edu/verify-security-question").
    send({
    securityQuestions: [
    { answer: "Hedwig", question: "What is your pet's name?" },
    { answer: "Quidditch Through the Ages", myName: "Harry Potter" }
    ],
    newPassword: "password"
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
    });

    it("should return 401 status code with a message of 'Unauthorized' when the security answers are incorrect", async() => {
      const res = await request(app).post("/api/users/harry@hogwarts.edu/verify-security-question").
      send({
      securityQuestions: [
      { answer: "Fluzy"},
      { answer: "Quidditch Through the Ages"},
      { answer: "Evans" }
      ],
      newPassword: "password"
      });
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual("Unauthorized");
      });
});
