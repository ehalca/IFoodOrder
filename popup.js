
document.addEventListener('DOMContentLoaded', function() {
	
	//UI Initialization
	//$("#tabs").tab();
	 $('a[href="#administrator"]').on('shown.bs.tab', function (e) {
		  updateAdministratorViews();
	 });
	
	 var updateOrder = function(order, callback){
         chrome.extension.getBackgroundPage().orderManager._db.updateOrder(order, function(){
         	callback();
         });
     };
	
	//Controller initialization
	var onAuthSuccess = function(user){
		$('.user-name').html(user._name);
		chrome.extension.getBackgroundPage().orderManager.getAuthenticateUserOrders(function(orders){
			$(".progress", "#orders-container").remove();
			window.orderController = new utils.OrderController(new utils.OrdersView());
			orders.forEach(function(order){
				if (utils.isOrderActive(order)){
					window.orderController.addOrder(order);
				}else{
					window.orderController.addHistoryOrder(order);
				}
			});
			window.orderController._events.orderDeleted.subscribe(function(order, callback){
				chrome.extension.getBackgroundPage().orderManager._db.deleteOrder(order, function(){
					callback();
				});
			});
            window.orderController._events.orderUpdated.subscribe(updateOrder);
		});
	};
	var onAuthFail = function(user){
		var $click = $('<a href="#">Change user</a>');
		$click.click(function(){
			chrome.extension.getBackgroundPage().orderManager._auth.authenticateWithToken(true);
		});
	};
	chrome.extension.getBackgroundPage().orderManager._auth.authenticateWithToken(false, onAuthSuccess, onAuthFail);
	
	chrome.browserAction.getBadgeText({}, function (result){
		chrome.browserAction.setBadgeText({text:""});
	});
	
	function updateAdministratorViews(){
		if (!window.adminProcessor){
			window.adminProcessor = new utils.AdminOrderProccessor(new utils.AdminOrdersView())
			window.adminProcessor._totalController._events.orderUpdated.subscribe(updateOrder);
		}
		window.adminProcessor.deleteOrders();
		window.adminProcessor._view.refreshing(true);
		chrome.extension.getBackgroundPage().orderManager._db.getAllOrders(function(orders){
			window.adminProcessor._view.refreshing(false);
			var comittedOrders = [];
			orders.forEach(function(order){
				if (utils.isOrderConfirmed(order)){
					comittedOrders.push(order);
				}
			});
			if (!_.isEmpty(comittedOrders)){
				comittedOrders.forEach(function(order){
                                    window.adminProcessor.addUserOrder(order);
				});
			}
		});
	}
});

