const { check } = require('express-validator');
const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

const login_helper = {
  loginValidation: function () {
    var validation = [
      check('username', 'empty').notEmpty(),
      check('username').matches(userFormat),
      check('password', 'empty').notEmpty(),
      check('password').isLength({min:8})
    ];
    return validation;
  }
}

module.exports = login_helper;
