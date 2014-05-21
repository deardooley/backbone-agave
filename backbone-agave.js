/**
 * Backbone Agave
 * Version 1.0.1
 *
 */
(function (window) {
  'use strict';

  var
    Backbone = window.Backbone,
    _ = window._,
    Agave = function(options) {
      var defaults = _.extend({primary: true}, options),
        token = this._token = new Agave.Auth.Token({});

      this._token.load();

      this.listenTo(token, 'change', function() {
        this.trigger('Agave:tokenChanged');
      }, this);

      this.listenTo(token, 'destroy', function() {
        this.token().clear();
        this.trigger('Agave:tokenDestroy');
      });

      if (defaults.token) {
        this.token(defaults.token);
      }

      if (defaults.primary) {
        Agave.instance = this;
      }

    };

  _.extend(Agave.prototype, Backbone.Events, {

    constructor: Agave,

    token: function(options) {
      if (options) this._token.set(options);
      return this._token;
    },

    destroyToken: function() {
      this._token.clear();
    },

    isDevelMode: function() {
    	return false;
    },
    authValue: function(username) {
  		return this._token.get('access_token');
  	},
  	authHeader: function() {
  		return 'Bearer';
	}


  });

  Agave.agaveApiRoot = 'https://agave.iplantc.org';
  Agave.agaveVersion = 'v2';
  Agave.agaveDevelApiRoot = 'https://iplant-qa.tacc.utexas.edu/v2';
  Agave.develMode = window.AGAVE_DEVEL;
  Agave.tenatId = window.AGAVE_TENANT || 'iplantc.org';

  // Custom sync function to handle Agave token auth
  Agave.sync = function(method, model, options) {
  	if (Agave.develMode) {
  		options.url = Agave.agaveDevelApiRoot + (options.url || _.result(model, 'url'));
  	} else {
  		options.url = Agave.agaveApiRoot + (options.url || _.result(model, 'url'));
  	}

	  var agaveToken = options.agaveToken || model.agaveToken || Agave.instance.token();

  	// Credentials for Basic Authentication
  	if (Agave.develMode)
  	{
  		var username = options.username || (agaveToken ? agaveToken.get('username') : '');

  		// Allow user-provided before send, but protect ours, too.
  		if (options.beforeSend) {
  			options._beforeSend = options.beforeSend;
  		}
  		options.beforeSend = function(xhr) {
  			if (options._beforeSend) {
  			  options._beforeSend(xhr);
  			}

  			xhr.setRequestHeader( Agave.prototype.authHeader(), Agave.prototype.authValue(username));
  		};
  	}
  	else if (options.basicAuth)
  	{
  		// Use credentials provided in options first; otherwise used current session creds.
  		var client_secret = options.clientSecret || (agaveToken ? agaveToken.get('client_secret') : '');
  		var client_key = options.clientKey || (agaveToken ? agaveToken.get('client_key') : '');

  		options.emulateJSON = true;
  		//options.data = model.toJSON();

  		// Allow user-provided before send, but protect ours, too.
  		if (options.beforeSend) {
  			options._beforeSend = options.beforeSend;
  		}
  		options.beforeSend = function(xhr) {
  			if (options._beforeSend) {
  			  options._beforeSend(xhr);
  			}
  			xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_key + ':' + client_secret));
  			xhr.setRequestHeader('Accept', 'application/json');
  			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  		};
  	}
  	else
  	{
  		// Allow user-provided before send, but protect ours, too.
  		if (options.beforeSend) {
  			options._beforeSend = options.beforeSend;
  		}
  		options.beforeSend = function(xhr) {
  			if (options._beforeSend) {
  			  options._beforeSend(xhr);
  			}
  			xhr.setRequestHeader('Authorization', 'Bearer ' + agaveToken.get('access_token'));
  			xhr.setRequestHeader('Accept', 'application/json');
  		};
  	}

    // Call default sync
    return Backbone.sync(method, model, options);
  };

  // Agave extension of default Backbone.Model that uses Agave sync
  Agave.Model = Backbone.Model.extend({
    constructor: function(attributes, options) {
      if (options && options.agaveToken) {
        this.agaveToken = options.agaveToken;
      }
      Backbone.Model.apply(this, arguments);
    },
    sync: Agave.sync,
    requiresAuth: true,
    parse: function(resp) {
      if (resp.result) {
        resp = resp.result;
      }
      return resp;
    }
  });

  // Agave extension of default Backbone.Collection that uses Agave sync
  Agave.Collection = Backbone.Collection.extend({
    constructor: function(attributes, options) {
      if (options && options.agaveToken) {
        this.agaveToken = options.agaveToken;
      }
      Backbone.Collection.apply(this, arguments);
    },
    sync: Agave.sync,
    requiresAuth: true,
    parse: function(resp) {
      if (resp.result) {
        resp = resp.result;
      }
      return resp;
    }
  });

  // Required Auth package
  var Auth = Agave.Auth = {};

  Auth.Token = Agave.Model.extend({
    defaults: {
      'access_token': null,
      'username': null,
      'expires_in': null,
	    'expires_at': null,
      'refresh_token': null,
      'client_secret': null,
      'client_key': null,
      'grant_type': 'client_credentials',
      'token_type': 'bearer',
      'scope': 'PRODUCTION'
    },

	  idAttribute: 'access_token',

    url: "/token",

    parse: function(resp, options) {
      if (resp.access_token) {
        resp.username = options.username;
        resp.expires_in = resp.expires_in * 1000;
        resp.expires_at = new Date().getTime() + resp.expires_in;
        resp.client_key = options.clientKey;
        resp.client_secret = options.clientSecret;
      }
      return resp;
    },

    sync: function(method, model, options) {
      switch (method) {
      case 'create':
        options.basicAuth = true;
        options.url = model.url;
        options.type = 'POST';
        options.data = 'grant_type=password&username=' + model.get('username') + '&password=' + model.get('password') + '&scope=PRODUCTION';
        break;
      case 'update':
        options.basicAuth = true;
        options.url = model.url;
        options.type = 'POST';
        options.data = 'grant_type=password&username=' + model.get('username') + '&password=' + model.get('password') + '&scope=PRODUCTION';
        break;

      // case 'update':
      // 	options.basicAuth = true;
      //   options.url = model.url;
      //   options.type = 'POST';
      //   options.data = 'grant_type=refresh_token&refresh_token=' + model.refresh_token + "&scope=PRODUCTION";
      //   break;

      case 'delete':
      	options.basicAuth = true;
        options.agaveToken = model;
        break;
      }
      return Backbone.Agave.sync(method, model, options);
    },

    validate: function(attrs, options) {
      var errors = {};
      options = _.extend({}, options);

      if ( attrs.access_token != '' && attrs.expires_at != '')
      {
        var expires = attrs.expires_at;
          if ( attrs.expires_at > new Date().getTime() ) {
            return;
          } else {
            //this.clear();
            errors.expires_at = 'Token is expired';
          }
      }
      else
      {
        //this.clear();
        errors.access_token = 'Access token is required';
      }

      if (! _.isEmpty(errors)) {
        return errors;
      }
    },

    clear: function() {
      this.set("access_token", '');
      this.set("expires_at", '');
      this.set("expires_in", '');
      this.set("client_key", '');
      this.set("client_secret", '');
      this.set("username", '');
      this.set("refresh_token", '');

      if(typeof(Storage)!=="undefined")
      {
        localStorage.removeItem("Agave.Token.AccessToken");
        localStorage.removeItem("Agave.Token.Expiration");
        localStorage.removeItem("Agave.Token.ClientKey");
        localStorage.removeItem("Agave.Token.ClientSecret");
        localStorage.removeItem("Agave.Token.Username");
        localStorage.removeItem("Agave.Token.RefreshToken");
      }
    },

    store: function() {
      if(typeof(Storage)!=="undefined")
      {
        localStorage.setItem("Agave.Token.AccessToken", this.get('access_token'));
        localStorage.setItem("Agave.Token.Expiration", this.get('expires_at'));
        localStorage.setItem("Agave.Token.ClientKey", this.get('client_key'));
        localStorage.setItem("Agave.Token.ClientSecret", this.get('client_secret'));
        localStorage.setItem("Agave.Token.Username", this.get('username'));
        localStorage.setItem("Agave.Token.RefreshToken", this.get('refresh_token'));
      }
    },

    load: function() {
      if(typeof(Storage)!=="undefined")
      {
        this.set("access_token", localStorage.getItem("Agave.Token.AccessToken"));
        this.set("expires_at", localStorage.getItem("Agave.Token.Expiration"));
        if (this.get("expires_at")) {
          this.set("expires_in", this.get('expires_at') - new Date().getTime());
        }
        this.set("client_key", localStorage.getItem("Agave.Token.ClientKey"));
        this.set("client_secret", localStorage.getItem("Agave.Token.ClientSecret"));
        this.set("username", localStorage.getItem("Agave.Token.Username"));
        this.set("refresh_token", localStorage.getItem("Agave.Token.RefreshToken"));
      }
    },

    expiresIn: function() {
      return this.get('expires_in');
    }
  });



  Backbone.Agave = Agave;
  return Agave;
})(this);
