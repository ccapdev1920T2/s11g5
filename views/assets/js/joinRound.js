var socket = io();
let timer;
if(!socket.socket){
  socket.connect();
}

function updateClass(prev, next){
  var prev_user = $(`#${prev}`);
  var next_user = $(`#${next}`);
  if(prev_user.hasClass('bg-primary')) {
    prev_user.removeClass('bg-primary');
  }
  if(prev_user.hasClass('text-light')) {
    prev_user.removeClass('text-light');
  }
  if(next_user.hasClass('bg-light')) {
    next_user.removeClass('bg-light');
  }
  if(next_user.hasClass('text-dark')) {
    next_user.removeClass('text-dark');
  }
  next_user.addClass('bg-primary');
  next_user.addClass('text-light');
}

function resetClass(){
  if($('#gov_first').hasClass('bg-primary')) {
    $('#gov_first').removeClass('bg-primary');
    $('#gov_first').addClass('bg-light');
  }
  if($('#gov_first').hasClass('bg-light')) {
    $('#gov_first').removeClass('bg-light');
    $('#gov_first').addClass('text-dark');
  }
  if($('#gov_second').hasClass('bg-primary')) {
    $('#gov_second').removeClass('bg-primary');
    $('#gov_second').addClass('bg-light');
  }
  if($('#gov_second').hasClass('bg-light')) {
    $('#gov_second').removeClass('bg-light');
    $('#gov_second').addClass('text-dark');
  }
  if($('#gov_third').hasClass('bg-primary')) {
    $('#gov_third').removeClass('bg-primary');
    $('#gov_third').addClass('bg-light');
  }
  if($('#gov_third').hasClass('bg-light')) {
    $('#gov_third').removeClass('bg-light');
    $('#gov_third').addClass('text-dark');
  }
  if($('#opp_first').hasClass('bg-primary')) {
    $('#opp_first').removeClass('bg-primary');
    $('#opp_first').addClass('bg-light');
  }
  if($('#opp_first').hasClass('bg-light')) {
    $('#opp_first').removeClass('bg-light');
    $('#opp_first').addClass('text-dark');
  }
  if($('#opp_second').hasClass('bg-primary')) {
    $('#opp_second').removeClass('bg-primary');
    $('#opp_second').addClass('bg-light');
  }
  if($('#opp_second').hasClass('bg-light')) {
    $('#opp_second').removeClass('bg-light');
    $('#opp_second').addClass('text-dark');
  }
  if($('#opp_third').hasClass('bg-primary')) {
    $('#opp_third').removeClass('bg-primary');
    $('#opp_third').addClass('bg-light');
  }
  if($('#opp_third').hasClass('bg-light')) {
    $('#opp_third').removeClass('bg-light');
    $('#opp_third').addClass('text-dark');
  }
}

function updateSpeaker(roundID, newSpeaker){
  $("#seconds").text('00');
  $("#minutes").text('00');
  $("#seconds_val").val(0);
  clearInterval(timer);
  if($("#timer_text").hasClass("text-danger")){
    $("#timer_text").removeClass("text-danger");
    $("#timer_text").addClass("text-primary");
  }
  if($("#pause").hasClass('pause')){
    $("#pause").removeClass('pause');
    $("#pause").addClass('play');
  }
  $.ajax({
      type:'PUT',
      url: '/ongoingRound/updateSpeaker/'+roundID,
      data: {name_speaker:newSpeaker.name_speaker, num_speaker:newSpeaker.num_speaker}
  }).done(function(response){
      console.log(response);
  }).fail(function(response){
      console.log("speaker not updated");
  });
}

