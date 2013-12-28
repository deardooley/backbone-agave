/**
 * Backbone Agave
 * Version 0.1
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

      // look for token in global variable
      else if (window.AGAVE_TOKEN && window.AGAVE_USERNAME) {
        this.token({
          'access_token': window.AGAVE_TOKEN,
          'username': window.AGAVE_USERNAME,
          'client_key': window.AGAVE_CLIENT_KEY,
          'client_secret': window.AGAVE_CLIENT_SECRET
        });
      }

      if (defaults.primary) {
        Agave.instance = this;
      }
      
      this.develMode = window.AGAVE_DEVEL;
    };

  _.extend(Agave.prototype, Backbone.Events, {

    constructor: Agave,

    token: function(options) {
      if (options) {
        this._token.set(options);
      }
      return this._token;
    },

    destroyToken: function() {
      this._token.destroy();
    }
  });

  Agave.agaveApiRoot = 'https://agave.iplantc.org';
  Agave.agaveDevelApiRoot = 'https://iplant-qa.tacc.utexas.edu';
  
  // Custom sync function to handle Agave token auth
  Agave.sync = function(method, model, options) {
  	if (Agave.develMode) {
		options.url = Agave.agaveDevelApiRoot + (options.url || _.result(model, 'url'));
	} else {
		options.url = Agave.agaveApiRoot + (options.url || _.result(model, 'url'));
	}

	var agaveToken = options.agaveToken || model.agaveToken || Agave.instance.token();

	// Credentials for Basic Authentication
	if (options.develMode) {
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
			var jwtPrefix="eyJ0eXAiOiJKV1QiLCJhbGciOiJTSEEyNTZ3aXRoUlNBIiwieDV0IjoiTm1KbU9HVXhNelpsWWpNMlpEUmhOVFpsWVRBMVl6ZGhaVFJpT1dFME5XSTJNMkptT1RjMVpBPT0ifQ=="
			var jwtBody = btoa("{\"iss\":\"wso2.org/products/am\",\"exp\":2384481713842,\"http://wso2.org/claims/subscriber\":\"" + username + "\",\"http://wso2.org/claims/applicationid\":\"5\",\"http://wso2.org/claims/applicationname\":\"DefaultApplication\",\"http://wso2.org/claims/applicationtier\":\"Unlimited\",\"http://wso2.org/claims/apicontext\":\"/apps\",\"http://wso2.org/claims/version\":\"2.0\",\"http://wso2.org/claims/tier\":\"Unlimited\",\"http://wso2.org/claims/keytype\":\"PRODUCTION\",\"http://wso2.org/claims/usertype\":\"APPLICATION_USER\",\"http://wso2.org/claims/enduser\":\"" + username + "\",\"http://wso2.org/claims/enduserTenantId\":\"-9999\", \"http://wso2.org/claims/emailaddress\":\"" + username + "@test.com\", \"http://wso2.org/claims/fullname\":\"Dev User\", \"http://wso2.org/claims/givenname\":\"Dev\", \"http://wso2.org/claims/lastname\":\"User\", \"http://wso2.org/claims/primaryChallengeQuestion\":\"N/A\", \"http://wso2.org/claims/role\":\"Internal/everyone\", \"http://wso2.org/claims/title\":\"N/A\"}";
			var jwtSuffix="FA6GZjrB6mOdpEkdIQL/p2Hcqdo2QRkg/ugBbal8wQt6DCBb1gC6wPDoAenLIOc+yDorHPAgRJeLyt2DutNrKRFv6czq1wz7008DrdLOtbT4EKI96+mXJNQuxrpuU9lDZmD4af/HJYZ7HXg3Hc05+qDJ+JdYHfxENMi54fXWrxs="
			xhr.setRequestHeader('x-jwt-assertion-iplantc-org', jwtPrefix + jwtBody + jwtSuffix);
		};
	}
	else if (options.basicAuth = true)
	{
		// Use credentials provided in options first; otherwise used current session creds.
		var client_secret = options.client_secret || (agaveToken ? agaveToken.get('client_secret') : '');
		var client_key = options.client_key || (agaveToken ? agaveToken.get('client_key') : '');
		
		// Allow user-provided before send, but protect ours, too.
		if (options.beforeSend) {
			options._beforeSend = options.beforeSend;
		}
		options.beforeSend = function(xhr) {
			if (options._beforeSend) {
			  options._beforeSend(xhr);
			}
			xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_secret + ':' + client_key));
		};
	}
	else
	{
		// Use credentials provided in options first; otherwise used current session creds.
		var accessToken = options.access_token || (agaveToken ? agaveToken.id : '');
		
		// Allow user-provided before send, but protect ours, too.
		if (options.beforeSend) {
			options._beforeSend = options.beforeSend;
		}
		options.beforeSend = function(xhr) {
			if (options._beforeSend) {
			  options._beforeSend(xhr);
			}
			xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
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
      'client_key': null
    },
    idAttribute: 'access_token',
    url: '/token',
    sync: function(method, model, options) {
      switch (method) {
      case 'update':
      	options.basicAuth = true;
        options.url = model.url;
        options.type = 'POST';
        options.data = 'grant_type=refresh_token&refresh_token=' + model.refresh_token + "&scope=PRODUCTION";
        options.success = function(
        break;

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
      if (! attrs.username) {
        errors.username = 'Username is required';
      }
      if (!(attrs.token || options.token || options.password)) {
        errors.token = 'A Token or Password is required';
      }
      if (!(attrs.client_secret || attrs.client_key ||options.client_secret || options.client_key)) {
        errors.token = 'Your client secret and key are required';
      }
      if (attrs.expires_at && (attrs.expires_at - Date.now() <= 0)) {
        errors.expires = 'Token is expired';
      }
      if (! _.isEmpty(errors)) {
        return errors;
      }
    },
    parse: function(resp, options) {
      if (resp.access_token) {
        resp.set("username", username);
        resp.set('expires_at', Date.now() + (resp.expires_in * 1000));
        resp.set('client_key', options.client_key);
        resp.set('client_secret', options.client_secret);
      }
      return resp;
    },
    expiresIn: function() {
      return Math.max(0, this.get('expires_at') - Date.now());
    },
    getBase64: function() {
      return btoa(this.get('client_secret') + ':' + this.get('client_key'));
    }
  }),

  // Auth.ActiveTokens = Agave.Collection.extend({
//     model: Auth.Token,
//     url: '/auth-v1/list',
//     comparator: function(token) {
//         return -token.get('created');
//       }
//   });

  Backbone.Agave = Agave;
  return Agave;
})(this);