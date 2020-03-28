var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var title = 'Title from app';
  var params = {id: "myid", class: title, required:true};
  res.render('index', { title: title, params: params });
});

module.exports = router;
