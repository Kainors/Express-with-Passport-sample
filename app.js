var Users = {
  test1:{
    name: 'test1',
    password: 'password1'
  },
  test2:{
    name: 'test2',
    password: 'password2'
  }
};
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
app.use(require('express-session')({ 
  secret: 'keyboard cat', // <= 這邊為官網範例預設值, 正式環境下請記得修改
  resave: false,
  saveUninitialized: false 
  }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  function (username, password, done) {
    // 取得使用者的資料
    user = Users[username];
    // 如果查無使用者
    if (user === null) {
      return done(null, false, { message: 'Invalid user' });
    }
    // 驗證使用者密碼錯誤時
    if (user.password !== password) {
      return done(null, false, { message: 'Invalid password' });
    }
    return done(null, user);
  }
));
passport.serializeUser(function (user, done) {
  done(null, user.name);
});
passport.deserializeUser(function (username, done) {
  done(null, Users[username]);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  res.locals.user = req.user;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use('/', index);

app.get('/login', function(req, res, next) {
  res.render('login');
});
app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
