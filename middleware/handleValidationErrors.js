const { validationResult } = require("express-validator");

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render((req.url).replaceAll("/", ""), 
      {errors: errors.array().map(err => err.msg)},
    );
  }

  next();
}

module.exports = { handleValidationErrors };