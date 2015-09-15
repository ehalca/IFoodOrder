(function(){
    window.messages = [];
	window.orderManager = new utils.IORDERMANAGER();
         window.checkOutOrders = function (restaurant, orders, callback){
                var o = [];
                orders.forEach(function(order){
                    var order = {id:order._itemId};
                    o.push(order);
                });
                 var newURL = "http://www.andys.md";
                 
                 chrome.tabs.create({ url: newURL, active:false }, function(tab){
                     window.messages[tab.id] = {orders: o, callback:callback};
                 });
                     
	};
        
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (window.messages[tabId] && changeInfo.status == "complete"){
        	var message = window.messages[tabId];
        	delete window.messages[tabId];
            chrome.tabs.sendMessage(tab.id, message, function (response) {
            	console.log('message sent, activating!');
            });
     }
    });
})();