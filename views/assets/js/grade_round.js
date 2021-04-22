$(document).ready(function () {
  $('#submit_grades').prop('disabled', true);

  function checkAll(){
    const sentenceFormat = /^[a-zA-Z0-9]([a-zA-Z0-9\s\-\.\!\?\,\']?)+$/;
    var firstgov = $('#firstgov').val();
    var firstgovName = $('#firstgovName').val();
    var secondgov = $('#secondgov').val();
    var secondgovName = $('#secondgovName').val();
    var thirdgov = $('#thirdgov').val();
    var thirdgovName = $('#thirdgovName').val();
    var firstopp = $('#firstopp').val();
    var firstoppName = $('#firstoppName').val();
    var secondopp = $('#secondopp').val();
    var secondoppName = $('#secondoppName').val();
    var thirdopp = $('#thirdopp').val();
    var thirdoppName = $('#thirdoppName').val();
    var comment = $('#comment').val();

    if(!validator.isEmpty(firstgov) && !validator.isEmpty(secondgov) && !validator.isEmpty(thirdgov) && !validator.isEmpty(firstopp) && !validator.isEmpty(secondopp) && !validator.isEmpty(thirdopp) && !validator.isEmpty(comment)){
      if(!validator.isNumeric(firstgov) || validator.contains(firstgov, ".") || ((firstgov > 100 || firstgov < 1) && !validator.equals(firstgovName, 'No User'))){
        $('#firstgov').css('border', '1px solid #d66');
        $('#invalid_firstgov').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        if(!validator.isNumeric(secondgov) || validator.contains(secondgov, ".") || ((secondgov > 100 || secondgov < 1) && !validator.equals(secondgovName, 'No User'))){
          $('#secondgov').css('border', '1px solid #d66');
          $('#invalid_secondgov').text('Invalid Score');
          $('#submit_grades').prop('disabled', true);
        }else{
          if(!validator.isNumeric(thirdgov) || validator.contains(thirdgov, ".") || ((thirdgov > 100 || thirdgov < 1) && !validator.equals(thirdgovName, 'No User'))){
            $('#thirdgov').css('border', '1px solid #d66');
            $('#invalid_thirdgov').text('Invalid Score');
            $('#submit_grades').prop('disabled', true);
          }else{
            if(!validator.isNumeric(firstopp) || validator.contains(firstopp, ".") || ((firstopp > 100 || firstopp < 1) && !validator.equals(firstoppName, 'No User'))){
              $('#firstopp').css('border', '1px solid #d66');
              $('#invalid_firstopp').text('Invalid Score');
              $('#submit_grades').prop('disabled', true);
            }else{
              if(!validator.isNumeric(secondopp) || validator.contains(secondopp, ".") || ((secondopp > 100 || secondopp < 1) && !validator.equals(secondoppName, 'No User'))){
                $('#secondopp').css('border', '1px solid #d66');
                $('#invalid_secondopp').text('Invalid Score');
                $('#submit_grades').prop('disabled', true);
              }else{
                if(!validator.isNumeric(thirdopp) || validator.contains(thirdopp, ".") || ((thirdopp > 100 || thirdopp < 1) && !validator.equals(thirdoppName, 'No User'))){
                  $('#thirdopp').css('border', '1px solid #d66');
                  $('#invalid_thirdopp').text('Invalid Score');
                  $('#submit_grades').prop('disabled', true);
                }else{
                  if(!validator.matches(comment, sentenceFormat)){
                    $('#comment').css('border', '1px solid #d66');
                    $('#invalid_comment').text('Invalid character/s in comment.');
                    $('#submit_grades').prop('disabled', true);
                  }else{
                    $('#firstgov').css('border', '1px solid #cccccc');
                    $('#invalid_firstgov').text('');
                    $('#secondgov').css('border', '1px solid #cccccc');
                    $('#invalid_secondgov').text('');
                    $('#thirdgov').css('border', '1px solid #cccccc');
                    $('#invalid_thirdgov').text('');
                    $('#firstopp').css('border', '1px solid #cccccc');
                    $('#invalid_firstopp').text('');
                    $('#secondopp').css('border', '1px solid #cccccc');
                    $('#invalid_secondopp').text('');
                    $('#thirdopp').css('border', '1px solid #cccccc');
                    $('#invalid_thirdopp').text('');
                    $('#comment').css('border', '1px solid #cccccc');
                    $('#invalid_comment').text('');
                    $('#submit_grades').prop('disabled', false);
                  }
                }
              }
            }
          }
        }
      }
    }else{
      $('#submit_grades').prop('disabled', true);
    }
  }

  $('#firstgov').keyup(function () {
    var firstgov = $('#firstgov').val();
    if(!validator.isEmpty(firstgov)){
      if(!validator.isNumeric(firstgov) || validator.contains(firstgov, ".") || firstgov > 100 || firstgov < 1){
        $('#firstgov').css('border', '1px solid #d66');
        $('#invalid_firstgov').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#firstgov').css('border', '1px solid #cccccc');
        $('#invalid_firstgov').text('');
        $('#invalid_grade_all').text('');
        checkAll();
      }
    }else{
      $('#firstgov').css('border', '1px solid #cccccc');
      $('#invalid_firstgov').text('');
      $('#submit_grades').prop('disabled', true);
    }
  });

  $('#secondgov').keyup(function () {
    var secondgov = $('#secondgov').val();
    if(!validator.isEmpty(secondgov)){
      if(!validator.isNumeric(secondgov) || validator.contains(secondgov, ".") || secondgov > 100 || secondgov < 1){
        $('#secondgov').css('border', '1px solid #d66');
        $('#invalid_secondgov').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#secondgov').css('border', '1px solid #cccccc');
        $('#invalid_secondgov').text('');
        $('#invalid_grade_all').text('');
        checkAll();
      }
    }else{
      $('#secondgov').css('border', '1px solid #cccccc');
      $('#invalid_secondgov').text('');
      $('#submit_grades').prop('disabled', true);
    }
  });

  $('#thirdgov').keyup(function () {
    var thirdgov = $('#thirdgov').val();
    if(!validator.isEmpty(thirdgov)){
      if(!validator.isNumeric(thirdgov) || validator.contains(thirdgov, ".") || thirdgov > 100 || thirdgov < 1){
        $('#thirdgov').css('border', '1px solid #d66');
        $('#invalid_thirdgov').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#thirdgov').css('border', '1px solid #cccccc');
        $('#invalid_thirdgov').text('');
        $('#invalid_grade_all').text('');
        checkAll();
      }
    }else{
      $('#thirdgov').css('border', '1px solid #cccccc');
      $('#invalid_thirdgov').text('');
      $('#submit_grades').prop('disabled', true);
    }
  });

  $('#firstopp').keyup(function () {
    var firstopp = $('#firstopp').val();
    if(!validator.isEmpty(firstopp)){
      if(!validator.isNumeric(firstopp) || validator.contains(firstopp, ".") || firstopp > 100 || firstopp < 1){
        $('#firstopp').css('border', '1px solid #d66');
        $('#invalid_firstopp').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#firstopp').css('border', '1px solid #cccccc');
        $('#invalid_firstopp').text('');
        $('#invalid_grade_all').text('');
        checkAll();
      }
    }else{
      $('#firstopp').css('border', '1px solid #cccccc');
      $('#invalid_firstopp').text('');
      $('#submit_grades').prop('disabled', true);
    }
  });

  $('#secondopp').keyup(function () {
    var secondopp = $('#secondopp').val();
    if(!validator.isEmpty(secondopp)){
      if(!validator.isNumeric(secondopp) || validator.contains(secondopp, ".") || secondopp > 100 || secondopp < 1){
        $('#secondopp').css('border', '1px solid #d66');
        $('#invalid_secondopp').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#secondopp').css('border', '1px solid #cccccc');
        $('#invalid_secondopp').text('');
        $('#invalid_grade_all').text('');
        checkAll();
      }
    }else{
      $('#secondopp').css('border', '1px solid #cccccc');
      $('#invalid_secondopp').text('');
      $('#submit_grades').prop('disabled', true);
    }
  });

  $('#thirdopp').keyup(function () {
    var thirdopp = $('#thirdopp').val();
    if(!validator.isEmpty(thirdopp)){
      if(!validator.isNumeric(thirdopp) || validator.contains(thirdopp, ".") || thirdopp > 100 || thirdopp < 1){
        $('#thirdopp').css('border', '1px solid #d66');
        $('#invalid_thirdopp').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#thirdopp').css('border', '1px solid #cccccc');
        $('#invalid_thirdopp').text('');
        $('#invalid_grade_all').text('');
        checkAll();
      }
    }else{
      $('#thirdopp').css('border', '1px solid #cccccc');
      $('#invalid_thirdopp').text('');
      $('#submit_grades').prop('disabled', true);
    }
  });

  $('#comment').keyup(function () {
    const sentenceFormat = /^[a-zA-Z0-9]([a-zA-Z0-9\s\-\.\!\?\,\']?)+$/;

    var comment = $('#comment').val();
    if(!validator.isEmpty(comment)){
      if(!validator.matches(comment, sentenceFormat)){
        $('#comment').css('border', '1px solid #d66');
        $('#invalid_comment').text('Invalid character/s in comment.');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#comment').css('border', '1px solid #cccccc');
        $('#invalid_comment').text('');
        checkAll();
      }
    }else{
      $('#comment').css('border', '1px solid #cccccc');
      $('#invalid_comment').text('');
      $('#submit_grades').prop('disabled', true);
    }
  });
});
