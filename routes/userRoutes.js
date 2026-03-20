const express = require('express');
const {getCurrentUserHandler, updateCurrentUserHandler, deleteCurrentUserHandler} = require('../controllers/userController.js');
const {authenticate} = require('../middleware/authenticate.js');
const {validateUpdateUser} = require('../middleware/userValidators.js');
const router = express.Router();

router.get('/me', authenticate, getCurrentUserHandler);
router.put('/me', authenticate, validateUpdateUser, updateCurrentUserHandler);
router.delete('/me', authenticate, deleteCurrentUserHandler);

module.exports = router;