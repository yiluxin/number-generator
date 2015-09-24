self.onmessage = function(event) {
  function zeroPad(number, width) {
    var string = String(number);
    while (string.length < width)
      string = "0" + string;
    return string;
  }

  var start = event.data.start;
  var end = event.data.end;
  var length = event.data.length;
  var result = [];

  for (var i = 0; i <  Math.pow(10, length); i++) {
    result.push(start + zeroPad(i, length) + end);
  }
  self.postMessage(result);
}
