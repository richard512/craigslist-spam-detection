// ==UserScript==
// @name         craigslist spam detector
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  detects spam in craigslist photos
// @author       https://github.com/richard512
// @match        https://*.craigslist.org/search/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// @require      https://github.com/antimatter15/ocrad.js/blob/master/ocrad.js?raw=true
// ==/UserScript==

function loadScript(url, callback)
{
	// Adding the script tag to the head as suggested before
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;


	// Then bind the event to the callback function.
	// There are several events for cross browser compatibility.
	script.onreadystatechange = callback;
	script.onload = callback;

	// Fire the loading
	head.appendChild(script);
}

function runvibrant(){
	GM_xmlhttpRequest({
		method: "GET",
		url: 'https://images.craigslist.org/00Z0Z_2FxbFilOyvk_300x300.jpg',
		responseType: 'arraybuffer',
		data: null,            
		onload: function(response) {
			console.log('got response.responseText');
			console.log("2> "+ this.response);
			//  console.log("2b> "+ xhr.responseText);

			var uInt8Array = new Uint8Array(this.response);
			var i = uInt8Array.length;
			var biStr = new Array(i);
			while (i--)
			{ biStr[i] = String.fromCharCode(uInt8Array[i]);
			}
			var data = biStr.join('');
			var base64 = window.btoa(data);

			console.log("3> "+ base64);

			dataURL = "data:image/png;base64,"+base64
			$("img:eq(0)").attr("src", dataURL);

			console.log('making image');
			var img = document.createElement('img');
			img.crossOrigin = "Anonymous";


			img.setAttribute('src', dataURL);

			img.addEventListener('load', function() {
				console.log('loaded image')
				var vibrant = new Vibrant(img);
				var swatches = vibrant.swatches()
				for (var swatch in swatches) {
					if (swatches.hasOwnProperty(swatch) && swatches[swatch]) {
						clr = swatches[swatch].getHex()
						console.log(clr+' ('+swatch+') %c '+swatch, 'color: '+clr)
					}
				}
			});
		}
	});
}

function workercode(){
	importScripts('ocrad.js')
	console.log('loaded worker')
	onmessage = function(e){
		postMessage(OCRAD(e.data))
	}
}

var lastWorker;
var worker = new Worker(
	window.URL.createObjectURL(
		new Blob([
			"importScripts('ocrad.js'); onmessage = function(e){postMessage(OCRAD(e.data))}"
		])
	)
);
function runOCR(image_data, raw_feed){
	console.log('processing')
	worker.onmessage = function(e){

		console.log('got message')

		if('innerText' in document.getElementById("text")){
			//document.getElementById("text").innerText = e.data
			console.log('text = ' + e.data)
		}else{
			//document.getElementById("text").textContent = e.data
			console.log('text = ' + e.data)
		}
		//document.getElementById('timing').innerHTML = 'recognition took ' + ((Date.now() - start)/1000).toFixed(2) + 's';
		console.log('recognition took ' + ((Date.now() - start)/1000).toFixed(2) + 's')
	}
	var start = Date.now()
	if(!raw_feed){
		image_data = o.getImageData(0, 0, c.width, c.height);	
	}

	worker.postMessage(image_data)
	lastWorker = worker;
}

function runocrad(imgindex, imgurl){
	GM_xmlhttpRequest({
		method: "GET",
		url: imgurl,
		responseType: 'arraybuffer',
		data: null,            
		onload: function(response) {
			console.log('got response.responseText');
			
			var uInt8Array = new Uint8Array(this.response);
			var i = uInt8Array.length;
			var biStr = new Array(i);
			while (i--)
			{ biStr[i] = String.fromCharCode(uInt8Array[i]);
			}
			var data = biStr.join('');
			var base64 = window.btoa(data);

			//console.log("3> "+ base64);

			dataURL = "data:image/png;base64,"+base64
			$("img:eq(0)").attr("src", dataURL);

			dataURL = "data:image/png;base64,"+base64
			$("img:eq(0)").attr("src", dataURL);

			console.log('making image');
			var img = document.createElement('img');
			img.crossOrigin = "Anonymous";


			img.setAttribute('src', dataURL);
			var string = OCRAD(img);

			//var myocr = new OCRAD()
			//var worker = myocr.createWebWorkerFromString(workercode)
			if (string.length > 3) {
				//alert('SPAM')
				$('.result-row:eq('+imgindex+')').css('background', 'red')
				console.log('result '+(imgindex+1)+' looks like spam')
			} else {
				//alert('Not SPAM')
			}
			//console.log(string, imgurl)
			//runOCR(uInt8Array, true)
		}
	});
}

//loadScript('https://jariz.github.io/vibrant.js/dist/Vibrant.min.js', runvibrant)

imglist = [];
$('.result-row').each(function(i){
	if (i < 2) {
		imgurl = $(this).find('img:eq(0)').attr('src')
		console.log(imgurl)
		if (imgurl.match('https://images.craigslist.org/.*_300x300.jpg')) {
			imglist.push(imgurl)
			runocrad(i, imgurl)
		}
	}
})

imgurl = $('img:eq(0)').attr('src')
//runocrad(imgurl)
