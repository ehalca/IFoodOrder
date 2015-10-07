var utils = utils || {};

$(document).ready(function() {
	
	utils.LaPlacinteParser = utils.AndysParser.extend({
		
		getItems: function(){
			return $("div.preview");
		},
		
		itemButtonPressed : function(itemId, name, price, img, type){
			this.addOrder(itemId, name, price, utils.LAPLACINTE_RESTAURANT_CONST.name, {imagePath:img, type: type});
		},
		
		getItemImage : function(order){
			var result =utils.LAPLACINTE_RESTAURANT_CONST.url+ order._details.imagePath;
			return result;
		},
		
		parse : function(){
			var that = this;
			this.getItems().each(function(){
				var $element = $(this);
				var $adding = $("<a class='buy'>iOrder</a>");
				$adding.click(function(){
					that.itemButtonPressed(parseInt($element.find(".fav.setfav").attr("mid")),
							$element.find("h5").text(),
							parseFloat($element.find(".p_buy").find(".price").text()),
							$element.find("img").attr("src")
					);
				});
				$(this).find(".p_buy").append($adding);
			});
		},
		
		 proceedToCheckout: function(orders, callback){
             //called only inside page
            var that = this;
             console.log(JSON.stringify(orders));
             var count = orders.length;
             orders.forEach(function(order){
                 that.addToCart(Number(order.id), function(){
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
           
		addToCart: function(id, callback){
			in_a_length=300;
			var source = 1;
			if (source==1) {
				num=$('#light_window .floatmenu_quant'+id).val();
				if ($('#light_window select.souceid').length>0) {
					souce=$('#light_window select.souceid').val();
				} else {
					souce=$('#light_window .souceid').val();
				}
				id=id+'_'+souce;
				
				$('#light_window').hide();
				$('#window_over').hide();
				
			} else if (source==2) {
				num=1;
			} else if (source==4) {
				num=1;
			} else {
				num=$('#pagemenu_quant'+id).val();
			}
			limit=parseInt(150);
			
			name=$('#light_window .descr h5').html();
			price=$('#light_window .descr .price').html();
			
			uri3='';
			
			var yaGoalParams = {name:name,price:price};
			//console.log(yaGoalParams);
			
			$.post('/pages/addtocart/',{id:id,num:num},function(data) {
				if (uri3=='cart') {
					wn=$(window).scrollTop();
					window.name=wn;
					window.location='//pages/cart/';
				}
				arr=data.split('<>');
				if (window.ptm)
				clearTimeout(window.ptm);
				$('.n_podsk').show();
				$('.n_podsk').fadeTo(0,0);
				$('.n_podsk').fadeTo(500,1);
				window.ptm=setTimeout(function() {
					$('.n_podsk').fadeTo(500,0,function() {
						$('.n_podsk').hide();
					});
				},2500);
				
				coof=arr[1]/limit;
				$('.h_cart .num').stop();
				$('.h_cart .num').fadeTo(in_a_length,0,function() {
					$('.h_cart .num').html(arr[0]);
					$('.h_cart .num').fadeTo(in_a_length,1);
				});
				$('.cartsumm').html(arr[1]);
						if (coof>=1) {
					$('.h_cart b').animate({
						width:120
					},in_a_length);
					$('.h_cart .num').css('background','#5fc32e');
					$('.h_cart b').css('background','#5fc32e');
					ftext='Livrare gratuită';
					$('.h_cart').removeClass('h_cart_notfull');
				} else {
					$('.h_cart b').animate({
						width:120*coof
					},in_a_length);
					
					$('.h_cart .num').css('background','#e70002');
					$('.h_cart b').css('background','#e70002');
					ftext='Livrare: 20 MDL';
					$('.h_cart').addClass('h_cart_notfull');
				}
						$('.dltext').html(ftext);
				if (uri3=='cart') {
					if (typeof yaCounter29826614 !== "undefined") yaCounter29826614.reachGoal('addonadded', yaGoalParams);
				} else {
					if (typeof yaCounter29826614 !== "undefined") yaCounter29826614.reachGoal('addtocart', yaGoalParams);
				}
				 callback();
			});
		}
		
	});
	
	window.parser = new utils.LaPlacinteParser();
                                       
});
