const express = require('express');
const authController = require('../controllers/authController.js');
const userValidators = require('../middleware/userValidators.js');
const router = express.Router();

router.post('/register', userValidators.validateUser, authController.signUpHandler);
router.post('/login', userValidators.validateUser, authController.logInHandler);

module.exports(router);