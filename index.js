/** 
 * @file The index file creates the Express application, sets up the server and implements routes to Api
 * endpoints used to access myFlix data. Requests made to these endpoints use mongoose models created in the 
 * models file and are authenticated using strategies implemented in the passport file. The connect method 
 * establishes a connection between mongoose and the database, which is hosted on MongoDB Atlas. The 
 * server and endpoints are hosted on Render.

 * @requires mongoose Connects the app to the database and implements data schemas using models.
 * @requires './models.js' The file where data schemas and models are defined.
 * @requires express Used to create an express application.
 * @requires morgan Used to log requests made to the database.
 * @requires passport Used to create strategies for authenticating and authorising requests to the Api endpoints.
 * @requires './auth.js' The file that implements the user login route.
 * @requires cors Used to control origins from which requests to the server can be made.
 * @requires express-validator Used to perform validation on data provided when creating or updating a user.
 */

const express = require("express"),
  morgan = require("morgan"),
  mongoose = require("mongoose"),
  Models = require("./models.js");

// Call the express function to create the application
const app = express();

const Movies = Models.Movie;
const Genres = Models.Genre;
const Users = Models.User;

//Connects mongoose to the local database
// mongoose.connect('mongodb://localhost:27017/myFlixDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

//Connects mongoose to the myFlix online database
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("common")); //middleware for logging requests
app.use(express.static("public")); // middleware for serving static files

//Import <cors> - Middleware for controlling which domains have access
const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:1234",
  "http://localhost:4200",
  "https://myflix-react.web.app",
];

//checks if the domain the request came from is allowed
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);

//Import <express-validator> - Middleware for validating methods on the backend
const { check, validationResult } = require("express-validator");

// Run passport file where strategies are implemented
const passport = require("passport");
require("./passport");
require("./auth")(app);

/**
 * All http requests in express take a callback function as a parameter. The function takes as parameters
 * the request and response objects, which can then be used to access the data associated with the request.
 * This callback type will be named: 'requestCallback'.
 * @callback requestCallback
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */

/**
 * Some endpoints are protected. The second parameter of requests made to these endpoints invokes a named
 * authentication strategy. If authentication succeeds, the authenticated user is attached to the request
 * object and the request callback is fired. This callback type will be named: 'authenticationCallback'.
 * @callback authenticationCallback
 * @param {string} strategy - the name of the passport strategy used.
 * @param {Object} config - configuration object. Used here to specify that sessions are not used.
 */

///////////////////////////////////////////////////////// HTTP Requests /////////////////////////////////////////////////////////

/**
 * GET request to the landing page ('/') endpoint.
 * @method GET
 * @param {string} URL
 * @param {requestCallback}
 * @returns {string} The welcome message.
 */
app.get("/", (req, res) => {
  res.send("Welcome to myFlix App");
});

/**
 * POST request to the /users endpoint to create a new user record. This request requires a request 
 * body containing the fields: FirstName, LastName, Username, Password, Email, Birthdate. The fields are first validated 
 * against specified validators before the new user record is created.
 * @method POST 
 * @param {string} URL
 * @param {object} validationChain Series of checks that validate specified fields in the request body.
 * @param {requestCallback}
 * @returns {Object} An object containing the new user record.
 * 
 * Expect a JSON object in this format:
    {
        FirstName: {type: String, required: true},
        LastName: {type: String, required: true},
        Username: {type: String, required: true},
        Email: {type: String, required: true},
        Password: {type: String, required: true},
        Birthdate: Date
    }
 */
app.post(
  "/users",
  [
    check(
      "Username",
      "Username can only contain letter and numbers - no special characters allowed"
    ).isAlphanumeric(),
    check("Username", "Username must be 5 characters long").isLength({
      min: 5,
    }),
    check("Password", "Password is required").not().isEmpty(),
    check("Password", "Password must be at least 8 characters long").isLength({
      min: 8,
    }),
    check("Email", "Valid email is required").isEmail(),
  ],
  (req, res) => {
    //check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists.
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists"); //If user is found, send a response that " USER " already exists.
        } else {
          Users.create({
            FirstName: req.body.FirstName,
            LastName: req.body.LastName,
            Username: req.body.Username,
            Email: req.body.Email,
            Password: hashedPassword,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((err) => {
              console.error(err);
              res.status(500).send("Error: " + err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * GET request to the /movies endpoint. Return a list of ALL movies to the user.
 * @method GET
 * @param {string} URL
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An array of all the movie records in the database.
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * GET request to the /movies/[Title] endpoint. Return data about a single movie by title to the user.
 * @method GET
 * @param {string} URL
 * @example /movies/Parasite
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An object containing the movie record for the movie whose title is included in the URL.
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * GET request to the /genres endpoint. Return a list of ALL genres to the user.
 * @method GET
 * @param {string} URL
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An array of all the genre records in the database.
 */
app.get(
  "/genres",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Genres.find()
      .then((genres) => {
        res.status(201).json(genres);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("MEOW: " + err);
      });
  }
);

/**
 * GET request to the /users/[UserID] endpoint.
 * @method GET
 * @param {string} URL
 * @example /users/647585932171739405
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An object containing the record for the user included in the URL.
 */
app.get(
  "/users/:UserID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ _id: req.params.UserID })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * PUT request to the /users/[UserID] endpoint to update the user's details. This request requires
 * a request body containing the fields: FirstName, LastName, Username, Password, Email, Birthday. The fields are first
 * validated against specified validators before the user record is updated.
 * @method PUT
 * @param {string} URL
 * @example /users/647585932171739405
 * @param {object} validationChain Series of checks that validate specified fields in the request body.
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An object containing the updated user record.
 */
app.put(
  "/users/:UserID",
  [
    check(
      "Username",
      "Username can only contain letter and numbers - no special characters allowed"
    ).isAlphanumeric(),
    check("Username", "Username must be 5 characters long").isLength({
      min: 5,
    }),
    check("Email", "Valid email is required").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    Users.findOneAndUpdate(
      { _id: req.params.UserID },
      {
        $set: {
          FirstName: req.body.FirstName,
          LastName: req.body.LastName,
          Username: req.body.Username,
          Email: req.body.Email,
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * POST request to the /users/[UserID]/movies/[MovieID] endpoint to add a movie to the user's favourites list.
 * @method PUT
 * @param {string} URL
 * @example /users/647585932171739405/movies/123145646547822
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An object containing the updated user record.
 */
app.post(
  "/users/:UserID/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { _id: req.params.UserID },
      { $addToSet: { FavouriteMovies: req.params.MovieID } },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * DELETE request to the /users/[UserID]/movies/[MovieID] endpoint to remove a movie from the user's favourites list.
 * @method DELETE
 * @param {string} URL
 * @example /users/647585932171739405/movies/123145646547822
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {Object} An object containing the updated user record.
 */
app.delete(
  "/users/:UserID/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { _id: req.params.UserID },
      { $pull: { FavouriteMovies: req.params.MovieID } },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * DELETE request to the /users/[UserID] endpoint.
 * @method DELETE
 * @param {string} URL
 * @example /users/647585932171739405
 * @param {authenticationCallback}
 * @param {requestCallback}
 * @returns {string} A text message: '[Username] has been deregistered'.
 */
app.delete(
  "/users/:UserID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ _id: req.params.UserID })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found.");
        } else {
          res.status(200).send(req.params.Username + " has been deregistered.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Create a reference to the port on the hosted server and listen to port
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port: " + port);
});

// Error handling function to catch any previously uncaught errors and log them to the console
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
