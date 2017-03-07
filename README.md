# craigslist-spam-detection

a userscript for detecting spam in craigslist photos

Might be useful:
```
function hasRepeatedLetters(str) {
    var patt = /(.)\1\1/;
    var result = patt.test(str);
    return result;
}
```
And this too:
```
function hasNonAscii(str){
    return str.split("").some(function(char) { return char.charCodeAt(0) > 127 });
}
```
