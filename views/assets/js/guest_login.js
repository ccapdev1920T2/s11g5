$(document).ready(function () {
  const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
  const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

  $('#guest_email').keyup(function () {
    var email = $('#guest_email').val();
    if(!validator.isEmpty(email)){
      if(!validator.isEmail(email)){
        $('#guest_email').css('border', '1px solid #d66');
        $('#invalid_guest').text('Invalid Email');
        $('#login_guest').prop('disabled', true);
      }else{
        $.get('/checkEmail', {email:email}, function (result) {
          if(result.email == email){
            $('#guest_email').css('border', '1px solid #d66');
            $('#invalid_guest').text('Email already registered');
            $('#login_guest').prop('disabled', true);
          }else{
            $('#guest_email').css('border', '1px solid #cccccc');
            $('#invalid_guest').text('');
            $('#login_guest').prop('disabled', false);
          }
        });
      }
    }else{
      $('#guest_email').css('border', '1px solid #cccccc');
      $('#invalid_guest').text('');
      $('#login_guest').prop('disabled', false);
    }
  });

  $('#firstname').keyup(function () {
    var first = $('#firstname').val();
    if(!validator.isEmpty(first)){
      if(!validator.matches(first, nameFormat)){
        $('#firstname').css('border', '1px solid #d66');
        $('#invalid_first').text('Invalid First Name');
        $('#submit').prop('disabled', true);
      }else{
        $('#firstname').css('border', '1px solid #cccccc');
        $('#invalid_first').text('');
        $('#submit').prop('disabled', false);
      }
    }else{
      $('#firstname').css('border', '1px solid #cccccc');
      $('#invalid_first').text('');
      $('#submit').prop('disabled', false);
    }
  });

  $('#lastname').keyup(function () {
    var last = $('#lastname').val();
    if(!validator.isEmpty(last)){
      if(!validator.matches(last, nameFormat)){
        $('#lastname').css('border', '1px solid #d66');
        $('#invalid_last').text('Invalid Last Name');
        $('#submit').prop('disabled', true);
      }else{
        $('#lastname').css('border', '1px solid #cccccc');
        $('#invalid_last').text('');
        $('#submit').prop('disabled', false);
      }
    }else{
      $('#lastname').css('border', '1px solid #cccccc');
      $('#invalid_last').text('');
      $('#submit').prop('disabled', false);
    }
  });

  $('#level').keyup(function () {
    var level = $('#level').val();
    if(!validator.isEmpty(level)){
      if(!validator.matches(level, nameFormat)){
        $('#level').css('border', '1px solid #d66');
        $('#invalid_level').text('Invalid Institution');
        $('#submit').prop('disabled', true);
      }else{
        $('#level').css('border', '1px solid #cccccc');
        $('#invalid_level').text('');
        $('#submit').prop('disabled', false);
      }
    }else{
      $('#level').css('border', '1px solid #cccccc');
      $('#invalid_level').text('');
      $('#submit').prop('disabled', false);
    }
  });
});
