const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

/**
 * Runs after express-validator chains.
 * If there are validation errors, responds with 422 and structured error list.
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));

    return next(
      Object.assign(new AppError("Validation failed.", 422), { errors: messages })
    );
  }

  next();
};

module.exports = { validate };
