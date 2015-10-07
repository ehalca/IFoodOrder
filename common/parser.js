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
		
		addOrder : function(itemId, name, price, restaurant, details){
			var status = 'new';
			var date = (new Date()).toString();
			chrome.runtime.sendMessage(undefined, {itemId:itemId, name:name, price:price, restaurant:restaurant, status:status, date:date, details:details}, {}, function(){
				
			});
		},
		
		getItems: function(){
			
		},
		
		getItemImage : function(order){
			
		},
                
                proceedToCheckout: function(orders, callback){
                    //called only inside page
                }
	});
	
utils.AndysParser = utils.PARSER.extend({
		
		hasItems : function (){
			return this.getItems().length > 0;
		},
		
		getItems: function(){
			return $("div.preview.menuelem");
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
							$element.find("img.bf_1").attr("src"),
							$element.find("a[onclick*='addtocart']").attr('onClick').match(/addtocart\(\d+,(\d)\);/)[1] || 1
					);
				});
				$(this).find(".p_buy").append($adding);
			});
		},
		
		itemButtonPressed : function(itemId, name, price, img, type){
			this.addOrder(itemId, name, price, utils.ANDYS_RESTAURANT_CONST.name, {imagePath:img, type: type});
		},
		
		getItemImage : function(order){
			var result ="http://www.andys.md"+ order._details.imagePath;
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
			 function calcheader(quan,summ) {
					$('.h_cart span.num').html(quan);
					$('.h_cart font.summ').html(summ);
					limit=150;
					st=limit/5;
					if (summ==0) {
						step=0;
					} else if (summ>0 && summ<st*1) {
						step=-24;
					} else if (summ>=st*1 && summ<st*2) {
						step=-48;
					} else if (summ>=st*2 && summ<st*3) {
						step=-72;
					} else if (summ>=st*3 && summ<st*4) {
						step=-96;
					} else if (summ>=st*4 && summ<st*5) {
						step=-120;
					}
					diff=limit-summ;
					$('#beforefreedel').html(diff);
					if (diff<=0) {
						$('.beforetext').hide();
						$('.h_cart .f_dlv div').css('color','inherit');
						$('#headfree').show();
						$('#headpay').hide();
						step=-144;
					} else {
						$('.beforetext').show();
						$('.h_cart .f_dlv div').css('color','#e3ddd6');
						$('#headfree').hide();
						$('#headpay').show();
					}
					
					max=2000;
					maxw=90;
					if (summ>max) {
						cw=90;
					} else {
						cw=90-(90*(summ/max));
					}
					$('#slowfill').width(cw);
					
					//$('.h_cart .f_dlv div').css('background-position','0 '+step+'px');
				};
			$('.n_podsk').show();
			$('.n_podsk').fadeTo(0,0);
			$('.n_podsk').fadeTo(500,1);
			ptm=setTimeout(function() {
				$('.n_podsk').fadeTo(500,0,function() {
					$('.n_podsk').hide();
				});
			},2500);
			
			$('#light_window').hide();
			$('#window_over').hide();
			
			if (type==1) {
				topp=0;
				souce=0;
				korj=0;
				quan=$('#quantype1_'+id).val();
				$.post('/pages/addtocart/',{id:id,topp:topp,souce:souce,korj:korj,quan:1},function(data) {
					dta=data.split('<>');
                                                    callback();
				});
			} else if (type==3) {
				topp=0;
				souce=0;
				korj=0;
				
				if ($('#light_window .icecreamtops').length>0) {
					delimiter='';
					topp='';
					$.each($('#light_window .icecreamtops'),function() {
						t_id=$(this).val();
						if (parseInt(t_id)>0) {
							q=1;
							topp+=delimiter+t_id+'<>'+q;
							delimiter=',';
						}
					});
				}
				console.log(topp);
				$.post('/pages/addtocart/',{id:id,topp:topp,souce:souce,korj:korj,quan:1},function(data) {
					dta=data.split('<>');
                                                    callback();
				});
			} else {
				topp=0;
				souce=0;
				korj=0;
				if ($('#light_window select.mw_select').length>0) {
					souce=$('#light_window select.mw_select').val();
				}
				if ($('#light_window .pc_sel').length>0) {
					if ($('#light_window .pc_sel .crust1').hasClass('v1')) {
						korj=1;
					} else {
						korj=2;
					}
				}
				if ($('#light_window .topcheck').length>0) {
					delimiter='';
					topp='';
					$.each($('#light_window .topcheck'),function() {
						if ($(this).is(':checked')) {
							t_id=$(this).attr('t_id');
							obj=$(this).parent().parent().parent().parent();
							q=$('input[type=text]',obj).val();
							topp+=delimiter+t_id+'<>'+q;
							delimiter=',';
						}
					});
				}
				
				$.post('/pages/addtocart/',{id:id,topp:topp,souce:souce,korj:korj,quan:1},function(data) {
					dta=data.split('<>');
                                                    callback();
				});
			}
		}
		
	});
	
})();

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse, done) {
    	var checkOut = function(){
    		if (message.orders && window.parser) {
    			window.parser.proceedToCheckout(message.orders, function(result){
    				sendResponse(result);
    			});
    		}
    	}
    	if (window.parser){
    		checkOut();
    	}else{
    		setTimeout(checkOut, 2000);
    	}
    	return true;
});