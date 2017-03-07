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

function loadScript(url, callback) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	script.onreadystatechange = callback;
	script.onload = callback;
	head.appendChild(script);
}

function runvibrant(){
	GM_xmlhttpRequest({
		method: "GET",
		url: 'https://images.craigslist.org/00Z0Z_2FxbFilOyvk_300x300.jpg',
		responseType: 'arraybuffer',
		data: null,            
		onload: function(response) {
			var uInt8Array = new Uint8Array(this.response);
			var i = uInt8Array.length;
			var biStr = new Array(i);
			while (i--)
			{ biStr[i] = String.fromCharCode(uInt8Array[i]);
			}
			
			var data = biStr.join('');
			var base64 = window.btoa(data);
			dataURL = "data:image/png;base64,"+base64
			$("img:eq(0)").attr("src", dataURL);
			
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

var lastWorker;
var worker = new Worker(
	window.URL.createObjectURL(
		new Blob([
			"importScripts('ocrad.js'); onmessage = function(e){postMessage(OCRAD(e.data))}"
		])
	)
);
function runOCR(image_data, raw_feed){
	worker.onmessage = function(e){
		if('innerText' in document.getElementById("text")){
			console.log('text = ' + e.data)
		}else{
			console.log('text = ' + e.data)
		}
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
			var uInt8Array = new Uint8Array(this.response);
			var i = uInt8Array.length;
			var biStr = new Array(i);
			while (i--)
			{
				biStr[i] = String.fromCharCode(uInt8Array[i]);
			}
			var data = biStr.join('');
			var base64 = window.btoa(data);
			dataURL = "data:image/png;base64,"+base64
			var img = document.createElement('img');
			img.crossOrigin = "Anonymous";


			img.setAttribute('src', dataURL);
			var string = OCRAD(img);

			if (string.length > 3) {
				$('.result-row:eq('+imgindex+')').css('background', 'red')
				console.log('result '+(imgindex+1)+' looks like spam')
			}
		}
	});
}

//loadScript('https://jariz.github.io/vibrant.js/dist/Vibrant.min.js', runvibrant)

imglist = [];
$('.result-row').each(function(i){
	if (i < 200) {
		imgurl = $(this).find('img:eq(0)').attr('src')
		console.log(imgurl)
		if (imgurl) {
			if (imgurl.match('https://images.craigslist.org/.*_300x300.jpg')) {
				imglist.push(imgurl)
				runocrad(i, imgurl)
			}
		}
	}
})
