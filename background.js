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
            chrome.tabs.sendMessage(tab.id, window.messages[tabId], {}, function () {
                             window.messages[tabId].callback();
                             delete window.messages[tabId];
                        });
     }
    });
})();