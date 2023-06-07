const postBlogUrl = "https://sl9hw1cqw3.execute-api.us-east-1.amazonaws.com/prod/presigned";

document.getElementById("postBlogSubmitButton").onclick = function() {

	let text = $('#postText').val();

	if (text == "") {
		return;
	}
	
	//generate a string from date and time in milliseconds
	//used to create a unique prefix for each post
	let d = new Date();
	let t = d.getTime().toString();

	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	
	var raw = JSON.stringify({
	  "text": text,
	  "prefix": t
	});
	
	var requestOptions = {
	  method: 'POST',
	  headers: myHeaders,
	  body: raw,
	  redirect: 'follow'
	};
	
	fetch(postBlogUrl, requestOptions)
	  .then(response => response.json())
	  .then(result => {
		speechmarksUrl = result["output"][0];
		console.log(speechmarksUrl);
		speechUrl = result["output"][1];
		console.log(speechUrl);
		getSpeechmarks(speechmarksUrl);
		doSpeech(speechUrl);
	  })
	  .catch(error => console.log('error', error.message));
}

function doSpeech(speechUrl) {
	//play the audio from url

	let playStatus = document.getElementById('playStatus');
	playStatus.textContent = "Fetching audio...";
	playStatus.style.display = "block";

	let divAudio 		= document.getElementById("audio");
	let createA 		= document.createElement('audio');
	createA.id       	= 'audio-player';
	createA.controls 	= 'controls';
	createA.autoplay	= true;
	createA.setAttribute('controlsList', 'nodownload');
	createA.setAttribute('oncontextmenu', 'return false;');
	createA.addEventListener('ended', (event) => {
		createA.remove();
	});

	createA.addEventListener('play', () => {
		//set speechmark timers to sync with the pressing of play button
		setTimers();
	});

	createA.src      	= speechUrl;
	createA.type     	= 'audio/mpeg';
	//createA.classList.add("image-center");
	divAudio.appendChild(createA);
	playStatus.style.display = "none";	
}

function getSpeechmarks(speechmarksUrl) {
	let myHeaders = new Headers();
	myHeaders.append("Accept", "text/plain");
	myHeaders.append("Content-Type", "text/plain");

	let requestOptions = {
		method: 'GET',
		//headers: myHeaders,
		redirect: 'follow'
		};
		
	fetch(speechmarksUrl, requestOptions)
		.then(response => response.text())
		.then(result => {
			sessionStorage.setItem("speechmarks", result);
		})
		.catch(error => console.log('error', error));	
}

function highlighter(start, finish, word) {
	let textarea = document.getElementById("postText");
	//console.log(start + "," + finish + "," + word);
	textarea.focus();
	textarea.setSelectionRange(start, finish);
}

function setTimers() {
	let speechmarksStr = sessionStorage.getItem("speechmarks");
    //read through the speechmarks file and set timers for every word
	console.log(speechmarksStr);
	let speechmarks = speechmarksStr.split("\n");
    for (let i = 0; i < speechmarks.length; i++) {
		//console.log(i + ":" + speechmarks[i]);
		if (speechmarks[i].length == 0) {
			continue;
		}
		smjson = JSON.parse(speechmarks[i]);
		t = smjson["time"];
		s = smjson["start"];
		f = smjson["end"];
		word = smjson["value"];
        setTimeout(highlighter, t, s, f, word);
    }
}