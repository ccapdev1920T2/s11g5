const { check, oneOf } = require('express-validator');
const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

const create_helper = {
  createValidation: function () {
    var validation = [
      check('create_teamname', 'empty').notEmpty(),
      check('create_teamname').matches(nameFormat),
      check('create_first', 'empty').notEmpty(),
      oneOf([
        check('create_first').matches(userFormat),
        check('create_first').isEmail(),
      ], 'create_first'),
      check('create_second', 'empty').notEmpty(),
      oneOf([
        check('create_second').matches(userFormat),
        check('create_second').isEmail(),
      ], 'create_second'),
      check('create_third', 'empty').notEmpty(),
      oneOf([
        check('create_third').matches(userFormat),
        check('create_third').isEmail(),
      ], 'create_third')
    ];
    return validation;
  }
}

module.exports = create_helper;
