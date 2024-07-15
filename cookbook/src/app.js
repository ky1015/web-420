/*
  Name: Kylie Struhs
  Date: June 23 2024
  File Name: app.js
  Description: Cookbook Application example
*/

// set up Express Application
const express = require("express");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");

const app = express(); // Creates an Express application

const recipes = require("../database/recipes");
const users = require("../database/users");

// parse incoming requests as JSON payloads
app.use(express.json());

// parse urlencoded payloads
app.use(express.urlencoded({ extended: true }));

// add a GET route for the main URL

app.get("/", async (req, res, next) => {
  // HTML content for the landing page
  const html = ` <html>
    <head>
    <title>Cookbook App</title>
     <style>
      body, h1, h2, h3 { margin: 0; padding: 0; border: 0;}
      body {  background: #424242;  color: # f;  margin: 1.25rem;  font-size: 1.25rem;}
      h1, h2, h3 { color: #EF5350; font-family: 'Emblema One', cursive;}
      h1, h2 { text-align: center }
      h3 { color: # f; }
      .container { width: 50%; margin: 0 auto; font-family: 'Lora', serif;}
      .recipe { border: 1px solid #EF5350; padding: 1rem; margin: 1rem 0;}
      .recipe h3 { margin-top: 0; } main a { color: # f; text-decoration: none;}
      main a:hover { color: #EF5350; text-decoration: underline;}
      </style>
    </head>
    <body>
      <div class="container">
      <header>
          <h1>Cookbook App</h1>
          <h2>Discover and Share Amazing Recipes</h2>
        </header>
        <br />
        <main>
          <div class="recipe">
            <h3>Classic Beef Tacos</h3>
              <p>1. Brown the ground beef in a skillet.<br>
                2. Warm the taco shells in the oven.<br>3. Fill the taco shells with beef, lettuce, and cheese.</p>
                </div>
                <div class="recipe">
                  <h3>Vegetarian Lasagna</h3>
                  <p>1. Layer lasagna noodles, marinara sauce, and cheese in a baking dish.<br>
                  2. Bake at 375 degrees for 45 minutes.<br>3. Let cool before serving.</p>
                  </div>
          </main>
        </div>
      </body>
      </html> `; // end HTML content for the landing page
  res.send(html); // Sends the HTML content to the client
});

// GET endpoint uses find method to return array
app.get("/api/recipes", async (req, res, next) => {
  try {
    const allRecipes = await recipes.find();
    console.log("All Recipes: ", allRecipes); // Logs all recipes
    res.send(allRecipes); // Sends response with all recipes
  } catch (err) {
    console.error("Error: ", err.message); // Logs error message
    next(err); // Passes error to the next middleware
  }
});

// makes sure input is a number and gets one recipe
app.get("/api/recipes/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    id = parseInt(id);
    if (isNaN(id)) {
      return next(createError(400, "Input must be a number"));
    }
    const recipe = await recipes.findOne({ id: id });
    console.log("Recipe: ", recipe);
    res.send(recipe);
  } catch (err) {
    console.error("Error: ", err.message);
    next(err);
  }
});

// Create new POST endpoint
app.post("/api/recipes", async (req, res, next) => {
  try {
    const newRecipe = req.body;
    const expectedKeys = ["id", "name", "ingredients"];
    const receivedKeys = Object.keys(newRecipe);
    if (
      !receivedKeys.every((key) => expectedKeys.includes(key)) ||
      receivedKeys.length !== expectedKeys.length
    ) {
      console.error("Bad Request: Missing keys or extra keys", receivedKeys);
      return next(createError(400, "Bad Request"));
    }
    const result = await recipes.insertOne(newRecipe);
    console.log("Result: ", result);
    res.status(201).send({ id: result.ops[0].id });
  } catch (err) {
    console.error("Error: ", err.message);
    next(err);
  }
});

// Create new POST endpoint to register a user, check if there are duplicate users with same email, and to check request parameter values
app.post("/api/register", async (req, res, next) => {
  console.log("Request body: ", req.body);
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
    let duplicateUser;
    try {
      duplicateUser = await users.findOne({ email: user.email });
    } catch (err) {
      duplicateUser = null;
    }
    if (duplicateUser) {
      console.error("Conflict: User already exists");
      return next(createError(409, "Conflict"));
    }
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    const newUser = await users.insertOne({
      email: user.email,
      password: hashedPassword,
    });
    res.status(200).send({ user: newUser, message: "Registration successful" });
  } catch (err) {
    console.error("Error: ", err);
    console.error("Error: ", err.message);
    next(err);
  }
});

// Create a new Delete endpoint
app.delete("/api/recipes/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await recipes.deleteOne({ id: parseInt(id) });
    console.log("Result: ", result);
    res.status(204).send();
  } catch (err) {
    if (err.message === "No matching item found") {
      return next(createError(404, "Recipe not found"));
    }
    console.error("Error: ", err.message);
    next(err);
  }
});

// Create a new PUT endpoint
app.put("/api/recipes/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    let recipe = req.body;
    id = parseInt(id);
    if (isNaN(id)) {
      return next(createError(400, "Input must be a number"));
    }
    const expectedKeys = ["name", "ingredients"];
    const receivedKeys = Object.keys(recipe);
    if (
      !receivedKeys.every((key) => expectedKeys.includes(key)) ||
      receivedKeys.length !== expectedKeys.length
    ) {
      console.error("Bad Request: Missing keys or extra keys", receivedKeys);
      return next(createError(400, "Bad Request"));
    }
    const result = await recipes.updateOne({ id: id }, recipe);
    console.log("Result: ", result);
    res.status(204).send();
  } catch (err) {
    if (err.message === "No matching item found") {
      console.log("Recipe not found", err.message);
      return next(createError(404, "Recipe not found"));
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
