const authService = require("../services/authService.js");

async function signUpHandler(req, res) {
    const {email, password} = req.body;
    const newUser = await authService.signUp(email, password);
    res.status(201).json({message: `New user created with an id of ${newUser.id}`});
}

async function logInHandler(req, res){
    const {email, password} = req.body;
    const accessToken = await authService.logIn(email, password);
    res.status(200).json({accessToken});
}

module.exports = {signUpHandler, logInHandler};