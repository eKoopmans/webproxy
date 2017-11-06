var webproxy = (function() {
  /*** CHANGE THIS URL IF YOU WISH TO HOST THE XML FILE YOURSELF ***/
  var odtUrl = 'http://www.erik-koopmans.com/webproxy/webproxy.xml';

  // Establish settings
  var scheme = (document.location.protocol === 'https:' ? 'https:' : 'http:');
  var yqlUrl = scheme + '//query.yahooapis.com/v1/public/yql';
  var headerDelim = String.fromCharCode(0);

  // Helper functions
  var isStr = function(obj) {
    return (typeof obj === 'string' || obj instanceof String);
  }
  var objType = function(obj) {
    if (typeof obj === 'undefined')                return 'undefined';
    else if (typeof obj === 'string' || obj instanceof String)  return 'string';
    else if (typeof obj === 'number' || obj instanceof Number)  return 'number';
    else if (!!obj && obj.constructor === Array)        return 'array';
    else if (typeof obj === 'object')              return 'object';
    else                            return 'unknown';
  }
  // Helper getJSON function, if jQuery isn't available
  var getJSON = $.getJSON || function(url, data, success) {
    // Create a simple clone of jQuery $.param
    var param = function(obj) {
      return Object.keys(obj).map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
      }).join('&');
    }

    // Attach data as a query string
    if (data)  url += '?' + param(data);

    // Initiate the request
    var req = new XMLHttpRequest();
    req.open('GET', url, true);

    // Handle the loaded request
    req.onload = function() {
      if (req.status >= 200 && req.status < 400) {
        req.responseJSON = JSON.parse(req.responseText);
        success(req.responseJSON);
      }
    }

    // Send the request
    req.send();
    return req;
  }

  // The primary webproxy function
  var webproxy = function(url, callback, opts) {
    // Handle default arguments
    if (!url)    throw "Webproxy requires a target URL."
    if (!callback)  callback = function() {};
    if (!opts)    opts = {};

    // Handle different opts.header formats (convert all to array)
    switch (objType(opts.header)) {
      case 'undefined':  break;
      case 'string':    opts.header = [opts.header];  break;
      case 'array':
        // Array format:  opts.header = ['h1name: h1val', 'h2name: h2val'];
        //       or:  opts.header = [['h1name', 'h1val'], ['h2name', 'h2val']];
        for (var i=0; i<opts.header.length; i++) {
          if (!isStr(opts.header[i]))
            opts.header[i] = opts.header[i].join(': ');
        }
        break;
      case 'object':
        // Object format:  opts.header = {h1name: 'h1val', h2name: 'h2val'};
        opts.header = Object.keys(opts.header).map(function(key) {
          return key + ': ' + opts.header[key];
        });
        break;
      default:      throw 'Unknown header format.';
    }

    // Handle different opts.data formats
    if (opts.data) {
      // Convert anything non-string into a JSON string and set the correct header
      if (!isStr(opts.data)) {
        opts.data = JSON.stringify(opts.data);
        var header = 'Content-Type: application/json';
      }
      else  var header = 'Content-Type: application/x-www-form-urlencoded';

      // URL-encode the data; it will be decoded inside of htmlproxy.xml
      opts.data = encodeURIComponent(opts.data);

      // Attach the header (as the first item, so it can be overridden)
      opts.header = opts.header ? [header].concat(opts.header) : [header];
    }

    // Combine the header field into a single string, if it exists
    if (opts.header)  opts.header = opts.header.join(headerDelim);

    // Construct the YQL statement
    var statement = 'use "' + odtUrl + '" as htmlproxy; '
    statement += 'select * from htmlproxy where url="' + url + '"';
    for (var key in opts) {
      statement += ' and ' + key + '="' + opts[key] + '"';
    }

    // Create a wrapper function that will return the parsed data to the callback
    var wrapCallback = function(data) {
      // Results are always the first child of data.query.results (name is inconsistent)
      for (var key in data.query.results) {
        return callback(data.query.results[key]);
      }
    }

    // Issue the YQL request
    return getJSON(yqlUrl, {q: statement, format: 'json'}, wrapCallback);
  }

  // Expose the webproxy function
  return webproxy;
}());
