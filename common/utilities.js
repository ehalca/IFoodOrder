// Class Library. Inspired by Simple JavaScript Inheritance By John Resig
var utils = utils || {};

(function() {
	
	utils.API_KEY = "AIzaSyC821H6-hmGKB4w_FaSnmDPN5_GcFJ8fbI";
	
	var initializing = false, fnTest = /xyz/.test(function() {
		xyz;
	}) ? /\b_super\b/ : /.*/;
	// The base Class implementation (does nothing)
	utils.Class = function() {};
	// Create a new Class that inherits from this class
	utils.Class.extend = function(prop, mixins) {
        if(mixins){
            mixins.forEach(function(mixin){
                for(var k in mixin){
                    prop[k]=mixin[k];
                }
            });
        }
		var _super = this.prototype;
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;
		// Copy the properties over onto the new prototype
		for ( var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] === 'function'
					&& typeof _super[name] === 'function'
					&& fnTest.test(prop[name]) ? (function(name, fn) {
				return function() {
					var tmp = this._super;
					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name];
					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fn.apply(this, arguments);
					this._super = tmp;
					return ret;
				};
			})(name, prop[name]) : prop[name];
		}
		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if (!initializing && this.init){
                this.init.apply(this, arguments);
            }
		}
		// Populate our constructed prototype object
		Class.prototype = prototype;
		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;
		// And make this class extendable
		Class.extend = arguments.callee;
		return Class;
	};
	
	utils.AUTHENTICATOR = utils.Class.extend({
		
		_onSuccess : null,
		
		_user : null,
		
		_google : null,
		
		init: function(onSucces, onFail){
			this._onSuccess = onSucces;
			this._onFail = onFail;
		},
		
		onSuccessfullAuthentication: function(callback){
			if (this._onSuccess){
				this._onSuccess.call(undefined, this._user, callback);
			}else{
				if (callback){
					callback();
				}
			}
			
		},
		
		onNoDomainAuthentication : function(callback){
			if (this._onFail){
				this._onFail.call(undefined, callback);
			}else{
				if (callback){
					callback();
				}
			}
		},
	
		authenticateWithToken : function (refreshToken, success, fail){
			var that = this;
			if (refreshToken && this._google){
				this._google.clearAccessToken();
			}
			this._google = new OAuth2('google', {
				  client_id: '970815733576-41liq0d4s6m43fuisbbf4om0gc5enb3d.apps.googleusercontent.com',
				  client_secret: 'VAs7nZOzo_9ltR44lvIA1ou6',
				  api_scope: ('https://www.googleapis.com/auth/plus.profile.emails.read'
						  +' https://spreadsheets.google.com/feeds'
						  +' https://www.googleapis.com/auth/drive'
						  +' https://www.googleapis.com/auth/drive.appdata'
						  +' https://www.googleapis.com/auth/drive.file'
						  +' https://www.googleapis.com/auth/drive.metadata'
						  )
				});

			this._google.authorize(function() {
				var token = that._google.getAccessToken();
				if (!_.isEmpty(token)){
					utils.getUserInfo(undefined, token, function(userInfo){
						var user  = utils.mapUser(userInfo, token);
						if (_.isEmpty(user._company)){
							that.onNoDomainAuthentication(function(){
								if (fail){
									fail.call(undefined);
								}
							});
						}else{
							that._user = user;
							that.onSuccessfullAuthentication(function(){
								if (success){
									success.call(this, user);
								}
							});
							
						}
					});
				}
			});
		},
		
		getAccessToken : function(){
			return this._google.getAccessToken();
		},
		
		authenticateWithIdentity: function(){
			var that = this;
			chrome.identity.getProfileUserInfo(function(token) {
				if (!_.isEmpty(token.id)){
					var user  = utils.mapUser(userInfo);
					if (that.checkUser(user)){
						that._user = user;
						that.onSuccessfullAuthentication();
					}
				}
			});
		},
		
	});
	
	
	utils.ITEM = utils.Class.extend({
		
		_restaurant : null,
		
		_name : null,
		
		_price : null,
		
		
		init : function(){
		},
		
		view : function(){
			
		}
		
		
	});
	
	utils.USER = utils.Class.extend({
		
		_gid : null,
		
		_name : null,
		
		_id : null,
		
		_company : null,
		
		init : function(gid, name, company, id){
			this._gid = gid;
			this._name = name;
			this._id = id;
			this._company = company;
		},
		
		view : function(){
		}
		
	});
	
	utils.OAuthUSER = utils.USER.extend({
		
		
		_accessToken : null,
		
		_image : null,
		
		init : function(gid, name, company, id, image){
			this._super(gid, name, company, id);
			this._image = image;
		},
		
	});
	
	utils.RESTAURANT = utils.Class.extend({
		
		_url : null,
		
		_name : null,
		
		
		init : function(data){
			this._url = data.url;
			this._name = data.name;
		},
		
		view : function(){
			
		}
		
	});
	
	utils.ORDER = utils.Class.extend({
		
		_restaurant : null,
		
		_itemName : null,
		
		_itemPrice : null,
		
		_itemId: null,
		
		_user : null,
		
		_date : null,
		
		_details : null,
		
		_status : null,
		
		init : function(restaurant, item, itemId, price, user, date, status, details){
			this._restaurant = restaurant;
			this._itemName = item;
			this._itemId = itemId;
			this._itemPrice = price;
			this._user = user;
			this._date = date;
			this._status = status;
			this._details = details;
			if (_.isEmpty(details.userImg) && !_.isEmpty(this._user._image)){
				this._details.userImg = this._user._image;
			}
		},
		
		toGJSON: function(){
			var result = {};
			result['gsx:user'] = this._user._name;
			result['gsx:restaurant'] = this._restaurant;
			result['gsx:item'] = this._itemName;
			result['gsx:itemId'] = this._itemId;
			result['gsx:price'] = this._itemPrice;
			result['gsx:date'] = this._date;
			result['gsx:status'] = this._status;
			result['gsx:details'] = JSON.stringify(this._details);
			var doc = $.parseXML('<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended"/>');
			var xml = doc.getElementsByTagName("entry")[0]
			var key, elem

			for (key in result) {
			  if (result.hasOwnProperty(key)) {
			    elem = doc.createElement(key)
			    $(elem).text(result[key])
			    xml.appendChild(elem)
			  }
			}
			return xml.outerHTML;
		},
		
		
	});
	
	utils.GOrder = utils.ORDER.extend({
		
		_gEntry : null,
		
		init : function(entry){
			this._super(entry.gsx$restaurant.$t,entry.gsx$item.$t,entry.gsx$itemid.$t,entry.gsx$price.$t,new utils.USER(undefined, entry.gsx$user.$t),entry.gsx$date.$t,entry.gsx$status.$t,$.parseJSON(entry.gsx$details.$t));
			this._gEntry = entry;
		},
		
	});
	
	utils.IORDERMANAGER = utils.Class.extend({
		
		_db : null,
		_auth : null,
		_controller: null,
		
		init : function(db, auth){
			var that = this;
			if (!auth){
				this._auth=new utils.AUTHENTICATOR(function(user, callback){
					that._db.initDriveDocument(user, function(){
						that.onDBReady();
						callback();
					});
				});
			}else{
				this._auth = auth;
			}
			if (!db){
				this._db = new utils.GDriveDataStore();
			}else{
				this._db = db;
			}
			chrome.runtime.onMessage.addListener(function( message, sender, sendResponse) {
				var processMessage = function(){
					if (that._auth._user){
						that._db.saveNewOrder(new utils.ORDER(message.restaurant,message.name, message.itemId,  message.price, that._auth._user, message.date, message.status, {imagePath:message.imagePath}), function(order){
							sendResponse({error:false});
						});
					}else{
						sendResponse({error:true, message:'not authenticated'});
					}
				}
				if (!that._auth._user){
					that._auth.authenticateWithToken(false, function(){
						processMessage();
					}, function(){
						sendResponse({error:true, message:'not authenticated'});
					});
				}else{
					processMessage();
				}
			});
			
		},
		
		onDBReady: function(){//no async calls
			var that = this;
		},
		
		getAuthenticateUserOrders: function(callback){
			var that = this;
			this._db.getAllOrders(function(orders){
				var result = [];
				if (!_.isEmpty(orders)){
					orders.forEach(function(order){
						if (order._user._name === that._auth._user._name){
							result.push(order);
						}
					});
				}
				callback(result);
			});
		},
		
		
		authenticateUser : function(user){
			return true;
		},
		
		findUserByGID: function(gid){
			
		},
		
		addUser : function(user){
			
		}
		
	});
	
	utils.DATASTORE = utils.Class.extend({
		
		
		init : function(orderManager){
		},
		
		getAllOrders : function(user){
			
		},
		
		saveNewOrder : function(order){
			
		}
		
	});
	
	utils.GDriveDataStore = utils.DATASTORE.extend({
		
		_user : null,
		
		_endPoints : null,
		
		_documentName : null,
		
		init : function(user){
			this._super();
			this._endPoints = {find:{url:'https://www.googleapis.com/drive/v2/files', type:'GET'},
					insert:{url:'https://www.googleapis.com/drive/v2/files', type:'POST'},
					permissions:{url:'https://www.googleapis.com/drive/v2/files/{id}/permissions', type:'POST'},
					revisions:{url:'https://www.googleapis.com/drive/v2/files/{id}/revisions/head', type:'PUT'},
					items:{url:'https://spreadsheets.google.com/feeds/list/{id}/1/public/full?alt=json', type:'GET'},
					cells:{url:'https://spreadsheets.google.com/feeds/cells/{id}/1/private/full/batch', type:'POST'},
					dynamic:{
							addOrder:{key:'http://schemas.google.com/g/2005#post', type:'POST'},
							deleteOrder:{key:'self', type:'DELETE'}
						}};
		},
		
		initDriveDocument : function(user, callback){
			var that =this;
			this._user = user;
			this._documentName = this._user._company + ' Orders';
			this.findDocument(function(documentId){
				var setDocument = function(documentId){
					that._documentId = documentId;
					that.getAllOrders(function(){
						if (callback)
							callback.call(undefined);	
					});
				};
				if (documentId){
					setDocument(documentId);
				}else{
					that.createDocument(setDocument);
				}
			});
		},
		
		createDocument : function(callback){
			var that = this;
			$.ajax({
		         url: that._endPoints.insert.url+'?key='+utils.API_KEY,
		         data: JSON.stringify({title: that._documentName, mimeType: "application/vnd.google-apps.spreadsheet"}),
		         contentType:'application/json',
		         type: that._endPoints.insert.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        	 },
		         success: function(data){
						if (!_.isEmpty(data)){
							var id =  data.id;
							that.setPermissions(id, function(){
								callback(id);
							});
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 error: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
						 that.createDocument(callback);
					 }
				 }
		      });
		},
		
		setPermissions : function(id ,callback){
			var that = this;
			$.ajax({
		         url: that._endPoints.permissions.url.replace('{id}', id)+'?key='+utils.API_KEY,
		         data: JSON.stringify({ "role": "writer","type": "domain","value": that._user._company}),
		         contentType:'application/json',
		         type: that._endPoints.permissions.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        	 },
		         success: function(data){
						if (!_.isEmpty(data)){
							that.publish(id, function(){
								callback();	
							})
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 error: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
						 that.setPermissions(id, callback);
					 }
				 }
		      });
		},
		
		publish : function(id ,callback){
			var that = this;
			$.ajax({
		         url: that._endPoints.revisions.url.replace('{id}', id)+'?key='+utils.API_KEY,
		         data: JSON.stringify({  "publishAuto": true,"published": true}),
		         contentType:'application/json',
		         type: that._endPoints.revisions.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        	 },
		         success: function(data){
						if (!_.isEmpty(data)){
							that.checkHeaders(id, function(){
								callback();
							});
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 error: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
						 that.setPermissions(id, callback);
					 }
				 }
		      });
		},
		
		checkHeaders : function(id, callback){
			var headers = utils.getHeaders(id);
			var that = this;
			$.ajax({
		         url: that._endPoints.cells.url.replace('{id}', id)+'?key='+utils.API_KEY,
		         data: headers,
		         contentType:'application/atom+xml',
		         type:  that._endPoints.cells.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        		 xhr.setRequestHeader('If-Match', '*');
		        	 },
		         success: function(data){
						if (!_.isEmpty(data)){
							callback();
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 error: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
					 }
				 }
		      });
		},
		
		
		findDocument: function(callback, shared){
			var that = this;
			$.ajax({
		         url: that._endPoints.find.url+'?key='+utils.API_KEY,
		         data: {q:"title='"+that._documentName+"' and trashed=false" + (shared ? " and sharedWithMe=true" : "")},
		         type: that._endPoints.find.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        	 },
		         success: function(data){
						if (!_.isEmpty(data)){
							if (_.isEmpty(data.items) && shared){
								return that.findDocument(callback, false);
							}
							var id = !_.isEmpty(data.items) ? data.items[0].id : undefined;
							callback(id);
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 error: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
						 that.findDocument(callback, shared);
					 }
				 }
		      });
		},
		
		getAllOrders : function(callback){
			var that = this;
			$.ajax({
		         url: that._endPoints.items.url.replace('{id}', that._documentId)+'&key='+utils.API_KEY ,
		         type: that._endPoints.items.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        	 },
		         success: function(data){
						if (!_.isEmpty(data)){
							that._list = data;
							callback(utils.parseListDataToOrders(data));
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 error: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
						 that.getAllOrders(callback);
					 }
				 }
		      });
		},
		
		saveNewOrder : function(order, callback){
			if (order._gEntry){
				console.log(order + ' is allready saved.');
				return;
			}
			var that = this;
			var link = that.getLinkFor(that._endPoints.dynamic.addOrder.key);
			$.ajax({
		         url: link.href.replace('public','private') +'?key='+utils.API_KEY+'&alt=json',
		         data: order.toGJSON(),
		         contentType:link.type,
		         type: that._endPoints.dynamic.addOrder.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        	 },
		         success: function(data){
						if (!_.isEmpty(data)){
							callback(new utils.GOrder(data.entry));
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 error: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
					 }
				 }
		      });
		},
		
		deleteOrder : function(order, callback){
			if (!order._gEntry){
				console.log(order + ' cant delete unsaved order!');
				return;
			}
			var that = this;
			var link = that.getLinkFor(that._endPoints.dynamic.deleteOrder.key, order._gEntry.link);
			$.ajax({
		         url: link.href.replace('public','private') +'?key='+utils.API_KEY,
		         //data: order.toGJSON(),
		         contentType:link.type,
		         type: that._endPoints.dynamic.deleteOrder.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        		 xhr.setRequestHeader('If-Match', '*');
		        	 },
		         success: function(data){
						if (_.isEmpty(data)){
							callback(data);
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 error: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
					 }
				 }
		      });
		},
		
		getLinkFor: function(key, links){
			var result = undefined;
			var links = links || this._list.feed.link;
			links.forEach(function(link){
				if (link.rel === key){
					result = link;
				}
			});
			return result;
		},
		
		
		
	});
	
	utils.OrderController = utils.Class.extend({
		
		_view : null,
		
		_events: null,
		
		init: function(view){
			var that = this;
			this._events = {orderDeleted: new utils.Event()};
			this._view = view;
			this._view._events.deleted.subscribe(function(order, callback){
				that.deleteOrder(order, callback);
			});
		},
		
		deleteOrder : function(order, callback){
			this._events.orderDeleted.publish(order, function(){
				callback();
			});
		},
		
		addOrder: function(order){
			this._view.addView(new utils.OrderView(order));
		}
		
		
	});
	
	utils.OrdersView = utils.Class.extend({
		
		_views : null,
		
		_events : null,
		
		_$wrap : null,
		
		init: function(views){
			var that = this;
			this._$wrap = this.get$Wrap();
			this._views = views || [];
			this._events = {deleted: new utils.Event(), viewsChanged: new utils.Event()};
			this._views.forEach(function(view){
				that.addView(view);
			});
			this.checkContainer();
			this._events.viewsChanged.subscribe(function(){
				that.checkContainer();
			});
		},
		
		deleteView : function(view, callback){
			var that = this;
			this._events.deleted.publish(view._order, function(){
				callback();
				that._views.splice(that._views.indexOf(view),1);
				that._events.viewsChanged.publish();
			});
		},
		
		addView: function(view){
			var that = this;
			this._views.push(view);
			if (view._events){
				view._events.deleted.subscribe(function(view, callback){
					that.deleteView(view, callback);
				});
			}
			view._$wrap.appendTo(this._$wrap).show('slow');
			this._events.viewsChanged.publish();
		},
		
		checkContainer: function(){
			if (this._views.length === 0){
				this._$noOrders = $("<p class='muted'>no orders, yet...</p>");
				this._$wrap.append(this._$noOrders);
			}else{
				this._$noOrders.remove();
			}
		},
		get$Wrap: function(){
			return $('#orders-container');
		},
		
		
	});
	
	utils.HistoryOrdersView = utils.OrdersView.extend({
		get$Wrap: function(){
			return $('#history-orders-container');
		},
		
		checkContainer: function(){
			if (this._views.length === 0){
				this._$noOrders = $("<tr><td class='muted' colspan='6'>no orders, yet...</td></tr>");
				this._$wrap.append(this._$noOrders);
			}else{
				this._$noOrders.remove();
			}
		},
	});
	
	utils.AdminOrdersView = utils.HistoryOrdersView.extend({
		
		_userViews : null,
		
		init: function(){
			this._super();
			this._userViews = {};
		},
		
		
		addView: function(view){
			var userView = this._userViews[view._order._user]; 
			if (!userView){
				userView = new utils.UserView();
				this._userViews[view._order._user] = userView;
				this._super(userView);
			}
			userView.addOrderView(view);
		},
		
		deleteView : function(user, callback){
			var view = this._userViews[user];
			view._$wrap.remove();
			this._userViews[user] = undefined;
			this._super(view, callback);
		},
		
		get$Wrap: function(){
			return $('#administrate-orders-container');
		},
		
		checkContainer: function(){
			if (this._views.length === 0){
				this._$noOrders = $("<tr><td class='muted' colspan='5'>no orders, yet...</td></tr>");
				this._$wrap.append(this._$noOrders);
			}else{
				this._$noOrders.remove();
			}
		},
		
		deleteViews : function(){
			var that = this;
			Object.keys(this._userViews).forEach(function(user){
				that.deleteView(user);
			});
		},
		
		refreshing : function(isRefresh){
			if (isRefresh){
				this._$refreshOrders = $("<tr><td class='muted' colspan='5'><div class='progress progress-striped active'><div class='bar' style='width: 100%;'></div></div></td></tr>");
				this._$wrap.append(this._$refreshOrders);
				if (this._$noOrders)
					this._$noOrders.remove();
			}else{
				this._$refreshOrders.remove();
				this.checkContainer();
			}
		}
	});
	
	utils.OrderView = utils.Class.extend({
		
		_order : null,
		
		_events : null,
		
		_$wrap : null,
		
		init: function(order){
			this._order = order;
			this._events = {deleted: new utils.Event()};
			this._$wrap = this.get$Wrap();
			$('.item-name', this._$wrap).html(this._order._itemName);
			$('.item-restaurant', this._$wrap).html(this._order._restaurant);
			$('.item-price', this._$wrap).html(this._order._itemPrice);
			$('.preview-item-img', this._$wrap).attr('src',utils.getParser(this._order._restaurant).getItemImage(this._order));
			this.initHandlers();
		},
		
		get$Wrap: function(){
			return $('#order-view-mock').clone().removeAttr('id');
		},
		
		initHandlers : function(){
			var that = this;
			$('.remove-order', this._$wrap).click(function(){
				that._events.deleted.publish(that, function(){
					that._$wrap.hide('slow', function(){
						$(this).remove();
					});
				});
			});
		}
		
		
	});
	
	utils.HistoryOrderView = utils.OrderView.extend({
		
		init: function(order){
			this._super(order);
			var date = new Date(this._order._date);
			var sDate = "" + date.getDate() + date.getMonth() + date.getFullYear()
			$('.item-date', this._$wrap).html(sDate);
			$('.item-status', this._$wrap).html(this._order._status);
		},
		
		initHandlers : function(){
			var that = this;
			this.initPreview();
		},
		
		initPreview: function(){
			var that = this;
			this._$wrap.popover({
				html: true,
				placement: function (context, source) {
			        var position = $(source).position();

			        if (position.top < 180){
			            return "bottom";
			        }

			        return "top";
			    },
				trigger: 'hover',
				title:this._order._itemName,
				content:function(){
					var result = $('.preview-item-img', this._$wrap).clone();
					result.removeClass('preview-item-img-small');
					result.addClass('preview-item-img-big');
					return result[0].outerHTML;
				}
			});
		},
		
		get$Wrap: function(){
			return $('#order-history-view-mock').clone().removeAttr('id');
		},
		
		
	});
	
	utils.UserView = utils.Class.extend({
		
		_ordersViews : null,
		
		_$wrap : null,
		
		_total : 0,
		
		init: function(orders){
			var that =this;
			this._$wrap = this.get$Wrap();
			this.initHandlers();
			this._ordersViews = [];
			if (!_.isEmpty(orders)){
				orders.forEach(function(order){
					that.addOrderView(order)
				});
			}
		},
		
		addOrderView : function(orderView){
			var that = this;
			this._ordersViews.push(orderView);
			if (this._ordersViews.length === 1){
				orderView._$wrap.prepend(function(){
					var $cell = that.getUserCell();
					$(".user-img", $cell).attr('src', orderView._order._details.userImg || 'http://www.jetcharters.com/bundles/jetcharterspublic/images/image-not-found.jpg');
					$(".user-name", $cell).html(orderView._order._user._name);
					return $cell;
				});
				this._$wrap.prepend(orderView._$wrap);
			}else{
				this._$wrap.find('tr').first().after(orderView._$wrap);
			}
			this._total += Number(orderView._order._itemPrice);
			this.updateView();
			
		},
		
		getUserCell : function(){
			return $("#admin-user-cell").clone().removeAttr("id");
		},
		
		removeOrderView : function(orderView){
			this._total -= Number(orderView._order._price);
			this._ordersViews.splice(this._ordersViews.indexOf(orderView),1);
			this.updateView();
		},
		
		updateView: function(){
			this._$wrap.find('tr').first().find('td').first().attr('rowspan', this._ordersViews.length + 1);
			$(".user-total", this._$wrap).html(this._total);
		},
		
		initHandlers : function(){
			var that = this;
		},
		get$Wrap: function(){
			return $('<tbody class="user-order"><tr><td colspan="3">Total</td><td colspan="1" class="user-total"></td></tr></tbody>');
		},
		
	});
	
	utils.UserOrderView = utils.HistoryOrderView.extend({
		
		init: function(order){
			this._super(order);
		},
		
		initHandlers : function(){
			var that = this;
		},
		
		get$Wrap: function(){
			return $('#order-admin-view-mock').clone().removeAttr('id');
		},
		
		
	});
	
	
	
	utils.parseListDataToOrders = function(data){
		var result = [];
		if (!_.isEmpty(data.feed.entry)){
			data.feed.entry.forEach(function(entry){
				var order = new utils.GOrder(entry);
				result.push(order);
			});
		}
		return result;
	};
	
	utils.getUserInfo = function(id, token, callback){
		$.ajax({
	         url: 'https://www.googleapis.com/plus/v1/people/'+(id || 'me')+'?key='+utils.API_KEY,
	         type: "GET",
	         beforeSend: function(xhr){
	        	 if (token)
	        		 xhr.setRequestHeader('Authorization', 'Bearer '+token);
	        	 },
	         success: function(data){
					if (!_.isEmpty(data)){
						callback({name:data.name.familyName + " " + data.name.givenName, gid:data.id, company:data.domain, img: data.image ? data.image.url : undefined});
					}
				} 
	      });
	};
	
	utils.getHeaders = function(id){
		var feed = '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:batch="http://schemas.google.com/gdata/batch" xmlns:gs="http://schemas.google.com/spreadsheets/2006">';
		
		var result = [];
		['user','restaurant','item','itemId','price','date','status','details'].forEach(function(header, index){
			var pos = index +1;
			var doc ='<entry'+
				    '>'+
				    ' <batch:id>'+String.fromCharCode(64 + pos)+'1</batch:id>'+
				    '<batch:operation type="update"/>'+
			  '<id>https://spreadsheets.google.com/feeds/cells/'+id+'/private/full/R1C'+pos+'</id>'+
			  '<link rel="edit" type="application/atom+xml" '+
			   'href="https://spreadsheets.google.com/feeds/cells/'+id+'/1/private/full/R1C'+pos+'"/>'+
			  '<gs:cell row="1" col="'+pos+'" inputValue="'+header+'"/>'+
			'</entry>';
			feed+=doc;
		});
		feed+='<id>https://spreadsheets.google.com/feeds/cells/'+id+'/1/private/full</id></feed>';
		return feed;
	};
	
	utils.isOrderActive = function(order){
		return order._status === 'new';
	}
	
	utils.isOrderCommited = function(order){
		return order._status === 'commited';
	}
	
	utils.getParser = function(restaurant){
		if (restaurant === utils.ANDYS_RESTAURANT_CONST.name){
			return new utils.AndysParser();
		}
	};
	
	utils.mapUser = function(userInfo, token){
		var user = new utils.OAuthUSER(userInfo.gid, userInfo.name, userInfo.company, undefined, userInfo.img);
		if (token){
			user._accessToken = token;
		}
		return user;
	};
	
	 // 
    utils.Event=function(){
        this._iterProcess=false;
        this._subscribers=[];
        this._iterationIndex=null;
    };
        // 
    utils.Event.prototype.publish=function(){
        if(this._iterProcess){
            throw new Error('Can not publish within other publish event');
        }else{
            this._iterProcess=true;
            for(this._iterIndex=0; this._iterIndex<this._subscribers.length; this._iterIndex++){
                this._subscribers[this._iterIndex].apply(undefined, arguments);
            }
            this._iterProcess=false;
        }
    };
    // 
    utils.Event.prototype.subscribe=function(subscriber){
        if(this._subscribers.indexOf(subscriber)===-1){
            this._subscribers.push(subscriber);
        }
    };
    // 
    utils.Event.prototype.unsubscribe=function(subscriber){
        var pos=this._subscribers.indexOf(subscriber);
        if(pos!==-1){
            if(this._iterProcess){
                this._iterIndex--;
            }
            this._subscribers.splice(pos, 1);
        }
    };
    // 
    utils.Event.prototype.count=function(){
        return this._subscribers.length;
    };
})();