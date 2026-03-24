const express = require('express');
const {getCurrentUserHandler, updateCurrentUserHandler, deleteCurrentUserHandler} = require('../controllers/userController.js');
const {requireAuth} = require('../middleware/requireAuth.js');
const {validateUpdateUser} = require('../middleware/userValidators.js');
const router = express.Router();

router.get('/me', requireAuth, getCurrentUserHandler);
router.put('/me', requireAuth, validateUpdateUser, updateCurrentUserHandler);
router.delete('/me', requireAuth, deleteCurrentUserHandler);

module.exports = router;