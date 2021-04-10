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

  function checkTeamName(){
    var teamname = $('#edit_teamname').val();
    var current_teamname = $('#current_team').val();
    if(!validator.isEmpty(teamname)){
      $('#invalid_editAll').text('');
      if(!validator.matches(teamname, nameFormat)){
        $('#edit_teamname').css('border', '1px solid #d66');
        $('#invalid_editTeam').text('Invalid Team Name');
        return false;
      }else{
        if(!validator.equals(teamname, current_teamname)){
          $.get('/checkName', {teamname:teamname}, function(result){
            if(result.teamname == teamname){
              $('#edit_teamname').css('border', '1px solid #d66');
              $('#invalid_editTeam').text('Team Name is Already Taken');
              return false;
            }else{
              $('#edit_teamname').css('border', '1px solid #cccccc');
              $('#invalid_editTeam').text('');
              return true;
            }
          });
        }else{
          $('#edit_teamname').css('border', '1px solid #d66');
          $('#invalid_editTeam').text('Enter a New Team Name');
          return false;
        }
      }
    }else{
      $('#edit_teamname').css('border', '1px solid #cccccc');
      $('#invalid_editTeam').text('');
      return false;
    }
  }

  function checkFirst(){
    var first = $('#edit_first').val();
    var current_first = $('#edit_firstCurrent').val();
    if(!validator.isEmpty(first)){
      $('#invalid_editAll').text('');
      if(!validator.matches(first, userFormat) && !validator.isEmail(first)){
        $('#edit_first').css('border', '1px solid #d66');
        $('#invalid_editFirst').text('Invalid Username / Email');
        return false;
      }else{
        if(!validator.matches(first, current_first)){
          if(validator.matches(first, userFormat) && !validator.isEmail(first)){
            $.get('/checkUsername', {username:first}, function(result){
              if(result.username == first){
                $('#edit_first').css('border', '1px solid #cccccc');
                $('#invalid_editFirst').text('');
                $('#invalid_editAll').text('');
                return true;
              }else{
                $('#edit_first').css('border', '1px solid #d66');
                $('#invalid_editFirst').text('User Not Found');
                return false;
              }
            });
          }else if(validator.isEmail(first)){
            $.get('/checkEmail', {email:first}, function(result){
              if(result.email == first){
                $('#edit_first').css('border', '1px solid #d66');
                $('#invalid_editFirst').text('Invalid Email');
                return false;
              }else{
                $('#edit_first').css('border', '1px solid #cccccc');
                $('#invalid_editFirst').text('');
                $('#invalid_editAll').text('');
                return true;
              }
            });
          }
        }else{
          $('#edit_first').css('border', '1px solid #d66');
          $('#invalid_editFirst').text('Enter a New User');
          return false;
        }
      }
    }else{
      $('#edit_first').css('border', '1px solid #cccccc');
      $('#invalid_editFirst').text('');
      return false;
    }
  }

  function checkSecond(){
    var second = $('#edit_second').val();
    var current_second = $('#edit_secondCurrent').val();
    if(!validator.isEmpty(second)){
      $('#invalid_editAll').text('');
      if(!validator.matches(second, userFormat) && !validator.isEmail(second)){
        $('#edit_second').css('border', '1px solid #d66');
        $('#invalid_editSecond').text('Invalid Username / Email');
        return false;
      }else{
        if(!validator.matches(second, current_second)){
          if(validator.matches(second, userFormat) && !validator.isEmail(second)){
            $.get('/checkUsername', {username:second}, function(result){
              if(result.username == second){
                $('#edit_second').css('border', '1px solid #cccccc');
                $('#invalid_editSecond').text('');
                $('#invalid_editAll').text('');
                return true;
              }else{
                $('#edit_second').css('border', '1px solid #d66');
                $('#invalid_editSecond').text('User Not Found');
                return false;
              }
            });
          }else if(validator.isEmail(second)){
            $.get('/checkEmail', {email:second}, function(result){
              if(result.email == second){
                $('#edit_second').css('border', '1px solid #d66');
                $('#invalid_editSecond').text('Invalid Email');
                return false;
              }else{
                $('#edit_second').css('border', '1px solid #cccccc');
                $('#invalid_editSecond').text('');
                $('#invalid_editAll').text('');
                return true;
              }
            });
          }
        }else{
          $('#edit_second').css('border', '1px solid #d66');
          $('#invalid_editSecond').text('Enter a New User');
          return false;
        }
      }
    }else{
      $('#edit_second').css('border', '1px solid #cccccc');
      $('#invalid_editSecond').text('');
      return false;
    }
  }

  function checkThird(){
    var third = $('#edit_third').val();
    var current_third = $('#edit_thirdCurrent').val();
    if(!validator.isEmpty(third)){
      $('#invalid_editAll').text('');
      if(!validator.matches(third, userFormat) && !validator.isEmail(third)){
        $('#edit_third').css('border', '1px solid #d66');
        $('#invalid_editThird').text('Invalid Username / Email');
        return false;
      }else{
        if(!validator.matches(third, current_third)){
          if(validator.matches(third, userFormat) && !validator.isEmail(third)){
            $.get('/checkUsername', {username:third}, function(result){
              if(result.username == third){
                $('#edit_third').css('border', '1px solid #cccccc');
                $('#invalid_editThird').text('');
                $('#invalid_editAll').text('');
                return true;
              }else{
                $('#edit_third').css('border', '1px solid #d66');
                $('#invalid_editThird').text('User Not Found');
                return false;
              }
            });
          }else if(validator.isEmail(third)){
            $.get('/checkEmail', {email:third}, function(result){
              if(result.email == third){
                $('#edit_third').css('border', '1px solid #d66');
                $('#invalid_editThird').text('Invalid Email');
                return false;
              }else{
                $('#edit_third').css('border', '1px solid #cccccc');
                $('#invalid_editThird').text('');
                $('#invalid_editAll').text('');
                return true;
              }
            });
          }
        }else{
          $('#edit_third').css('border', '1px solid #d66');
          $('#invalid_editThird').text('Enter a New User');
          return false;
        }
      }
    }else{
      $('#edit_third').css('border', '1px solid #cccccc');
      $('#invalid_editThird').text('');
      return false;
    }
  }

  function checkCurrent(){
    var edit_current = $('#edit_current').val();
    var current_teamname = $('#current_team').val();
    if(!validator.isEmpty(edit_current)){
      if(validator.equals(edit_current, current_teamname) && validator.matches(edit_current, nameFormat)){
        $('#edit_current').css('border', '1px solid #cccccc');
        $('#invalid_editCurrent').text('');
        return true;
      }else{
        $('#edit_current').css('border', '1px solid #d66');
        $('#invalid_editCurrent').text('Invalid Team Name');
        return false;
      }
    }else{
      $('#edit_current').css('border', '1px solid #cccccc');
      $('#invalid_editCurrent').text('');
      return false;
    }
  }

  function checkEverything(){
    var teamname, first, second, third, newMember = 0, newName = 0;
    var validFirst = 0, validSecond = 0, validThird = 0;
    if(!validator.isEmpty($('#edit_teamname').val())){
      teamname = $('#edit_teamname').val();
      newName = 1;
    }else{
      teamname = $('#current_team').val();
    }
    if(!validator.isEmpty($('#edit_first').val())){
      first = $('#edit_first').val();
      newMember = 1;
      if(!checkFirst())
        validFirst = 1;
      else
        validFirst = 0;
    }else{
      first = $('#edit_firstCurrent').val();
      validFirst = 0;
    }
    if(!validator.isEmpty($('#edit_second').val())){
      second = $('#edit_second').val();
      newMember = 1;
      if(!checkSecond())
        validSecond = 1;
      else
        validSecond = 0;
    }else{
      second = $('#edit_secondCurrent').val();
      validSecond = 0;
    }
    if(!validator.isEmpty($('#edit_third').val())){
      third = $('#edit_third').val();
      newMember = 1;
      if(!checkThird())
        validThird = 1;
      else
        validThird = 0;
    }else{
      third = $('#edit_thirdCurrent').val();
      validThird = 0;
    }
    var confirm = $('#edit_current').val();
    var current = $('#current_user').val();
    var current_teamname = $('#current_team').val();
    if(((!validator.isEmpty(first) && validFirst == 0) || (!validator.isEmpty(second) && validSecond == 0) || (!validator.isEmpty(third) && validThird == 0)) && newMember == 1){
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
                  if(!checkTeamName()){
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
        if(!checkTeamName()){
          $('#edit').prop('disabled', true);
          return false;
        }else{
          $('#edit').prop('disabled', false);
          return true;
        }
      }else{
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
    if(!checkTeam()){
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

  $('#edit_first').keyup(function () {
    if(!checkFirst()){
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

  $('#edit_second').keyup(function () {
    if(!checkSecond()){
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

  $('#edit_third').keyup(function () {
    if(!checkThird()){
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

  $('#edit_current').keyup(function () {
    if(!checkCurrent()){
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
});