function findNext(roundID, numSpeaker){
  if(numSpeaker == 1){
    $('#current_text').text($("#oppFirst").val());
    $("#speaker_count").val(2);
    var newSpeaker = {name_speaker:$("#oppFirst").val(), num_speaker:2};
    updateSpeaker(roundID, newSpeaker);
  }else if(numSpeaker == 2){
    $('#current_text').text($("#govSecond").val());
    $("#speaker_count").val(3);
    var newSpeaker = {name_speaker:$("#govSecond").val(), num_speaker:3};
    updateSpeaker(roundID, newSpeaker);
  }else if(numSpeaker == 3){
    $('#current_text').text($("#oppSecond").val());
    $("#speaker_count").val(4);
    var newSpeaker = {name_speaker:$("#oppSecond").val(), num_speaker:4};
    updateSpeaker(roundID, newSpeaker);
  }else if(numSpeaker == 4){
    $('#current_text').text($("#govThird").val());
    $("#speaker_count").val(5);
    var newSpeaker = {name_speaker:$("#govThird").val(), num_speaker:5};
    updateSpeaker(roundID, newSpeaker);
  }else if(numSpeaker == 5){
    $('#current_text').text($("#oppThird").val());
    $("#speaker_count").val(6);
    var newSpeaker = {name_speaker:$("#oppThird").val(), num_speaker:6};
    updateSpeaker(roundID, newSpeaker);
  }else{
    var roundID = $("#roundID").val();
    socket.emit('endRound', roundID);
  }
}

function pad (val) {return val > 9 ? val : "0" + val;}

