#TodoMVC + Scheduling

This is made entirely as an exercise to get used to Backbone.js.
Most of the code in there comes from [todoMVC](https://github.com/tastejs/todomvc/tree/gh-pages/architecture-examples/backbone) but I added a couple features:
- Sweet animations (slideUp and slideDown from jQuery)
- A new properties menu (which adds some features like due date or priority)
- A couple scheduling algorithms and a schedule filter

##Scheduling
---
I implemented a quick and dirty version of quicksort in order to demonstrate what I had in mind. What happens is that the sorting algorithm takes a comparator that will return true if the first element should be placed first (first on the screen, so last in the todos.models array, that is because backbone renders the collections from back to front) and false otherwise. Using this I implemented some scheduling algorithms like FIFO or SJF.

The idea is that once you have your list of todos set up, you can ask the app to put them in the best order possible so that you're going to be the most efficient if you do the todos in that order.

Also I wanted to have the scheduling happen in front of your eyes, so I needed to have a bunch of call backs once the animations were done.
Instead of a for loop, I implemented my own loop using recursion.
