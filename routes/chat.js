const chatController = require('../controllers/chat')
const userAuthentication = require('../middleware/authenticate');
const express = require('express');
const router = express.Router();

router.post('/sendMsg',userAuthentication.authenticate,chatController.sendMsg);
router.get('/getMsg',chatController.getMsg);

module.exports = router;
