const expressvalidator = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = expressvalidator.validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array().map((err) => err.msg) });
  }
  next();
}

module.exports = {handleValidationErrors};