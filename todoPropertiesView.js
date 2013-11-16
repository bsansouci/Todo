var app = app || {};

(function($) {
  'use strict';

  app.TodoPropertiesView = Backbone.View.extend({
    tagName: 'div',
    className: 'properties',

    propertiesTemplate: _.template($("#properties-template").html()),

    events: {
      'keypress input': 'saveData',
      'click .close': 'removeView'
    },

    initialize: function() {
      // This event is fired when the model changes
      // AKA: when you toggle the todo to be completed or not
      // this.listenTo(this.model, 'change', this.render);

      // This event is triggered by the localStorage, once it's done deleting
      // a model
      this.listenTo(this.model, 'destroy', this.removeView);
      this.listenTo(this.model, 'visible', this.filterTodos);

      this.listenTo(this, "removePropertiesView", this.removeView);
    },

    toggleComplete: function() {
      this.model.toggle();
    },

    render: function() {
      var data = [];
      var attributes = this.model.attributes.visible;
      for(var prop in this.model.attributes.visible) {
        data.push({name: prop, value: attributes[prop]});
      }
      this.$el.html(this.propertiesTemplate({
                        dataToShow: data}));
      return this;
    },

    removeView: function () {
      var that = this;
      // this.model.set({propOpen: false});

      // this.remove();

      this.$el.animate({left: "+=" + $(".properties").width() + "px", width: 0}, function () {
        that.undelegateEvents();
        that.$el.removeData().unbind();
        that.remove();
        Backbone.View.prototype.remove.call(that);
        $(document).unbind("click");
      });
    },

    saveData: function(e) {
      if(e.which !== 13 || !$(e.target).val().trim()) {
        return;
      }

      if(e.which === 13) {
        var $t = $(e.target);
        var v = this.model.get("visible");
        v[$t.attr("name")] = $t.val();
        this.model.set("visible", v);
        this.model.save();
        app.todos.trigger("change");
      }
    }
  });
})(jQuery);
