
document.addEventListener('DOMContentLoaded', function() {
  
	$("#load").click(function(){
		chrome.identity.getProfileUserInfo(function(token) {
			if (!_.isEmpty(token.id)){
				document.orderManager = new utils.IORDERMANAGER("https://www.googleapis.com/datastore/v1beta2/datasets/iorder-food-corporate/");
				utils.getUserInfo(token.id, function(userInfo){
					result = document.orderManager.authenticateUser(utils.mapUser(userInfo));
				});
			}
			$("#response").html(token);
	})
		
	});
	
  
});

