/*
  Name: Kylie Struhs
  Date: 07/11/2024
  File Name: app.js
  Description: Project for Web 420
*/

// set up Express Application
const express = require("express");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");

const app = express(); // Creates an Express application

const books = require("../database/books");

const users = require("../database/users");

app.use(express.static("public"));

// set up ajv class and schema object
const Ajv = require("ajv");
const ajv = new Ajv();
const securityQuestionsSchema = {
  type: "object",
  properties: {
    newPassword: { type: "string" },
    securityQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          answer: { type: "string" },
        },
        required: ["answer"],
        additionalProperties: false,
      },
    },
  },
  required: ["newPassword", "securityQuestions"],
  additionalProperties: false,
};

// parse incoming requests as JSON payloads
app.use(express.json());

// parse urlencoded payloads
app.use(express.urlencoded({ extended: true }));

// add a GET route for the main URL

app.get("/", async (req, res, next) => {
  // HTML content for the landing page
  const html = ` <html>
  <head>
  <title>In-n-Out Books</title>
   <style>
    body, h1, h2, h3 { margin: 0; padding: 0; border: 0;}
    body {  background: #EAE2D6;  color: #515751;  margin: 1.25rem;  font-size: 1.25rem;}
    h1, h2, h3 { color: #440d0f; font-family: 'Optima', sans-serif;}
    h1, h2 { text-align: center}
    .container { width: 50%; margin: 0 auto; font-family: 'Georgia', serif;}
    .my-shelf { border: 1px solid #171627; padding: 1rem; margin: 1rem 0;}
    .previous-reads h3 { margin-top: 0; } main a { color: #440d0f;}
    .previous-reads {border: 1px solid #171627;}
    main a:hover { color: #171627; text-decoration: underline;}
    </style>
  </head>
  <body>
    <div class="container">
    <header>
        <h1>In-n-Out Books</h1>
        <h2>Manage your reading lists, discover new books, and connect with other readers!</h2>
      </header>
      <br />
      <main>
        <div class="my-shelf">
          <h3>My Shelf: Ready to Read</h3>
              <img src="/images/pjson.jfif" alt="Cover of Percy Jackson: Lost Heroes of Olympus Book 2 which depicts a teenager emerging out of the ocean carrying a golden eagle statue" height="400px" width="300px">
              <img src="/images/selection.jpg" alt="Cover of The Selection which has a teenager in a flowing blue gown surrounded by mirrors" height="400px" width="300px">
              </div>
              <div class="previous-reads">
                <h3>Previous Reads</h3>
                  <img src="/images/tkam.jfif" alt="An image of a tree on a red background" height="400px" width="300px">
                  <img src="/images/annegg.jpg" alt="A girl with red hair in a blue dress and with a large hat on a bridge" height="400px" width="300px">
              </div>
              <aside>
                  <h4>
                  Recommended Books Based on Your Previous Reads:
                  </h4>
                  <img src="/images/ella.jfif" alt="A young teenage girl in a blue dress on a yellow background" height="400px" width="300px">
                  <img src="/images/1984.jpg" alt="A book cover with an eye tilted vertically on a red background" height="400px" width="300px">
                </aside>
        </main>
      </div>
    </body>
    </html> `; // end HTML content for the landing page

  res.send(html); // Sends the HTML content to the client
});

// GET routes
app.get("/api/books", async (req, res, next) => {
  try {
    const allBooks = await books.find();
    console.log("Book Titles: ", allBooks); // Logs all books
    res.send(allBooks); // Sends response with all books
  } catch (err) {
    console.error("Error: ", err.message); // Logs error message
    next(err); // Passes error to the next middleware
  }
});

// makes sure input is a number and gets one book
app.get("/api/books/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    id = parseInt(id);
    if (isNaN(id)) {
      return next(createError(400, "Input must be a number"));
    }
    const book = await books.findOne({ id: id });
    console.log("Book: ", book);
    res.send(book);
  } catch (err) {
    console.error("Error: ", err.message);
    next(err);
  }
});

