var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var title = `
  
  this is 

  <b>bold</b>    
  
  `;
  res.render('index', { title: title, val: 55, obj: {a: 'aaa', b: 555} });
});

module.exports = router;
