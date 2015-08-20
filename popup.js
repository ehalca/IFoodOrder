
document.addEventListener('DOMContentLoaded', function() {
	var onAuthSuccess = function(user){
		$('.user-name').html(user._name);
		chrome.extension.getBackgroundPage().orderManager.getAuthenticateUserOrders(function(orders){
			window.orderController = new utils.OrderController(new utils.OrdersView());
			orders.forEach(function(order){
				window.orderController._view.addView(new utils.OrderView(order));
			});
			window.orderController._events.orderDeleted.subscribe(function(order, callback){
				chrome.extension.getBackgroundPage().orderManager._db.deleteOrder(order, function(){
					callback();
				});
			});
		});
//		chrome.runtime.onMessage.addListener(function( message, sender, sendResponse) {
//			console.log(message);
//		});
	};
	var onAuthFail = function(user){
		var $click = $('<a href="#">Change user</a>');
		$click.click(function(){
			chrome.extension.getBackgroundPage().orderManager._auth.authenticateWithToken(true);
		});
	};
	chrome.extension.getBackgroundPage().orderManager._auth.authenticateWithToken(false, onAuthSuccess, onAuthFail);
});

