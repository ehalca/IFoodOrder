var utils = utils || {};

(function() {
	
	utils.AndysParser = utils.PARSER.extend({
		
		hasItems : function (){
			return $("div.preview.menuelem").length > 0;
		},
		
		parse : function(){
			var that = this;
			$("div.preview.menuelem").each(function(){
				var $element = $(this);
				var $adding = $("<a class='buy'>iOrder</a>");
				$adding.click(function(){
					that.itemButtonPressed(parseInt($element.find(".fav.setfav").attr("mid")),
							$element.find("h5").text(),
							parseFloat($element.find(".p_buy").find(".price").text()));
				});
				$(this).find(".p_buy").append($adding);
			});
		},
		
		itemButtonPressed : function(itemId, name, price){
			this.addOrder(new utils.AndysItem(itemId, name, price));
		},
		
		
	});
	
	utils.AndysItem = utils.ITEM.extend({
		
		_id : null,
		
		init : function(id, name, price){
			this._restaurant = ANDYS_RESTAURANT;
			this._name = name;
			this._price = price;
			this._id = id;
		},
		
		view : function(){
			
		}
		
	});
	
	var ANDYS_RESTAURANT = new utils.RESTAURANT(utils.ANDYS_RESTAURANT_CONST);
	window.parser = new utils.AndysParser();
	
})();
