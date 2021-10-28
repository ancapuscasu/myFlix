//imported <express> and <morgan>
const express = require ('express'),
morgan = require('morgan');

const app = express();

app.use(morgan('common')); //middleware for logging site use
app.use(express.static('public')); // middleware for serving static files


// created topMovies list
let topMovies = [
    {
        title: 'Parasite',
        genre: ['Drama', 'Mystery & Thriller', 'Comedy'],
        director: 'Bong Joon-ho',
        releaseYear: 2019
    },
    {
        title: 'Us',
        genre: ['Horror', 'Mystery & Thriller'],
        director: 'Jordan Peele',
        releaseYear: 2019
    },
    {
        title: 'Blackkklansman',
        genre: ['Drama', 'Crime', 'Comedy'],
        director: 'Spike Lee',
        releaseYear: 2018
    },
    {
        title: 'Get Out',
        genre: ['Horror', 'Comedy', 'Mystery & Thriller'],
        director: 'Jordan Peele',
        releaseYear: 2017
    },
    {
        title: 'American Psycho',
        genre: ['Horror', 'Comedy'],
        director: 'Mary Harron',
        releaseYear: 2000
    },
    {
        title: 'Burning',
        genre: ['Drama', 'Mystery & Thriller'],
        director: 'Lee Chang-dong',
        releaseYear: 2018
    },
    {
        title: 'Baby Driver',
        genre: ['Action', 'Mystery & Thriller'],
        director: 'Edgar Wright',
        releaseYear: 2017
    },
    {
        title: 'Hidden Figures',
        genre: ['Drama', 'History'],
        director: 'Theodore Melfi',
        releaseYear: 2017
    },
    {
        title: 'Taxi Driver',
        genre: ['Drama'],
        director: 'Martin Scorsese',
        releaseYear: 1976
    },
    {
        title: 'Midnight in Paris',
        genre: ['Fantasy', 'Romance'],
        director: 'Woody Allen',
        releaseYear: 2011
    }
];

// GET requests
app.get('/movies', (req, res, next) => {
    res.json(topMovies);
    next();
});

app.get('/', (req, res, next) => {
    res.send('Welcome to myFlix app');
    next();
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname }
    );
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  }); 