// Create new POST endpoint
app.post("/api/books", async (req, res, next) => {
  try {
    const newBook = req.body;
    const expectedKeys = ["id", "title", "author"];
    const receivedKeys = Object.keys(newBook);
    if (
      !receivedKeys.every((key) => expectedKeys.includes(key)) ||
      receivedKeys.length !== expectedKeys.length
    ) {
      console.error("Bad Request: Missing keys or extra keys", receivedKeys);
      return next(createError(400, "Bad Request"));
    }
    const result = await books.insertOne(newBook);
    console.log("Result: ", result);
    res.status(201).send({ id: result.ops[0].id });
  } catch (err) {
    console.error("Error: ", err.message);
    next(err);
  }
});

// Create a new POST endpoint to login a user, checks if email or password is missing, and checks if the password is valid
app.post("/api/login", async (req, res, next) => {
  try {
    const user = req.body;
    const expectedKeys = ["email", "password"];
    const receivedKeys = Object.keys(user);
    if (
      !receivedKeys.every((key) => expectedKeys.includes(key)) ||
      receivedKeys.length !== expectedKeys.length
    ) {
      console.error("Bad Request: Missing keys or extra keys", receivedKeys);
      return next(createError(400, "Bad Request"));
    }
    let storedUser = await users.findOne({ email: user.email });
    let storedPassword = storedUser.password;
    if (bcrypt.compareSync(user.password, storedPassword) === false) {
      return next(createError(401, "Unauthorized"));
    }
    res.status(200).send({ message: "Authentication successful" });
  } catch (err) {
    console.error("Error: ", err);
    console.error("Error: ", err.message);
    next(err);
  }
});

// Create a new Post endpoint to verify a user's security questions and reset password
app.post(
  "/api/users/:email/verify-security-question",
  async (req, res, next) => {
    try {
      const { email } = req.params;
      const { newPassword, securityQuestions } = req.body;
      const validate = ajv.compile(securityQuestionsSchema);
      const valid = validate(req.body);
      if (!valid) {
        console.error("Bad Request: Invalid request body", validate.errors);
        return next(createError(400, "Bad Request"));
      }
      const user = await users.findOne({ email: email });
      if (
        securityQuestions[0].answer !== user.securityQuestions[0].answer ||
        securityQuestions[1].answer !== user.securityQuestions[1].answer ||
        securityQuestions[2].answer !== user.securityQuestions[2].answer
      ) {
        console.error("Unauthorized");
        return next(createError(401, "Unauthorized"));
      }
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      user.password = hashedPassword;
      const result = await users.updateOne({ email: email }, { user });
      console.log("Result: ", result);
      res
        .status(200)
        .send({ message: "Password reset successful", user: user });
    } catch (err) {
      console.error("Error: ", err.message);
      next(err);
    }
  }
);


// Create a new Delete endpoint
app.delete("/api/books/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await books.deleteOne({ id: parseInt(id) });
    console.log("Result: ", result);
    res.status(204).send();
  } catch (err) {
    if (err.message === "No matching item found") {
      return next(createError(404, "Book Title not found"));
    }
    console.error("Error: ", err.message);
    next(err);
  }
});

// create new PUT endpoint with validation
app.put("/api/books/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    let book = req.body;
    id = parseInt(id);
    if (isNaN(id)) {
      return next(createError(400, "Input must be a number"));
    }
    const expectedKeys = ["title", "author"];
    const receivedKeys = Object.keys(book);
    if (
      !receivedKeys.every((key) => expectedKeys.includes(key)) ||
      receivedKeys.length !== expectedKeys.length
    ) {
      console.error("Bad Request: Missing keys or extra keys", receivedKeys);
      return next(createError(400, "Bad Request"));
    }
    const result = await books.updateOne({ id: id }, book);
    console.log("Result: ", result);
    res.status(204).send();
  } catch (err) {
    if (err.message === "No matching book found") {
      console.log("Book not found", err.message);
      return next(createError(404, "Book not found"));
    }
    console.error("Error: ", err.message);
    next(err);
  }
});

// add error handling
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);

  res.json({
    type: "error",
    status: err.status,
    message: err.message,
    stack: req.app.get("env") === "development" ? err.stack : undefined,
  });
});

module.exports = app;
