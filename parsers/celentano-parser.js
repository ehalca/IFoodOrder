var utils = utils || {};

$(document).ready(function() {
	utils.CelentanoParser = utils.PARSER.extend({
		
		hasItems : function (){
			return this.getItems().length > 0;
		},
		
		getItems: function(){
			return $('form').parent().parent();
		},
		
		parse : function(){
			var that = this;
			this.getItems().each(function(){
				var $element = $(this);
				var $adding = $('<input type="button" value="iOrder" class="feedsubm3">');
				$adding.click(function(){
					that.itemButtonPressed(parseInt($element.find('input[name="goods_item_id"]').val()),
							$element.find('.pr22').find('.fl1').find('h2').text(),
							parseFloat($element.find('.pr22').find('.fr1').find('.f2').find('b').text()),
							$element.find('.pr1').find('a').find('img').attr('src'),
							undefined
					);
				});
				$(this).find("td.pr3").append($adding);
			});
		},
		
		itemButtonPressed : function(itemId, name, price, img, type){
			this.addOrder(itemId, name, price, utils.CELENTANO_RESTAURANT_CONST.name, {imagePath:img, type: type});
		},
		
		getItemImage : function(order){
			var result ="http://www.celentano.md/"+ order._details.imagePath;
			return result;
		},
		
		proceedToCheckout: function(orders, callback){
			//called only inside page
			var that = this;
			console.log(JSON.stringify(orders));
			var count = orders.length;
			var submitOrder = function(orders, i, callback){
				if (i === -1){
					callback(true);
				}else{
					that.addToCart(Number(orders[i].id),orders[i].details.type, function(){
						submitOrder(orders, i-1, callback);
					});
				}
			}
			submitOrder(orders, orders.length - 1, callback);
		},
		
		addToCart : function(id,type, callback){
				$.get("/e.php",{action:'add_item', items_count:1,goods_item_id:id, location:'/ro/menu'},function(a){callback();});
		}
		
	});
	
	window.parser = new utils.CelentanoParser();
                                       
});