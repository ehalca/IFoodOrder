// Class Library. Inspired by Simple JavaScript Inheritance By John Resig
var utils = utils || {};

(function() {
	
        utils.ANDYS_RESTAURANT_CONST = {name:"Andys", url:"http://www.andys.md", checkOutUrl:"http://www.andys.md/ro/pages/cart/"};
        utils.LAPLACINTE_RESTAURANT_CONST = {name:"LaPlacinte", url:"http://laplacinte.md/", checkOutUrl:"http://laplacinte.md/ro/pages/cart/"};
        utils.OLIVA_RESTAURANT_CONST = {name:"Oliva", url:"http://www.oliva.md/", checkOutUrl:"http://www.oliva.md/cart/"};
        utils.CELENTANO_RESTAURANT_CONST = {name:"Celentano", url:"http://www.celentano.md/", checkOutUrl:"http://www.celentano.md/ro/basket.html"};
        utils.SUPPORTED_RESTAURANTS = [utils.ANDYS_RESTAURANT_CONST,utils.LAPLACINTE_RESTAURANT_CONST, utils.OLIVA_RESTAURANT_CONST,utils.CELENTANO_RESTAURANT_CONST];
        
        
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
						var user = utils.mapUser(userInfo, token);
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
			result['gsx:itemid'] = this._itemId;
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
		_adminManager: null,
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
						that._db.saveNewOrder(new utils.ORDER(message.restaurant,message.name, message.itemId,  message.price, that._auth._user, message.date, message.status, message.details), function(order){
							sendResponse({error:false});
							chrome.browserAction.getBadgeText({}, function (result){
								chrome.browserAction.setBadgeText({text:(Number(result)+1).toString()});
							});
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
			if (!that._adminManager && that._db instanceof utils.GDriveDataStore){
				that._adminManager = new utils.GAdministrateManager(function(){},that._db);
			}
		},
		
		checkAdmin: function(callback){
			this._adminManager.checkAdmin(callback);
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
	
	utils.AdministrateManager = utils.Class.extend({
		
		_onAccessRequested :null,
		
		init: function(onAccessRequested){
			this._onAccessRequested = onAccessRequested;
			
		},
		
		isUserAdmin: function(user){
			
		},
		
		isAdminSet: function(){
			
		},
		
		setUserAdmin: function(user){
			
		},
		
		requestAdminAccess: function(user){
			
		},
		
	});
	
	utils.GAdministrateManager = utils.AdministrateManager.extend({
		
		ADMIN_PROPERTY : 'ADMIN_USER',
		ACCESS_REQUESTED_PROPERTY : 'ACCESS_REQUESTED',
		USERS_PROPERTY : 'SAVED_USERS',
		
		_endPoints : {
			get:{url:'https://www.googleapis.com/drive/v2/files/fileId/properties/propertyKey', type:'GET'},
			insert:{url:'https://www.googleapis.com/drive/v2/files/fileId/properties',type:'POST'},
			update:{url:'https://www.googleapis.com/drive/v2/files/fileId/properties/propertyKey',type:'PUT'}
			},
		
		
		_gStore : null,
		
		init: function(onAccessRequested, gStore){
			this._gStore = gStore;
			this._super(onAccessRequested);
		},
		
		checkAdmin: function(callback){
			var that = this;
			this.isAdminSet(function(isAdminSet){
				var setCurrentUserAdmin = function(){
					that._gStore._user._isAdmin = true;
					callback(that._gStore._user);
				};
				if (!isAdminSet){
					that.setUserAdmin(that._gStore._user, function(){
						setCurrentUserAdmin();
						that.saveUser(that._gStore._user);
					});
				}else{
					that.isUserAdmin(that._gStore._user, function(isUserAdmin){
						if (isUserAdmin){
							setCurrentUserAdmin();
						}else{
							callback(that._gStore._user);
						}
					});
				}
			})
		},
		
		saveUser: function(user, callback){
			var that = this;
			this.getUsers(function(users){
				if (users.indexOf(user._name) === -1){
					users.push(user._name);
				}
				that.saveProperty(that.USERS_PROPERTY, users.join(';'), function(value){
					if (callback){
						callback(true);
					}
				});
			});
		},
		
		getUsers: function(callback){
			var that = this;
			this.getProperty(this.USERS_PROPERTY, function(value){
				callback(value ? value.split(';') : []);
			});
		},
		
		isUserAdmin: function(user, callback){
			var that= this;
			this.getProperty(this.ADMIN_PROPERTY, function(value){
				callback(value === user._name);
				that.saveUser(user);
			});
		},
		
		isAdminSet: function(callback){
			this.getProperty(this.ADMIN_PROPERTY, function(value){
				callback(value);
			});
		},
		
		setUserAdmin: function(user, callback){
			this.saveProperty(this.ADMIN_PROPERTY, user._name, function(result){
				callback(result);
			});
		},
		
		getAdminRequests: function(callback){
			this.getProperty(this.ACCESS_REQUESTED_PROPERTY, function(value){
				callback(value ? value.split(';') : []);
			});
		},
		
		requestAdminAccess: function(user, callback){
			var that = this;
			if (!user){
				user = this._gStore._user;
			}
			this.getAdminRequests(function(requests){
				if (requests.indexOf(user._name) === -1){
					requests.push(user._name);
				}
				that.saveProperty(that.ACCESS_REQUESTED_PROPERTY, requests.join(';'), function(result){
					if (callback){
						callback(result);
					}
				});
			});
		},
		
		giveAdminAccess: function(username, callback){
			var that= this;
			this.getAdminRequests(function(requests){
				if (requests.indexOf(username) > -1){
					requests.splice(requests.indexOf(username), 1);
				}
				that.saveProperty(that.ACCESS_REQUESTED_PROPERTY, requests.join(';'), function(result){
					that.setUserAdmin({_name: username}, function(result){
						if (callback){
							callback(result);
						}
					});
				});
			});
		},
		
		saveProperty: function(key, value, callback){
			var that = this;
			this.getProperty(key, function(result){
				if (result){
					that.updateProperty(key, value, callback);
				}else{
					$.ajax({
				         url: that._endPoints.insert.url.replace('fileId',that._gStore._documentId)+'?key='+utils.API_KEY,
				         data: JSON.stringify({key:key,value:value}),
				         contentType:'application/json',
				         type: that._endPoints.insert.type,
				         beforeSend: function(xhr){
				        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._gStore._user._accessToken);
				        	 },
				         success: function(data){
								if (!_.isEmpty(data)){
									callback(data.value);
								}else{
									//TBD process error
									 callback(undefined);
								}
							},
						 error: function( jqXHR,  textStatus, errorThrown ){
							 callback(undefined);
						 }
				      });
				}
			});
		},
		
		updateProperty: function(key, value, callback){
			var that = this;
			$.ajax({
		         url: that._endPoints.update.url.replace('fileId',that._gStore._documentId).replace('propertyKey', key)+'?key='+utils.API_KEY,
		         data: JSON.stringify({key:key,value:value}),
		         contentType:'application/json',
		         type: that._endPoints.update.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._gStore._user._accessToken);
		        	 },
		         success: function(data){
						if (!_.isEmpty(data)){
							callback(data.value);
						}else{
							//TBD process error
							 callback(undefined);
						}
					},
				 error: function( jqXHR,  textStatus, errorThrown ){
					 callback(undefined);
				 }
		      });
		},
		
		getProperty: function(key, callback){
			var that = this;
			$.ajax({
		         url: that._endPoints.get.url.replace('fileId',that._gStore._documentId).replace('propertyKey', key)+'?key='+utils.API_KEY,
		         contentType:'application/json',
		         type: that._endPoints.get.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._gStore._user._accessToken);
		        	 },
		         success: function(data){
						if (!_.isEmpty(data)){
							callback(data.value);
						}else{
							//TBD process error
							 callback(undefined);
						}
					},
				 error: function( jqXHR,  textStatus, errorThrown ){
					 callback(undefined);
				 }
		      });
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
							deleteOrder:{key:'self', type:'DELETE'},
                                                        updateOrder:{key:'self', type:'PUT'}
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
		
		
		findDocument: function(callback){
			var that = this;
			$.ajax({
		         url: that._endPoints.find.url+'?key='+utils.API_KEY,
		         data: {q:"title='"+that._documentName+"' and trashed=false", corpus:"DOMAIN"},
		         type: that._endPoints.find.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        	 },
		         success: function(data){
						if (!_.isEmpty(data)){
							var id = !_.isEmpty(data.items) ? data.items[0].id : undefined;
							callback(id);
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 error: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
						 that.findDocument(callback);
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
                
                updateOrder : function(order, callback){
			if (!order._gEntry){
				console.log(order + ' cant delete unsaved order!');
				return;
			}
			var that = this;
			var link = that.getLinkFor(that._endPoints.dynamic.updateOrder.key, order._gEntry.link);
			$.ajax({
		         url: link.href.replace('public','private') +'?key='+utils.API_KEY,
		         data: order.toGJSON(),
		         contentType:link.type,
		         type: that._endPoints.dynamic.updateOrder.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        		 xhr.setRequestHeader('If-Match', '*');
		        	 },
		         success: function(data){
						if (!_.isEmpty(data)){
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
	
	utils.DomainController = utils.Class.extend({
		
		_propertyManager: null,
		
		_view : null,
		
		_user : null,
		
		init: function(propertyManager, view){
			var that = this;
			this._propertyManager = propertyManager;
			this._view = view || new utils.DomainView();
			this._view._events.giveAccess.subscribe(function(username, callback){
				that._propertyManager.giveAdminAccess(username, callback);
			});
			this._view._events.requestAccess.subscribe(function(callback){
				that._propertyManager.requestAdminAccess(undefined,callback);
			});
		},
		
		updateView: function(user){
			this._user = user;
			var that = this;
			this._propertyManager.getUsers(function(users){
				that._view.setUsers(users);
			});
			this._propertyManager.isAdminSet(function(admin){
				that._propertyManager.isUserAdmin(that._user, function(result){
						that._propertyManager.getAdminRequests(function(requests){
							if (result){
								that._view.setAdminRequest(requests);
							}
							that._view.setAdminInfo(admin, result, requests.indexOf(that._user._name) > -1);
						});
				});
			});
			this._view.setDomainInfo(undefined, this._user._company);
		},
		
	});
	
	utils.DomainView = utils.Class.extend({
		
		_$wrap: null,
		
		_events: null,
		
		init: function(){
			this._$wrap = this.get$Wrap();
			this._events = {giveAccess: new utils.Event(), requestAccess: new utils.Event()};
		},
		
		setDomainInfo: function(image, domainName){
			$('.domain-name', this._$wrap).html(domainName);
		},
		
		setUsers: function(users){
			$('.domain-users', this._$wrap).html(users.length > 0 ? users.join(',') : 'no users saved');
		},
		
		setAdminInfo: function(admin, isAdmin, isAdminRequested){
			var that = this;
			$('.domain-admin', this._$wrap).html(admin);
			var alreadyRequested = function(){
				$('.domain-request', that._$wrap).html('<p class="muted"><i>You have already requested Admin access.</i></p>');
			};
			if (isAdmin){
				$('.admin-request', this._$wrap).hide();
			}else{
				$('.admin-request', this._$wrap).show();
				if (isAdminRequested){
					alreadyRequested();
				}else{
					var $requestBtn = $('<a class="btn btn-info">Request Access</a>');
					$requestBtn.on('click', function(){
						$(this).attr('disabled', 'disabled');
						that._events.requestAccess.publish(function(){
							alreadyRequested();
						});
					});
					$('.domain-request', that._$wrap).empty().append($requestBtn);
				}
			}
		},
		
		setAdminRequest: function(requests){
			var that = this;
			var $container =$('.admin-requests-container', this._$wrap);
			if (requests.length > 0){
				$('.admin-requests', this._$wrap).show();
			}else{
				$('.admin-requests', this._$wrap).hide();
			}
			requests.forEach(function(request){
				var $mock = $('<dt>'+request+'</dt>');
				var $btn = $('<a class="btn">Give Access</a>');
				$btn.on('click', function(){
					$('a.btn', $container).attr('disabled','disabled');
					that._events.giveAccess.publish(request, function(){
						$('.admin-requests', that._$wrap).hide();
					});
				});
				$container.append($mock);
				$container.append($btn);
			});
		},
		
		get$Wrap: function(){
			return $('#domain-info');
		}
		
	});
	
	utils.OrderController = utils.Class.extend({
		
		_view : null,
                
                _orders : null,
                
                _historyView : null,
		
		_events: null,
		
		init: function(view){
			var that = this;
			this._events = {orderDeleted: new utils.Event(),orderUpdated: new utils.Event(), orderReordered: new utils.Event()};
			this._view = view;
                        this._orders = [];
                        this._historyView = new utils.HistoryOrdersView();
			this._view._events.deleted.subscribe(function(order, callback){
				that.deleteOrder(order, callback);
			});
            this._view._events.confirmClicked.subscribe(function(view, callback){
                that.confirm(function(result){
                    if (result){
                    }
                    callback();
                });
            });
		},
		
		deleteOrder : function(order, callback){
                    var that = this;
			this._events.orderDeleted.publish(order, function(){
                                that._orders.splice(that._orders.indexOf(order),1);
				callback();
			});
		},
		
		addOrder: function(order){
			var that = this;
            this._orders.push(order);
            var orderView = new utils.OrderView(order);
            orderView._events.commited.subscribe(function(order, callback){
            	 that.commitOrder(order, callback);
			});
			this._view.addView(orderView);
			return orderView;
		},
                
        addHistoryOrder: function(order){
        	var that = this;
        	var historyOrderView = new utils.HistoryOrderView(order);
        	historyOrderView._events.reOrdered.subscribe(function(order){
        		that._events.orderReordered.publish(order);
        	});
            this._historyView.addView(historyOrderView);
        },

        confirm : function(callback){
            var that = this;
            var count = this._orders.length;
            function done(){
                if (count === 1){
                    callback();
                }else{
                    count --;
                }
            };
            this._orders.forEach(function(order){
                that.commitOrder(order, done);
            });
        },
        
        commitOrder: function(order, callback){
        	var that = this;
        	order._status = 'commited';
            that._events.orderUpdated.publish(order, callback);
        }
		
	});
	
	utils.OrdersView = utils.Class.extend({
		
		_views : null,
		
		_events : null,
		
		_$wrap : null,
                
                _$confirm : null,
		
		init: function(views){
			var that = this;
			this._$wrap = this.get$Wrap();
                        this._$confirm = $('.confirm', this._$wrap).hide();
			this._views = views || [];
			this._events = {deleted: new utils.Event(), viewsChanged: new utils.Event(), confirmClicked: new utils.Event()};
			this._views.forEach(function(view){
				that.addView(view);
			});
			this.checkContainer();
			this._events.viewsChanged.subscribe(function(){
				that.checkContainer();
			});
                        this._$confirm.off('click').on('click', function(){
                            that._events.confirmClicked.publish(that, function(){
                                that.updateViews();
                            });
                        });
		},
                
        updateViews: function(){
        	this._views.forEach(function(view){view.updateView();});
        	this.checkContainer();
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
                                this._$confirm.hide();
			}else{
				this._$noOrders.remove();
                                this._$confirm.show();
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
                        var that = this;
			this._super();
			this._userViews = {};
		},
		
		updateView:function(){
			var that = this;
			Object.keys(this._userViews).forEach(function(user){
				that._userViews[user].updateView();
			});
		},
		
		addView: function(view){
			var userView = this._userViews[view._order._user._name]; 
			if (!userView){
				userView = new utils.UserView();
				this._userViews[view._order._user._name] = userView;
				this._super(userView);
			}
			userView.addOrderView(view);
		},
		
		deleteView : function(user, callback){
			var view = this._userViews[user];
			view._$wrap.remove();
			delete this._userViews[user];
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
		},
                
	});
	
	utils.OrderView = utils.Class.extend({
		
		_order : null,
		
		_events : null,
		
		_$wrap : null,
		
		init: function(order){
			this._order = order;
			this._events = {deleted: new utils.Event(), commited: new utils.Event()};
			this._$wrap = this.get$Wrap();
			$('.item-name', this._$wrap).html(this._order._itemName);
			$('.item-restaurant', this._$wrap).html(this._order._restaurant);
			$('.item-price', this._$wrap).html(this._order._itemPrice);
			$('.preview-item-img', this._$wrap).attr('src',utils.getParser(this._order._restaurant).getItemImage(this._order));
			this.initHandlers();
            this.updateView();
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
			$('.commit-order', this._$wrap).click(function(){
				that._events.commited.publish(that._order, function(){
					that.updateView();
				});
			});
		},
		
		updateView: function(){
			if (this._order._status === 'commited'){
				this._$wrap.addClass('order-commited');
			}else{
				this._$wrap.removeClass('order-commited');
			}
		}
		
		
	});
	
	utils.HistoryOrderView = utils.OrderView.extend({
		
		init: function(order){
			this._super(order);
			var date = new Date(this._order._date);
			var sDate = "" + date.getDate() + date.getMonth() + date.getFullYear()
			$('.item-date', this._$wrap).html(sDate);
			$('.item-status', this._$wrap).html(this._order._status);
			this._events.reOrdered = new utils.Event();
			this.updateView();
		},
		
		initHandlers : function(){
			var that = this;
			$('.reorder-order', this._$wrap).on('click', function(){
				that._events.reOrdered.publish(that._order);
			});
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
					var result = $('.preview-item-img', that._$wrap).clone();
					result.removeClass('preview-item-img-small');
					result.addClass('preview-item-img-big');
					return result[0].outerHTML;
				}
			});
		},
		
		get$Wrap: function(){
			return $('#order-history-view-mock').clone().removeAttr('id');
		},
                
                updateView: function(){
		}
		
		
	});
        
        utils.AdminOrderProccessor = utils.Class.extend({
            
            _view : null,
            
            _orders: null,
            
            _totalController: null,
            
            init : function(user, view){
                var that = this;
                this._totalController = new utils.TotalController();
                this._view = view;
                this._orders = {};
                this._totalController._events.ordersChanged.subscribe(function(orders){
                		that.update();
                });
                this.userAdminUpdate(user);
            },
            
            addUserOrder: function(order){
                this.processOrder(order);
                this._view.addView(new utils.UserOrderView(order));
            },
            
            deleteOrders: function(){
                this._view.deleteViews();
                this._totalController.clear();
            },
            
            deleteOrder: function(order){
            },
            
            update: function(){
            	this._view.updateView();
            },
            
            processOrder: function(order){
                this._totalController.addOrder(order);
            },
            
            checkOut: function(){
                
            },
            
            userAdminUpdate: function(loggedInUser){
            	if (loggedInUser._isAdmin){
            		this._totalController.showTotals();
            	}else{
            		this._totalController.showAdminMessage();
            	}
            }
            
            
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
			this._ordersViews.forEach(function(orderView){
				orderView.updateView();
			});
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
		
		updateView: function(){
			if (this._order._status === 'delivered'){
				this._$wrap.find('td:nth-last-child(3), td:nth-last-child(2), td:nth-last-child(1)').toggleClass('order-delivered', true);
			}
		}
		
	});
        
        utils.TotalController = utils.Class.extend({
            
            _view : null,
            
            _orders: null,
            
            init: function(view){
                var that = this;
                this._view = view || new utils.TotalsView();
                this._events = {orderUpdated: new utils.Event(), ordersChanged: new utils.Event()};
                this._orders = {};
            },
            
            addOrder: function(order){
            	var that = this;
                var totalOrder = this._orders[order._restaurant];
                if (!totalOrder){
                    this._orders[order._restaurant] = {total:{restaurant:order._restaurant, total:0},orders:[]};
                    totalOrder = this._orders[order._restaurant];
                    var totalView = new utils.TotalView(totalOrder);
                    totalView._events.checkoutClicked.subscribe(function(view){
                        utils.checkOutOrders(view._orders.total.restaurant,view._orders.orders, function(result){
                        	that.ordersConfirmed(view._orders, result);
                        });
                    });
                    totalView._events.retryClicked.subscribe(function(view){
                    	 utils.checkOutOrders(view._orders.total.restaurant,view._orders.orders, function(result){
                         	that.ordersConfirmed(view._orders, result);
                         });
                    });
                    totalView._events.doneClicked.subscribe(function(view){
                        that.ordersDelivered(view._orders, function(){
                        	view._$wrap.remove();
                        });
                    });
                    this._view.addView(totalView);
                }
                var found = false;
                totalOrder.orders.forEach(function(o){
                    if (!found && o._gEntry.id.$t === order._gEntry.id.$t){
                        found = true;
                    }
                });
                if (!found){
                    totalOrder.total.total += Number(order._itemPrice);
                    totalOrder.orders.push(order);
                }
                this._view.updateView();
            },
            
            ordersDelivered: function(orders, callback){
            	var that = this;
            	this.updateOrders(orders,  'delivered', function(){
            		delete that._orders[orders.total._restaurant];
            		that._events.ordersChanged.publish(orders);
            		if (callback){
            			callback();
            		}
            	});
            },
            
            ordersConfirmed: function(orders, result){
            	this.updateOrders(orders,  result ? 'ordered' : 'failed');
            },
            
            updateOrders: function(orders, status, callback){
            	var that = this;
       		 	var count = orders.orders.length;
                function done(){
                    if (count === 1){
                     that._events.ordersChanged.publish(orders);
                   	 that._view.updateView();
                   	 if (callback){
                   		 callback();
                   	 }
                    }else{
                        count --;
                    }
                };
                orders.orders.forEach(function(order){
                    order._status = status;
                    that._events.orderUpdated.publish(order, done);
                });
            },
            
            clear: function(){
                 this._orders = {};
                 this._view.clear();
            },
            
            showTotals: function(){
            	this._view._$wrap.show();
            	this._view._$admin.hide();
            },
            
            showAdminMessage: function(){
            	this._view._$wrap.hide();
            	this._view._$admin.show();
            }
            
        });
        
        utils.TotalsView = utils.Class.extend({
           
            _$wrap: null,
            
            _$admin: null,
            
            _views: null,
            
            init:function(){
                this._$wrap = $('#administrate-totals-container');
                this._$admin = $('#administrate-admin-message');
                this._views = [];
                this.updateView();
            },
            
            addView: function(totalView){
                this._views.push(totalView);
                this._$wrap.append(totalView._$wrap);
            },
            
            updateView: function(){
                if (this._views.length === 0){
                    this.$noOrders = $('<tr><td colspan="3"></td></tr>');
                    this._$wrap.html(this.$noOrders);
                }else{
                    if (this.$noOrders){
                        this.$noOrders.remove();
                        this.$noOrders = undefined;
                    }
                    this._views.forEach(function(view){
                        view.updateView();
                    });
                }
            },
            
            clear: function(){
                this._views.forEach(function(view){
                    view._$wrap.remove();
                });
                this._views = [];
            }
            
            
        });
        
        utils.TotalView = utils.Class.extend({
		
		_orders : null,
		
		_events : null,
		
		_$wrap : null,
                
                _$checkOutBtn: null,
                
                _$retryBtn : null,
                
                _$doneBtn : null,
		
		init: function(orders){
			this._orders = orders;
			this._$wrap = this.get$Wrap();
            this._$checkOutBtn = $('.checkout-btn', this._$wrap);
            this._$retryBtn = $('.retry-btn', this._$wrap);
            this._$doneBtn = $('.done-btn', this._$wrap);
            this._events = {checkoutClicked : new utils.Event(), retryClicked: new utils.Event(), doneClicked: new utils.Event()};
            this.initHandlers();
            this.updateView();
		},
		
		get$Wrap: function(){
			return $('#total-admin-view-mock').clone().removeAttr('id');
		},
		
		initHandlers : function(){
			var that = this;
                        this._$checkOutBtn.click(function(){
                            that._events.checkoutClicked.publish(that);
                        });
                         this._$retryBtn.click(function(){
                            that._events.retryClicked.publish(that);
                        });
                         this._$doneBtn.click(function(){
                            that._events.doneClicked.publish(that);
                        });
		},
		
		updateView: function(){
             $('.total-restaurant', this._$wrap).html(this._orders.total.restaurant);
		     $('.total-total', this._$wrap).html(this._orders.total.total);  
		     this._$retryBtn.hide();
		     this._$checkOutBtn.hide();
		     this._$doneBtn.hide();
		     try{
			     if (this._orders.orders.length > 0){
			    	 var isCheckOut = false;
			    	 var isDone = false;
			    	 for (var i = 0; i < this._orders.orders.length && !(isCheckOut && isDone); i++){
			    		 if (this._orders.orders[i]._status === 'commited'){
			    			 isCheckOut = true;
			    		 }else if (this._orders.orders[i]._status === 'ordered'){
			    			 isDone = true;
			    		 }
			    	 }
				     if (isCheckOut){
				    	 this._$wrap.toggleClass('total-ordered total-failed', false);
				    	 this._$checkOutBtn.show();
				     }
				     if (isDone){
				    	 this._$wrap.toggleClass('total-ordered', true);
				    	 this._$doneBtn.show();
				     }
			     }
		     }catch(error){
		    	 
		     }
		}
		
		
	});
	
	utils.getRestaurantInfo = function(restaurant){
		var info = undefined;
		for (var index in utils.SUPPORTED_RESTAURANTS){
			if (utils.SUPPORTED_RESTAURANTS[index].name === restaurant){
				info = utils.SUPPORTED_RESTAURANTS[index];
				break;
			}
		}
		return info;
	}
	
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
						var name = data.name.familyName + " " + data.name.givenName;
						if (name.trim().length === 0){
							name = data.emails[0].value;
						}
						callback({name:name, gid:data.id, company:data.domain, img: data.image ? data.image.url : undefined});
					}
				} 
	      });
	};
	
	utils.getHeaders = function(id){
		var feed = '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:batch="http://schemas.google.com/gdata/batch" xmlns:gs="http://schemas.google.com/spreadsheets/2006">';
		
		var result = [];
		['user','restaurant','item','itemid','price','date','status','details'].forEach(function(header, index){
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
		return order._status === 'new' || order._status === 'commited';
	}
	
	utils.isOrderConfirmed = function(order){
		return order._status === 'commited' || order._status === 'ordered' || order._status === 'failed';
	}
        
        utils.checkOutOrders = function(restaurant, orders, callback){
            chrome.extension.getBackgroundPage().checkOutOrders(restaurant, orders, callback);
	};
	
	utils.getParser = function(restaurant){
		if (restaurant === utils.ANDYS_RESTAURANT_CONST.name){
			return new utils.AndysParser();
		}else if (restaurant === utils.LAPLACINTE_RESTAURANT_CONST.name){
			return new utils.LaPlacinteParser();
		}else if (restaurant === utils.OLIVA_RESTAURANT_CONST.name){
			return new utils.OlivaParser();
		}else if (restaurant === utils.CELENTANO_RESTAURANT_CONST.name){
			return new utils.CelentanoParser();
		}
	};
	
	utils.isSessionSet = function(cookies){
		if (!cookies){
			return false;
		}
		var result = false;
		for (var i = 0; i < cookies.length && !result; i++ ){
			result = cookies[i].session;
		}
		return result;
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