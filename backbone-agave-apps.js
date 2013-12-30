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
  urlRoot: "/apps/"
});

Apps.Applications = Agave.Collection.extend({
  model: Apps.Application,
  url: "/apps/",
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
    return "/apps/tag/" + this.tag;
  }
});

Apps.PublicApplicationsTermed = Agave.Collection.extend({
  model: Apps.Application,
  requiresAuth: false,
  url: function() {
    return "/apps/ontology/" + this.term;
  }
});

Apps.AppPermissions = Agave.Model.extend({
  idAttribute: "id",
  initialize: function(attributes, options) {
    this.system = this.options.system;
  },
  url: function() {
    return "/apps/" + this.id + "/pems/";
  }
});

return Apps;
})(this);