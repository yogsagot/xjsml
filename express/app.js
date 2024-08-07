var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const xjsml = new (require('..'))({
  cacheEnabled: app.get('env') !== 'development',
  caseSensitive: true,
  javascriptTagAllowed: false,
  callbacksAllowed: true
});

xjsml.registerTag('test', function(tag, args) {
  return "<b>TEST</b>" + this.renderTag(tag.children, args);
});

xjsml.registerModifier('shitcase', function(value, param, values) {
  var res = [...value];
  for (let index = 0; index < res.length; index++) {
    if (index % 2 === 0) {
      res[index] = String(res[index]).toUpperCase();
    } else {
      res[index] = String(res[index]).toLowerCase();
    }
  }
  return res.join('') + values.func();
});

xjsml.registerCallback('supercallback', function(paramA, paramB) {
  this.callbackpatch = `param A is ${paramA}`;
  return `returning param B: ${paramB * 5}`;
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'xjsml');
app.engine('xjsml', xjsml.express());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.sessionvar = "this is sessionvar"
  next();
});

xjsml.globals.globalvar = "this is globalvar";

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
