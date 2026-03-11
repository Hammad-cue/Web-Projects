var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Signup Form. */
router.get('/signup', function(req, res, next) {
  res.render('signup'); 
});

/* POST signup data. */
router.post('/signup', function(req, res, next) {
  const { username, email, password } = req.body;
  
  console.log("New User Registration:");
  console.log("Username:", username);
  console.log("Email:", email);

  res.send(`<h1>Thanks for signing up, ${username}!</h1><a href="/signup">Go back</a>`);
});

module.exports = router;
