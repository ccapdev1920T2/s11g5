var defaults = {}
  , one_second = 1000
  , one_minute = one_second * 60
  , seven = one_second * 100
  , startDate = new Date()
  , statusElem = document.getElementById('status')
  , face = document.getElementById('lazy');

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
var requestAnimationFrame = (function() {
  return window.requestAnimationFrame       ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame    ||
         window.oRequestAnimationFrame      ||
         window.msRequestAnimationFrame     ||
         function( callback ){
           window.setTimeout(callback, 1000 / 60);
         };
}());

tick();

function tick() {

  var now = new Date()
    , elapsed = now - startDate
    , parts = [];

  if (elapsed > seven){
    statusElem.innerText = 'Time\'s Up';
    return;
  }
  else if (elapsed <= one_minute || elapsed >= one_minute * 6 )
    statusElem.innerText = 'POIS unavailable';
  else
    statusElem.innerText = 'POIs available';

  parts[0] = '' + Math.floor( (elapsed % seven) / one_minute );
  parts[1] = '' + Math.floor( ( (elapsed % seven) % one_minute ) / one_second );

  parts[0] = (parts[0].length == 1) ? '0' + parts[0] : parts[0];
  parts[1] = (parts[1].length == 1) ? '0' + parts[1] : parts[1];

  face.innerText = parts.join(':');

  requestAnimationFrame(tick);

}
