const { check } = require('express-validator');
const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

const settings_helper = {
  userValidation: function () {
    var validation = [
      check('username', 'empty').notEmpty(),
      check('username').matches(userFormat),
      check('email', 'empty').notEmpty(),
      check('email').isEmail()
    ];
    return validation;
  },

  personalValidation: function () {
    var validation = [
      check('first_name', 'empty').notEmpty(),
      check('first_name').matches(nameFormat),
      check('last_name', 'empty').notEmpty(),
      check('last_name').matches(nameFormat),
      check('institution', 'empty').notEmpty(),
      check('institution').matches(nameFormat)
    ];
    return validation;
  },

  passValidation: function () {
    var validation = [
      check('current_pass', 'empty').notEmpty(),
      check('current_pass').isLength({min:8}),
      check('password', 'empty').notEmpty(),
      check('password').isLength({min:8}),
      check('confirm_pass', 'empty').notEmpty(),
      check('confirm_pass').isLength({min:8})
    ];
    return validation;
  }
}

module.exports = settings_helper;
