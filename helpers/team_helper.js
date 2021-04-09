const { oneOf, check, body, query } = require('express-validator');
const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;

const team_helper = {
  teamValidation: function () {
    var validation = [
      query('teamname', 'empty').notEmpty(),
      query('teamname', 'format').matches(nameFormat)
    ];
    return validation;
  },

  teamIDValidation: function () {
    var validation = [
      query('team', 'empty').notEmpty(),
      query('team', 'format').isAlphanumeric()
    ];
    return validation;
  },

  indexValidation: function () {
    var validation = [
      query('index', 'empty').notEmpty(),
      query('index', 'format').isNumeric()
    ];
    return validation;
  },

  editTeamValidation: function () {
    var validation = [
      oneOf([
        check('edit_choose').notEmpty(),
        query('team').notEmpty(),
      ], 'empty'),
      oneOf([
        check('edit_choose').isAlphanumeric(),
        query('team').isAlphanumeric()
      ], 'format'),
    ];
    return validation;
  }
}

module.exports = team_helper;
