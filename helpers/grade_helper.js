const { check } = require('express-validator');

const grade_helper = {
  gradeValidation: function () {
    var validation = [
      check('firstgov', 'empty').notEmpty(),
      check('firstgov').isNumeric(),
      check('secondgov', 'empty').notEmpty(),
      check('secondgov').isNumeric(),
      check('thirdgov', 'empty').notEmpty(),
      check('thirdgov').isNumeric(),
      check('firstopp', 'empty').notEmpty(),
      check('firstopp').isNumeric(),
      check('secondopp', 'empty').notEmpty(),
      check('secondopp').isNumeric(),
      check('thirdopp', 'empty').notEmpty(),
      check('thirdopp').isNumeric(),
      check('comment', 'empty').notEmpty()
    ];
    return validation;
  }
}

module.exports = grade_helper;
