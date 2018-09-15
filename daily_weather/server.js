/* =======================
    LOAD THE DEPENDENCIES
==========================*/
var express    = require('express');
var app        = express();
var path       = require('path');
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');
var multer=require('multer');
var Board = require('./models/board');
// Database
var mongodbUri = 'mongodb://localhost:27017/daily_weather/users';
mongoose.Promise = global.Promise;
mongoose.connect(mongodbUri);
var db = mongoose.connection;
db.once('open', function () {
   console.log('DB connected!');
});
db.on('error', function (err) {
  console.log('DB ERROR:', err);
});

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'content-type, x-access-token');
  next();
});


// API
app.use('/api/users', require('./api/users'));
app.use('/api/auth', require('./api/auth'));
app.use('/api/contents',require('./api/contents'));
app.use('/api/mypage',require('./api/mypage'));
// Server
var port = 3000;
app.listen(port, function(){
  console.log('listening on port:' + port);
});
