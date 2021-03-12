const { check, oneOf } = require('express-validator');
const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

const edit_helper = {
  editValidation: function () {
    var validation = [
      check('edit_teamname', 'empty').notEmpty(),
      check('edit_teamname', 'edit_teamname').matches(nameFormat),
      check('edit_first', 'empty').notEmpty(),
      oneOf([
        check('edit_first').matches(userFormat),
        check('edit_first').isEmail(),
      ], 'edit_first'),
      check('edit_second', 'empty').notEmpty(),
      oneOf([
        check('edit_second').matches(userFormat),
        check('edit_second').isEmail(),
      ], 'edit_second'),
      check('edit_third', 'empty').notEmpty(),
      oneOf([
        check('edit_third').matches(userFormat),
        check('edit_third').isEmail(),
      ], 'edit_third'),
      check('edit_current', 'empty').notEmpty(),
      check('edit_current', 'edit_current').matches(nameFormat),
    ];
    return validation;
  }
}

module.exports = edit_helper;
