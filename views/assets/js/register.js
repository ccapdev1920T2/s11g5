function checkAll(){
  var first = $('#first_name').val();
  var last = $('#last_name').val()
  var institution = $('#institution').val();
  var username = $('#username').val();
  var email = $('#email').val();
  var password = $('#password').val();
  var confirm = $('#confirm_pass').val();
  return (!validator.isEmpty(first) && !validator.isEmpty(last) && !validator.isEmpty(institution) && !validator.isEmpty(username) && !validator.isEmpty(email) && !validator.isEmpty(password) && !validator.isEmpty(confirm))
}

$(document).ready(function () {
  const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
  const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

  $('#submit').prop('disabled', true);
  $('#first_name').keyup(function () {
    var first = $('#first_name').val();
    if(!validator.isEmpty(first)){
      if(!validator.matches(first, nameFormat)){
        $('#first_name').css('border', '1px solid #d66');
        $('#invalid_first').text('Invalid First Name');
        $('#submit').prop('disabled', true);
      }else{
        $('#first_name').css('border', '1px solid #cccccc');
        $('#invalid_first').text('');
        $('#invalid_all').text('');
        if(checkAll() == true){
          $('#submit').prop('disabled', false);
        }else{
          $('#submit').prop('disabled', true);
        }
      }
    }else{
      $('#first_name').css('border', '1px solid #cccccc');
      $('#invalid_first').text('');
      $('#submit').prop('disabled', true);
    }
  });

  $('#last_name').keyup(function () {
    var last = $('#last_name').val();
    if(!validator.isEmpty(last)){
      if(!validator.matches(last, nameFormat)){
        $('#last_name').css('border', '1px solid #d66');
        $('#invalid_last').text('Invalid Last Name');
        $('#submit').prop('disabled', true);
      }else{
        $('#last_name').css('border', '1px solid #cccccc');
        $('#invalid_last').text('');
        $('#invalid_all').text('');
        if(checkAll() == true){
          $('#submit').prop('disabled', false);
        }else{
          $('#submit').prop('disabled', true);
        }
      }
    }else{
      $('#last_name').css('border', '1px solid #cccccc');
      $('#invalid_last').text('');
      $('#submit').prop('disabled', true);
    }
  });

  $('#institution').keyup(function () {
    var institution = $('#institution').val();
    if(!validator.isEmpty(institution)){
      if(!validator.matches(institution, nameFormat)){
        $('#institution').css('border', '1px solid #d66');
        $('#invalid_insti').text('Invalid Institution');
        $('#submit').prop('disabled', true);
      }else{
        $('#institution').css('border', '1px solid #cccccc');
        $('#invalid_insti').text('');
        $('#invalid_all').text('');
        if(checkAll() == true){
          $('#submit').prop('disabled', false);
        }else{
          $('#submit').prop('disabled', true);
        }
      }
    }else{
      $('#institution').css('border', '1px solid #cccccc');
      $('#invalid_insti').text('');
      $('#submit').prop('disabled', true);
    }
  });

  $('#username').keyup(function () {
    var username = $('#username').val();
    if(!validator.isEmpty(username)){
      if(!validator.matches(username, userFormat)){
        $('#username').css('border', '1px solid #d66');
        $('#invalid_user').text('Invalid Username');
        $('#submit').prop('disabled', true);
      }else{
        $.get('/checkUsername', {username:username}, function (result) {
          if(result.username == username){
            $('#username').css('border', '1px solid #d66');
            $('#invalid_user').text('Username already registered');
            $('#submit').prop('disabled', true);
          }else{
            $('#username').css('border', '1px solid #cccccc');
            $('#invalid_user').text('');
            $('#invalid_all').text('');
            if(checkAll() == true){
              $('#submit').prop('disabled', false);
            }else{
              $('#submit').prop('disabled', true);
            }
          }
        });
      }
    }else{
      $('#username').css('border', '1px solid #cccccc');
      $('#invalid_user').text('');
      $('#submit').prop('disabled', true);
    }
  });

  $('#email').keyup(function () {
    var email = $('#email').val();
    if(!validator.isEmpty(email)){
      if(!validator.isEmail(email)){
        $('#email').css('border', '1px solid #d66');
        $('#invalid_email').text('Invalid Email');
        $('#submit').prop('disabled', true);
      }else{
        $.get('/checkEmail', {email:email}, function (result) {
          if(result.email == email){
            $('#email').css('border', '1px solid #d66');
            $('#invalid_email').text('Email already registered');
            $('#submit').prop('disabled', true);
          }else{
            $('#email').css('border', '1px solid #cccccc');
            $('#invalid_email').text('');
            $('#invalid_all').text('');
            if(checkAll() == true){
              $('#submit').prop('disabled', false);
            }else{
              $('#submit').prop('disabled', true);
            }
          }
        });
      }
    }else{
      $('#email').css('border', '1px solid #cccccc');
      $('#invalid_email').text('');
      $('#submit').prop('disabled', true);
    }
  });

  $('#password').keyup(function () {
    var password = $('#password').val();
    var confirm = $('#confirm_pass').val();
    if(!validator.isLength(password,{min:8})){
      $('#password').css('border', '1px solid #d66');
      $('#confirm_pass').css('border', '1px solid #d66');
      $('#invalid_pass').text('Password needs to be 8 characters or more');
      $('#submit').prop('disabled', true);
    }else if(!validator.isEmpty(confirm)){
      if(validator.equals(confirm, password)){
        $('#password').css('border', '1px solid #cccccc');
        $('#confirm_pass').css('border', '1px solid #cccccc');
        $('#invalid_pass').text('');
        $('#invalid_all').text('');
        if(checkAll() == true){
          $('#submit').prop('disabled', false);
        }else{
          $('#submit').prop('disabled', true);
        }
      }else{
        $('#password').css('border', '1px solid #d66');
        $('#confirm_pass').css('border', '1px solid #d66');
        $('#invalid_pass').text('Passwords do not match');
        $('#submit').prop('disabled', true);
      }
    }else{
      $('#password').css('border', '1px solid #cccccc');
      $('#confirm_pass').css('border', '1px solid #cccccc');
      $('#invalid_pass').text('');
      $('#submit').prop('disabled', true);
    }
  });

  $('#confirm_pass').keyup(function () {
    var password = $('#password').val();
    var confirm = $('#confirm_pass').val();
    if(!validator.isLength(password,{min:8})){
      $('#password').css('border', '1px solid #d66');
      $('#confirm_pass').css('border', '1px solid #d66');
      $('#invalid_pass').text('Password needs to be 8 characters or more');
      $('#submit').prop('disabled', true);
    }else if(validator.equals(confirm, password)){
      $('#password').css('border', '1px solid #cccccc');
      $('#confirm_pass').css('border', '1px solid #cccccc');
      $('#invalid_pass').text('');
      $('#invalid_all').text('');
      if(checkAll() == true){
        $('#submit').prop('disabled', false);
      }else{
        $('#submit').prop('disabled', true);
      }
    }else{
      $('#password').css('border', '1px solid #d66');
      $('#confirm_pass').css('border', '1px solid #d66');
      $('#invalid_pass').text('Passwords do not match');
      $('#submit').prop('disabled', true);
    }
  });
});
