const express = require('express');
const userController = require('../controllers/userController.js');
const authenticate = require('../middleware/authenticate.js');
const userValidators = require('../middleware/userValidators.js');
const router = express.Router();

router.get('/me', authenticate.authenticate, userController.getCurrentUserHandler);
router.put('/me', authenticate.authenticate, userValidators.validateUpdateUser, userController.updateCurrentUserHandler);
router.delete('/me', authenticate.authenticate, userController.deleteCurrentUserHandler);

module.exports = (router);