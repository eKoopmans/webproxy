# WebProxy

WebProxy is a JavaScript module to proxy GET and POST requests through YQL (Yahoo! Query Language).

Many web APIs prevent direct communication to their servers via AJAX, which presents a serious roadblock to developing client-side software. One solution is to route requests through a proxy server and have that proxy return a response. WebProxy uses YQL (Yahoo! Query Language) as a configurable proxy server for all GET and POST requests.

## Install

1. Copy `webproxy.js` to your project directory.
2. Include `<script src="webproxy.js"></script>` in your HTML document.
3. **Optional:** Copy `webproxy.xml` to your server and update the link in `webproxy.js` (search for 'odtUrl').


## Usage

### Basic usage

As soon as WebProxy is included, the `webproxy` function is exposed:

```js
var url = 'http://www.mydomain.com';
var callback = function(data) { console.log(data) };
webproxy(url, callback);
```

### The opts parameter

WebProxy accepts a third parameter, `opts`, that allows configuration of the HTTP request. Here are some examples:

```js
webproxy(url, callback, { query: 'a=1&b=2' });
webproxy(url, callback, { method: 'POST', data: {a: 1, b: 2} });
webproxy(url, callback, { header: ['Accept: application/xml', 'Authorization: Bearer MYAUTHCODE'] });
```

The `opts` parameter has the following optional fields (default values are in bold):

|Field   |Value(s)                |Description                                              |
|--------|------------------------|---------------------------------------------------------|
|method  |**`'GET'`** or `'POST'` |The HTTP method used for the request.                    |
|query   |string                  |A string that will be attached to the URL as a GET query.|
|data    |string or object        |Data that will be sent in a POST message.                |
|header  |string, array, or object|A set of headers to be used when contacting the URL.     |

#### Looking closer: opts.query

The `opts.query` option attaches the given query string to the URL as a GET query. Thus, `{query: 'a=1&b=2'}` will produce a URL of
`http://www.mydomain.com?a=1&b=2`.

This same goal can also be accomplished by passing a URL with the query string already attached. The query option **is** allowed to be used in combination with POST requests.

#### Looking closer: opts.data

The `opts.data` option may only be used with POST requests. It sends the specified data in the body of the HTTP POST request. It currently accepts two formats of data: a `string` or an `object`.

If the data is a string, it is passed as-is into the body of the HTTP POST request. The string is assumed to be formatted using query notation ('a=1&b=2'), though any string is legal. A message header `Content-Type: application/x-www-form-urlencoded` is attached to the request. If the data is any other object, it is first converted to a JSON string, and a message header `Content-Type: application/json` is attached to the request.

In both cases, the automatic header can be overridden by specifying your own `Content-Type` header in the `opts.header` field.

#### Looking closer: opts.header

The `opts.header` option allows you to specify HTTP headers that will be sent with the request. There is a comprehensive list of headers [here](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields). To specify a single header, use a string with the format `'HeaderName: HeaderValue'`. Multiple headers may be specified using an `array` or an `object`.

An array of headers should be specified with the format `['H1Name: H1Val', 'H2Name: H2Val']`. An object of headers should take the form `{'H1Name': 'H1Val', 'H2Name': H2Val}`. In both cases, the list of headers are joined together into a single string separated by the NULL character (ASCII 0). Note that this will cause problems if any of your headers contain the NULL character (very unlikely).

## YQL Open Data Tables (ODT) and webproxy.xml

The proxy server YQL (Yahoo! Query Language) requires a set of instructions to parse any requests being sent to it. These instructions are XML files called Open Data Tables (ODT).

WebProxy sends its requests to YQL along with the URL of `webproxy.xml`, a customized ODT specifically for use with WebProxy. The file is currently hosted [here](https://cdn.rawgit.com/eKoopmans/webproxy/deb1c746/src/webproxy.xml), however you are welcome to host the file on your own server. Simply update the variable `odtUrl` in `webproxy.js` with the URL of your hosted version.

## LocalProxy

I have also included a standalone package, LocalProxy, that may be used in place of WebProxy. To use it you must host localproxy.php on your server, thus creating your own (local) proxy server. This is not recommended, as it is not very secure, but is included for testing and troubleshooting purposes.

## Dependencies

WebProxy does not require any external JavaScript packages. It uses jQuery if available to handle AJAX requests, but has an internal fallback that maintains full functionality in its absence.

## Credits

- [Erik Koopmans](https://github.com/eKoopmans)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2017 Erik Koopmans <[http://www.erik-koopmans.com/](http://www.erik-koopmans.com/)>
