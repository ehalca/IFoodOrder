
document.addEventListener('DOMContentLoaded', function() {
  
	$("#load").click(function(){
		
		document.orderManager = new utils.IORDERMANAGER("https://www.googleapis.com/datastore/v1beta2/datasets/iorder-food-corporate/");
		var authenticator = new utils.AUTHENTICATOR(document.orderManager, function(user){
			console.log(user.name);
		});
		authenticator.authenticateWithToken();
		
	
	});
	
  
});

