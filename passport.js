/**
 * @file This file implements two passport strategies that are used to authenticate requests to the 
 * Api endpoints. The local strategy is used when a user logs in, and validates the username and 
 * password against the users collection in the database. For subsequent requests the JWT strategy is 
 * used. This validates the request by decoding the json Web Token returned to the user on a successful 
 * login, then checking the user ID from the payload against the users collection in the database.
 
 * @requires passport Used to create strategies for authenticating and authorizing requests to the Api endpoints.
 * @requires passport-local Used to create a local strategy.
 * @requires './models.js' The file where data schemas and models are defined.
 * @requires passport-jwt Used to create a jwt strategy and to extract tokens from requests.
 */

const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

// Configures and registers a local authentication strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    (username, password, callback) => {
      console.log(username + " " + password);
      Users.findOne({ Username: username }, (error, user) => {
        if (error) {
          console.log(error);
          return callback(error);
        }

        if (!user) {
          console.log("incorrect username");
          return callback(null, false, { message: "Incorrect username." });
        }

        if (!user.validatePassword(password)) {
          console.log("Incorrect password");
          return callback(null, false, { message: "Incorrect password." });
        }

        console.log("finished");
        return callback(null, user);
      });
    }
  )
);

//Configures and registers a local authentication strategy
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
