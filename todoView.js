var app = app || {};

(function($) {
  'use strict';

  app.TodoView = Backbone.View.extend({
    tagName: 'li',

    todoTemplate: _.template($("#todo-template").html()),

    events: {
      'click .toggleComplete': 'toggleComplete',
      'click .destroy': 'clear',
      'click label': 'createPropertiesView'
    },

    initialize: function() {
      // This event is fired when the model changes
      // AKA: when you toggle the todo to be completed or not
      this.listenTo(this.model, 'change:completed', this.render);
      this.listenTo(this.model, 'change', this.render);


      // This event is triggered by the localStorage, once it's done deleting
      // a model
      this.listenTo(this.model, 'destroy', this.hideAndRemove);
      this.listenTo(this.model, 'visible', this.filterTodos);
      this.listenTo(this, 'moveDown', this.moveDown);
      this.listenTo(this, 'moveUp', this.moveUp);

    },

    toggleComplete: function() {
      this.model.toggle();
    },

    render: function() {
      this.$el.html(this.todoTemplate(this.model.toJSON()));

      this.$el.toggleClass('completed', this.model.get('completed'));
      // This function is there to filter what should be shown on the screen
      // this.filterTodos();
      return this;
    },

    // This function is called when the event 'visible' is triggered
    // usually triggered by the appView when the event 'change:complete'
    // or the change in TodoFilter mode, by clicking on a button on the tool
    // bar
    filterTodos: function () {
      this.isHidden() ? this.$el.slideUp() : this.$el.slideDown();
    },

    // This function is called when the delete icon is clicked, it will
    // remove the model from the localStorage and trigger the destroy event
    // which will just delete the view for the model
    clear: function () {
      this.model.destroy();
    },

    isHidden: function() {
      var isCompleted = this.model.get('completed');
      var scheduling = app.ToolSelected === 'scheduler';
      // app.ToolSelected is inside the router, I don't understand how it works
      // but it will make the completed todos appear on the screen
      // if you remove those two lines, it won't show the completed todos.

      // I actually undersand now, the router will listen to url changes
      // and call a function when there's a certain url
      return (!isCompleted && app.ToolSelected === 'completed' ||
               isCompleted && (app.ToolSelected === 'active' || scheduling));
    },

    createPropertiesView: function() {
      var flag = $(".properties").length;
      $(".properties").animate({opacity: 0, width: 0, left: "+=" + $(".properties").width() + "px"}, function() {
        this.remove();
      });
      this._propertiesView = new app.TodoPropertiesView({ model: this.model });
      var $el = this._propertiesView.render().$el;
      // this.model.set({propOpen: true});
      // console.log("creating property view");

      var that = this;

      $("#todo-list").prepend($el);

      // quickly get the width
      var w = $el.width();

      $el.css({opacity: 0, width: 0});

      // console.log(this.$el.position().top + this.$el.height() / 2);
      $el.children("#indicator").css({top: that.$el.position().top + that.$el.height() / 2 - 8});
      $el.animate({opacity: 1, width: w}, function() {
        $(document).click(function(e) {
          if($(e.target).parents().index($('.properties')) == -1) {
            that.removePropertiesView();
          }
        });
      });
    },

    removePropertiesView: function() {
      this._propertiesView.trigger("removePropertiesView");
    },

    moveDown: function (callback) {
      var $el = this.$el;
      var next = $el.next();

      if(next.length === 0) {
        console.log("Can't go more down");
        return;
      }
      this.$el.slideUp(200, function() {
        $el.insertAfter(next);
        $el.slideDown(200);

        if(callback)
          callback();
      });
    },

    moveUp: function (callback) {
      var $el = this.$el;
      var prev = $el.prev();

      if(prev.length === 0) {
        console.log("Can't go more up");
        return;
      }
      this.$el.slideUp(200, function() {
        $el.insertBefore(prev);
        $el.slideDown(200);

        if(callback)
          callback();
      });
    },

    hideAndRemove: function() {
      var that = this;
      this.$el.slideUp(function() {
        that.remove();
      });
    }
  });
})(jQuery);
