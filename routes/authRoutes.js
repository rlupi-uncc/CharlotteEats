const express = require('express');
const {signUpHandler, logInHandler} = require('../controllers/authController.js');
const {validateUser} = require('../middleware/userValidators.js');
const router = express.Router();

router.post('/register', validateUser, signUpHandler);
router.post('/login', validateUser, logInHandler);

module.exports = router;