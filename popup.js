
document.addEventListener('DOMContentLoaded', function() {
	
	//UI Initialization
	//$("#tabs").tab();
	 $('a[href="#administrator"]').on('shown.bs.tab', function (e) {
		  updateAdministratorViews();
	 });
	
	
	//Controller initialization
	var onAuthSuccess = function(user){
		$('.user-name').html(user._name);
		chrome.extension.getBackgroundPage().orderManager.getAuthenticateUserOrders(function(orders){
			$(".progress", "#orders-container").remove();
			window.orderController = new utils.OrderController(new utils.OrdersView());
			var historyView = new utils.HistoryOrdersView();
			orders.forEach(function(order){
				if (utils.isOrderActive(order)){
					window.orderController._view.addView(new utils.OrderView(order));
				}else{
					historyView.addView(new utils.HistoryOrderView(order));
				}
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
	
	function updateAdministratorViews(){
		window.administratorView = window.administratorView || new utils.AdminOrdersView();
		window.administratorView.deleteViews();
		window.administratorView.refreshing(true);
		chrome.extension.getBackgroundPage().orderManager._db.getAllOrders(function(orders){
			window.administratorView.refreshing(false);
			var comittedOrders = [];
			orders.forEach(function(order){
				if (utils.isOrderCommited(order)){
					comittedOrders.push(order);
				}
			});
			if (!_.isEmpty(comittedOrders)){
				comittedOrders.forEach(function(order){
					window.administratorView.addView(new utils.UserOrderView(order));
				});
			}
		});
	}
});

