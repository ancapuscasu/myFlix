//Import <express>, <morgan>, <mongoose>, <./models.js>, <lodash>
const express = require ('express'),
morgan = require('morgan'),
mongoose = require('mongoose'),
Models = require('./models.js');


const app = express();

const Movies = Models.Movie;
const Genres = Models.Genre;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('common')); //middleware for logging site use
app.use(express.static('public')); // middleware for serving static files

//Import <cors>
const cors = require('cors');
app.use(cors()); // Middleware for controlling which domains have access


// //Import <./auth.js> file
// let auth = require('./auth')(app);

//Import <passport> module and <passport.js> file
const passport = require('passport');
require('./passport');
require('./auth')(app);


//Return the home page of myFlix App
app.get('/', passport.authenticate("jwt", { session: false }), (req, res) =>{
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
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username})
        .then ((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + " already exists");
            } else {
                Users
                    .create({
                        FirstName: req.body.FirstName,
                        LastName: req.body.LastName,
                        Username: req.body.Username,
                        Email: req.body.Email,
                        Password: req.body.Password,
                        Birthdate: req.body.Birthdate
                    })
                    .then((user) => {
                        res.status(201).json(user) })
                    .catch((err) => {
                        console.error(err);
                        res.status(500).send('Error: ' + err);
                    })
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
app.put('/users/:Username', passport.authenticate("jwt", { session: false }), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username},
        {$set: {
            FirstName: req.body.FirstName,
            LastName: req.body.LastName,
            Username: req.body.Username,
            Email: req.body.Email,
            Password: req.body.Password,
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
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  }); 

//Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });




  