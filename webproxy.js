/* webproxy(url, callback, opts)
 *
 *	A JavaScript module to proxy GET and POST requests through YQL (Yahoo! Query Language).
 *
 * url:			The target URL.
 *
 * callback:	A callback function that will receive a single data object on completion.
 *
 * opts:		Optional parameters:
 *
 *				{ method:	The HTTP method ('GET' or 'POST') to use. Default is 'GET'.
 *
 *				  query:	A string that will be attached to the URL as a GET query.
 *
 *				  data:		Data that will be sent in a POST message. It can take one of several
 *							formats, and will automatically set the 'Content-Type' header:
 *							- str: 'a=1&b=2';	// Content-Type: application/x-www-form-urlencoded
 *							- obj: {a:1, b:2};	// Content-Type: application/json
 *
 *				  header:	A set of headers to be used when contacting the URL. It can take
 *							one of several formats:
 *							- str: 'HeaderName: HeaderValue';
 *							- obj: {'H1Name': 'H1Val', 'H2Name': 'H2Val'};
 *							- arr: ['H1Name: H1Val', 'H2Name: H2Val'];
 *							   or: [['H1Name', 'H1Val'], ['H2Name', 'H2Val']];
 *				}
 *
 * Example usage:
 *		// Simple GET requests
 *		webproxy('http://www.mydomain.com', function(data) {console.log(data)});
 *		webproxy('http://www.mydomain.com', mycbk, {query: 'a=1&b=2'});
 *
 *		// POST requests and header manipulation
 *		webproxy('http://www.mydomain.com', mycbk, {method: 'POST', data: {a: 1, b: 2}});
 *		webproxy('http://www.mydomain.com', mycbk, {method: 'POST', data: {a: 1, b: 2}},
 *				 header: ['Accept: application/xml', 'Authorization: Bearer MYAUTHCODE']});
 *
 * Details:
 *		- This package uses the Yahoo! Query Language (YQL) as a proxy server. Requests on YQL
 *		  are interpreted through a custom Open Data Table (ODT), 'webproxy.xml'. This file is
 *		  hosted on www.erik-koopmans.com, but you are welcome to rehost the file elsewhere.
 *		  Simply change the 'odtUrl' variable below.
 *
 * Version:		1.0.0	Erik Koopmans	2017-01-19
 *
 */

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
		if (typeof obj === 'undefined')								return 'undefined';
		else if (typeof obj === 'string' || obj instanceof String)	return 'string';
		else if (typeof obj === 'number' || obj instanceof Number)	return 'number';
		else if (!!obj && obj.constructor === Array)				return 'array';
		else if (typeof obj === 'object')							return 'object';
		else														return 'unknown';
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
		if (data)	url += '?' + param(data);

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
		if (!url)		throw "Webproxy requires a target URL."
		if (!callback)	callback = function() {};
		if (!opts)		opts = {};

		// Handle different opts.header formats (convert all to array)
		switch (objType(opts.header)) {
			case 'undefined':	break;
			case 'string':		opts.header = [opts.header];	break;
			case 'array':
				// Array format:	opts.header = ['h1name: h1val', 'h2name: h2val'];
				//			 or:	opts.header = [['h1name', 'h1val'], ['h2name', 'h2val']];
				for (var i=0; i<opts.header.length; i++) {
					if (!isStr(opts.header[i]))
						opts.header[i] = opts.header[i].join(': ');
				}
				break;
			case 'object':
				// Object format:	opts.header = {h1name: 'h1val', h2name: 'h2val'};
				opts.header = Object.keys(opts.header).map(function(key) {
					return key + ': ' + opts.header[key];
				});
				break;
			default:			throw 'Unknown header format.';
		}
		
		// Handle different opts.data formats
		if (opts.data) {
			// Convert anything non-string into a JSON string and set the correct header
			if (!isStr(opts.data)) {
				opts.data = JSON.stringify(opts.data);
				var header = 'Content-Type: application/json';
			}
			else	var header = 'Content-Type: application/x-www-form-urlencoded';
			
			// URL-encode the data; it will be decoded inside of htmlproxy.xml
			opts.data = encodeURIComponent(opts.data);
			
			// Attach the header (as the first item, so it can be overridden)
			opts.header = opts.header ? [header].concat(opts.header) : [header];
		}
		
		// Combine the header field into a single string, if it exists
		if (opts.header)	opts.header = opts.header.join(headerDelim);

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
