const { check, query } = require('express-validator');
const sentenceFormat = /^[a-zA-Z0-9]([a-zA-Z0-9\s\-\.\!\?\,\']?)+$/;

const grade_helper = {
  gradeValidation: function () {
    var validation = [
      query('roundID', 'empty').notEmpty(),
      query('roundID').isAlphanumeric(),
      check('firstgov', 'empty').notEmpty(),
      check('firstgov', 'numeric').isNumeric(),
      check('firstgov', 'float').contains("."),
      check('secondgov', 'empty').notEmpty(),
      check('secondgov', 'numeric').isNumeric(),
      check('secondgov', 'float').contains("."),
      check('thirdgov', 'empty').notEmpty(),
      check('thirdgov', 'numeric').isNumeric(),
      check('thirdgov', 'float').contains("."),
      check('firstopp', 'empty').notEmpty(),
      check('firstopp', 'numeric').isNumeric(),
      check('firstopp', 'float').contains("."),
      check('secondopp', 'empty').notEmpty(),
      check('secondopp', 'numeric').isNumeric(),
      check('secondopp', 'float').contains("."),
      check('thirdopp', 'empty').notEmpty(),
      check('thirdopp', 'numeric').isNumeric(),
      check('thirdopp', 'float').contains("."),
      check('comment', 'empty').notEmpty(),
      check('comment').matches(sentenceFormat)
    ];
    return validation;
  }
}

module.exports = grade_helper;
