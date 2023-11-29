const express = require('express');
const signupController = require('../controllers/user');
const userAuthentication = require('../middleware/authenticate');
const router = express.Router();

router.post('/signup', signupController.postSignup);
router.post('/login',signupController.postLogin);
router.post('/checkIfAdmin',userAuthentication.authenticate,signupController.checkIfAdmin);


module.exports = router;