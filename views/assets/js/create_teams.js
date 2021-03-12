$(document).ready(function () {
  const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
  const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

  function resetEverything(){
    $('#create_teamname').css('border', '1px solid #cccccc');
    $('#create_first').css('border', '1px solid #cccccc');
    $('#create_second').css('border', '1px solid #cccccc');
    $('#create_third').css('border', '1px solid #cccccc');
    $('#invalid_createTeam').text('');
    $('#invalid_createFirst').text('');
    $('#invalid_createSecond').text('');
    $('#invalid_createThird').text('');
    $('#invalid_createAll').text('');
  }

  function checkEverything(){
    var teamname = $('#create_teamname').val();
    var first = $('#create_first').val();
    var second = $('#create_second').val();
    var third = $('#create_third').val();
    var current = $('#current_user').val();
    if(!validator.isEmpty(teamname) && !validator.isEmpty(first) && !validator.isEmpty(second) && !validator.isEmpty(third)){
      if(current == first || current == second || current == third){
        if(first != second && first != third && second != third){
          $.get('/checkTeam', {first:first, second:second, third:third}, function(result){
            if(!validator.isEmpty(result)){
              $('#create_first').css('border', '1px solid #d66');
              $('#create_second').css('border', '1px solid #d66');
              $('#create_third').css('border', '1px solid #d66');
              $('#invalid_createAll').text('Team Already Exists');
              return false;
            }else{
              resetEverything();
              $('#create').prop('disabled', false);
              return true;
            }
          });
        }else{
          $('#create_first').css('border', '1px solid #d66');
          $('#create_second').css('border', '1px solid #d66');
          $('#create_third').css('border', '1px solid #d66');
          $('#invalid_createAll').text('Users cannot have more than one role');
          return false;
        }
      }else{
        $('#create_first').css('border', '1px solid #d66');
        $('#create_second').css('border', '1px solid #d66');
        $('#create_third').css('border', '1px solid #d66');
        $('#invalid_createAll').text('Team Creator needs to be in the team');
        return false;
      }
    }else{
      return false;
    }
  }

  $('#create').prop('disabled', true);
  $('#create_teamname').keyup(function () {
    var teamname = $('#create_teamname').val();
    if(!validator.isEmpty(teamname)){
      if(!validator.matches(teamname, nameFormat)){
        $('#create_teamname').css('border', '1px solid #d66');
        $('#invalid_createTeam').text('Invalid Team Name');
        $('#create').prop('disabled', true);
      }else{
        $.get('/checkName', {teamname:teamname}, function(result){
          if(result.teamname == teamname){
            $('#create_teamname').css('border', '1px solid #d66');
            $('#invalid_createTeam').text('Team Name is Already Taken');
            $('#create').prop('disabled', true);
          }else{
            if(!checkEverything()){
              $('#create').prop('disabled', true);
            }else{
              resetEverything();
              $('#create').prop('disabled', false);
            }
          }
        });
      }
    }else{
      resetEverything();
      $('#create').prop('disabled', true);
    }
  });

  $('#create_first').keyup(function () {
    var first = $('#create_first').val();
    if(!validator.isEmpty(first)){
      if(!validator.matches(first, userFormat) && !validator.isEmail(first)){
        $('#create_first').css('border', '1px solid #d66');
        $('#invalid_createFirst').text('Invalid Username / Email');
        $('#create').prop('disabled', true);
      }else if(validator.matches(first, userFormat) && !validator.isEmail(first)){
        $.get('/checkUsername', {username:first}, function(result){
          if(result.username == first){
            $('#create_first').css('border', '1px solid #cccccc');
            $('#invalid_createFirst').text('');
            $('#invalid_createAll').text('');
            if(!checkEverything()){
              $('#create').prop('disabled', true);
            }else{
              resetEverything();
              $('#create').prop('disabled', false);
            }
          }else{
            $('#create_first').css('border', '1px solid #d66');
            $('#invalid_createFirst').text('Invalid Username');
            $('#create').prop('disabled', true);
          }
        });
      }else if(validator.isEmail(first)){
        $.get('/checkEmail', {email:first}, function(result){
          if(result.email == first){
            $('#create_first').css('border', '1px solid #d66');
            $('#invalid_createFirst').text('Invalid Email');
            $('#create').prop('disabled', true);
          }else{
            $('#create_first').css('border', '1px solid #cccccc');
            $('#invalid_createFirst').text('');
            $('#invalid_createAll').text('');
            if(!checkEverything()){
              $('#create').prop('disabled', true);
            }else{
              resetEverything();
              $('#create').prop('disabled', false);
            }
          }
        });
      }
    }else{
      resetEverything();
      $('#create').prop('disabled', true);
    }
  });

  $('#create_second').keyup(function () {
    var second = $('#create_second').val();
    if(!validator.isEmpty(second)){
      if(!validator.matches(second, userFormat) && !validator.isEmail(second)){
        $('#create_second').css('border', '1px solid #d66');
        $('#invalid_createSecond').text('Invalid Username / Email');
        $('#create').prop('disabled', true);
      }else if(validator.matches(second, userFormat) && !validator.isEmail(second)){
        $.get('/checkUsername', {username:second}, function(result){
          if(result.username == second){
            $('#create_second').css('border', '1px solid #cccccc');
            $('#invalid_createSecond').text('');
            $('#invalid_createAll').text('');
            if(!checkEverything()){
              $('#create_second').css('border', '1px solid #cccccc');
              $('#invalid_createSecond').text('');
              $('#invalid_createAll').text('');
              if(!checkEverything()){
                $('#create').prop('disabled', true);
              }else{
                resetEverything();
                $('#create').prop('disabled', false);
              }
            }
          }else{
            $('#create_second').css('border', '1px solid #d66');
            $('#invalid_createSecond').text('Invalid Username');
            $('#create').prop('disabled', true);
          }
        });
      }else if(validator.isEmail(second)){
        $.get('/checkEmail', {email:second}, function(result){
          if(result.email == second){
            $('#create_second').css('border', '1px solid #d66');
            $('#invalid_createSecond').text('Invalid Email');
            $('#create').prop('disabled', true);
          }else{
            $('#create_second').css('border', '1px solid #cccccc');
            $('#invalid_createSecond').text('');
            $('#invalid_createAll').text('');
            if(!checkEverything()){
              $('#create').prop('disabled', true);
            }else{
              resetEverything();
              $('#create').prop('disabled', false);
            }
          }
        });
      }
    }else{
      resetEverything();
      $('#create').prop('disabled', true);
    }
  });

  $('#create_third').keyup(function () {
    var third = $('#create_third').val();
    if(!validator.isEmpty(third)){
      if(!validator.matches(third, userFormat) && !validator.isEmail(third)){
        $('#create_third').css('border', '1px solid #d66');
        $('#invalid_createThird').text('Invalid Username / Email');
        $('#create').prop('disabled', true);
      }else if(validator.matches(third, userFormat) && !validator.isEmail(third)){
        $.get('/checkUsername', {username:third}, function(result){
          if(result.username == third){
            $('#create_third').css('border', '1px solid #cccccc');
            $('#invalid_createThird').text('');
            $('#invalid_createAll').text('');
            if(!checkEverything()){
              $('#create').prop('disabled', true);
            }else{
              resetEverything();
              $('#create').prop('disabled', false);
            }
          }else{
            $('#create_third').css('border', '1px solid #d66');
            $('#invalid_createThird').text('Invalid Username');
            $('#create').prop('disabled', true);
          }
        });
      }else if(validator.isEmail(third)){
        $.get('/checkEmail', {email:third}, function(result){
          if(result.email == third){
            $('#create_third').css('border', '1px solid #d66');
            $('#invalid_createThird').text('Invalid Email');
            $('#create').prop('disabled', true);
          }else{
            $('#create_third').css('border', '1px solid #cccccc');
            $('#invalid_createThird').text('');
            $('#invalid_createAll').text('');
            if(!checkEverything()){
              $('#create').prop('disabled', true);
            }else{
              resetEverything();
              $('#create').prop('disabled', false);
            }
          }
        });
      }
    }else{
      resetEverything();
      $('#create').prop('disabled', true);
    }
  });
});
