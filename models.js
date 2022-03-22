/**
 * @file The models file implements schemas for documents held in the movies, genres and users collections in
 * the myFlix database. The schemas are used to create models, which in turn are used in http requests
 * to Api endpoints to create, read, update and delete documents from the database. Mongoose is 
 * connected to the database using the connect method in the index file.
 * @requires mongoose Connects the app to the database and implements data schemas using models.
 * @requires bcrypt Used to implement encryption on user passwords.
 */

const mongoose = require('mongoose'),
bcrypt = require('bcrypt');
const passport = require('passport');

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
  Username: {type: String, required: true, minlength: 5, maxlenght: 15},
  Email: {type: String, required: true, match: /.+\@.+\..+/,unique: true },
  Password: {type: String, required: true, minlength: 8},
  Birthdate: Date,
  FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

/**
 * Static method to encrypt user passwords. Used when creating or updating users. 
 * Available to each instance of a user created.
 * @method hashPassword
 * @param {*} password - The user's password taken from the request body.
 * @returns {string} String containing the encrypted password.
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Custom method used to validate a user's password against the encrypted version in the database
 * when the user attempts to log in. Available to each instance of a user created.
 * @method validatePassword
 * @param {*} password - Password submitted by the user when logging in.
 * @returns {boolean} True if the password submitted when encrypted matches the encrypted password
 * taken from the database. 
 */
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

/** Creates models for the database collections using the above defined mongoose schemas */
let Movie = mongoose.model('Movie', movieSchema);
let Genre = mongoose.model('Genre', genreSchema);
let User = mongoose.model('User', userSchema);


module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.User = User;
