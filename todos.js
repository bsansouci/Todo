var app = app || {};

(function($) {
  var Todos = Backbone.Collection.extend({
    model: app.Todo,

    // Copy pasted the local storage hack that was made by Tastejs
    // Save all of the todo items under the `"todos"` namespace.
    localStorage: new Backbone.LocalStorage('todos-backbone'),

    nextIndex: function () {
      if(!this.length) {
        return 1;
      }
      return this.last().get('index') + 1;
    },

    completed: function () {
      return this.filter(function(todo){
        return todo.get('completed');
      });
    },

    // This will basically invert the completed set of todos, returning the
    // todos that aren't completed
    notCompleted: function () {
      return this.without.apply(this, this.completed());
    }
  });

  app.todos = new Todos();
})(jQuery);
