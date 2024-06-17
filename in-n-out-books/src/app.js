/*
  Name: Kylie Struhs
  Date: June 14 2024
  File Name: app.js
  Description:
*/

// set up Express Application
const express = require("express");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");

const app = express(); // Creates an Express application

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
          <h3>My Shelf</h3>
            <p>
              <ul>
                <li>Pride and Prejudice</li>
                <li>The Count of Monte Cristo</li>
              </ul>
            </p>
              </div>
              <div class="previous-reads">
                <h3>Previous Reads</h3>
                <p>
                <ul>
                  <li>To Kill a Mockingbird</li>
                  <li>Anne of Green Gables</li>
                </ul>
                </p>
              </div>
        </main>
      </div>
    </body>
    </html> `; // end HTML content for the landing page

  res.send(html); // Sends the HTML content to the client
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
