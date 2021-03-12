$(document).ready(function () {

  $('#find').prop('disabled', true);
  $('#roundID').keyup(function () {
    var roundID = $('#roundID').val();
    if(!validator.isEmpty(roundID)){
      if(!validator.isAlphanumeric(roundID)){
        $('#roundID').css('border', '1px solid #d66');
        $('#invalid_round').text('Invalid Round ID');
        $('#find').prop('disabled', true);
      }else{
        $('#roundID').css('border', '1px solid #cccccc');
        $('#invalid_round').text('');
        $('#find').prop('disabled', false);
      }
    }else{
      $('#roundID').css('border', '1px solid #cccccc');
      $('#invalid_round').text('');
      $('#login_btn').prop('disabled', true);
    }
  });
});