$(document).ready( function () {
  $("#adj_motion_area").hide();
  $("#back_class").hide();
  $("#first_area").hide();
  $("#second_area").hide();
  $("#join_area").hide();
  $("#timer_area").hide();
  $("#rndTimer").hide();
  $("#ad_commands").hide();
  $("#back_dash_area").hide();
  $("#end_area").hide();

  $("#tutorial_btn").click(function (e) {
    $("#join_area").slideUp(500);
    $("#adj_motion_area").slideUp(500);
    $("#title_area").slideDown(500);
    $("#back_class").hide();
    $("#first_area").hide();
    $("#second_area").hide();
    $("#tutorial_area").slideDown(500);
    if($("#next_class").hasClass('text-center')) {
      $("#next_class").removeClass('text-center');
      $("#next_class").addClass('text-right');
    }
    if ($("#tutorial_count").val() != ""){
      $("#tutorial_count").val("");
    }
  });

  $("#skip_btn").click(function (e) {
    $("#tutorial_area").slideUp(500);
    $("#timer_area").slideUp(500);
    $("#adj_motion_area").slideDown(1000);
    $("#join_area").slideDown(1000);
  });

  $("#next_btn").click(function (e) {
    if ($("#tutorial_count").val() == "")
        $("#tutorial_count").val(1);
    else {
        var count = parseInt($("#tutorial_count").val()) + 1;
        $("#tutorial_count").val(count);
    }
    if($("#tutorial_count").val() == 1){
      $("#title_area").slideUp(500);
      $("#first_area").slideDown(1000);
      if($("#next_class").hasClass('text-right')) {
        $("#next_class").removeClass('text-right');
        $("#next_class").addClass('text-center');
      }
      $("#back_class").fadeIn(500);
    }else if($("#tutorial_count").val() == 2){
      $("#adj_motion_area").slideDown(1000);
      $("#title_area").fadeOut(500);

      if($("#left_title").hasClass('text-left')) {
        $("#left_title").removeClass('text-left');
        $("#left_title").addClass('text-center');
      }
      if($("#left_details").hasClass('text-left')) {
        $("#left_details").removeClass('text-left');
        $("#left_details").addClass('text-center');
      }
      if($("#right_title").hasClass('text-right')) {
        $("#right_title").removeClass('text-right');
        $("#right_title").addClass('text-center');
      }
      if($("#right_details").hasClass('text-right')) {
        $("#right_details").removeClass('text-right');
        $("#right_details").addClass('text-center');
      }
      $("#left_title").text('Adjudicator');
      $("#left_details").text('The Adjudicators are the ones to judge the round. They can call on the next speaker, end the round, give all speakers their grades, and give any comments that they may have.');
      $("#right_title").text('Motion');
      $("#right_details").text('The Motion is the topic of this debate round.');
    }else if($("#tutorial_count").val() == 3){
      $("#timer_area").slideDown(1000);
      $("#rndTimer").hide();
      $("#first_area").slideUp(500);
      $("#second_area").fadeIn(1000);
    }else if($("#tutorial_count").val() == 4){
      $("#adj_motion_area").slideUp(500);
      $("#timer_area").slideUp(500);
      $("#next_btn").text('Proceed');
      $("#timer_title").text('Good Luck');
      $("#timer_details").text('Have fun debating!');
    }else{
      $("#tutorial_area").slideUp(500);
      $("#adj_motion_area").slideDown(1000);
      $("#join_area").slideDown(1000);
    }
  });

  $("#back_btn").click(function (e) {
    if ($("#tutorial_count").val() == "")
        $("#tutorial_count").val(1);
    else {
        var count = parseInt($("#tutorial_count").val()) - 1;
        $("#tutorial_count").val(count);
    }
    if($("#tutorial_count").val() == 0){
      $("#title_area").slideDown(500);
      $("#first_area").slideUp(250);
      $("#back_class").fadeOut(500);
      if($("#next_class").hasClass('text-center')) {
        $("#next_class").removeClass('text-center');
        $("#next_class").addClass('text-right');
      }
    }else if($("#tutorial_count").val() == 1){
      $("#adj_motion_area").slideUp(500);

      if($("#left_title").hasClass('text-center')) {
        $("#left_title").removeClass('text-center');
        $("#left_title").addClass('text-left');
      }
      if($("#left_details").hasClass('text-center')) {
        $("#left_details").removeClass('text-center');
        $("#left_details").addClass('text-left');
      }
      if($("#right_title").hasClass('text-center')) {
        $("#right_title").removeClass('text-center');
        $("#right_title").addClass('text-right');
      }
      if($("#right_details").hasClass('text-center')) {
        $("#right_details").removeClass('text-center');
        $("#right_details").addClass('text-right');
      }
      $("#left_title").text('On the Left side, you have the Government team.');
      $("#left_details").text('They\'re the ones who agree with the motion.');
      $("#right_title").text('On the Right side, you have the Opposition team.');
      $("#right_details").text('They\'re the ones who don\'t agree with the motion.');

      $("#first_area").slideDown(1000);
    }else if($("#tutorial_count").val() == 2){
      $("#adj_motion_area").slideUp(500);
      $("#timer_area").slideUp(500);
      $("#second_area").slideUp(500);
      $("#rndTimer").hide();

      if($("#left_title").hasClass('text-left')) {
        $("#left_title").removeClass('text-left');
        $("#left_title").addClass('text-center');
      }
      if($("#left_details").hasClass('text-left')) {
        $("#left_details").removeClass('text-left');
        $("#left_details").addClass('text-center');
      }
      if($("#right_title").hasClass('text-right')) {
        $("#right_title").removeClass('text-right');
        $("#right_title").addClass('text-center');
      }
      if($("#right_details").hasClass('text-right')) {
        $("#right_details").removeClass('text-right');
        $("#right_details").addClass('text-center');
      }
      $("#left_title").text('Adjudicator');
      $("#left_details").text('The Adjudicators are the ones to judge the round. They can call on the next speaker, end the round, give all speakers their grades, and give any comments that they may have.');
      $("#right_title").text('Motion');
      $("#right_details").text('The Motion is the topic of this debate round.');

      $("#first_area").slideDown(1000);
      $("#second_area").fadeout(500);
    }else if($("#tutorial_count").val() == 3){
      $("#adj_motion_area").slideDown(1000);
      $("#timer_area").slideDown(500);
      $("#next_btn").text('Next');
      $("#timer_title").text('Timer');
      $("#timer_details").text('Each speaker is given seven minutes. This timer allows all of the users in this round to see how much time a speaker has been speaking.');
    }else{
      $("#tutorial_area").slideUp(500);
      $("#adj_motion_area").slideDown(1000);
      $("#join_area").slideDown(1000);
    }
  });

  $("#confirm_btn").click(function (e) {
    $("#seconds_val").val(0);
    $("#join_area").fadeOut(500);
    $("#timer_area").slideDown(1000);
    $("#rndTimer").fadeIn(750);
    $("#ad_commands").fadeIn(750);
    var numSpeaker = $("#speaker_count").val();
    if(numSpeaker == "" || numSpeaker == 1){
      if($('#gov_first').hasClass('bg-light')) {
        $('#gov_first').removeClass('bg-light');
        $('#gov_first').addClass('bg-primary');
      }
      if($('#gov_first').hasClass('text-dark')) {
        $('#gov_first').removeClass('text-dark');
        $('#gov_first').addClass('text-light');
      }
    }else if(numSpeaker == 2){
      if($('#opp_first').hasClass('bg-light')) {
        $('#opp_first').removeClass('bg-light');
        $('#opp_first').addClass('bg-primary');
      }
      if($('#opp_first').hasClass('text-dark')) {
        $('#opp_first').removeClass('text-dark');
        $('#opp_first').addClass('text-light');
      }
    }else if(numSpeaker == 3){
      if($('#gov_second').hasClass('bg-light')) {
        $('#gov_second').removeClass('bg-light');
        $('#gov_second').addClass('bg-primary');
      }
      if($('#gov_second').hasClass('text-dark')) {
        $('#gov_second').removeClass('text-dark');
        $('#gov_second').addClass('text-light');
      }
    }else if(numSpeaker == 4){
      if($('#opp_second').hasClass('bg-light')) {
        $('#opp_second').removeClass('bg-light');
        $('#opp_second').addClass('bg-primary');
      }
      if($('#opp_second').hasClass('text-dark')) {
        $('#opp_second').removeClass('text-dark');
        $('#opp_second').addClass('text-light');
      }
    }else if(numSpeaker == 5){
      if($('#gov_third').hasClass('bg-light')) {
        $('#gov_third').removeClass('bg-light');
        $('#gov_third').addClass('bg-primary');
      }
      if($('#gov_third').hasClass('text-dark')) {
        $('#gov_third').removeClass('text-dark');
        $('#gov_third').addClass('text-light');
      }
    }else if(numSpeaker == 6){
      if($('#opp_third').hasClass('bg-light')) {
        $('#opp_third').removeClass('bg-light');
        $('#opp_third').addClass('bg-primary');
      }
      if($('#opp_third').hasClass('text-dark')) {
        $('#opp_third').removeClass('text-dark');
        $('#opp_third').addClass('text-light');
      }
    }
    var roundID = $("#roundID").val();
    socket.emit('joinRound', roundID);
  });

  $("#pause").click(function (e) {
    var roundID = $("#roundID").val();
    if($("#pause").hasClass('pause')){
      $("#pause").removeClass('pause');
      $("#pause").addClass('play');
      var seconds = $("#seconds_val").val();
      var timerdata = {roundID:roundID,seconds:seconds};
      socket.emit('stop', timerdata);
    }else{
      var seconds = $("#seconds_val").val();
      var timerdata = {roundID:roundID,seconds:seconds};
      $("#pause").removeClass('play');
      $("#pause").addClass('pause');
      socket.emit('start', timerdata);
    }
  });

  $("#next_speaker_btn").click(function (e) {
    var roundID = $("#roundID").val();
    var details = {numSpeaker:$("#speaker_count").val(), roundID:roundID};
    socket.emit('nextSpeaker', details);
  });

  $("#dash_adj_btn").click(async function (e) {
    resetClass();
    $("#timer_area").slideUp(500);
    $("#ad_commands").slideUp(500);
    $("#back_dash_area").fadeIn(3000);
    var roundID = $("#roundID").val();
    socket.emit('leaveRound', roundID);
  });

  $("#dash_deb_btn").click(async function (e) {
    resetClass();
    $("#timer_area").slideUp(500);
    $("#ad_commands").slideUp(500);
    $("#back_dash_area").fadeIn(3000);
    var roundID = $("#roundID").val();
    socket.emit('leaveRound', roundID);
  });

  $("#end_btn").click(async function (e) {
    var roundID = $("#roundID").val();
    socket.emit('endRound', roundID);
  });
});

