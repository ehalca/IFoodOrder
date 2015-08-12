// Class Library. Inspired by Simple JavaScript Inheritance By John Resig
var utils = utils || {};

(function() {
	
	utils.PARSER = utils.Class.extend({
		
		_events : null,
		
		_orders : null,
		
		init : function(){
			this._orders = [];
			this._event = {orderAdded : new utils.Event(), orderDeleted : new utils.Event()};
			if (this.hasItems()){
				this.parse();
			}
		},
		
		hasItems : function (){
			
		},
		
		parse : function(){
			
		},
		
		itemButtonPressed : function(){
			// abstract, implement in subclasses for specific parsers
		},
		
		addOrder : function(order){
			this._orders.push(order);
		}
		
	});
	
})();