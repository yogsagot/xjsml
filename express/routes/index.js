var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var title = 'this is <b>bold</b>';
  
  res.render('index', { ...req.xjsmlsessionvars, title: title, val: 55 });
});

module.exports = router;
