var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var title = 'title';
  var arr = [111, "333", "fdsf", 34.44]
  res.render('index', { title: title, arr: arr });
});

module.exports = router;
