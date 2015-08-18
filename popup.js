
document.addEventListener('DOMContentLoaded', function() {
  
	$("#load").click(function(){
		
		document.orderManager = new utils.IORDERMANAGER(new utils.GDriveDataStore());
		var authenticator = new utils.AUTHENTICATOR(document.orderManager, function(user){
			console.log(user.name);
		});
		authenticator.authenticateWithToken();
		
	
	});
	
  
});

