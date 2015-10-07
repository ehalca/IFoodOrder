(function(){
    window.messages = [];
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
    	console.log(changeInfo.status);
        if (window.messages[tabId] && changeInfo.status == "complete"){
        	var message = window.messages[tabId];
        	delete window.messages[tabId];
        	console.log('sending message');
            chrome.tabs.sendMessage(tab.id, message, function (response) {
            	console.log('message sent');
            	 chrome.tabs.update(tab.id, { url: message.restaurant.checkOutUrl, active:true }, function(tab){
                     message.callback(response);
                 });
            });
     }
    });
})();