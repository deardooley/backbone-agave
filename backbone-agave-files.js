/**
 * Backbone Agave Files Models and Collections
 * Version 1.0.1
 *
 */
(function (window) {

"use strict";

var Backbone = window.Backbone;
var $ = window.$;
var _ = window._;

var Agave = Backbone.Agave;

var IO = Agave.IO = {};

IO.File = Agave.Model.extend({
  defaults: {
    "owner": null,
    "path": null
  },
  idAttribute: "path",
  urlRoot: "/files/v2",
  url: function() {
  	if (Agave.develMode) {
	    return '/files/media/system/' + this.system() + "/" + this.id;
  	} else {
  		return '/files/' + Agave.agaveVersion + '/media/system/' + this.system() + "/" + this.id;
  	}
  },
  modelUrl: function() {
    if (Agave.develMode) {
	    return '/files/media/system/' + this.system() + "/" + this.id;
  	} else {
  		return '/files/' + Agave.agaveVersion + '/media/system/' + this.system() + "/" + this.id;
  	}
  },
  downloadUrl: function() {
  	if (Agave.develMode) {
	    return Agave.agaveDevelApiRoot + '/files/media/system/' + this.system() + "/" + this.id;
  	} else {
  		return Agave.agaveApiRoot + '/files/' + Agave.agaveVersion + '/media/system/' + this.system() + "/" + this.id;
  	}
  },
  directoryPath: function() {
    var path = this.get("path");
    if (this.get("type") === "dir") {
      if (path.lastIndexOf("/") !== path.length - 1) {
        path += "/";
      }
    } else {
      path = path.substring(0, path.lastIndexOf("/") + 1);
    }
    return path;
  },
  parentDirectoryPath: function() {
    var path = this.directoryPath().substring(0, this.directoryPath().lastIndexOf("/"));
    return path.substring(0, path.lastIndexOf("/"));
  },
  // canRead: function() {
  //   return ['READ','READ_WRITE','READ_EXECUTE','ALL','OWN'].indexOf(this.get("permissions")) >= 0;
  // },
  // canWrite: function() {
  //   return ['READ_WRITE','WRITE','WRITE_EXECUTE','ALL','OWN'].indexOf(this.get("permissions")) >= 0;
  // },
  // canExecute: function() {
  //   return ['READ_EXECUTE','WRITE_EXECUTE','EXECUTE','ALL','OWN'].indexOf(this.get("permissions")) >= 0;
  // },
  // isOwner: function() {
  //   return this.get("permissions") === 'OWN';
  // },
  parse: function(resp) {
    var result = resp;
    if (resp.result) {
      result = resp.result;
    }
    if (_.isArray(result)) {
      return result[0];
    } else {
      return result;
    }
  },
  system: function() {
  	var sys = this.attributes._links.system.href;
  	return sys.substring(sys.lastIndexOf("/") + 1);
  }

});

IO.FilePermissions = Agave.Model.extend({
  idAttribute: "path",
  initialize: function(attributes, options) {
    this.system = (options != undefined && 'system' in options) ? options.system : attributes.system;
    this.path = (options != undefined && 'path' in options) ? options.path : attributes.path;
  },
  url: function() {
    return "/files/v2/pems/system/" + this.system + "/" + this.path;
  }
});

IO.History = Agave.Model.extend({
    idAttribute: 'created',
    urlRoot: "/files/v2/history/"
});

IO.HistoryListing = Agave.Collection.extend({
    model: IO.History,
    initialize: function(attributes, options) {
    	this.system = (options != undefined && 'system' in options) ? options.system : attributes.system;
    	this.path = (options != undefined && 'path' in options) ? options.path : attributes.path;
  	},
  	url: function() {
    	return "/files/v2/history/system/" + this.system + "/" + this.path;
  	}
});

IO.Listing = Agave.Collection.extend({
  model: IO.File,
  initialize: function(models, options) {
    this.path = options.path;
    this.system = options.system;
  },
  url: function() {
    return "/files/v2/listings/system/" + this.system + "/" + this.path;
  },
  comparator: function(model) {
    return [model.get("type"), model.get("name")];
  }
});

IO.Share = Agave.Model.extend({
  initialize: function(attributes, options) {
    this.file = options.file;
    this.system = attributes.system;
  },
  url: function() {
    var owner = this.file.get("owner"),
      path = this.file.get("path");
    if (path) {
      return "/files/v2/pems/system/" + this.system + "/" + path;
    }
  },
  shareLink: function() {
    if (this.isPublic()) {
      return Agave.agaveApiRoot + "/files/v2/download/system/" + this.system + "/" + this.file.get("owner") + this.file.get("path");
    }
  }
});

return IO;
})(this);
