const { oneOf, body, query } = require('express-validator');
const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

const stats_helper = {
  statsValidation: function () {
    var validation = [
      oneOf([
        body('roundID').notEmpty(),
        query('roundID').notEmpty(),
      ], 'empty'),
      oneOf([
        body('roundID').isAlphanumeric(),
        query('roundID').isAlphanumeric(),
      ], 'format')
    ];
    return validation;
  }
}

module.exports = stats_helper;
