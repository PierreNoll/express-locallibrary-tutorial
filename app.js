var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site.

var compression = require('compression'); // To compress html response to send to the clients. For a high-traffic website in production you wouldn't use this middleware. Instead you would use a reverse proxy like Nginx.
var helmet = require('helmet'); // middleware to setting appropriate HTTP headers to help protect from well known vulnerabilities

var partials = require('express-partials'); // For handling layout

var app = express();

app.use(helmet()); // Declaring early so sure that the app is protected

//Set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = process.env.MONGO_DB_URI || 'mongodb://express-app:'+process.env.MLAB_PASS+'@ds237363.mlab.com:37363/local_library_tuto';
mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(compression()); // Before all routes so compress all routes

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(partials());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);  // Add catalog routes to middleware chain.

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
