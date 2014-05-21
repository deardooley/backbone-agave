/**
 * Backbone Agave PostIt
 * Version 1.0.1
 *
 */
(function (window) {

  'use strict';

  var Backbone = window.Backbone;

  var Agave = Backbone.Agave;

  var PostIts = Agave.PostIts = {};

  PostIts.PostIt = Agave.Model.extend({
    idAttribute: 'postit',
    urlRoot: '/postits/v2/'
  });

  PostIts.ActivePostIts = Agave.Collection.extend({
    model: PostIts.PostIt,
    url: '/postits/v2/'
  });

  return PostIts;
})(this);
