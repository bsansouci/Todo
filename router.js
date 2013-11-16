/*global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Todo Router
  // ----------
  var TodoRouter = Backbone.Router.extend({
    routes: {
      'scheduler': 'setScheduler',
      '*filter': 'setFilter'
    },

    setFilter: function (param) {
      // Set the current filter to be used
      app.ToolSelected = param || '';

      // Trigger a collection filter event, causing hiding/unhiding
      // of Todo view items
      app.todos.trigger('filter');
    },

    setScheduler: function () {
      app.ToolSelected = 'scheduler';
      app.todos.trigger('schedule');
    }
  });

  app.TodoRouter = new TodoRouter();
  Backbone.history.start();
})();
