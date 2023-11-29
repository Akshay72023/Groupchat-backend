const userAuthentication = require('../middleware/authenticate');
const groupController = require('../controllers/group');
const express = require('express');
const router = express.Router();

router.post('/createGroup',userAuthentication.authenticate,groupController.createNewGroup);

router.get('/getGroups',userAuthentication.authenticate,groupController.getGroups);

router.get('/findGroup',groupController.findGroup);

router.post('/addUser',userAuthentication.authenticate,groupController.addUser)

module.exports = router