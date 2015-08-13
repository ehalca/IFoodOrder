
document.addEventListener('DOMContentLoaded', function() {
  
	$("#load").click(function(){
		chrome.identity.getAuthToken({ 'interactive': false }, function(token) {
			$("#response").html(token);
		});
		
	});
	
  
});
