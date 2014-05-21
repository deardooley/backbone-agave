/**
 * Backbone Agave Jobs
 * Version 1.0.1
 *
 */
(function (window) {

  'use strict';

  var Backbone = window.Backbone;
  var $ = window.$;
  var _ = window._;

  var Agave = Backbone.Agave;

  var Profile = Agave.Profile = {};

  Profile.Profile = Agave.Model.extend({
    idAttribute: 'username',
    parse: function(resp) {
      if (resp.result) {
        if (resp.result.length === 1) {
          resp = resp.result[0];
        } else {
          resp = resp.result;
        }
      }
      return resp;
    },
    url: function() {
      return '/profiles/v2/?username=' + this.get('username');
    },
    requiresAuth: true
  });

  Profile.Search = Agave.Collection.extend({
    model: Profile.Profile,
    searchOption: 'username',
    searchOptions: ['username','name','email'],
    keyword: '',
    url: function() {
      if (this.searchOption && this.keyword) {
        return '/profiles/v2/search/' + this.searchOption + '/' + this.keyword;
      }
    }
  });

  return Profile;
})(this);
