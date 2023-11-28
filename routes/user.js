const express = require('express');
const signupController = require('../controllers/user');
const router = express.Router();

router.post('/signup', signupController.postSignup);


module.exports = router;