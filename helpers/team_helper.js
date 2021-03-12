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

  editTeamValidation: function () {
    var validation = [
      oneOf([
        check('edit_choose').notEmpty(),
        check('current_team').notEmpty(),
        query('teamname').notEmpty(),
      ], 'empty'),
      oneOf([
        check('edit_choose').matches(nameFormat),
        check('current_team').matches(nameFormat),
        query('teamname').matches(nameFormat)
      ], 'format'),
    ];
    return validation;
  }
}

module.exports = team_helper;
