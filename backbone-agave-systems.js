/**
 * Backbone Agave Systems
 * Version 1.0.1
 *
 */
(function (window) {

  'use strict';

  var Backbone = window.Backbone;

  var Agave = Backbone.Agave;

  var Systems = Agave.Systems = {};

  Systems.System = Agave.Model.extend({
    idAttribute: 'id',
    urlRoot: '/systems/v2'
  });

  Systems.StorageListing = Agave.Collection.extend({
    model: Systems.System,
    requiresAuth: true,
    url: function() {
      return "/systems/v2?type=storage";
    }
  });

  Systems.ExecutionListing = Agave.Collection.extend({
    model: Systems.System,
    requiresAuth: true,
    url: function() {
      return "/systems/v2?type=execution";
    }
  });

  Systems.Listing = Agave.Collection.extend({
    model: Systems.System,
    url: '/systems/v2/'
  });

  return Systems;
})(this);
