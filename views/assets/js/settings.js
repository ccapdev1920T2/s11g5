$(document).ready(function () {
  const emailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
  const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

  $('#user').prop('disabled', true);
  $('#personal').prop('disabled', true);
  $('#change_pass').prop('disabled', true);

  $('#username').keyup(function () {
    var username = $('#username').val();
    var current_user = $('#current_user').val();
    var email = $('#email').val();
    if(!validator.isEmpty(username)){
      if(validator.equals(username, current_user)){
        $('#username').css('border', '1px solid #d66');
        $('#invalid_user').text('Enter a New Username');
        $('#user').prop('disabled', true);
      }else if(!validator.matches(username, userFormat)){
        $('#username').css('border', '1px solid #d66');
        $('#invalid_user').text('Invalid Username');
        $('#user').prop('disabled', true);
      }else{
        $.get('/checkUsername', {username:username}, function (result) {
          if(result.username == username){
            $('#username').css('border', '1px solid #d66');
            $('#invalid_user').text('Username already registered');
            $('#user').prop('disabled', true);
          }else{
            $('#username').css('border', '1px solid #cccccc');
            $('#invalid_user').text('');
            $('#user').prop('disabled', false);
          }
        });
      }
    }else{
      $('#username').css('border', '1px solid #cccccc');
      $('#invalid_user').text('');
      if(!validator.isEmpty(email))
        $('#user').prop('disabled', false);
      else
        $('#user').prop('disabled', true);
    }
  });

  $('#email').keyup(function () {
    var username = $('#username').val();
    var email = $('#email').val();
    var current_email = $('#current_email').val();
    if(!validator.isEmpty(email)){
      if(!validator.isEmail(email)){
        $('#email').css('border', '1px solid #d66');
        $('#invalid_email').text('Invalid Email');
        $('#user').prop('disabled', true);
      }else{
        if(validator.equals(email, current_email)){
          $('#email').css('border', '1px solid #d66');
          $('#invalid_email').text('Enter a New Email');
          $('#user').prop('disabled', true);
        }else{
          $.get('/checkEmail', {email:email}, function (result) {
            if(result.email == email){
              $('#email').css('border', '1px solid #d66');
              $('#invalid_email').text('Email already registered');
              $('#user').prop('disabled', true);
            }else{
              $('#email').css('border', '1px solid #cccccc');
              $('#invalid_email').text('');
              $('#user').prop('disabled', false);
            }
          });
        }
      }
    }else{
      $('#email').css('border', '1px solid #cccccc');
      $('#invalid_email').text('');
      if(!validator.isEmpty(username))
        $('#user').prop('disabled', false);
      else
        $('#user').prop('disabled', true);
    }
  });

  $('#first_name').keyup(function () {
    var current_first = $('#current_first').val();
    var first = $('#first_name').val();
    var last = $('#last_name').val();
    var level = $('#level').val();
    if(!validator.isEmpty(first)){
      if(validator.equals(first, current_first)){
        $('#first_name').css('border', '1px solid #d66');
        $('#invalid_first').text('Enter a New First Name');
        $('#personal').prop('disabled', true);
      }else if(!validator.matches(first, nameFormat)){
        $('#first_name').css('border', '1px solid #d66');
        $('#invalid_first').text('Invalid First Name');
        $('#personal').prop('disabled', true);
      }else{
        $('#first_name').css('border', '1px solid #cccccc');
        $('#invalid_first').text('');
        $('#personal').prop('disabled', false);
      }
    }else{
      $('#first_name').css('border', '1px solid #cccccc');
      $('#invalid_first').text('');
      if(!validator.isEmpty(last) || !validator.isEmpty(level))
        $('#personal').prop('disabled', false);
      else
        $('#personal').prop('disabled', true);
    }
  });

  $('#last_name').keyup(function () {
    var current_last = $('#current_last').val();
    var first = $('#first_name').val();
    var last = $('#last_name').val();
    var level = $('#level').val();
    if(!validator.isEmpty(last)){
      if(validator.equals(last, current_last)){
        $('#last_name').css('border', '1px solid #d66');
        $('#invalid_last').text('Enter a New Last Name');
        $('#personal').prop('disabled', true);
      }else if(!validator.matches(last, nameFormat)){
        $('#last_name').css('border', '1px solid #d66');
        $('#invalid_last').text('Invalid Last Name');
        $('#personal').prop('disabled', true);
      }else{
        $('#last_name').css('border', '1px solid #cccccc');
        $('#invalid_last').text('');
        $('#personal').prop('disabled', false);
      }
    }else{
      $('#last_name').css('border', '1px solid #cccccc');
      $('#invalid_last').text('');
      if(!validator.isEmpty(first) || !validator.isEmpty(level))
        $('#personal').prop('disabled', false);
      else
        $('#personal').prop('disabled', true);
    }
  });

  $('#level').change(function () {
    var current_level = $('#current_level').val();
    var first = $('#first_name').val();
    var last = $('#last_name').val();
    var level = $('#level').val();
    console.log(current_level);
    console.log(level);
    if(!validator.isEmpty(level)){
      if(validator.equals(level, current_level)){
        $('#level').css('border', '1px solid #d66');
        $('#invalid_level').text('Enter a New Debate Level');
        $('#personal').prop('disabled', true);
      }else if(!validator.isAlpha(level)){
        $('#level').css('border', '1px solid #d66');
        $('#invalid_level').text('Invalid Debate Level');
        $('#personal').prop('disabled', true);
      }else{
        $('#level').css('border', '1px solid #cccccc');
        $('#invalid_level').text('');
        $('#personal').prop('disabled', false);
      }
    }else{
      $('#level').css('border', '1px solid #cccccc');
      $('#invalid_level').text('');
      if(!validator.isEmpty(first) || !validator.isEmpty(last))
        $('#personal').prop('disabled', false);
      else
        $('#personal').prop('disabled', true);
    }
  });

  $('#current_pass').keyup(function () {
    var current = $('#current_pass').val();
    var password = $('#password').val();
    var confirm = $('#confirm_pass').val();
    if(!validator.isEmpty(current)){
      if(!validator.isLength(current,{min:8})){
        $('#current_pass').css('border', '1px solid #cccccc');
        $('#password').css('border', '1px solid #cccccc');
        $('#confirm_pass').css('border', '1px solid #cccccc');
        $('#invalid_pass').text('');
        $('#change_pass').prop('disabled', true);
      }else{
        $('#current_pass').css('border', '1px solid #cccccc');
        $('#password').css('border', '1px solid #cccccc');
        $('#confirm_pass').css('border', '1px solid #cccccc');
        $('#invalid_pass').text('');
        if(!validator.isEmpty(password) && !validator.isEmpty(confirm) && (validator.isLength(password,{min:8}) && validator.isLength(confirm,{min:8}))){
          if(validator.equals(password, confirm) && validator.equals(password, current)){
            $('#current_pass').css('border', '1px solid #d66');
            $('#password').css('border', '1px solid #d66');
            $('#confirm_pass').css('border', '1px solid #d66');
            $('#invalid_pass').text('Enter a New Password');
            $('#change_pass').prop('disabled', true);
          }else if(validator.equals(password, confirm)){
            $('#current_pass').css('border', '1px solid #cccccc');
            $('#password').css('border', '1px solid #cccccc');
            $('#confirm_pass').css('border', '1px solid #cccccc');
            $('#invalid_pass').text('');
            $('#change_pass').prop('disabled', false);
          }else{
            $('#current_pass').css('border', '1px solid #cccccc');
            $('#password').css('border', '1px solid #d66');
            $('#confirm_pass').css('border', '1px solid #d66');
            $('#invalid_pass').text('Passwords do not match');
            $('#change_pass').prop('disabled', true);
          }
        }else{
          $('#current_pass').css('border', '1px solid #cccccc');
          $('#password').css('border', '1px solid #cccccc');
          $('#confirm_pass').css('border', '1px solid #cccccc');
          $('#invalid_pass').text('');
          $('#change_pass').prop('disabled', true);
        }
      }
    }else{
      $('#current_pass').css('border', '1px solid #cccccc');
      $('#password').css('border', '1px solid #cccccc');
      $('#confirm_pass').css('border', '1px solid #cccccc');
      $('#invalid_pass').text('');
      $('#change_pass').prop('disabled', true);
    }
  });

  $('#password').keyup(function () {
    var current = $('#current_pass').val();
    var password = $('#password').val();
    var confirm = $('#confirm_pass').val();
    if(!validator.isEmpty(password)){
      if(!validator.isLength(password,{min:8})){
        $('#current_pass').css('border', '1px solid #cccccc');
        $('#password').css('border', '1px solid #d66');
        $('#confirm_pass').css('border', '1px solid #d66');
        $('#invalid_pass').text('Password needs to be 8 characters or more');
        $('#change_pass').prop('disabled', true);
      }else{
        $('#current_pass').css('border', '1px solid #cccccc');
        $('#password').css('border', '1px solid #cccccc');
        $('#confirm_pass').css('border', '1px solid #cccccc');
        $('#invalid_pass').text('');
        if(!validator.isEmpty(confirm) && validator.equals(password, confirm)){
          if(!validator.isEmpty(current) && validator.equals(password, current)){
            $('#current_pass').css('border', '1px solid #d66');
            $('#password').css('border', '1px solid #d66');
            $('#confirm_pass').css('border', '1px solid #d66');
            $('#invalid_pass').text('Enter a New Password');
            $('#change_pass').prop('disabled', true);
          }
        }else{
          $('#change_pass').prop('disabled', true);
        }
      }
    }else{
      $('#current_pass').css('border', '1px solid #cccccc');
      $('#password').css('border', '1px solid #cccccc');
      $('#confirm_pass').css('border', '1px solid #cccccc');
      $('#invalid_pass').text('');
      $('#change_pass').prop('disabled', true);
    }
  });

  $('#confirm_pass').keyup(function () {
    var current = $('#current_pass').val();
    var password = $('#password').val();
    var confirm = $('#confirm_pass').val();
    if(!validator.isEmpty(password) && !validator.isEmpty(confirm) && !validator.isEmpty(current)){
      if(!validator.isLength(confirm,{min:8})){
        $('#current_pass').css('border', '1px solid #cccccc');
        $('#password').css('border', '1px solid #d66');
        $('#confirm_pass').css('border', '1px solid #d66');
        $('#invalid_pass').text('Password needs to be 8 characters or more');
        $('#change_pass').prop('disabled', true);
      }else if(validator.equals(password, confirm) && validator.equals(password, current)){
        $('#current_pass').css('border', '1px solid #d66');
        $('#password').css('border', '1px solid #d66');
        $('#confirm_pass').css('border', '1px solid #d66');
        $('#invalid_pass').text('Enter a New Password');
        $('#change_pass').prop('disabled', true);
      }else if(validator.equals(password, confirm)){
        $('#current_pass').css('border', '1px solid #cccccc');
        $('#password').css('border', '1px solid #cccccc');
        $('#confirm_pass').css('border', '1px solid #cccccc');
        $('#invalid_pass').text('');
        $('#change_pass').prop('disabled', false);
      }else{
        $('#current_pass').css('border', '1px solid #cccccc');
        $('#password').css('border', '1px solid #d66');
        $('#confirm_pass').css('border', '1px solid #d66');
        $('#invalid_pass').text('Passwords do not match');
        $('#change_pass').prop('disabled', true);
      }
    }else if((!validator.isEmpty(password) && validator.isEmpty(confirm)) || (validator.isEmpty(password) && !validator.isEmpty(confirm))){
      $('#current_pass').css('border', '1px solid #cccccc');
      $('#password').css('border', '1px solid #d66');
      $('#confirm_pass').css('border', '1px solid #d66');
      $('#invalid_pass').text('Passwords do not match');
      $('#change_pass').prop('disabled', true);
    }else if(validator.isEmpty(current) && (!validator.isEmpty(password) || !validator.isEmpty(confirm))){
      $('#current_pass').css('border', '1px solid #d66');
      $('#invalid_pass').text('Enter Current Password');
      $('#change_pass').prop('disabled', true);
    }else{
      $('#current_pass').css('border', '1px solid #cccccc');
      $('#password').css('border', '1px solid #cccccc');
      $('#confirm_pass').css('border', '1px solid #cccccc');
      $('#invalid_pass').text('');
      $('#change_pass').prop('disabled', true);
    }
  });
});
