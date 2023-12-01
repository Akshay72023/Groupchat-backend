const chatController = require('../controllers/chat')
const userAuthentication = require('../middleware/authenticate');
const multer = require('multer')  // to handle uploaded files
// Multer configuration
const upload = multer({ dest: 'uploads/' });
const express = require('express');
const router = express.Router();

router.post('/sendMsg',userAuthentication.authenticate,chatController.sendMsg);
router.get('/getNewMsg',chatController.getNewMsg);
router.post('/upload',userAuthentication.authenticate,upload.single('file'),chatController.upload)

module.exports = router;
