/**
 * Backbone Agave PostIt
 * Version 0.1
 *
 */
(function (window) {

  'use strict';

  var Backbone = window.Backbone;

  var Agave = Backbone.Agave;

  var PostIts = Agave.PostIts = {};

  PostIts.PostIt = Agave.Model.extend({
    idAttribute: 'postit',
    urlRoot: '/postits/'
  });

  PostIts.ActivePostIts = Agave.Collection.extend({
    model: PostIts.PostIt,
    url: '/postits/'
  });

  return PostIts;
})(this);