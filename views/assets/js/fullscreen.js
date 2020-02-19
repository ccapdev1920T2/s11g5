/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.getElementById("roundtimer");
var full = false;
$("#fullscreen").click( () => {
    if (!full){
        openFullscreen();
        $("#timer").attr("width", "750");
        $("#fsBtn").removeClass("fa-expand");
        $("#fsBtn").addClass("fa-compress");
    }
    else {
        closeFullscreen();
    }
    full = !full;
});

if (document.addEventListener)
{
 document.addEventListener('fullscreenchange', exitHandler, false);
 document.addEventListener('mozfullscreenchange', exitHandler, false);
 document.addEventListener('MSFullscreenChange', exitHandler, false);
 document.addEventListener('webkitfullscreenchange', exitHandler, false);
}

function exitHandler()
{
 if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement !== null)
 {
  // Run code on exit
  $("#timer").attr("width", "300");
  $("#fsBtn").removeClass("fa-compress");
  $("#fsBtn").addClass("fa-expand");
  console.log("fs exit");
 }
}

/* View in fullscreen */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
}
