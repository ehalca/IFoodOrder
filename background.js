/**
 * 
 */

function login(){

 var oauth = ChromeExOAuth.initBackgroundPage({
	  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
	  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
	  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
	  'consumer_key': 'anonymous',
	  'consumer_secret': 'anonymous',
	  'scope': 'https://docs.google.com/feeds/',
	  'app_name': 'My Google Docs Extension'
	});

	function onAuthorized() {
	  var url = 'https://docs.google.com/feeds/default/private/full';
	  var request = {
	    'method': 'POST',
	    'headers': {
	      'GData-Version': '3.0',
	      'Content-Type': 'application/atom+xml'
	    },
	    'parameters': {
	      'alt': 'json'
	    },
	    'body': 'Data to send'
	  };

	  // Send: POST https://docs.google.com/feeds/default/private/full?alt=json
	  oauth.sendSignedRequest(url, callback, request);
	};

	function callback(resp, xhr) {
	  $("#response").html(JSON.stringify(resp));
	};

	oauth.authorize(onAuthorized);
	
}
