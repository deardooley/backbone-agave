/**
 * Backbone Agave PostIt
 * Version 0.1
 *
 */
(function (window) {

  'use strict';

  var Backbone = window.Backbone;

  var Agave = Backbone.Agave;

  var PostIt = Agave.PostIt = {};

  PostIt.PostIt = Agave.Model.extend({
    idAttribute: 'token',
    urlRoot: '/postit-v1/'
  });

  PostIt.ActivePostIts = Agave.Collection.extend({
    model: PostIt.PostIt,
    url: '/postit-v1/'
  });

  return PostIt;
})(this);