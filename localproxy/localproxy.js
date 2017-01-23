/* localproxy(url, callback, opts)
 *
 * Implementation details (to fix, you must edit localproxy.php):
 *  - when using POST, localproxy always sends data as JSON (and sets the appropriate header).
 *	- opts.method is not used; instead, POST is always used if there is data in opts.data, otherwise GET is always used.
 */

var localproxy = (function($) {
	// The primary localproxy function
	var localproxy = function(url, callback, opts) {
		// Set up the proxy PHP info
		var proxyURL = './localproxy.php';
		var info = {'_LOCALPROXY_URL': url, '_LOCALPROXY_HEADER': opts.header ? opts.header : []};

		// Handle query and data options
		if (opts.query)	{ proxyURL += '?' + $.param(opts.query); }
		if (opts.data)	{ info = $.extend({}, info, opts.data); }

		// Send the request (always POST at least the URL and headers)
		$.post(proxyURL, info).then( function(data) {
			// Parse the returned JSON data if possible
			try			{data = JSON.parse(data);}
			catch(e)	{}
			callback(data);
		} );
	}

	// Expose the localproxy function
	return localproxy;
}(jQuery));
