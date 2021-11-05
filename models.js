
const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
Title: {type: String, required: true},
Description: {type: String, required: true},
Genre: [{type: mongoose.Schema.Types.ObjectId, ref: 'Genre'}],
Director: {
  Name: String,
  Bio: String,
  Birthdate: Date
},
ImagePath: String,
Featured: Boolean,
ReleaseYear: Number
});

let genreSchema = mongoose.Schema({
  Name: {type: String, required: true},
  Description: {type: String, required: true}
})

let userSchema = mongoose.Schema({
  FirstName: {type: String, required: true},
  LastName: {type: String, required: true},
  Username: {type: String, required: true},
  Email: {type: String, required: true},
  Password: {type: String, required: true},
  Birthdate: Date,
  FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

let Movie = mongoose.model('Movie', movieSchema);
let Genre = mongoose.model('Genre', genreSchema);
let User = mongoose.model('User', userSchema);


module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.User = User;
