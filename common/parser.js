// Class Library. Inspired by Simple JavaScript Inheritance By John Resig
var utils = utils || {};

(function() {
	
	utils.PARSER = utils.Class.extend({
		
		_events : null,
		
		_orders : null,
		
		init : function(){
                    var that = this;
			this._orders = [];
			this._event = {orderAdded : new utils.Event(), orderDeleted : new utils.Event()};
			if (this.hasItems()){
				this.parse();
			};
                    
		},
		
		hasItems : function (){
			
		},
		
		parse : function(){
			
		},
		
		itemButtonPressed : function(){
			// abstract, implement in subclasses for specific parsers
		},
		
		addOrder : function(itemId, name, price, restaurant, imagePath){
			var status = 'new';
			var date = (new Date()).toString();
			chrome.runtime.sendMessage(undefined, {itemId:itemId, name:name, price:price, restaurant:restaurant, status:status, date:date, imagePath:imagePath}, {}, function(){
				
			});
		},
		
		getItemImage : function(order){
			
		},
                
                proceedToCheckout: function(orders, callback){
                    //called only inside page
                }
		
	});
	
})();

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (message.orders && window.parser) {
            window.parser.proceedToCheckout(message.orders, sendResponse);
        } else {
            if (sendResponse) {
                sendResponse();
            }
    }
});