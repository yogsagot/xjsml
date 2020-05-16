var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var title = 'Title from app';
  var user = {
    firstname: 'Juris',
    lastname: 'Krumgolds'
  }
  var params = {id: "myid", class: title, required:true};

  var sortfunc = (a, b) => (a > b ? -1 : 1);

  var func = function() {
    return "hello from func";
  }

  var arr = new Array();
  arr.push(1);
  arr.push('ffff');

  res.render('index', { title: title, params: params, func: func, arr: arr, user: user, sortfunc: sortfunc });
});

module.exports = router;
