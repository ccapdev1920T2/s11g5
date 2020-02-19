/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.getElementById("roundtimer");
var full = false;
$("#fullscreen").click( () => {
    if (!full){
        openFullscreen();
        $("#fsBtn").removeClass("fa-expand");
        $("#fsBtn").addClass("fa-compress");
    }
    else { 
        closeFullscreen();
        $("#fsBtn").removeClass("fa-compress");
        $("#fsBtn").addClass("fa-expand");
    }
    full = !full;
});

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