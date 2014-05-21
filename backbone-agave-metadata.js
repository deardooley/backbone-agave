/**
 * Backbone Agave Metadata
 * Version 1.0.1
 *
 */
(function (window) {

  'use strict';

  var Backbone = window.Backbone;

  var Agave = Backbone.Agave;

  var Metadata = Agave.Metadata = {};

  Metadata.Metadata = Agave.Model.extend({
    idAttribute: 'id',
    urlRoot: '/meta/v2/data/'
  });

  Metadata.MetadataList = Agave.Collection.extend({
    model: Metadata.Metadata,
    url: '/meta/v2/data/'
  });

  Metadata.Search = Agave.Collection.extend({
    model: Metadata.Metadata,
    "associatedUuid": null,
    "query": null,
    urlRoot: '/meta/v2/data/',
    url: function() {
      if (this.associatedUuid) {
        return this.urlRoot + '?associatedUuid=' + this.associatedUuid;
      } else if (this.query) {
        return this.urlRoot + '?q=' + this.query;
      } else {
        return this.urlRoot;
      }
    }
  });

  Metadata.MetadataPermission = Agave.Model.extend({
    idAttribute: "username",
    defaults: {
      "metaId": null,
      "username" : null
    },
    url: function() {
      return "/meta/v2/data/" + this.get("metaId") + "/pems/" + this.get("username");
    },
    parse: function(resp, options) {
      if (resp.result) {
        resp = resp.result;
      }
      console.log(resp);

      return resp;
    },
    validate: function(attrs, options) {
      var errors = {};
      options = _.extend({}, options);

      if ( attrs.username != '' && attrs.permission != '')
      {
        return;
      }
      else
      {
        errors.access_token = 'Username and permission are both required';
      }

      if (! _.isEmpty(errors)) {
        return errors;
      }
    },
    getPermissionName: function() {
      if (this.get('permission') && this.get('permission').read) {
        if (this.get('permission').write) {
          if (this.get('permission').execute) {
            return 'ALL';
          } else {
            return 'READ_WRITE';
          }
        } else if (this.get('permission').execute) {
          return 'READ_EXECUTE';
        } else {
          return 'READ';
        }
      } else if (this.get('permission') && this.get('permission').write) {
        if (this.get('permission').execute) {
          return 'WRITE_EXECUTE';
        } else {
          return 'WRITE';
        }
      } else if (this.get('permission') && this.get('permission').execute) {
          return 'EXECUTE';
      } else {
        return 'NONE';
      }
    }
  });

  Metadata.MetadataPermissionList = Agave.Collection.extend({
    model: Metadata.MetadataPermission,
    initialize: function(attributes, options) {
      this.metaId = attributes.id;
    },
    url: function() {
      return "/meta/v2/data/" + this.metaId + "/pems/";
    },
    requiresAuth: false
  });

  return Metadata;
})(this);
