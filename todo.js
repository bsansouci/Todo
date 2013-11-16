var app = app || {};

// Todo model, represents the actual todo
// so has a field content which is the thing that
// the user writes and a field completed, which is
// used to know how to draw the model (if it completed
// it can be filtered out)


// Anonymous function, loading jquery on it's own scope
(function() {
  'use strict';

  app.Todo = Backbone.Model.extend({
    defaults: {
      visible: {
        content: '',
        priority: 0,
        dueDate: "11/12/2013",
        timeTaking: "1h"
      },

      completed: false
      // propOpen: false
    },

    // when toggled completed or not, we save the completionDate
    // or delete it if it's toggled back
    toggle: function() {
      var completed = this.get('completed');
      this.save({
        completed: !completed,
        completionDate: (completed ? null : (new Date()).getTime())
      })
    },

    parseDueDate: function() {
      return Date.parse(this.get("visible").dueDate);
    },

    parseTimeTaking: function() {
      var t = this.get("visible").timeTaking;
      if(t.length === 0){
        return 0;
      }

      var h = t.split("h");

      if(h[1].length === 0) {
        return 360000 * parseInt(h[0]);
      }
      var min = h[1].split("min");

      if(min[1].length === 0){
        return 360000 * parseInt(h[0]) + 60000 * parseInt(min[0]);
      }

      var sec = min[1].split("sec");
      if(sec[1].length === 0) {
        return 360000 * parseInt(h[0]) + 60000 * parseInt(min[0]) + 1000 * parseInt(sec[0]);
      }
    }
  });
})();
