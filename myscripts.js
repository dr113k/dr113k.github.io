
document.addEventListener('mousedown', mousedown, false);
document.addEventListener('mouseup', mouseup, false);
document.addEventListener('mousemove', mousemove, false);
window.ondragstart = function() { return false; } 
var SeResult;
var endoflist = false;
var XSecPoss,XFirstPoss,Speed;
var Iscroll;
var searchStr = "";
var MouseDownNow = false;
const maxSize = 400;
const apiSearchPrefix = "https://www.googleapis.com/youtube/v3/search?maxResults=20&part=snippet&key=AIzaSyB8iFzdNo8E2OuiJeIhHPSXpbh3psn8mvQ&q="
const apiStatisticPrefix = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&key=AIzaSyB8iFzdNo8E2OuiJeIhHPSXpbh3psn8mvQ&id="
const youtubePrefix = "https://www.youtube.com/watch?v="
var Elsize = 400;
var VdArr = [];
const dopspeed = 1;

function SizeChange()
{
 //изменение размера     
	var newSize = document.getElementById('body').clientWidth;      			
	var sizeCurrection = (newSize -((Math.floor(newSize/maxSize) + 1)*maxSize)) / (Math.floor(newSize/maxSize) + 1);				
	for (var i = 0; i < VdArr.length; i++)						
	{
		VdArr[i].style.width = ((maxSize + sizeCurrection - 20)+'px');
	}
	Elsize = maxSize + sizeCurrection;
	Iscroll.scrollLeft = (Math.floor((Iscroll.scrollLeft+2)/Elsize))*Elsize;
}

function SpeedProceed()
{
	if ((!(MouseDownNow))&&(Math.abs(Speed) > 1))
	{
		Iscroll.scrollLeft =Iscroll.scrollLeft+ Speed;
		if (Speed > 0)
		{
			Speed =Speed- dopspeed;
		}
		else 
		{
			Speed =Speed+ dopspeed;
		}
		setTimeout(function() {SpeedProceed();}, 10)
	}
	else
	{
		if (Math.abs(Speed) <= 1)
		{
			PossAdder();
		}
	}
	//прогрузка след 20
	var WindowSize = document.getElementById('body').clientWidth;
	if ((Iscroll.scrollLeft+WindowSize+5 > VideoList.clientWidth) && !(endoflist))
	{
		endoflist = true;
		Speed = 0;
		searchNextVideoList();
	}
	if (Iscroll.scrollLeft+WindowSize < VideoList.clientWidth - maxSize*2)
	{
		endoflist = false;
	}
}
function mousedown(evt)
{
	MouseDownNow = true;
}

function mousemove(evt)
{
	XSecPoss =  evt.screenX;
	if (MouseDownNow )
	{
		Iscroll.scrollLeft =Iscroll.scrollLeft+ XFirstPoss-XSecPoss;
		Speed = XFirstPoss-XSecPoss;
	}
	XFirstPoss=  evt.screenX;
	
}

function mouseup(evt)
{
	MouseDownNow = false;
	SpeedProceed();
}


function listClear()
{
	VideoList = document.getElementById('VideoList');
	VdArr.forEach(function(entry) 
	{
    	VideoList.removeChild(entry);
	});
	VdArr = [];
}





function PossAdder()//автодоводка
{
	var startX = Iscroll.scrollLeft % Elsize 
	if(startX > (Elsize / 2))					
	{
		var needX = Elsize - startX;
	}
	else
	{
		var needX = -startX;
	}
	if (needX < 0)
	{
		Speed = -dopspeed*( Math.sqrt(Math.abs((needX*dopspeed))));
	}
	else
	{
		Speed = dopspeed* (Math.sqrt(Math.abs((needX*dopspeed))));
	}
	setTimeout(function() {SpeedProceed();}, 10)
}

function searchFirstVideoList()
{
	listClear()
	searchStr = document.getElementById('keywords').value
	if(searchStr.length == 0)
	{
		alert('Пусто');
	}
	else
	{
		searchStr = searchStr.replace(/\s/g,'+');
		var xhr = new XMLHttpRequest();
		xhr.open("GET", apiSearchPrefix + searchStr, false); 
		xhr.send();
    	SeResult = JSON.parse(xhr.responseText);
		loadingResults();
	}
}
function searchNextVideoList()
{//след 20
	var xhr = new XMLHttpRequest();
	xhr.open("GET", apiSearchPrefix + searchStr+ "&pageToken="+SeResult.nextPageToken, false); 
	xhr.send();
	SeResult = JSON.parse(xhr.responseText)
	loadingResults();
}



function loadingResults()
{
	Iscroll = document.getElementById('scrollId');
	VideoList = document.getElementById('VideoList');
	for (var i = 0; i < SeResult.items.length; i++)
	{
		if (!(SeResult.items[i].id.videoId == null)){  // видео без videoId
		var element = document.createElement('div');	
    	element.className = 'VidoElement';
    	VideoList.appendChild(element);
    	VdArr.push(element); 	
		var h1 = document.createElement('h1');		//название 
 		var t = document.createTextNode("Название: "+SeResult.items[i].snippet.title);
 		h1.appendChild(t);
    	element.appendChild(h1);	
		
    	var a = document.createElement('a');		
    	a.setAttribute("href", youtubePrefix + SeResult.items[i].id.videoId);
    	a.setAttribute("target", "_blank");
    	element.appendChild(a);	
    	var img = document.createElement('img');  	
    	img.setAttribute("src",SeResult.items[i].snippet.thumbnails.high.url);
    	a.appendChild(img);

 										

    	var h2 = document.createElement('h2');		//название канала
 		var t = document.createTextNode("Канал: "+SeResult.items[i].snippet.channelTitle);
 		h2.appendChild(t);
    	element.appendChild(h2);

   		var xhr = new XMLHttpRequest();
		xhr.open("GET", apiStatisticPrefix + SeResult.items[i].id.videoId, false); // длительности
		xhr.send();
		var statResult = JSON.parse(xhr.responseText);
		var durationStr = statResult.items[0].contentDetails.duration;
		durationStr = durationStr.replace(/PT/g,'');
		durationStr = durationStr.replace(/H/g,':')
		durationStr = durationStr.replace(/M/g,':');
		durationStr = durationStr.replace(/S/g,'');	
		var p = document.createElement('h3');		//время
 		var t = document.createTextNode("Продолжительность: "+durationStr);
 		p.appendChild(t);
    	element.appendChild(p);	

    	var p = document.createElement('p');		//Описание
 		var t = document.createTextNode("Описание: "+SeResult.items[i].snippet.description);
 		p.appendChild(t);
    	element.appendChild(p);	
    	}
	}
	SizeChange();
	Speed = 0;
}