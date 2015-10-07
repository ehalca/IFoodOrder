var utils = utils || {};

$(document).ready(function() {
	utils.OlivaParser = utils.PARSER.extend({
		
		hasItems : function (){
			return this.getItems().length > 0;
		},
		
		getItems: function(){
			return $("div.r-list-d");
		},
		
		parse : function(){
			var that = this;
			this.getItems().each(function(){
				var $element = $(this);
				var $adding = $("<a class='addtocart'>iOrder</a>");
				$adding.click(function(){
					that.itemButtonPressed(parseInt($element.find('div.count').attr('id').match(/product-(\d+)/)[1]),
							$element.find('h2').text(),
							parseFloat($element.find('div.label > span').text()),
							$element.find('a.fancybox > img').attr('src'),
							undefined
					);
				});
				var $wrapper = $('<div class="i-order-count"></div>'); 
				$wrapper.append($adding);
				$(this).find("div.r-list-d-info > div.count").after($wrapper);
			});
		},
		
		itemButtonPressed : function(itemId, name, price, img, type){
			this.addOrder(itemId, name, price, utils.OLIVA_RESTAURANT_CONST.name, {imagePath:img, type: type});
		},
		
		getItemImage : function(order){
			var result ="http://www.oliva.md"+ order._details.imagePath;
			return result;
		},
		
		proceedToCheckout: function(orders, callback){
			//called only inside page
			var that = this;
			console.log(JSON.stringify(orders));
			var count = orders.length;
			orders.forEach(function(order){
				that.addToCart(Number(order.id),order.details.type, function(){
					if (count === 1){
						if (callback){
							callback(true);
						}
					}else{
						count--;
					}
				});
			});
		},
		
		addToCart : function(id,type, callback){
			console.log('item added ' + id);
				$.get("/classes/ajax/cart.php",{go_rate:1,product_id:id},function(a){callback();});
		}
		
	});
	
	window.parser = new utils.OlivaParser();
                                       
});
