//Import <express>, <morgan>, <mongoose>, <./models.js>, <lodash>
const express = require ('express'),
morgan = require('morgan'),
mongoose = require('mongoose'),
Models = require('./models.js');


const app = express();

const Movies = Models.Movie;
const Genres = Models.Genre;
const Users = Models.User;

//CONNECT to local database
// mongoose.connect('mongodb://localhost:27017/myFlixDB', { 
//     useNewUrlParser: true, 
//     useUnifiedTopology: true
// });

//CONNECT to online database
mongoose.connect(process.env.CONNECTION_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('common')); //middleware for logging site use
app.use(express.static('public')); // middleware for serving static files


//Import <cors> - Middleware for controlling which domains have access
const cors = require('cors');

//list of allowed domains
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

//function to check domains - allows listed domains, else returns error 
app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            let message = `The CORS policy for this application doesn't allow access from origin ` + origin;
            return callback (new Error(message), false);
        }
        return callback(null, true);
    }
})); 


//Import <express-validator> - Middleware for validating methods on the backend
const { check, validationResult } = require('express-validator');


//Import <passport> module, <passport.js> and <auth.js> files
const passport = require('passport');
require('./passport');
require('./auth')(app);


//Return the home page of myFlix App
app.get('/', (req, res) =>{
    res.send('Welcome to myFlix App');
})


// Return a list of ALL movies to the user
app.get('/movies', passport.authenticate("jwt", { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



// Return data about a single movie by title to the user
app.get('/movies/:Title', passport.authenticate("jwt", { session: false }), (req, res) => {
   Movies.findOne({ Title: req.params.Title})
    .then ((movie) => {
        res.json(movie);
    })
    .catch ((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});



//Return data about a genre by name/title.
app.get('/genres/:Name', passport.authenticate("jwt", { session: false }), (req, res) => {
    Genres.findOne({ Name: req.params.Name})
        .then((genre) => {
            res.json(genre);
        })
        .catch ((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});


//Return data about a director by name
app.get('/movies/director/:Name', passport.authenticate("jwt", { session: false }), (req, res) => {
    Movies.findOne({"Director.Name": req.params.Name})
        .then((movies) => {
            res.json(movies.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});



//Return a list of all Users 
app.get('/users', passport.authenticate("jwt", { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Return a User by Username
app.get('/users/:Username', passport.authenticate("jwt", { session: false }), (req,res) => {
    Users.findOne({ Username: req.params.Username})
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});


//Allow new users to register
/* Expect a JSON object in this format:
    {
        FirstName: {type: String, required: true},
        LastName: {type: String, required: true},
        Username: {type: String, required: true},
        Email: {type: String, required: true},
        Password: {type: String, required: true},
        Birthdate: Date
    }
*/
app.post('/users', 
    [
        check ('Username', 'Username can only contain letter and numbers - no special characters allowed').isAlphanumeric(),
        check ('Username', 'Username must be 5 characters long').isLength({min: 5}),
        check ('Password', 'Password is required').not().isEmpty(),
        check ('Password', 'Password must be at least 8 characters long').isLength({min: 8}),
        check ('Email', 'Valid email is required').isEmail()
    ],(req, res) => {

    //check the validation object for errors
        let errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array () });
        }

        let hashedPassword = Users.hashPassword(req.body.Password); 
        Users.findOne({ Username: req.body.Username}) // Search to see if a user with the requested username already exists.
            .then ((user) => {
                if (user) {
                    return res.status(400).send(req.body.Username + " already exists"); //If user is found, send a response that " USER " already exists.
                } else {
                    Users
                        .create({
                            FirstName: req.body.FirstName,
                            LastName: req.body.LastName,
                            Username: req.body.Username,
                            Email: req.body.Email,
                            Password: hashedPassword,
                            Birthdate: req.body.Birthdate
                        })
                        .then((user) => {
                            res.status(201).json(user) })
                        .catch((err) => {
                            console.error(err);
                            res.status(500).send('Error: ' + err);
                        });
                    }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
        
});



//Allow users to update their User Info by Username
/* Expect a JSON object with one or more fields updated:
    {
        FirstName: {type: String, required: true},
        LastName: {type: String, required: true},
        Username: {type: String, required: true},
        Email: {type: String, required: true},
        Password: {type: String, required: true},
        Birthdate: Date
    }
*/
app.put('/users/:Username', 
    [
        check ('Username', 'Username can only contain letter and numbers - no special characters allowed').isAlphanumeric(),
        check ('Username', 'Username must be 5 characters long').isLength({min: 5}),
        check ('Password', 'Password is required').not().isEmpty(),
        check ('Password', 'Password must be at least 8 characters long').isLength({min: 8}),
        check ('Email', 'Valid email is required').isEmail()
    ], passport.authenticate("jwt", { session: false }), (req, res) => {

        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);

        Users.findOneAndUpdate({ Username: req.params.Username},
            {$set: {
                FirstName: req.body.FirstName,
                LastName: req.body.LastName,
                Username: req.body.Username,
                Email: req.body.Email,
                Password: hashedPassword,
                Birthdate: req.body.Birthdate
            }
        },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});


//Allow users to add a movie to their list of favorites 
app.post('/users/:Username/movies/:MovieID', passport.authenticate("jwt", { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username},
        {$addToSet: { FavouriteMovies: req.params.MovieID}
    },
    { new: true},
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//Allow users to remove a movie from their list of favorites 
app.delete('/users/:Username/movies/:MovieID', passport.authenticate("jwt", { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username},
        {$pull: { FavouriteMovies: req.params.MovieID}
    },
    { new: true},
    (err, updatedUser) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error: ' + err);
        } else {
            res.json(updatedUser);
        }
    });
});

//Delete a user by Username
app.delete('/users/:Username', passport.authenticate("jwt", { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username})
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + " was not found.");
            } else {
                res.status(200).send(req.params.Username + " was deleted.");
            }
        })
        .catch ((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
 


// listen for requests
const port = process.env.PORT || 80;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port: ' + port);
  }); 

//Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });




  