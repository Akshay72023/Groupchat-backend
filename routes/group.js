const userAuthentication = require('../middleware/authenticate');
const groupController = require('../controllers/group');
const express = require('express');
const router = express.Router();

router.post('/createGroup',userAuthentication.authenticate,groupController.createNewGroup);

router.get('/getGroups',userAuthentication.authenticate,groupController.getGroups);

router.get('/findGroup',groupController.findGroup);

router.post('/addUser',groupController.addUser);

router.get('/getAllMembers',userAuthentication.authenticate,groupController.getAllMembers);

router.post('/removeMember',userAuthentication.authenticate,groupController.removeMember)

router.post('/makeAdmin',userAuthentication.authenticate,groupController.makeAdmin);

router.post('/removeAdmin',userAuthentication.authenticate,groupController.removeAdmin)

module.exports = router