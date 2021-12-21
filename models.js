
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

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let Genre = mongoose.model('Genre', genreSchema);
let User = mongoose.model('User', userSchema);


module.exports.Movie = Movie;
module.exports.Genre = Genre;
module.exports.User = User;
