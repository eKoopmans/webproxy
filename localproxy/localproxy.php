<?php

// Allow this proxy to be accessed from anywhere (CORS)
header("Access-Control-Allow-Origin: *");

// Grab the destination URL from POST
if (array_key_exists('_LOCALPROXY_URL',$_POST)) {
	$url = $_POST['_LOCALPROXY_URL'];
	unset($_POST['_LOCALPROXY_URL']);
} else	return;

// Grab custom headers from POST
if (array_key_exists('_LOCALPROXY_HEADERS',$_POST)) {
	$httpHeader = $_POST['_LOCALPROXY_HEADERS'];
	unset($_POST['_LOCALPROXY_HEADERS']);
} else	$httpHeader = array();

// Get data from $_GET or $_POST
if (!empty($_POST)) {
	// Encode the POST info into a JSON string
	$data = $_POST;
	$data_string = json_encode($data);

	// Extra headers for POST
	array_push($httpHeader, 'Content-Type: application/json',
		'Content-Length: ' . strlen($data_string));
} elseif (!empty($_GET)) {
	// Make the query string for GET
	$url = $url . '?' . http_build_query($_GET);
}

// Setup cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeader);

// Extra settings for POST
if (isset($data_string)) {
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
	// curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
}

// Execute
$response = curl_exec($ch);

// Close the connection, release resources used
curl_close($ch);

// Return the response
echo $response;

?>
