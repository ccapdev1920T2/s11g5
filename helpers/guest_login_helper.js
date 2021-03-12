const { check } = require('express-validator');
const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

const guest_login_helper = {
  guestLoginValidation: function () {
    var validation = [
      check('guest_email', 'empty').notEmpty(),
      check('guest_email').isEmail()
    ];
    return validation;
  },

  guestNameValidation: function () {
    var validation = [
      check('firstname', 'empty').notEmpty(),
      check('firstname').matches(nameFormat),
      check('lastname', 'empty').notEmpty(),
      check('lastname').matches(nameFormat),
      check('institution', 'empty').notEmpty(),
      check('institution').matches(nameFormat)
    ];
    return validation;
  }
}

module.exports = guest_login_helper;
