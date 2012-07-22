var events      = require('events'),
    stripe      = require('stripe'),
    crypto      = require('crypto'),
    request     = require('request'),
    NGN 		= require('../NGN.core');

/**
 * @class NGN.app.Person
 * Represents a person involved in the ecosystem. This includes customers, administrators, and any other
 * human user.
 * @extends NGN.core
 * @param {Object} [config] Configuration Object
 * @requires NGN.core
 * @requires events
 * @requires crypto
 * @requires request
 * @docauthor Corey Butler
 */
var Person = NGN.extend({
	
	constructor: function( config ){
	    
	    var me = this;
		
		Person.super.constructor.call( this, config );
		
		Object.defineProperties(this,{
			
			_temp: {
                value:          {},
                enumerable:     false,
                writable:       true
            },
            
            /**
             * @property {String} id
             * The ID of the person (as defined by Application)
             */
            _id: {
                value:          null,
                writable:       true,
                enumerable:     false
            },
            
            /**
             * @property {Boolean} exists @readonly
             * Identifies that the person has been looked up in the database and determined to either exist or not. 
             */
            _exists: {
                value:          null,
                writable:       true,
                enumerable:     false
            },
            
            /**
             * @property {Array} dataProperties
             * An array of property names populated by a "get()" 
             */
            _dataProperties: {
                value:          [],
                writable:       true,
                enumerable:     false
            },
            _modified: {
                value:          false,
                writable:       true,
                enumerable:     false
            },
            _modifiedAttributes: {
                value:          {},
                writable:       true,
                enumerable:     true
            },
            _primaryemail: {
                value:          null,
                writable:       true,
                enumerable:     false
            },
            _displayname: {
                value:          null,
                writable:       true,
                enumerable:     false
            },
            
			id: {               // The ID of the person (as defined by PerkPals)
                enumerable:     true,
                get:            function() {
                                    if (!this._exists)
                                        this.emit('error',{type:'InvalidAttribute',message:'The attribute does not exist.',detail:'The ID attribute is only available after a get() or authenticate() or some other lookup method.'});
                                    else
                                        return this._id;
                                },
                set:            function(value){
                                    this._id = value.toString().trim();
                                    if (this._id.indexOf('@') !== -1){
                                        this.loginMethod= 'email';
                                        this.loginId    = this._id;
                                    }
                                }
            },
            
            // See _dataProperties
            dataProperties: {
                enumerable:     false,
                get:            function(){
                                    return this._dataProperties;
                                },
                set:            function(value,doNotAppend){
                                    if (value.trim().length == 0)
                                        return;
                                    if (doNotAppend || false) {
                                        this._dataProperties = [];
                                        this._dataProperties.push(value.trim());
                                    } else
                                        this._dataProperties.push(value.trim());
                                }
            },
            
            // See _exists
            exists: {
                enumerable:     true,
                get:            function() {
                                    if (this._exists == null)
                                        this.emit('error',{type:'InvalidAttribute',message:'The attribute does not exist.',detail:'The exists attribute is only available after a get() or authenticate() or some other lookup method.'});
                                    else
                                        return this._exists;
                                }
            },
            
            /**
             * @property {Boolean}
             * Indicates one or more data properties has changed.  
             */
            modified: {
                enumerable:     true,
                get:            function(){
                                    return this._modified;
                                },
                set:            function(){
                                    this.emit('error',{type:'InvalidSet',message:'This attribute cannot be set.',detail:'The modified attribute cannot be set directly.'});
                                }                        
            },
            
            /**
             * @property {String} 
             * The primary email account of the person.
             */
            primaryemail: {
                enumerable:     true,
                get:            function(){
                                    this.emit('step','Acquiring primary email address.');
                                    if (this._exists == null)
                                        this.emit('error',{type:'InvalidAttribute',message:'The attribute does not exist.',detail:'The exists attribute is only available after a get() or authenticate() or some other lookup method.'});
                                    else {
                                        if (this._primaryemail == null) {
                                            this.emit('step','Checking for EMAIL object.');
                                            if (this.EMAIL == undefined)
                                                return null;
                                            var firstValid = null;
                                            this.emit('step','Parsing EMAIL object for address.');
                                            for(var i=0;i<this.EMAIL.length;i++){
                                                if (this.EMAIL[i].PRIMARY == this.EMAIL[i].VALID == true){
                                                    this._primaryemail = this.EMAIL[i].ADDRESS.trim();
                                                     this.emit('step','Primary address found - '+this._primaryemail);
                                                    return this._primaryemail;
                                                } else if (this.EMAIL[i].VALID && firstValid == null)
                                                    firstValid = i;
                                            }
                                            if (firstValid == null)
                                                return null;
                                            return this.EMAIL[firstValid].ADDRESS.trim();
                                        } else
                                            return this._primaryemail;
                                    }
                                }
            },
            
            /**
             * @property {String}
             * Currently returns the FB pic or gravatar URL.
             */
            image: {
                enumerable:     true,
                get:            function() {
                                    this.emit('step','Acquiring primary image.');
                                    if (this._exists == null)
                                        this.emit('error',{type:'InvalidAttribute',message:'The attribute does not exist.',detail:'The exists attribute is only available after a get() or authenticate() or some other lookup method.'});
                                    else {
                                        for(var i=0;i<this.LOGIN.length;i++){
                                            if (this.LOGIN[i].NAME.toUpperCase() == 'FB'){
                                                return 'https://graph.facebook.com/'+this.LOGIN[i].ID+'/picture';
                                            }
                                        }
                                        var md5 = crypto.createHash('md5');
                                        return 'http://www.gravatar.com/avatar/'+md5.update(this.primaryemail.trim().toLowerCase()).digest('hex')+'?d=404&s=30';
                                    }
                                }
            },
            
            /**
             * @property {String}
             * The individual profile URL of the my.perkpals.com account. 
             */
            profileurl: {
                enumverable:    true,
                get:            function() {
                                    this.emit('step','Acquiring profile URL.');
                                    if (this._exists == null)
                                        this.emit('error',{type:'InvalidAttribute',message:'The attribute does not exist.',detail:'The exists attribute is only available after a get() or authenticate() or some other lookup method.'});
                                    else {
                                        return 'http://my.perkpals.com/'+this.id;
                                    }
                                }
            },
            
            
            //TODO: Figure out a better way to handle displayname
            /**
             * @property {String}
             * The name by which the person prefers to be referred to as. 
             */
            displayname: {
                enumerable:     true,
                get:            function(){
                                    this.emit('step','Acquiring displayname.');
                                    if (this._exists == null)
                                        this.emit('error',{type:'InvalidAttribute',message:'The attribute does not exist.',detail:'The exists attribute is only available after a get() or authenticate() or some other lookup method.'});
                                    else {
                                        if (this._displayname == null) {
                                            this.emit('step','Looking up name attributes');
                                            try {
                                                this._displayname = this.FIRSTNAME+' '+(this.LASTNAME||'').substr(0,1)+'.';
                                            } catch (e) {
                                                this.emit('step','Failing over to alias');
                                                try {
                                                    this._displayname = this.ALIAS || '';
                                                } catch (_e) {
                                                    this.emit('step','Failing over to blank');
                                                    this._displayname = '';
                                                }
                                            }
                                        }
                                        return this._displayname;
                                    }
                                }
            },
			
			/**
			 * @property {String}
			 * Given name.
			 */
			firstname: {
				value:		'Unknown',
				enumerale:	true,
				writable:	true
			},
			
			/**
			 * @property {String}
			 * Surname
			 */
			lastname: {
				value:		'Unknown',
				enumerale:	true,
				writable:	true
			},
			
			_login: {
				value:		null,
				enumerable:	false,
				writable:	false
			},
			
			/**
			 * @property {NGN.app.Login} [login=null]
			 * @readonly
			 * The login used to authenticate the user. This is `null`
			 * until an authentication method is executed. 
			 */
			login: {
				enumerable: true,
				get:		function() {
								return this._login;
							}
			}
			
		});
		
		// Common Event Handlers
        this.on('modified',function(attr){
            var attribute = attr.name || attr;
            me._modified = true;
    
            me._modifiedAttributes[attribute] = {
                value: attr.newValue || null,
                old:   attr.oldValue || null,
                meta:  attr.meta !== undefined ? attr.meta : null 
            };
            switch (attribute.toString().trim().toLowerCase()){
                case 'accesstoken':
                    me.save();
                    break;
            }
        });
        this.on('saved',function(){
            me._modified = false;
        });
		
	}
	
});

// Create a module out of this.
module.exports = Person;