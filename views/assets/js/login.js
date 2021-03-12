$(document).ready(function () {
  const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

  $('#login_btn').prop('disabled', true);
  $('#username').keyup(function () {
    var username = $('#username').val();
    var password = $('#password').val();
    if(!validator.isEmpty(username)){
      if(!validator.matches(username, userFormat)){
        $('#username').css('border', '1px solid #d66');
        $('#text_message').text('Invalid Username');
        $('#login_btn').prop('disabled', true);
      }else{
        $('#username').css('border', '1px solid #cccccc');
        $('#password').css('border', '1px solid #cccccc');
        $('#text_message').text('');
        if(validator.isEmpty(password))
          $('#login_btn').prop('disabled', true);
        else if(validator.isLength(password, {min:8}))
          $('#login_btn').prop('disabled', false);
      }
    }else{
      $('#username').css('border', '1px solid #cccccc');
      $('#text_message').text('');
      $('#login_btn').prop('disabled', false);
    }
  });

  $('#password').keyup(function () {
    var username = $('#username').val();
    var password = $('#password').val();
    if(!validator.isEmpty(password) && validator.isLength(password, {min:8})){
      if(!validator.isEmpty(username) && validator.matches(username, userFormat)){
        $('#username').css('border', '1px solid #cccccc');
        $('#text_message').text('');
        $('#login_btn').prop('disabled', false);
      }else{
        $('#username').css('border', '1px solid #cccccc');
        $('#text_message').text('');
        $('#login_btn').prop('disabled', false);
      }
    }else{
      $('#login_btn').prop('disabled', true);
    }
  });
});
