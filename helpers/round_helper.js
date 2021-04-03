const { check, query, oneOf } = require('express-validator');
const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
const userFormat = /[a-zA-Z0-9\-\_\.]+$/;
const sentenceFormat = /^[a-zA-Z0-9]([a-zA-Z0-9\s\-\.\!\?\,\']?)+$/;

const round_helper = {
  roundIDValidation: function () {
    var validation = [
      oneOf([
        check('roundID').notEmpty(),
        query('roundID').notEmpty()
      ], 'empty'),
      oneOf([
        check('roundID').isAlphanumeric(),
        query('roundID').isAlphanumeric()
      ], 'format'),
    ];
    return validation;
  },

  createRoundValidation: function () {
    var validation = [
      query('roundID', 'empty').notEmpty(),
      query('roundID', 'format').isAlphanumeric(),
      query('status', 'empty').notEmpty(),
      query('status', 'format').isAlpha(),
      check('user_role', 'empty').notEmpty(),
      check('motion', 'empty').notEmpty(),
      check('motion').matches(sentenceFormat),
      check('gov', 'empty').notEmpty(),
      check('gov', 'format').matches(nameFormat),
      check('opp', 'empty').notEmpty(),
      check('opp', 'format').matches(nameFormat)
    ];
    return validation;
  },

  adjValidation: function () {
    var validation = [
      query('roundID', 'empty').notEmpty(),
      query('roundID', 'format').isAlphanumeric(),
      query('status', 'empty').notEmpty(),
      query('status', 'format').isAlpha(),
      check('ad', 'empty').notEmpty(),
      check('ad', 'format').matches(userFormat)
    ];
    return validation;
  }
}

module.exports = round_helper;
