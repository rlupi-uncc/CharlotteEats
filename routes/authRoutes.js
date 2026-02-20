const express = require("express");
const authController = require("../controllers/authController.js");
const { validateUser, validateLogin } = require("../middleware/userValidators.js");

const router = express.Router();

router.post("/register", validateUser, authController.signUpHandler);
router.post("/login", validateLogin, authController.logInHandler);

module.exports = router;