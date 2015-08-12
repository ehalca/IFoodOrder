// Class Library. Inspired by Simple JavaScript Inheritance By John Resig
var utils = utils || {};

(function() {
	
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
	
	
	utils.ITEM = utils.Class.extend({
		
		_restaurant : null,
		
		_name : null,
		
		_price : null,
		
		
		init : function(){
		},
		
		view : function(){
			
		}
		
		
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
		
		_items : null,
		
		
		init : function(){
		},
		
	});
	
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