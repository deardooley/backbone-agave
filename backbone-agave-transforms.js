/**
 * Backbone Agave Transforms
 * Version 1.0.1
 *
 */
(function (window) {

"use strict";

var Backbone = window.Backbone;
var $ = window.$;
var _ = window._;

var Agave = Backbone.Agave;

var Transforms = Agave.Transforms = {};

Transforms.Transform = Agave.Model.extend({
  idAttribute: "name",
  urlRoot: "/transforms",
});

return Transforms;

})(this);