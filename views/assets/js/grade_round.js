function checkAll(){
  var firstgov = $('#firstgov').val();
  var secondgov = $('#secondgov').val();
  var thirdgov = $('#thirdgov').val();
  var firstopp = $('#firstopp').val();
  var secondopp = $('#secondopp').val();
  var thirdopp = $('#thirdopp').val();
  var comment = $('#comment').val();
  return (!validator.isEmpty(firstgov) && !validator.isEmpty(secondgov) && !validator.isEmpty(thirdgov) && !validator.isEmpty(firstopp) && !validator.isEmpty(secondopp) && !validator.isEmpty(thirdopp) && !validator.isEmpty(comment))
}

$(document).ready(function () {
  $('#submit_grades').prop('disabled', true);
  $('#firstgov').keyup(function () {
    var firstgov = $('#firstgov').val();
    if(!validator.isEmpty(firstgov)){
      if(!validator.isNumeric(firstgov) || firstgov > 100 || firstgov < 1){
        $('#firstgov').css('border', '1px solid #d66');
        $('#invalid_firstgov').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#firstgov').css('border', '1px solid #cccccc');
        $('#invalid_firstgov').text('');
        $('#invalid_grade_all').text('');
        if(checkAll())
          $('#submit_grades').prop('disabled', false);
        else
          $('#submit_grades').prop('disabled', true);
      }
    }else{
      $('#firstgov').css('border', '1px solid #cccccc');
      $('#invalid_firstgov').text('');
      $('#submit_grades').prop('disabled', false);
    }
  });

  $('#secondgov').keyup(function () {
    var secondgov = $('#secondgov').val();
    if(!validator.isEmpty(secondgov)){
      if(!validator.isNumeric(secondgov) || secondgov > 100 || secondgov < 1){
        $('#secondgov').css('border', '1px solid #d66');
        $('#invalid_secondgov').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#secondgov').css('border', '1px solid #cccccc');
        $('#invalid_secondgov').text('');
        $('#invalid_grade_all').text('');
        if(checkAll())
          $('#submit_grades').prop('disabled', false);
        else
          $('#submit_grades').prop('disabled', true);
      }
    }else{
      $('#secondgov').css('border', '1px solid #cccccc');
      $('#invalid_secondgov').text('');
      $('#submit_grades').prop('disabled', false);
    }
  });

  $('#thirdgov').keyup(function () {
    var thirdgov = $('#thirdgov').val();
    if(!validator.isEmpty(thirdgov)){
      if(!validator.isNumeric(thirdgov) || thirdgov > 100 || thirdgov < 1){
        $('#thirdgov').css('border', '1px solid #d66');
        $('#invalid_thirdgov').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#thirdgov').css('border', '1px solid #cccccc');
        $('#invalid_thirdgov').text('');
        $('#invalid_grade_all').text('');
        if(checkAll())
          $('#submit_grades').prop('disabled', false);
        else
          $('#submit_grades').prop('disabled', true);
      }
    }else{
      $('#thirdgov').css('border', '1px solid #cccccc');
      $('#invalid_thirdgov').text('');
      $('#submit_grades').prop('disabled', false);
    }
  });

  $('#firstopp').keyup(function () {
    var firstopp = $('#firstopp').val();
    if(!validator.isEmpty(firstopp)){
      if(!validator.isNumeric(firstopp) || firstopp > 100 || firstopp < 1){
        $('#firstopp').css('border', '1px solid #d66');
        $('#invalid_firstopp').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#firstopp').css('border', '1px solid #cccccc');
        $('#invalid_firstopp').text('');
        $('#invalid_grade_all').text('');
        if(checkAll())
          $('#submit_grades').prop('disabled', false);
        else
          $('#submit_grades').prop('disabled', true);
      }
    }else{
      $('#firstopp').css('border', '1px solid #cccccc');
      $('#invalid_firstopp').text('');
      $('#submit_grades').prop('disabled', false);
    }
  });

  $('#secondopp').keyup(function () {
    var secondopp = $('#secondopp').val();
    if(!validator.isEmpty(secondopp)){
      if(!validator.isNumeric(secondopp) || secondopp > 100 || secondopp < 1){
        $('#secondopp').css('border', '1px solid #d66');
        $('#invalid_secondopp').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#secondopp').css('border', '1px solid #cccccc');
        $('#invalid_secondopp').text('');
        $('#invalid_grade_all').text('');
        if(checkAll())
          $('#submit_grades').prop('disabled', false);
        else
          $('#submit_grades').prop('disabled', true);
      }
    }else{
      $('#secondopp').css('border', '1px solid #cccccc');
      $('#invalid_secondopp').text('');
      $('#submit_grades').prop('disabled', false);
    }
  });

  $('#thirdopp').keyup(function () {
    var thirdopp = $('#thirdopp').val();
    if(!validator.isEmpty(thirdopp)){
      if(!validator.isNumeric(thirdopp) || thirdopp > 100 || thirdopp < 1){
        $('#thirdopp').css('border', '1px solid #d66');
        $('#invalid_thirdopp').text('Invalid Score');
        $('#submit_grades').prop('disabled', true);
      }else{
        $('#thirdopp').css('border', '1px solid #cccccc');
        $('#invalid_thirdopp').text('');
        $('#invalid_grade_all').text('');
        if(checkAll())
          $('#submit_grades').prop('disabled', false);
        else
          $('#submit_grades').prop('disabled', true);
      }
    }else{
      $('#thirdopp').css('border', '1px solid #cccccc');
      $('#invalid_thirdopp').text('');
      $('#submit_grades').prop('disabled', false);
    }
  });

  $('#comment').keyup(function () {
    var thirdopp = $('#comment').val();
    if(!validator.isEmpty(comment)){
      $('#comment').css('border', '1px solid #cccccc');
      $('#invalid_comment').text('');
      $('#invalid_grade_all').text('');
      if(checkAll())
        $('#submit_grades').prop('disabled', false);
      else
        $('#submit_grades').prop('disabled', true);
    }else{
      $('#comment').css('border', '1px solid #cccccc');
      $('#invalid_comment').text('');
      $('#submit_grades').prop('disabled', false);
    }
  });
});
