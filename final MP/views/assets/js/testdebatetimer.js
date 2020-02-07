var socket = io();

//output stuff
let progressBar = document.querySelector('.e-c-progress');
let indicator = document.getElementById('e-indicator');
let pointer = document.getElementById('e-pointer');
let oneMin = document.getElementById('e-1min');
let sixMin = document.getElementById('e-6min');
let length = Math.PI * 2 * 100;
let toggleColor;
const nopoi = "#4e73df";
const poi = "#1cc88a";
const timeup = "red";
const almost = "#f6c23e";

progressBar.style.strokeDasharray = length;

function update(value, timePercent) {
	let percent = ( value >= timePercent )  ? 1 : value/timePercent;
	var offset = length * (1-percent);
	progressBar.style.strokeDashoffset = offset;
	pointer.style.transform = `rotate(${360 * percent}deg)`;

	toggleColor = (value < 60) ? nopoi : poi;
	toggleColor = (value >= 420-60) ? almost : toggleColor;

	if (value >= 60 )
		oneMin.style.opacity = 0;
	else
		oneMin.style.opacity = 1;

	if (value >= 420-60 )
		sixMin.style.opacity = 0;
	else
		sixMin.style.opacity = 1;

	if (percent == 1)
		blink();
	else
		setColors();
};

function blink(){
	displayOutput.style.opacity = 1;
	toggleColor = timeup;
	setColors();
	progressBar.style.opacity = progressBar.style.opacity == 1 ? 0 : 1;
}

function setColors(){
	progressBar.style.stroke = toggleColor;
	pointer.style.stroke = toggleColor;
	displayOutput.style.color = toggleColor;
}

function displayTime (timePassed){ //displays time on the input
  let minutes = Math.floor(timePassed / 60);
  let seconds = timePassed % 60;
  let displayString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  displayOutput.textContent = displayString;
  update(timePassed, wholeTime);
}
//end of output stuff


//stopwatch stuff
const displayOutput = document.querySelector('.display-remain-time')
const pauseBtn = document.getElementById('pause');
const setterBtns = document.querySelectorAll('button[data-setter]');

let intervalWatch;
let elapsed;
let wholeTime = 7 * 60; // manage this to set the whole time
let started = false;
let triggerdate;

let outdate = null;
function tick(){
	let now = new Date();
	outdate = new Date(elapsed + now.getTime() - triggerdate.getTime());
	displayTime(outdate.getMinutes() * 60 + outdate.getSeconds());
}

function pauseTimer () {
	elapsed = (outdate) ? outdate.getTime() : 0;
	// elapsed = (0*60 + 55) * 1000;
	triggerdate = new Date();

	if (started){
		clearInterval(intervalWatch);
		interval = null;
		started = false;
		pauseBtn.classList.remove('pause');
		pauseBtn.classList.add('play');
	}
	else {
		intervalWatch = setInterval( tick, 500 );
		started = true;
		pauseBtn.classList.remove('play');
		pauseBtn.classList.add('pause');
	}
}
//end of stopwatch stuff


//start of event listeners
pauseBtn.addEventListener('click', click);

function click(){
	socket.emit('timer event', {'elapsed':elapsed, 'started':started});
}

socket.on('timer event', function(timerdata){
	elapsed, paused = timerdata['elapsed'], timerdata['paused'];
	pauseTimer();
	// elapsed, started = timerdata['elapsed'], timerdata['started'];
});

console.log(document.getElementById('timer').getAttribute('width'));

//end of event listeners
oneMin.style.transform = 'rotate(51.42deg)';
sixMin.style.transform = 'rotate(308.57deg)';
$('#currentspeaker').text(" Pending...");
displayTime(0);
