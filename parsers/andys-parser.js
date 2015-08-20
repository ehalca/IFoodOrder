var utils = utils || {};

$(document).ready(function() {
	
	utils.ANDYS_RESTAURANT_CONST = {name:"Andys", url:"http://www.andys.md"};
	
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
							parseFloat($element.find(".p_buy").find(".price").text()),
							$element.find("img.bf_1").attr("src")
					);
				});
				$(this).find(".p_buy").append($adding);
			});
		},
		
		itemButtonPressed : function(itemId, name, price, img){
			this.addOrder(itemId, name, price, utils.ANDYS_RESTAURANT_CONST.name, img);
		},
		
		getItemImage : function(order){
			var result ="http://www.andys.md"+ order._details.imagePath;
			return result;
		}
		
		
	});
	
	window.parser = new utils.AndysParser();
	
});
