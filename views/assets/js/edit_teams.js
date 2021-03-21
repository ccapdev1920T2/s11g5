$(document).ready(function () {
  const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
  const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

  function resetEverything(){
    $('#edit_teamname').css('border', '1px solid #cccccc');
    $('#edit_first').css('border', '1px solid #cccccc');
    $('#edit_second').css('border', '1px solid #cccccc');
    $('#edit_third').css('border', '1px solid #cccccc');
    $('#invalid_editTeam').text('');
    $('#invalid_editFirst').text('');
    $('#invalid_editSecond').text('');
    $('#invalid_editThird').text('');
    $('#invalid_editAll').text('');
  }

  function checkEverything(){
    var teamname, first, second, third, newMember = 0, newName = 0;
    if(!validator.isEmpty($('#edit_teamname').val())){
      teamname = $('#edit_teamname').val();
      newName = 1;
    }else{
      teamname = $('#current_team').val();
    }
    if(!validator.isEmpty($('#edit_first').val())){
      first = $('#edit_first').val();
      newMember = 1;
    }else{
      first = $('#edit_firstCurrent').val();
    }
    if(!validator.isEmpty($('#edit_second').val())){
      second = $('#edit_second').val();
      newMember = 1;
    }else{
      second = $('#edit_secondCurrent').val();
    }
    if(!validator.isEmpty($('#edit_third').val())){
      third = $('#edit_third').val();
      newMember = 1;
    }else{
      third = $('#edit_thirdCurrent').val();
    }
    var confirm = $('#edit_current').val();
    var current = $('#current_user').val();
    var current_teamname = $('#current_team').val();
    if((!validator.isEmpty(first) || !validator.isEmpty(second) || !validator.isEmpty(third)) && newMember == 1){
      if(current == first || current == second || current == third){
        if(first != second && first != third && second != third){
          $.get('/checkTeam', {first:first, second:second, third:third}, function(result){
            if(result != false && result.teamname != current_teamname){
              $('#edit_first').css('border', '1px solid #d66');
              $('#edit_second').css('border', '1px solid #d66');
              $('#edit_third').css('border', '1px solid #d66');
              $('#invalid_editAll').text('Team Already Exists');
              return false;
            }else{
              if(!validator.isEmpty(confirm)){
                if(!validator.isEmpty(teamname) && newName == 1){
                  if(!validator.equals(teamname, confirm)){
                    resetEverything();
                    $('#edit').prop('disabled', false);
                    return true;
                  }else{
                    $('#edit_teamname').css('border', '1px solid #d66');
                    $('#invalid_editTeam').text('Enter a New Team Name');
                    $('#edit').prop('disabled', true);
                    return false;
                  }
                }else{
                  resetEverything();
                  $('#edit').prop('disabled', false);
                  return true;
                }
              }else{
                resetEverything();
                $('#edit').prop('disabled', true);
                return false;
              }
            }
          });
        }else{
          $('#edit_first').css('border', '1px solid #d66');
          $('#edit_second').css('border', '1px solid #d66');
          $('#edit_third').css('border', '1px solid #d66');
          $('#invalid_editAll').text('Users cannot have more than one role');
          $('#edit').prop('disabled', true);
          return false;
        }
      }else{
        $('#edit_first').css('border', '1px solid #d66');
        $('#edit_second').css('border', '1px solid #d66');
        $('#edit_third').css('border', '1px solid #d66');
        $('#invalid_editAll').text('Team Creator needs to be in the team');
        $('#edit').prop('disabled', true);
        return false;
      }
    }else{
      if(newName == 1 && !validator.isEmpty(confirm)){
        resetEverything();
        $('#edit').prop('disabled', false);
        return true;
      }else{
        resetEverything();
        $('#edit').prop('disabled', true);
        return false;
      }
    }
  }

  $('#edit_next').prop('disabled', true);
  $('#edit_choose').change(function () {
    var chosen = $('#edit_choose').val();
    if(validator.equals(chosen, 'choose')){
      $('#edit_choose').css('border', '1px solid #d66');
      $('#invalid_editChoose').text('Invalid Chosen Team');
      $('#edit_next').prop('disabled', true);
    }else{
      $('#edit_choose').css('border', '1px solid #cccccc');
      $('#invalid_editChoose').text('');
      $('#edit_next').prop('disabled', false);
    }
  });

  $('#edit').prop('disabled', true);
  $('#edit_teamname').keyup(function () {
    var teamname = $('#edit_teamname').val();
    var current_teamname = $('#current_team').val();
    resetEverything();
    if(!validator.isEmpty(teamname)){
      if(!validator.matches(teamname, nameFormat)){
        $('#edit_teamname').css('border', '1px solid #d66');
        $('#invalid_editTeam').text('Invalid Team Name');
        $('#edit').prop('disabled', true);
      }else{
        if(!validator.equals(teamname, current_teamname)){
          $.get('/checkName', {teamname:teamname}, function(result){
            if(result.teamname == teamname){
              $('#edit_teamname').css('border', '1px solid #d66');
              $('#invalid_editTeam').text('Team Name is Already Taken');
              $('#edit').prop('disabled', true);
            }else{
              if(!checkEverything()){
                $('#edit').prop('disabled', true);
              }else{
                resetEverything();
                $('#edit').prop('disabled', false);
              }
            }
          });
        }else{
          $('#edit_teamname').css('border', '1px solid #d66');
          $('#invalid_editTeam').text('Enter a New Team Name');
          $('#edit').prop('disabled', true);
        }
      }
    }else{
      resetEverything();
      $('#edit').prop('disabled', true);
    }
  });

  $('#edit_first').keyup(function () {
    var first = $('#edit_first').val();
    var current_first = $('#edit_firstCurrent').val();
    if(!validator.isEmpty(first)){
      if(!validator.matches(first, userFormat) && !validator.isEmail(first)){
        $('#edit_first').css('border', '1px solid #d66');
        $('#invalid_editFirst').text('Invalid Username / Email');
        $('#edit').prop('disabled', true);
      }else{
        if(!validator.matches(first, current_first)){
          if(validator.matches(first, userFormat) && !validator.isEmail(first)){
            resetEverything();
            $.get('/checkUsername', {username:first}, function(result){
              if(result.username == first){
                $('#edit_first').css('border', '1px solid #cccccc');
                $('#invalid_editFirst').text('');
                $('#invalid_editAll').text('');
                if(!checkEverything()){
                  $('#edit').prop('disabled', true);
                }else{
                  resetEverything();
                  $('#edit').prop('disabled', false);
                }
              }else{
                $('#edit_first').css('border', '1px solid #d66');
                $('#invalid_editFirst').text('Invalid Username');
                $('#edit').prop('disabled', true);
              }
            });
          }else if(validator.isEmail(first)){
            $.get('/checkEmail', {email:first}, function(result){
              if(result.email == first){
                $('#edit_first').css('border', '1px solid #d66');
                $('#invalid_editFirst').text('Invalid Email');
                $('#edit').prop('disabled', true);
              }else{
                $('#edit_first').css('border', '1px solid #cccccc');
                $('#invalid_editFirst').text('');
                $('#invalid_editAll').text('');
                if(!checkEverything()){
                  $('#edit').prop('disabled', true);
                }else{
                  resetEverything();
                  $('#edit').prop('disabled', false);
                }
              }
            });
          }
        }else{
          $('#edit_first').css('border', '1px solid #d66');
          $('#invalid_editFirst').text('Enter a New User');
          $('#edit').prop('disabled', true);
        }
      }
    }else{
      $('#edit').prop('disabled', true);
    }
  });

  $('#edit_second').keyup(function () {
    var second = $('#edit_second').val();
    var current_second = $('#edit_secondCurrent').val();
    if(!validator.isEmpty(second)){
      if(!validator.matches(second, userFormat) && !validator.isEmail(second)){
        $('#edit_second').css('border', '1px solid #d66');
        $('#invalid_editSecond').text('Invalid Username / Email');
        $('#edit').prop('disabled', true);
      }else{
        if(!validator.matches(second, current_second)){
          if(validator.matches(second, userFormat) && !validator.isEmail(second)){
            resetEverything();
            $.get('/checkUsername', {username:second}, function(result){
              if(result.username == second){
                $('#edit_second').css('border', '1px solid #cccccc');
                $('#invalid_editSecond').text('');
                $('#invalid_editAll').text('');
                if(!checkEverything()){
                  $('#edit').prop('disabled', true);
                }else{
                  resetEverything();
                  $('#edit').prop('disabled', false);
                }
              }else{
                $('#edit_second').css('border', '1px solid #d66');
                $('#invalid_editSecond').text('Invalid Username');
                $('#edit').prop('disabled', true);
              }
            });
          }else if(validator.isEmail(second)){
            $.get('/checkEmail', {email:second}, function(result){
              if(result.email == second){
                $('#edit_second').css('border', '1px solid #d66');
                $('#invalid_editSecond').text('Invalid Email');
                $('#edit').prop('disabled', true);
              }else{
                $('#edit_second').css('border', '1px solid #cccccc');
                $('#invalid_editSecond').text('');
                $('#invalid_editAll').text('');
                if(!checkEverything()){
                  $('#edit').prop('disabled', true);
                }else{
                  resetEverything();
                  $('#edit').prop('disabled', false);
                }
              }
            });
          }
        }else{
          $('#edit_second').css('border', '1px solid #d66');
          $('#invalid_editSecond').text('Enter a New User');
          $('#edit').prop('disabled', true);
        }
      }
    }else{
      $('#edit').prop('disabled', true);
    }
  });

  $('#edit_third').keyup(function () {
    var third = $('#edit_third').val();
    var current_third = $('#edit_thirdCurrent').val();
    if(!validator.isEmpty(third)){
      if(!validator.matches(third, userFormat) && !validator.isEmail(third)){
        $('#edit_third').css('border', '1px solid #d66');
        $('#invalid_editThird').text('Invalid Username / Email');
        $('#edit').prop('disabled', true);
      }else{
        if(!validator.matches(third, current_third)){
          if(validator.matches(third, userFormat) && !validator.isEmail(third)){
            resetEverything();
            $.get('/checkUsername', {username:third}, function(result){
              if(result.username == third){
                $('#edit_third').css('border', '1px solid #cccccc');
                $('#invalid_editThird').text('');
                $('#invalid_editAll').text('');
                if(!checkEverything()){
                  $('#edit').prop('disabled', true);
                }else{
                  resetEverything();
                  $('#edit').prop('disabled', false);
                }
              }else{
                $('#edit_third').css('border', '1px solid #d66');
                $('#invalid_editThird').text('Invalid Username');
                $('#edit').prop('disabled', true);
              }
            });
          }else if(validator.isEmail(third)){
            $.get('/checkEmail', {email:third}, function(result){
              if(result.email == third){
                $('#edit_third').css('border', '1px solid #d66');
                $('#invalid_editThird').text('Invalid Email');
                $('#edit').prop('disabled', true);
              }else{
                $('#edit_third').css('border', '1px solid #cccccc');
                $('#invalid_editThird').text('');
                $('#invalid_editAll').text('');
                if(!checkEverything()){
                  $('#edit').prop('disabled', true);
                }else{
                  resetEverything();
                  $('#edit').prop('disabled', false);
                }
              }
            });
          }
        }else{
          $('#edit_third').css('border', '1px solid #d66');
          $('#invalid_editThird').text('Enter a New User');
          $('#edit').prop('disabled', true);
        }
      }
    }else{
      $('#edit').prop('disabled', true);
    }
  });

  $('#edit_current').keyup(function () {
    var edit_current = $('#edit_current').val();
    var current_teamname = $('#current_team').val();
    resetEverything();
    if(!validator.isEmpty(edit_current)){
      if(validator.equals(edit_current, current_teamname) && validator.matches(edit_current, nameFormat)){
        $('#edit_current').css('border', '1px solid #cccccc');
        $('#invalid_editCurrent').text('');
        if(!checkEverything()){
          $('#edit').prop('disabled', true);
        }else{
          resetEverything();
          $('#edit').prop('disabled', false);
        }
      }else{
        $('#edit_current').css('border', '1px solid #d66');
        $('#invalid_editCurrent').text('Invalid Team Name');
        $('#edit').prop('disabled', true);
      }
    }else{
      resetEverything();
      $('#edit').prop('disabled', true);
    }
  });
});
