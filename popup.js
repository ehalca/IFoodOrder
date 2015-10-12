
document.addEventListener('DOMContentLoaded', function() {
	
	//UI Initialization
	//$("#tabs").tab();
	 $('a[href="#administrator"]').on('shown.bs.tab', function (e) {
		  updateAdministratorViews();
	 });
	 $('a[href="#info"]').on('shown.bs.tab', function (e) {
		 initInfoTab();
	 });
	 
	 
	
	 var updateOrder = function(order, callback){
         chrome.extension.getBackgroundPage().orderManager._db.updateOrder(order, function(){
         	callback();
         });
     };
     
    var onAdminCallback = function(user, orderManager){
 		if (user._isAdmin === undefined && orderManager){
 			orderManager.checkAdmin(onAdminCallback);
 		}
 		if (window.adminProcessor){
 			window.adminProcessor.userAdminUpdate(user);
 		}
 	};
	
	//Controller initialization
	var onAuthSuccess = function(user){
		$('.user-name').html(user._name);
		$('.user-img').attr('src', user._image);
		onAdminCallback(user, chrome.extension.getBackgroundPage().orderManager);
		$('.user-switch').off('click').on('click', function(){
			chrome.extension.getBackgroundPage().orderManager._auth.authenticateWithToken(true);
		});
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
            window.orderController._events.orderReordered.subscribe(function(order){
            	chrome.extension.getBackgroundPage().orderManager._db.saveNewOrder(new utils.ORDER(order._restaurant,order._itemName, order._itemId,  order._itemPrice, order._user, (new Date()).toString(), 'new', order._details), function(resultOrder){
            		var view = window.orderController.addOrder(resultOrder);
            		window.orderController.commitOrder(resultOrder, function(){
            			view.updateView();
            		});
            	});
            });
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
			window.adminProcessor = new utils.AdminOrderProccessor(chrome.extension.getBackgroundPage().orderManager._db._user, new utils.AdminOrdersView())
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
	};
	
	function initInfoTab(){
		$('#supported-restaurants').empty();
		 utils.SUPPORTED_RESTAURANTS.forEach(function(restaurant){
			 var $restaurant = $('#mock-supported-restaurant').clone().removeAttr('id');
			 $('.supported-restaurant-name', $restaurant).html(restaurant.name);
			 var $link = $('<a href="'+restaurant.url+'">'+restaurant.url+'</a>');
			 $link.on('click', function(){
				 chrome.tabs.create({ url: restaurant.url, active:true }, function(tab){
                 }); 
			 });
			 $('.supported-restaurant-url', $restaurant).append($link);
			 $('#supported-restaurants').append($restaurant.children()); 
		 });
		 window.infoController = window.infoController || new utils.DomainController(chrome.extension.getBackgroundPage().orderManager._adminManager);
		 window.infoController.updateView(chrome.extension.getBackgroundPage().orderManager._db._user);
	}
	
});

