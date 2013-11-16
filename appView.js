var app = app || {};

(function($) {
  'use strict';

  app.AppView = Backbone.View.extend({
    el: '#todo-app',

    events: {
      'keypress #new-todo': 'createTodo',
      'click #toggle-all': 'toggleAllComplete',
      'click #clear-completed': 'clearAll'
    },

    toolsTemplate: _.template($("#tools-template").html()),

    initialize: function () {
      // Some caching for speeding up
      this.$input = $('#new-todo');
      this.$footer = $('#footer');

      // Event handers
      // this.listenTo(app.todos, 'change:completed', this.filterOne);
      this.listenTo(app.todos, 'add', this.createView);
      this.listenTo(app.todos, 'reset', this.addAll);
      this.listenTo(app.todos, 'filter', this.filterAll);
      this.listenTo(app.todos, 'schedule', this.schedule);
      this.listenTo(app.todos, 'change:completed', this.filterOne);

      this.listenTo(app.todos, 'change', this.schedule);

      this.listenTo(app.todos, 'destroy', this.removeView);

      this.listenTo(app.todos, 'all', this.render);

      // Suppresses 'add' events with {reset: true} and prevents the app view
      // from being re-rendered for every model. Only renders when the 'reset'
      // event is triggered at the end of the fetch.
      app.todos.fetch({reset: true});

    },

    render: function () {
      if(app.todos.length) {

        // The template is asking for an array of tools that each have a name
        // and an href that can be used to filter todos
        this.$footer.html(this.toolsTemplate({
          allTools: [{
           name: "Completed",
           href: "completed"
          }, {
            name: "Active",
            href: "active"
          }, {
            name: "Scheduled",
            href: "scheduler"
          }],
          remaining: app.todos.notCompleted().length,
          completed: app.todos.completed().length
        }));

        this.$footer.show();

        // I actually understand how this is working now
        // I'll explain later
        this.$('#tools li a')
          .removeClass('selected')
          .filter('[href="#/' + (app.ToolSelected || '') + '"]')
          .addClass('selected');
      } else {
        this.$footer.hide();
      }
    },

    createView: function (todo) {
      // Creates a view for a model, then renders it (generate some html code)
      // then append to the dom
      var view = new app.TodoView({ model: todo });
      var $el = view.render().$el;
      $el.hide();
      $("#todo-list").append($el);
      $el.slideDown();

      if(!this._todoViews)
        this._todoViews = [];

      this._todoViews.push(view);
    },

    removeView: function (todo) {

    },

    // Add all items in the **Todos** collection at once.
    addAll: function () {
      this.$('#todo-list').html('');
      app.todos.each(this.createView, this);
    },

    clearAll: function () {
      _.each(app.todos.completed(), function(todo){
        todo.destroy();
      })
    },

    createTodo: function (e) {
      // 13 is the enter key
      // If you didn't press enter or you didn't write anything in the textbox
      if(e.which !== 13 || !this.$input.val().trim()) {
        return;
      }

      // Create is inside the localStorage, it will give the model an id
      // and save the model
      app.todos.create({
        visible: {
          content: this.$input.val(),
          priority: 0,
          dueDate: "11/12/2013",
          timeTaking: "1h"
        },
        index: app.todos.nextIndex(),
        creationDate: (new Date()).getTime()
      });
      this.$input.val('');
      this.schedule();
    },

    // This function is called when the event 'change:complete'
    // is fired. This event is fired when the textbox is checked
    filterOne: function (todo) {
      todo.trigger('visible');
    },

    filterAll: function () {
      app.todos.each(this.filterOne, this);
    },

    toggleAllComplete: function () {
      var completness = ($("#toggle-all")[0]).checked;

      app.todos.each(function (todo) {
        todo.save({
          'completed': completness
        })
      })
    },

    schedule: function () {
      if(app.ToolSelected !== 'scheduler') {
        return;
      }
      var orderedTodos = quicksort(this._todoViews, dueDateFirstComparator);
      var curTodos = this._todoViews;

      recursiveSolutionToAsync(curTodos, orderedTodos, 0, 0, 0);

      // Some recursion going on here
      // I'll explain later
      function recursiveSolutionToAsync (curTodos, orderedTodos, whereToGo, whereIAm, moveMore) {
        if(whereIAm >= curTodos.length) {
          whereIAm = 0;
          whereToGo++;
        }

        if(whereToGo >= orderedTodos.length) {
          return;
        }

        // console.log("Call whereToGo:" + whereToGo + " whereIAm:" + whereIAm);


        if(orderedTodos[whereToGo] === curTodos[whereIAm]) {
          // console.log("Equal " + curTodos[whereIAm].model.get("content") + " at whereToGo:" + whereToGo + " whereIAm:" + whereIAm + " moveMore:" + moveMore);
          if(whereToGo < whereIAm) {
            if(moveMore < Math.abs(whereToGo - whereIAm)) {
              curTodos[whereIAm].trigger("moveUp", function() {
                recursiveSolutionToAsync(curTodos, orderedTodos, whereToGo, whereIAm, ++moveMore);
              });
            } else {
              moveInArray(curTodos, whereIAm, whereToGo);
              recursiveSolutionToAsync(curTodos, orderedTodos, 0, 0, 0);
            }
          } else if(whereToGo > whereIAm) {
            if(moveMore < Math.abs(whereToGo - whereIAm)) {
              curTodos[whereIAm].trigger("moveDown", function() {
                recursiveSolutionToAsync(curTodos, orderedTodos, whereToGo, whereIAm, ++moveMore);
              });
            } else {
              moveInArray(curTodos, whereIAm, whereToGo);
              recursiveSolutionToAsync(curTodos, orderedTodos, 0, 0, 0);              }
          } else {
            recursiveSolutionToAsync(curTodos, orderedTodos, whereToGo, ++whereIAm, 0);
          }
        } else {
          recursiveSolutionToAsync(curTodos, orderedTodos, whereToGo, ++whereIAm, 0);
        }
      }

      function moveInArray(array, from ,to) {
        array.splice(to, 0, array.splice(from, 1)[0]);
      }
    }
  });

  function myComparator(todo1, todo2) {
    var todo1Priority = 0;
    var todo2Priority = 0;
    var data1 = todo1.get("visible");
    var data2 = todo2.get("visible");

    var today = new Date();

    var t1 = {
      p: parseInt(data1.priority),
      dueDate: todo1.parseDueDate(),
      creationTime: today.getTime() - parseInt(todo1.get("creationDate")),
      timeTaking: todo1.parseTimeTaking()
    }

    var t2 = {
      p: parseInt(data2.priority),
      dueDate: todo2.parseDueDate(),
      creationTime: today.getTime() - parseInt(todo2.get("creationDate")),
      timeTaking: todo2.parseTimeTaking()
    }

    // var firstDue = (dueDate1 < dueDate2 ? dueDate1 : dueDate2);
    // var total1 = p1 + creationTime1 + timeTaking1;
    // var total2 = p2 + creationTime2 + timeTaking2;

    // todo1Priority += p1 / total1;
    // todo2Priority += p2 / total2;

    // todo1Priority -= 0.6 * ((dueDate1 - today.getTime()) / 1000 - timeTaking1) / ((dueDate1 - today.getTime()) / 1000);
    // todo2Priority -= 0.6 * ((dueDate2 - today.getTime()) / 1000 - timeTaking2) / ((dueDate2 - today.getTime()) / 1000);

    var f = (t1.dueDate < t2.dueDate ? t1 : t2);
    var l = (t1.dueDate > t2.dueDate ? t1 : t2);
    console.log("first " + f.p);

    if(f.p < l.p) {
      var extraTime = f.dueDate - today.getTime() - f.timeTaking;
      console.log(l.dueDate - today.getTime() + " " +l.timeTaking);

      // Remove the weekend
      extraTime = extraTime - extraTime * 2/7;
      console.log(extraTime);

      // Remove half of the day that you sleep and do other stuff
      extraTime = extraTime - extraTime * 3/4;
      console.log(extraTime);
      if(l.timeTaking <= extraTime) {
        return false;
      } else {
        return true;
      }
    }

    return t1.dueDate < t2.dueDate;
    // todo1Priority += 1.1 * creationTime1 / total1;
    // todo2Priority += 1.1 * creationTime2 / total2;

    // todo1Priority -= 1.2 * timeTaking1 / total1;
    // todo2Priority -= 1.2 * timeTaking2 / total2;

    // console.log(p1 / total1 + " " + dueDate1 / total1 + " " + creationTime1 / total1+ " " + timeTaking1 / total1);
    // console.log(p2 / total2 + " " + dueDate2 / total2+ " " + creationTime2 / total2 + " " + timeTaking2 / total2);
    // console.log(0.5 * ((dueDate1 - today.getTime()) / 1000 - timeTaking1) / ((dueDate1 - today.getTime()) / 1000));

    // console.log( 0.5 * ((dueDate2 - today.getTime()) / 1000 - timeTaking2) / ((dueDate2 - today.getTime()) / 1000));
    // console.log(timeTaking1 / total1);

    // console.log(todo1.get("visible").content + " " + todo1Priority + " " + todo2.get("visible").content + " " + todo2Priority);

    // return todo1Priority > todo2Priority;
  }

  function priorityComparator(todo1, todo2) {
    var todo1Priority = 0;
    var todo2Priority = 0;
    todo1Priority += parseInt(todo1.get("priority"));
    todo2Priority += parseInt(todo2.get("priority"));

    return todo1Priority > todo2Priority;
  }

  function dueDateFirstComparator(todo1, todo2) {
    var todo1Priority = 0;
    var todo2Priority = 0;

    todo1Priority += todo1.parseDueDate();
    todo2Priority += todo2.parseDueDate();

    return todo1Priority < todo2Priority;
  }

  function FIFOComparator(todo1, todo2) {
    var todo1Priority = 0;
    var todo2Priority = 0;

    return true;
  }

  function SJFComparator(todo1, todo2) {
    var todo1Priority = 0;
    var todo2Priority = 0;

    todo1Priority += todo1.parseTimeTaking();
    todo2Priority += todo2.parseTimeTaking();

    return todo1Priority < todo2Priority;
  }

  function quicksort(array, comparator) {
    if(!comparator)
      return array;

    var pivot = array[0];
    var left = [], right = [];

    if (array.length == 0) {
      return [];
    }


    // I inverted the right and left arrays because the render function
    // renders them from the end to the start, and I don't want to have to
    // think about this, so therefore when creating comparators, just imagine
    // it will be sorted as if a < b then a will be put first.
    for (var i = 1; i < array.length; i++) {
      if (comparator(array[i].model, pivot.model)) {
        left.push(array[i]);
      } else {
        right.push(array[i]);
      }
    }

    return quicksort(left, comparator).concat([pivot].concat(quicksort(right, comparator)));
  }
})(jQuery);
