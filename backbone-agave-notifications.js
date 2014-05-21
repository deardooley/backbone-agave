/**
 * Backbone Agave Notifications
 * Version 1.0.1
 *
 */
(function (window) {

  'use strict';

  var Backbone = window.Backbone;

  var Agave = Backbone.Agave;

  var Notification = Agave.Notification = {};

  Notification.Notification = Agave.Model.extend({
    idAttribute: 'id',
    urlRoot: '/notifications/v2/'
  });

  Notification.Notifications = Agave.Collection.extend({
    model: Notification.Notification,
    url: '/notifications/v2/'
  });

  Notification.Search = Agave.Collection.extend({
    model: Notification.Notification,
    "associatedUuid": null,
    urlRoot: '/notifications/v2/',
    url: function() {
      if (this.associatedUuid) {
        return this.urlRoot + '?associatedUuid=' + this.associatedUuid;
      } else {
        return this.urlRoot;
      }
    }
  });

  return Notification;
})(this);
