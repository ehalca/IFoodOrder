// Class Library. Inspired by Simple JavaScript Inheritance By John Resig
var utils = utils || {};

(function() {
	
	utils.API_KEY = "AIzaSyC821H6-hmGKB4w_FaSnmDPN5_GcFJ8fbI";
	
	utils.ANDYS_RESTAURANT_CONST = {name:"Andys", url:"http://www.andys.md"};
	
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
		
		init: function(onSucces){
			this._onSuccess = onSucces;
		},
		
		onSuccessfullAuthentication: function(){
			if (this._onSuccess){
				this._onSuccess.call(undefined, this._user);
			}
		},
	
		authenticateWithToken : function (){
			var that = this;
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
							that._user = user;
							that.onSuccessfullAuthentication();
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
		
		init : function(gid, name, company, id){
			this._super(gid, name, company, id);
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
		
		_user : null,
		
		_date : null,
		
		_status : null,
		
		init : function(restaurant, item, price, user, date, status){
			this._restaurant = restaurant;
			this._itemName = item;
			this._itemPrice = price;
			this._user = user;
			this._date = date;
			this._status = status;
		},
		
		toGJSON: function(){
			var result = {};
			result['gsx:user'] = this._user._name;
			result['gsx:restaurant'] = this._restaurant;
			result['gsx:item'] = this._itemName;
			result['gsx:price'] = this._itemPrice;
			result['gsx:date'] = this._date;
			result['gsx:status'] = this._status;
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
			this._gEntry = entry;
		},
		
	});
	
	utils.IORDERMANAGER = utils.Class.extend({
		
		_db : null,
		_auth : null,
		
		init : function(db, auth){
			var that = this;
			if (!auth){
				this._auth=new utils.AUTHENTICATOR(function(user){
					that._db.initDriveDocument(user, function(){
						that.onDBReady();
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
			this._auth.authenticateWithToken();
		},
		
		onDBReady: function(){
			console.log('DB Ready!!!');
			this._db.getAllOrders(function(orders){
				console.log(orders);
			});
			var order = new utils.ORDER('andys', 'soleanca', '50', this._auth._user, 'now', 'new');
			this._db.saveNewOrder(order, function(order){
				console.log(order);
			});
			this._db.getAllOrders(function(orders){
				console.log(orders);
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
							addOrder:{key:'http://schemas.google.com/g/2005#post', type:'POST'}
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
				 fail: function( jqXHR,  textStatus, errorThrown ){
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
						if (!_.isEmpty(data) && !_.isEmpty(data.id)){
							that.publish(id, function(){
								callback();	
							})
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 fail: function( jqXHR,  textStatus, errorThrown ){
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
						if (!_.isEmpty(data) && !_.isEmpty(data.id)){
							that.checkHeaders(id, function(){
								callback();
							});
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 fail: function( jqXHR,  textStatus, errorThrown ){
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
		         crossDomain : true,
		         contentType:'application/atom+xml',
		         type:  that._endPoints.cells.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        	 },
		         success: function(data){
						if (!_.isEmpty(data) && !_.isEmpty(data.id)){
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
		         data: {q:"title='"+that._documentName+"' and trashed=false"},
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
				 fail: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
						 that.findDocument(callback);
					 }
				 }
		      });
		},
		
		getAllOrders : function(callback){
			var that = this;
			$.ajax({
		         url: that._endPoints.items.url.replace('{id}', that._documentId)+'&key='+utils.API_KEY,
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
				 fail: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
						 that.getAllOrders(callback);
					 }
				 }
		      });
		},
		
		saveNewOrder : function(order, callback){
			if (order._entry){
				console.log(order + ' is allready saved.');
				return;
			}
			var that = this;
			var link = that.getLinkFor(that._endPoints.dynamic.addOrder.key);
			$.ajax({
		         url: link.href.replace('public','private') +'?key='+utils.API_KEY,
		         data: order.toGJSON(),
		         contentType:link.type,
		         type: that._endPoints.dynamic.addOrder.type,
		         beforeSend: function(xhr){
		        		 xhr.setRequestHeader('Authorization', 'Bearer '+that._user._accessToken);
		        	 },
		         success: function(data){
						if (!_.isEmpty(data) && !_.isEmpty(data.id)){
							callback();
						}else{
							//TBD process error
							console.log(data);
						}
					},
				 fail: function( jqXHR,  textStatus, errorThrown ){
					 if (true){//TBD check for usage limit error
					 }
				 }
		      });
		},
		
		getLinkFor: function(key){
			var result = undefined;
			this._list.feed.link.forEach(function(link){
				if (link.rel === key){
					result = link;
				}
			});
			return result;
		},
		
		
		
	});
	
	utils.ENTITYMANAGER = utils.Class.extend({
		
		_endpoint : null,
		
		init: function(){
			
		},
		
		findById : function(){
			
		},
		
		save : function(){
			
		},
		
		deleteEntity : function(){
			
		}
		
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
						callback({name:data.name.familyName + " " + data.name.givenName, gid:data.id, company:data.domain});
					}
				} 
	      });
	};
	
	utils.getHeaders = function(id){
		var feed = '<feed xmlns="http://www.w3.org/2005/Atom" xmlns:batch="http://schemas.google.com/gdata/batch" xmlns:gs="http://schemas.google.com/spreadsheets/2006">';
		
		var result = [];
		['user','restaurant','item','price','date','status'].forEach(function(header, index){
			var doc ='<entry xmlns="http://www.w3.org/2005/Atom" '+
				    'xmlns:gs="http://schemas.google.com/spreadsheets/2006" xmlns:batch="http://schemas.google.com/gdata/batch">'+
				    ' <batch:id>A'+index+'</batch:id>'+
				    '<batch:operation type="update"/>'+
			  '<id>https://spreadsheets.google.com/feeds/cells/'+id+'/private/full/R0C'+index+'</id>'+
			  '<link rel="edit" type="application/atom+xml" '+
			   'href="https://spreadsheets.google.com/feeds/cells/'+id+'/worksheetId/private/full/R0C'+index+'"/>'+
			  '<gs:cell row="0" col="'+index+'" inputValue="'+header+'"/>'+
			'</entry>';
			feed+=doc;
		});
		feed+='<id>https://spreadsheets.google.com/feeds/cells/'+id+'/worksheetId/private/full</id></feed>';
		return feed;
	};
	
	utils.mapUser = function(userInfo, token){
		var user = new utils.OAuthUSER(userInfo.gid, userInfo.name, userInfo.company);
		if (token){
			user._accessToken =token;
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