socket.on('start', function(seconds){
  if(seconds < $("#seconds_val").val()){
    var higher = $("#seconds_val").val();
    var roundID = $("#roundID").val();
    var timerdata = {roundID:roundID,seconds:higher};
    alert('Timers are unsynchronized! Pausing to synchronize your timers.');
    socket.emit('stop', timerdata);
  }else{
    if($("#pause").hasClass('play')){
      $("#pause").removeClass('play');
      $("#pause").addClass('pause');
    }
    timer = setInterval( function(){
      if($("#seconds_val").val() > 409){
        if($("#timer_text").hasClass("text-primary")){
          $("#timer_text").removeClass("text-primary");
          $("#timer_text").addClass("text-danger");
        }
      }
      $("#seconds").text(pad(++seconds%60));
      $("#minutes").text(pad(parseInt(seconds/60,10)));
      $("#seconds_val").val(seconds);
      if($("#seconds_val").val() >= 420){
        clearInterval(timer);
        var roundID = $("#roundID").val();
        var details = {numSpeaker:$("#speaker_count").val(), roundID:roundID};
        socket.emit('nextSpeaker', details);
      }
    }, 1000);
  }
});

socket.on('stop', function(seconds){
  if($("#pause").hasClass('pause')){
    $("#pause").removeClass('pause');
    $("#pause").addClass('play');
  }
  if($("#timer_text").hasClass("text-danger")){
    $("#timer_text").removeClass("text-danger");
    $("#timer_text").removeClass("text-primary");
  }
  clearInterval(timer);
  $("#seconds_val").val(seconds);
  $("#seconds").text(pad(++seconds%60));
  $("#minutes").text(pad(parseInt(seconds/60,10)));
});

