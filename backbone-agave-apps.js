/**
 * Backbone Agave Apps
 * Version 1.0.1
 *
 */
(function (window) {

"use strict";

var Backbone = window.Backbone;
var $ = window.$;
var _ = window._;

var Agave = Backbone.Agave;

var Apps = Agave.Apps = {};

Apps.Application = Agave.Model.extend({
  defaults: {
    "name":null
  },
  urlRoot: "/apps/v2/"
});

Apps.Applications = Agave.Collection.extend({
  model: Apps.Application,
  url: "/apps/v2/",
  requiresAuth: false,
  comparator: function(app) {
    return app.get("name").toLowerCase();
  }
});

Apps.PublicApplicationsNamed = Agave.Collection.extend({
  model: Apps.Application,
  requiresAuth: false,
  url: function() {
    return "/apps/name/" + this.name;
  }
});

Apps.PublicApplicationsTagged = Agave.Collection.extend({
  model: Apps.Application,
  requiresAuth: false,
  url: function() {
    return "/apps/v2/tag/" + this.tag;
  }
});

Apps.PublicApplicationsTermed = Agave.Collection.extend({
  model: Apps.Application,
  requiresAuth: false,
  url: function() {
    return "/apps/v2/ontology/" + this.term;
  }
});

Apps.SystemApplications = Agave.Collection.extend({
  model: Apps.Application,
  requiresAuth: false,
  url: function() {
    return "/apps/v2/system/" + this.models[0].attributes.id;
  }
});

Apps.AppPermission = Agave.Model.extend({
  idAttribute: "username",
  defaults: {
    "appId": null,
    "username" : null
  },
  url: function() {
  	return "/apps/v2/" + this.attributes.appId + "/pems/" + this.attributes.username;
  },
  getPermissionName: function() {
  	if (this.attributes.read) {
  		if (this.attributes.write) {
  			if (this.attributes.execute) {
  				return 'ALL';
  			} else {
  				return 'READ_WRITE';
  			}
  		} else if (this.attributes.execute) {
  			return 'READ_EXECUTE';
  		} else {
  			return 'READ';
  		}
  	} else if (this.attributes.write) {
  		if (this.attributes.execute) {
  			return 'WRITE_EXECUTE';
  		} else {
  			return 'WRITE';
  		}
  	} else if (this.attributes.execute) {
  			return 'EXECUTE';
  	} else {
  		return 'NONE';
  	}
  }
});

Apps.AppPermissionList = Agave.Collection.extend({
  model: Apps.AppPermission,
  initialize: function(attributes, options) {
    this.appId = attributes.id;
  },
  url: function() {
  	return "/apps/v2/" + this.appId + "/pems/";
  },
  requiresAuth: false
});



return Apps;
})(this);
