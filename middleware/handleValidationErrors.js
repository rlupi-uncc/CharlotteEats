const { validationResult } = require("express-validator");

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    //Captures the source of the request
    origin = (((req.originalUrl).replaceAll("/", " ")).split(" "))[1];
    
    //For testing, remove on final release
    console.log(origin);
    
    //Reroutes auth requests back to the login page
    if(origin==="auth"){
      page = "login";
    }

    //If user related, reroutes user back to userprofile
    if(origin==="user"){
      page = "userProfileEdit";
    }

    //Sends the user back to the page they sent the request from (if it works) with the validation errors attached for use in error messages
    return res.status(400).render(page, { errors: errors.array().map(err => " "+err.msg) },);
  }

  next();
}

module.exports = { handleValidationErrors };