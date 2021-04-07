$(document).ready( function () {
  $("#specifics_area").hide();
  $("#specifics_first").hide();
  $("#specifics_second").hide();
  $("#specifics_third").hide();
  $("#specifics_fourth").hide();
  $("#final_buttons").hide();

  $("#next_wel_btn").click(function (e) {
    $("#welcome_area").slideUp(500);
    $("#specifics_area").slideDown(250);
    $("#specifics_first").slideDown(500);
    $("#specifics_second").slideDown(750);
    $("#specifics_third").slideDown(1000);
    $("#specifics_fourth").slideDown(1250);
    $("#welcome_count").val(0);
  });

  $("#next_tut_btn").click(function (e) {
    if ($("#welcome_count").val() == "")
        $("#welcome_count").val(1);
    else {
        var count = parseInt($("#welcome_count").val()) + 1;
        $("#welcome_count").val(count);
    }
    if($("#welcome_count").val() == 1){
      $('#wel_photo').css("background-image", 'url(assets/img/tutorial/sidebarSecond.jpg)');
      $("#specifics_title").text('First up, the Sidebar!');
      $("#specifics_description").text('The sidebar contains various tabs leading to different pages.');
      //
      $("#specifics_first_icon").removeClass().addClass('fa');
      $("#specifics_first_icon").addClass('fa-area-chart');
      $("#specifics_first_details").text('Round Stats - For any of your concluded rounds, get the round ID and enter them in this tab so you can see the statistics of that round.');
      //
      $("#specifics_second_icon").removeClass().addClass('fa');
      $("#specifics_second_icon").addClass('fa-table');
      $("#specifics_second_details").text('Round History - To see a list of your previous rounds, head on over to this tab to find all of them.');
      //
      $("#specifics_third_icon").removeClass().addClass('fas');
      $("#specifics_third_icon").addClass('fa-users');
      $("#specifics_third_details").text('Teams - This is your Teams Dashboard. In here, you\'ll be able to find all of your teams and create and edit them.');
      //
      $("#specifics_fourth_icon").removeClass().addClass('fas');
      $("#specifics_fourth_icon").addClass('fa-wrench');
      $("#specifics_fourth_details").text('Profile Settings - To change anything about your personal information, you can edit and save these changes under this tab.');
    }else if($("#welcome_count").val() == 2){
      $("#specifics_third").slideUp(500);
      $("#specifics_fourth").slideUp(500);
      //
      $('#wel_photo').css("background-image", 'url(assets/img/tutorial/updatesDash.jpg)');
      $("#specifics_title").text('Next up, the Notification Tab!');
      $("#specifics_description").text('The Notification Tab contains various tabs leading to different pages.');
      //
      $("#specifics_first_icon").removeClass().addClass('fas');
      $("#specifics_first_icon").addClass('fa-envelope');
      $("#specifics_first_icon").addClass('fa-fw');
      $("#specifics_first_details").text('Join Round - If you receive any invites to debate rounds, they will appear here.');
      //
      $("#specifics_second_icon").removeClass().addClass('fas');
      $("#specifics_second_icon").addClass('fa-users');
      $("#specifics_second_details").text('Team Updates - If there are any updates within your team such as change of team name or change of members, they will appear here.');
    }else if($("#welcome_count").val() == 3){
      $('#wel_photo').css("background-image", 'url(assets/img/tutorial/profileDash.jpg)');
      $("#specifics_title").text('Next up, the User Menu!');
      $("#specifics_description").text('The User Menu contains various tabs leading to different pages.');
      //
      $("#specifics_first_icon").removeClass().addClass('fas');
      $("#specifics_first_icon").addClass('fa-tachometer-alt');
      $("#specifics_first_details").text('Dashboard - This is your profile page. You\'ll find some information such as the number of debates you\'ve won and lost.');
      //
      $("#specifics_second_icon").removeClass().addClass('fas');
      $("#specifics_second_icon").addClass('fa-wrench');
      $("#specifics_second_details").text('Profile Settings - To change anything about your personal information, you can edit and save these changes under this tab.');
      //
      $("#specifics_third_icon").removeClass().addClass('fas');
      $("#specifics_third_icon").addClass('fa-book');
      $("#specifics_third_details").text('Tutorial - If you need a refresher on where everything is, you can come back to this tutorial by clicking on Tutorial.');
      //
      $("#specifics_fourth_icon").removeClass().addClass('fas');
      $("#specifics_fourth_icon").addClass('fa-sign-out-alt');
      $("#specifics_fourth_details").text('Logout - When you need to log out of your account, you can click on Logout.');
      //
      $("#specifics_third").slideDown(750);
      $("#specifics_fourth").slideDown(750);
    }else if($("#welcome_count").val() == 4){
      $('#wel_photo').css("background-image", 'url(assets/img/tutorial/dashOptions.jpg)');
      $("#specifics_title").text('Next up, the Dashboard!');
      $("#specifics_description").text('The Dashboard contains various information regarding your performance as well as tabs leading to different pages.');
      //
      $("#specifics_first_icon").removeClass().addClass('fa');
      $("#specifics_first_icon").addClass('fa-plus');
      $("#specifics_first_details").text('Create a Round - When you want to create your own round, this is where you head to.');
      //
      $("#specifics_second_icon").removeClass().addClass('fa');
      $("#specifics_second_icon").addClass('fa-envelope-open-o');
      $("#specifics_second_details").text('Join a Round - If any of your teams are invited to join rounds, here is where you\'ll find them, as well as ongoing rounds.');
      //
      $("#specifics_third_icon").removeClass().addClass('fa');
      $("#specifics_third_icon").addClass('fa-area-chart');
      $("#specifics_third_details").text('Round Stats - For any of your concluded rounds, get the round ID and enter them in this tab so you can see the statistics of that round.');
      //
      $("#specifics_fourth_icon").removeClass().addClass('fa');
      $("#specifics_fourth_icon").addClass('fa-table');
      $("#specifics_fourth_details").text('Round History - To see a list of your previous rounds, head on over to this tab to find all of them.');
    }else if($("#welcome_count").val() == 5){
      $('#wel_photo').css("background-image", 'url(assets/img/tutorial/teamsDash.jpg)');
      $("#specifics_title").text('Lastly, the Teams Dashboard!');
      $("#specifics_description").text('When you click on the Teams tab, you would be led to this page. The Teams Dashboard contains various tabs leading to different pages.');
      //
      $("#specifics_first_icon").removeClass().addClass('fa');
      $("#specifics_first_icon").addClass('fa-plus');
      $("#specifics_first_details").text('Create a Team - If you want to create a brand new team with other registered users, go ahead and click on the Create a Team.');
      //
      $("#specifics_second_icon").removeClass().addClass('fa');
      $("#specifics_second_icon").addClass('fa-users');
      $("#specifics_second_details").text('My Teams - If you want to see a full list of all of the teams you\'re part of, you can head on over to My Teams.');
      //
      $("#specifics_third_icon").removeClass().addClass('fa');
      $("#specifics_third_icon").addClass('fa-address-card-o');
      $("#specifics_third_details").text('Team Updates - If there are any updates within your team such as change of team name or change of members, they will appear here.');
      //
      $("#specifics_fourth_icon").removeClass().addClass('fa');
      $("#specifics_fourth_icon").addClass('fa-address-book-o');
      $("#specifics_fourth_details").text('Edit a Team - If there are any changes that you would want to do to your team, you can edit your team and save these changes under Edit a Team.');
    }else{
      var full_name = $("#full_name").val();
      $("#welcome_title").text('And that\'s it!');
      $("#welcome_message").text('Once again, Welcome to Tabcore, '+full_name+'!');
      $("#welcome_buttons").hide();
      $("#specifics_area").slideUp(500);
      $("#welcome_area").slideDown(1000);
      $("#final_buttons").slideDown(1250);
    }
  });

  $("#back_tut_btn").click(function (e) {
    if ($("#welcome_count").val() == "")
        $("#welcome_count").val(1);
    else {
        var count = parseInt($("#welcome_count").val()) - 1;
        $("#welcome_count").val(count);
    }
    if($("#welcome_count").val() < 0){
      var full_name = $("#full_name").val();
      $("#specifics_area").slideUp(500);
      $("#specifics_first").hide();
      $("#specifics_second").hide();
      $("#specifics_third").hide();
      $("#specifics_fourth").hide();
      $("#final_buttons").hide();
      $("#welcome_title").text('Welcome to Tabcore, '+full_name+'!');
      $("#welcome_message").text('To get you started, we\'ll go through some features.');
      $("#specifics_fourth").slideUp(250);
      $("#specifics_third").slideUp(500);
      $("#specifics_second").slideUp(750);
      $("#specifics_first").slideUp(100);
      $("#specifics_area").slideUp(1250);
      $("#welcome_area").slideDown(1500);
      $("#welcome_buttons").slideDown(1750);
      $("#welcome_count").val(1);
    }else if($("#welcome_count").val() == 0){
      $('#wel_photo').css("background-image", 'url(assets/img/tutorial/sidebarFirst.jpg)');
      $("#specifics_title").text('First up, the Sidebar!');
      $("#specifics_description").text('The sidebar contains various tabs leading to different pages.');
      //
      $("#specifics_first_icon").removeClass().addClass('fas');
      $("#specifics_first_icon").addClass('fa-tachometer-alt');
      $("#specifics_first_details").text('Dashboard - This is your profile page. You\'ll find some information such as the number of debates you\'ve won and lost.');
      //
      $("#specifics_second_icon").removeClass().addClass('fa');
      $("#specifics_second_icon").addClass('fa-plus-circle');
      $("#specifics_second_details").text('Create a Round - When you want to create your own round, this is where you head to.');
      //
      $("#specifics_third_icon").removeClass().addClass('fa');
      $("#specifics_third_icon").addClass('fa-envelope-open-o');
      $("#specifics_third_details").text('Join a Round - If any of your teams are invited to join rounds, here is where you\'ll find them, as well as ongoing rounds.');
      //
      $("#specifics_fourth_icon").removeClass().addClass('fa');
      $("#specifics_fourth_icon").addClass('fa-edit');
      $("#specifics_fourth_details").text('Grade a Round - If you\'re an adjudicator for a round, you can head on over to this tab when the round ends in order to grade everyone.');
    }else if($("#welcome_count").val() == 1){
      $('#wel_photo').css("background-image", 'url(assets/img/tutorial/sidebarSecond.jpg)');
      $("#specifics_title").text('First up, the Sidebar!');
      $("#specifics_description").text('The sidebar contains various tabs leading to different pages.');
      //
      $("#specifics_first_icon").removeClass().addClass('fa');
      $("#specifics_first_icon").addClass('fa-area-chart');
      $("#specifics_first_details").text('Round Stats - For any of your concluded rounds, get the round ID and enter them in this tab so you can see the statistics of that round.');
      //
      $("#specifics_second_icon").removeClass().addClass('fa');
      $("#specifics_second_icon").addClass('fa-table');
      $("#specifics_second_details").text('Round History - To see a list of your previous rounds, head on over to this tab to find all of them.');
      //
      $("#specifics_third_icon").removeClass().addClass('fas');
      $("#specifics_third_icon").addClass('fa-users');
      $("#specifics_third_details").text('Teams - This is your Teams Dashboard. In here, you\'ll be able to find all of your teams and create and edit them.');
      //
      $("#specifics_fourth_icon").removeClass().addClass('fas');
      $("#specifics_fourth_icon").addClass('fa-wrench');
      $("#specifics_fourth_details").text('Profile Settings - To change anything about your personal information, you can edit and save these changes under this tab.');
      $("#specifics_third").slideDown(750);
      $("#specifics_fourth").slideDown(750);
    }else if($("#welcome_count").val() == 2){
      $("#specifics_third").slideUp(500);
      $("#specifics_fourth").slideUp(500);
      $('#wel_photo').css("background-image", 'url(assets/img/tutorial/updatesDash.jpg)');
      $("#specifics_title").text('Next up, the Notification Tab!');
      $("#specifics_description").text('The Notification Tab contains various tabs leading to different pages.');
      //
      $("#specifics_first_icon").removeClass().addClass('fas');
      $("#specifics_first_icon").addClass('fa-envelope');
      $("#specifics_first_icon").addClass('fa-fw');
      $("#specifics_first_details").text('Join Round - If you receive any invites to debate rounds, they will appear here.');
      //
      $("#specifics_second_icon").removeClass().addClass('fas');
      $("#specifics_second_icon").addClass('fa-users');
      $("#specifics_second_details").text('Team Updates - If there are any updates within your team such as change of team name or change of members, they will appear here.');
    }else if($("#welcome_count").val() == 3){
      $('#wel_photo').css("background-image", 'url(assets/img/tutorial/profileDash.jpg)');
      $("#specifics_title").text('Next up, the User Menu!');
      $("#specifics_description").text('The User Menu contains various tabs leading to different pages.');
      //
      $("#specifics_first_icon").removeClass().addClass('fas');
      $("#specifics_first_icon").addClass('fa-tachometer-alt');
      $("#specifics_first_details").text('Dashboard - This is your profile page. You\'ll find some information such as the number of debates you\'ve won and lost.');
      //
      $("#specifics_second_icon").removeClass().addClass('fas');
      $("#specifics_second_icon").addClass('fa-wrench');
      $("#specifics_second_details").text('Profile Settings - To change anything about your personal information, you can edit and save these changes under this tab.');
      //
      $("#specifics_third_icon").removeClass().addClass('fas');
      $("#specifics_third_icon").addClass('fa-book');
      $("#specifics_third_details").text('Tutorial - If you need a refresher on where everything is, you can come back to this tutorial by clicking on Tutorial.');
      //
      $("#specifics_fourth_icon").removeClass().addClass('fas');
      $("#specifics_fourth_icon").addClass('fa-sign-out-alt');
      $("#specifics_fourth_details").text('Logout - When you need to log out of your account, you can click on Logout.');
    }else if($("#welcome_count").val() == 4){
      $('#wel_photo').css("background-image", 'url(assets/img/tutorial/dashOptions.jpg)');
      $("#specifics_title").text('Next up, the Dashboard!');
      $("#specifics_description").text('The Dashboard contains various information regarding your performance as well as tabs leading to different pages.');
      //
      $("#specifics_first_icon").removeClass().addClass('fa');
      $("#specifics_first_icon").addClass('fa-plus');
      $("#specifics_first_details").text('Create a Round - When you want to create your own round, this is where you head to.');
      //
      $("#specifics_second_icon").removeClass().addClass('fa');
      $("#specifics_second_icon").addClass('fa-envelope-open-o');
      $("#specifics_second_details").text('Join a Round - If any of your teams are invited to join rounds, here is where you\'ll find them, as well as ongoing rounds.');
      //
      $("#specifics_third_icon").removeClass().addClass('fa');
      $("#specifics_third_icon").addClass('fa-area-chart');
      $("#specifics_third_details").text('Round Stats - For any of your concluded rounds, get the round ID and enter them in this tab so you can see the statistics of that round.');
      //
      $("#specifics_fourth_icon").removeClass().addClass('fa');
      $("#specifics_fourth_icon").addClass('fa-table');
      $("#specifics_fourth_details").text('Round History - To see a list of your previous rounds, head on over to this tab to find all of them.');
    }else{
      $("#welcome_count").val(5);
      $('#wel_photo').css("background-image", 'url(assets/img/tutorial/teamsDash.jpg)');
      $("#specifics_title").text('Lastly, the Teams Dashboard!');
      $("#specifics_description").text('When you click on the Teams tab, you would be led to this page. The Teams Dashboard contains various tabs leading to different pages.');
      //
      $("#specifics_first_icon").removeClass().addClass('fa');
      $("#specifics_first_icon").addClass('fa-plus');
      $("#specifics_first_details").text('Create a Team - If you want to create a brand new team with other registered users, go ahead and click on the Create a Team.');
      //
      $("#specifics_second_icon").removeClass().addClass('fa');
      $("#specifics_second_icon").addClass('fa-users');
      $("#specifics_second_details").text('My Teams - If you want to see a full list of all of the teams you\'re part of, you can head on over to My Teams.');
      //
      $("#specifics_third_icon").removeClass().addClass('fa');
      $("#specifics_third_icon").addClass('fa-address-card-o');
      $("#specifics_third_details").text('Team Updates - If there are any updates within your team such as change of team name or change of members, they will appear here.');
      //
      $("#specifics_fourth_icon").removeClass().addClass('fa');
      $("#specifics_fourth_icon").addClass('fa-address-book-o');
      $("#specifics_fourth_details").text('Edit a Team - If there are any changes that you would want to do to your team, you can edit your team and save these changes under Edit a Team.');
    }
  });

  $("#back_wel_btn").click(function (e) {
    $("#welcome_count").val(5);
    $('#wel_photo').css("background-image", 'url(assets/img/tutorial/teamsDash.jpg)');
    $("#specifics_title").text('Lastly, the Teams Dashboard!');
    $("#specifics_description").text('When you click on the Teams tab, you would be led to this page. The Teams Dashboard contains various tabs leading to different pages.');
    //
    $("#specifics_first_icon").removeClass().addClass('fa');
    $("#specifics_first_icon").addClass('fa-plus');
    $("#specifics_first_details").text('Create a Team - If you want to create a brand new team with other registered users, go ahead and click on the Create a Team.');
    //
    $("#specifics_second_icon").removeClass().addClass('fa');
    $("#specifics_second_icon").addClass('fa-users');
    $("#specifics_second_details").text('My Teams - If you want to see a full list of all of the teams you\'re part of, you can head on over to My Teams.');
    //
    $("#specifics_third_icon").removeClass().addClass('fa');
    $("#specifics_third_icon").addClass('fa-address-card-o');
    $("#specifics_third_details").text('Team Updates - If there are any updates within your team such as change of team name or change of members, they will appear here.');
    //
    $("#specifics_fourth_icon").removeClass().addClass('fa');
    $("#specifics_fourth_icon").addClass('fa-address-book-o');
    $("#specifics_fourth_details").text('Edit a Team - If there are any changes that you would want to do to your team, you can edit your team and save these changes under Edit a Team.');
    $("#final_buttons").slideUp(250);
    $("#welcome_area").slideUp(500);
    $("#specifics_area").slideDown(750);
    $("#specifics_first").slideDown(1000);
    $("#specifics_second").slideDown(1250);
    $("#specifics_third").slideDown(1500);
    $("#specifics_fourth").slideDown(1750);
  });

  $("#skip_tut_btn").click(function (e) {
    var full_name = $("#full_name").val();
    $("#welcome_title").text('And that\'s it!');
    $("#welcome_message").text('Once again, Welcome to Tabcore, '+full_name+'!');
    $("#welcome_buttons").hide();
    $("#specifics_area").slideUp(500);
    $("#welcome_area").slideDown(1000);
    $("#final_buttons").slideDown(1250);
  });

});