socket.on('nextSpeaker', function(numSpeaker){
  var roundID = $("#roundID").val();
  $("#seconds_val").val(0);
  if(numSpeaker == 1){
    if($("#opp_first_name").text() == 'No User'){
      if($("#gov_second_name").text() == 'No User'){
        if($("#opp_second_name").text() == 'No User'){
          if($("#gov_third_name").text() == 'No User'){
            if($("#opp_third_name").text() == 'No User'){
              resetClass();
              findNext(roundID, 6);
            }else{
              updateClass("gov_first", "opp_third");
              findNext(roundID, 5);
            }
          }else{
            updateClass("gov_first", "gov_third");
            findNext(roundID, 4);
          }
        }else{
          updateClass("gov_first", "opp_second");
          findNext(roundID, 3);
        }
      }else{
        updateClass("gov_first", "gov_second");
        findNext(roundID, 2);
      }
    }else{
      updateClass("gov_first", "opp_first");
      findNext(roundID, 1);
    }
  }else if(numSpeaker == 2){
    if($("#gov_second_name").text() == 'No User'){
      if($("#opp_second_name").text() == 'No User'){
        if($("#gov_third_name").text() == 'No User'){
          if($("#opp_third_name").text() == 'No User'){
            resetClass();
            findNext(roundID, 6);
          }else{
            updateClass("opp_first", "opp_third");
            findNext(roundID, 5);
          }
        }else{
          updateClass("opp_first", "gov_third");
          findNext(roundID, 4);
        }
      }else{
        updateClass("opp_first", "opp_second");
        findNext(roundID, 3);
      }
    }else{
      updateClass("opp_first", "gov_second");
      findNext(roundID, 2);
    }
  }else if(numSpeaker == 3){
    if($("#opp_second_name").text() == 'No User'){
      if($("#gov_third_name").text() == 'No User'){
        if($("#opp_third_name").text() == 'No User'){
          resetClass();
          findNext(roundID, 6);
        }else{
          updateClass("gov_second", "opp_third");
          findNext(roundID, 5);
        }
      }else{
        updateClass("gov_second", "gov_third");
        findNext(roundID, 4);
      }
    }else{
      updateClass("gov_second", "opp_second");
      findNext(roundID, 3);
    }
  }else if(numSpeaker == 4){
    if($("#gov_third_name").text() == 'No User'){
      if($("#opp_third_name").text() == 'No User'){
        resetClass();
        findNext(roundID, 6);
      }else{
        updateClass("opp_second", "opp_third");
        findNext(roundID, 5);
      }
    }else{
      updateClass("opp_second", "gov_third");
      findNext(roundID, 4);
    }
  }else if(numSpeaker == 5){
    if($("#opp_third_name").text() == 'No User'){
      resetClass();
      findNext(roundID, 6);
    }else{
      updateClass("gov_third", "opp_third");
      findNext(roundID, 5);
    }
  }else{
    var roundID = $("#roundID").val();
    socket.emit('endRound', roundID);
    resetClass();
    $("#timer_area").slideUp(500);
    $("#ad_commands").slideUp(500);
    $("#end_area").fadeIn(3000);
  }
});

socket.on('endRound', function(roundID){
  resetClass();
  $("#timer_area").slideUp(500);
  $("#ad_commands").slideUp(500);
  $("#end_area").fadeIn(3000);

  $.ajax({
      type:'PUT',
      url: '/ongoingRound/updateStatus/'+roundID,
      data: {status:'Grading'}
  }).done(function(response){
      console.log(response);
  }).fail(function(response){
      console.log("status not updated");
  });

  var roundID = $("#roundID").val();
  socket.emit('leaveRound', roundID);
});
