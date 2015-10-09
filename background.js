(function(){
    window.messages = [];
    window.tabReloaded = {};
	window.orderManager = new utils.IORDERMANAGER();
         window.checkOutOrders = function (restaurant, orders, callback){
             var restaurantInfo = utils.getRestaurantInfo(restaurant);
             if (restaurantInfo){
            	 var o = [];
            	 orders.forEach(function(order){
            		 var order = {id:order._itemId, details: order._details};
            		 o.push(order);
            	 });
                 chrome.tabs.create({ url: restaurantInfo.url, active:false }, function(tab){
                     window.messages[tab.id] = {orders: o, callback:callback, restaurant:restaurantInfo};
                 });
             }else{
            	 callback();
             }
                     
	};
        
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (window.messages[tabId] && changeInfo.status === "complete"){
        	if (!window.tabReloaded[tabId]){
        		window.tabReloaded[tabId] = 'refreshing';
        		chrome.cookies.getAll({url:window.messages[tabId].restaurant.url}, function(cookies){
        			if (cookies){
        				var count = cookies.length;
        				cookies.forEach(function(cookie){
        					chrome.cookies.remove({url: window.messages[tabId].restaurant.url, name:cookie.name}, function(details){
        						count--;
        						if (count === 0){
        							console.log('refreshing!!!');
        							chrome.tabs.reload(tabId, {}, function(){
        								window.tabReloaded[tabId] = 'refreshed'
        							});
        						}
        					});
        				});
        			}else{
        				chrome.tabs.reload(tabId, {}, function(){
        					window.tabReloaded[tabId] = 'refreshed'
        				});
        			}
        		});
        		return;
        	}else if (window.tabReloaded[tabId] === 'refreshing'){
        		return;
        	}
        	chrome.cookies.getAll({url:window.messages[tabId].restaurant.url}, function(cookies){
        		if (utils.isSessionSet(cookies)){
        			var message = window.messages[tabId];
                	delete window.messages[tabId];
                		  chrome.tabs.sendMessage(tabId, message, function (response) {
                         	 chrome.tabs.update(tab.id, { url: message.restaurant.checkOutUrl, active:true }, function(tab){
                                  message.callback(response);
                              });
                         });
        		}
        	})
     }
    });
})();