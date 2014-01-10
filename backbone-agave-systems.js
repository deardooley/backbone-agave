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
    urlRoot: '/systems/'
  });

  Systems.Listing = Agave.Collection.extend({
    model: Systems.System,
    url: '/systems/'
  });

  return Systems;
})(this);