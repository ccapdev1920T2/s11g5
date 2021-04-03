$(document).ready(function () {
  const nameFormat = /^[a-zA-Z][a-zA-Z\s]*$/;
  const userFormat = /[a-zA-Z0-9\-\_\.]+$/;

  function resetEverything(){
    $('#user_role').css('border', '1px solid #cccccc');
    $('#motion').css('border', '1px solid #cccccc');
    $('#gov').css('border', '1px solid #cccccc');
    $('#opp').css('border', '1px solid #cccccc');
    $('#invalid_role').text('');
    $('#invalid_motion').text('');
    $('#invalid_gov').text('');
    $('#invalid_opp').text('');
  }

  function checkMembers(user, team){
    return (user != team.first.username && user != team.second.username && user != team.third.username);
  }

  function checkEverything(){
    var gov, opp, user_role, motion;
    const sentenceFormat = /^[a-zA-Z0-9]([a-zA-Z0-9\s\-\.\!\?\,\']?)+$/;
    if(!validator.isEmpty($('#gov').val())){
      gov = $('#gov').val();
    }else if(!validator.equals($('#edit_gov').val(), 'Enter Goverment Team Name...')){
      gov = $('#edit_gov').val();
    }else{
      gov = $('#gov').val();
    }
    if(!validator.isEmpty($('#opp').val())){
      opp = $('#opp').val();
    }else if(!validator.equals($('#edit_opp').val(), 'Enter Opposition Team Name...')){
      opp = $('#edit_opp').val();
    }else{
      opp = $('#opp').val();
    }
    if(!validator.isEmpty($('#user_role').val())){
      user_role = $('#user_role').val();
    }else if(!validator.equals($('#edit_role').val(), 'Choose Your Role')){
      user_role = $('#edit_role').val();
    }else{
      user_role = $('#user_role').val();
    }
    if(!validator.isEmpty($('#motion').val())){
      motion = $('#motion').val();
    }else if(!validator.equals($('#edit_motion').val(), 'Enter Motion...')){
      motion = $('#edit_motion').val();
    }else{
      motion = $('#motion').val();
    }
    var curr_user = $('#current_user').val();
    if(!validator.isEmpty(gov) && !validator.isEmpty(opp)){
      $.get('/checkName', {teamname:gov}, function(gov_res){
        $.get('/checkName', {teamname:opp}, function(opp_res){
          if(gov_res.teamname == gov && opp_res.teamname == opp){
            if(checkMembers(gov_res.first.username, opp_res) && checkMembers(gov_res.second.username, opp_res) && checkMembers(gov_res.third.username, opp_res) && checkMembers(opp_res.first.username, gov_res) && checkMembers(opp_res.second.username, gov_res) && checkMembers(opp_res.third.username, gov_res)){
              if(!validator.isEmpty(user_role)){
                if(user_role == 'ad'){
                  if(checkMembers(curr_user, gov_res) && checkMembers(curr_user, opp_res)){
                    resetEverything();
                    if(!validator.isEmpty(motion) && validator.matches(motion, sentenceFormat)){
                      $('#round_next').prop('disabled', false);
                    }else{
                      $('#round_next').prop('disabled', true);
                    }
                  }else{
                    $('#user_role').css('border', '1px solid #d66');
                    $('#gov').css('border', '1px solid #d66');
                    $('#opp').css('border', '1px solid #d66');
                    $('#invalid_opp').text('Adjudicator cannot be in any teams');
                    $('#round_next').prop('disabled', true);
                  }
                }else if(user_role == 'gov'){
                  if(!checkMembers(curr_user, gov_res) && checkMembers(curr_user, opp_res)){
                    resetEverything();
                    if(!validator.isEmpty(motion) && validator.matches(motion, sentenceFormat)){
                      $('#round_next').prop('disabled', false);
                    }else{
                      $('#round_next').prop('disabled', true);
                    }
                  }else{
                    $('#gov').css('border', '1px solid #d66');
                    $('#opp').css('border', '1px solid #d66');
                    $('#invalid_opp').text('User can only be in Government Team');
                    $('#round_next').prop('disabled', true);
                  }
                }else if(user_role == 'opp'){
                  if(checkMembers(curr_user, gov_res) && !checkMembers(curr_user, opp_res)){
                    resetEverything();
                    if(!validator.isEmpty(motion) && validator.matches(motion, sentenceFormat)){
                      $('#round_next').prop('disabled', false);
                    }else{
                      $('#round_next').prop('disabled', true);
                    }
                  }else{
                    $('#gov').css('border', '1px solid #d66');
                    $('#opp').css('border', '1px solid #d66');
                    $('#invalid_opp').text('User can only be in Opposition Team');
                    $('#round_next').prop('disabled', true);
                  }
                }else{
                  $('#round_next').prop('disabled', true);
                }
              }else{
                $('#round_next').prop('disabled', true);
              }
            }else{
              $('#gov').css('border', '1px solid #d66');
              $('#opp').css('border', '1px solid #d66');
              $('#invalid_opp').text('Members cannot be in both teams');
              $('#round_next').prop('disabled', true);
            }
          }else{
            $('#gov').css('border', '1px solid #d66');
            $('#opp').css('border', '1px solid #d66');
            $('#invalid_opp').text('Invalid Teams');
            $('#round_next').prop('disabled', true);
          }
        });
      });
    }else{
      $('#round_next').prop('disabled', true);
    }
  }

  function enableNext(){
    var status = $('#current_status').val();
    if(!validator.isEmpty(status)){
      if(validator.equals(status, 'Creating')){
        $('#round_next').prop('disabled', true);
        $('#adj_next').prop('disabled', true);
      }else{
        $('#round_next').prop('disabled', false);
        var curr_ad = $('#edit_adj').val();
        if(!validator.isEmpty(curr_ad)){
          if(validator.matches(curr_ad, "No User")){
            $('#adj_next').prop('disabled', true);
          }else{
            $('#adj_next').prop('disabled', false);
          }
        }else{
          $('#adj_next').prop('disabled', true);
        }
      }
    }else{
      $('#round_next').prop('disabled', false);
    }
  }

  enableNext();
  $('#user_role').change(function () {
    var user_role = $('#user_role').val();
    if(!validator.isEmpty(user_role)){
      $('#user_role').css('border', '1px solid #cccccc');
      $('#invalid_role').text('');
      checkEverything();
    }else{
      $('#user_role').css('border', '1px solid #d66');
      $('#invalid_role').text('Invalid Role');
      $('#round_next').prop('disabled', true);
    }
  });

  $('#motion').keyup(function () {
    const sentenceFormat = /^[a-zA-Z0-9]([a-zA-Z0-9\s\-\.\!\?\,\']?)+$/;
    var motion = $('#motion').val();
    if(!validator.isEmpty(motion)){
      if(!validator.matches(motion, sentenceFormat)){
        $('#motion').css('border', '1px solid #d66');
        $('#invalid_motion').text('Invalid character/s in motion');
        $('#round_next').prop('disabled', true);
      }else{
        $('#motion').css('border', '1px solid #cccccc');
        $('#invalid_motion').text('');
        checkEverything();
      }
    }else{
      $('#motion').css('border', '1px solid #cccccc');
      $('#invalid_motion').text('');
      enableNext();
    }
  });

  $('#gov').keyup(function () {
    var gov = $('#gov').val();
    if(!validator.isEmpty(gov)){
      if(!validator.matches(gov, nameFormat)){
        $('#gov').css('border', '1px solid #d66');
        $('#invalid_gov').text('Invalid Team Name');
        $('#round_next').prop('disabled', true);
      }else{
        $.get('/checkName', {teamname:gov}, function(result){
          if(result.teamname == gov){
            $('#gov').css('border', '1px solid #cccccc');
            $('#invalid_gov').text('');
            checkEverything();
          }else{
            $('#gov').css('border', '1px solid #d66');
            $('#invalid_gov').text('Team Not Found');
            $('#round_next').prop('disabled', true);
          }
        });
      }
    }else{
      $('#gov').css('border', '1px solid #cccccc');
      $('#invalid_gov').text('');
      enableNext();
    }
  });

  $('#opp').keyup(function () {
    var opp = $('#opp').val();
    if(!validator.isEmpty(opp)){
      if(!validator.matches(opp, nameFormat)){
        $('#opp').css('border', '1px solid #d66');
        $('#invalid_opp').text('Invalid Team Name');
        $('#round_next').prop('disabled', true);
      }else{
        $.get('/checkName', {teamname:opp}, function(result){
          if(result.teamname == opp){
            $('#opp').css('border', '1px solid #cccccc');
            $('#invalid_opp').text('');
            checkEverything();
          }else{
            $('#opp').css('border', '1px solid #d66');
            $('#invalid_opp').text('Team Not Found');
            $('#round_next').prop('disabled', true);
          }
        });
      }
    }else{
      $('#opp').css('border', '1px solid #cccccc');
      $('#invalid_opp').text('');
      enableNext();
    }
  });

  $('#ad').keyup(function () {
    var ad = $('#ad').val();
    var roundID = $('#roundID').val();
    if(!validator.isEmpty(ad)){
      if(!validator.matches(ad, userFormat)){
        $('#ad').css('border', '1px solid #d66');
        $('#invalid_ad').text('Invalid User');
        $('#adj_next').prop('disabled', true);
      }else{
        $.get('/checkMatch', {roundID:roundID}, function (match) {
          if(match){
            $.get('/checkUsername', {username:ad}, function (adjudicator) {
              if(adjudicator.username == ad){
                if(checkMembers(ad, match.gov) && checkMembers(ad, match.opp)){
                  $('#ad').css('border', '1px solid #cccccc');
                  $('#invalid_ad').text('');
                  $('#adj_next').prop('disabled', false);
                }else{
                  $('#ad').css('border', '1px solid #d66');
                  $('#invalid_ad').text('User cannot be a Debater in this round');
                  $('#adj_next').prop('disabled', true);
                }
              }else{
                $('#ad').css('border', '1px solid #d66');
                $('#invalid_ad').text('User not Found');
                $('#adj_next').prop('disabled', true);
              }
            });
          }else{
            $('#ad').css('border', '1px solid #d66');
            $('#invalid_ad').text('Cannot find Round ID. Please Try Again Later.');
            $('#adj_next').prop('disabled', true);
          }
        });
      }
    }else{
      $('#ad').css('border', '1px solid #cccccc');
      $('#invalid_ad').text('');
      enableNext();
    }
  });
});
