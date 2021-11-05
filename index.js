//imported <express> and <morgan>
const express = require ('express'),
morgan = require('morgan'),
mongoose = require('mongoose'),
Models = require('./models.js');


const app = express();
const Movies = Models.Movie;
const Genres = Models.Genre;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true});

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded()); // Parse URL-encoded bodies
app.use(morgan('common')); //middleware for logging site use
app.use(express.static('public')); // middleware for serving static files


// created topMovies list
// let topMovies = [
//     {
//         title: 'Parasite',
//         genre: ['Thriller'],
//         director: 'Bong Joon-ho',
//         releaseYear: 2019
//     },
//     {
//         title: 'Us',
//         genre: ['Horror'],
//         director: 'Jordan Peele',
//         releaseYear: 2019
//     },
//     {
//         title: 'Blackkklansman',
//         genre: ['Drama'],
//         director: 'Spike Lee',
//         releaseYear: 2018
//     },
//     {
//         title: 'Get Out',
//         genre: ['Thriller'],
//         director: 'Jordan Peele',
//         releaseYear: 2017
//     },
//     {
//         title: 'American Psycho',
//         genre: ['Horror'],
//         director: 'Mary Harron',
//         releaseYear: 2000
//     },
//     {
//         title: 'Burning',
//         genre: ['Drama'],
//         director: 'Lee Chang-dong',
//         releaseYear: 2018
//     },
//     {
//         title: 'Baby Driver',
//         genre: ['Action'],
//         director: 'Edgar Wright',
//         releaseYear: 2017
//     },
//     {
//         title: 'Hidden Figures',
//         genre: ['History'],
//         director: 'Theodore Melfi',
//         releaseYear: 2017
//     },
//     {
//         title: 'Taxi Driver',
//         genre: ['Drama'],
//         director: 'Martin Scorsese',
//         releaseYear: 1976
//     },
//     {
//         title: 'Midnight in Paris',
//         genre: ['Fantasy'],
//         director: 'Woody Allen',
//         releaseYear: 2011
//     }
// ];

//Return the home page of myFlix App
app.get('/', (req, res) =>{
    res.send('Welcome to myFlix App');
})

// Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
    res.json(topMovies);
});


// Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get('/movies/:title', (req, res) => {
    res.json(topMovies.find( (movie) => {
        return movie.title === req.params.title 
    }));
});

//Return data about a genre (description) by name/title (e.g., “Thriller”)
app.get('/movies/:title/genre', (req, res) => {
    res.send('Successful GET request returning data about a genre.');
});

//Return data about a director (bio, birth year, death year) by name
app.get('/movies/directors/:name', (req, res) => {
    res.send('Successful GET request returning data about a director.');
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
app.post('/newUser', (req, res) => {
    Users.findOne({ Username: req.body.Username})
        .then ((user) => {
            if (user) {
                return res.status(400).send(req.body.username + "already exists");
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



//Allow users to update their user info (username)
app.put('/newUser/:id/info', (req, res) => {
    res.send('Successful PUT request - user info is updated');
});

//Allow users to add a movie to their list of favorites 
app.post('/newUser/:id/favourites', (req, res) => {
    res.send('Successful POST request - user added a movie to their favourites');
});

//Allow users to remove a movie from their list of favorites 
app.delete('/newUser/:id/favourites', (req, res) => {
    res.send('Successful DELETE request - user removed movie from favourites');
});

//Allow existing users to deregister 
app.delete('/newUser', (req, res) => {
    res.send('Successful DELETE request - user has deregistered');
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




  