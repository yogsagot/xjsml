var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var title = 'Title from app';
  var arr = [111, "333", "fdsf", 34.44];
  var func = 'return "abc";';
  res.render('index', { title: title, arr: arr, func: func });
});

module.exports = router;
