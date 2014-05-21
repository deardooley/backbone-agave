/**
 * Backbone Agave Jobs
 * Version 1.0.1
 *
 */
(function (window) {

  'use strict';

  var Backbone = window.Backbone;

  var Agave = Backbone.Agave;

  var Jobs = Agave.Jobs = {};

  Jobs.Job = Agave.Model.extend({
    idAttribute: "id",
    urlRoot: "/jobs/v2/"
  });

  Jobs.Jobs = Agave.Collection.extend({
    model: Jobs.Job,
    url: "/jobs/v2/"
  });

  Jobs.History = Agave.Model.extend({
    urlRoot: "/jobs/v2/",
    initialize: function() {
      this.history = new Jobs.HistoryList();
      this.history.url = this.urlRoot + this.id + '/history';
      this.history.on("reset", this.updateCounts);
    },
    url: function() {
      return this.urlRoot + this.jobId + "/history/";
    }
  });

  Jobs.HistoryList = Agave.Collection.extend({
    model: Jobs.HistoryItem,
  });

  Jobs.HistoryItem = Agave.Model.extend({
    idAttribute: "created",
    urlRoot: "/jobs/v2/"
  });

  return Jobs;
})(this);
