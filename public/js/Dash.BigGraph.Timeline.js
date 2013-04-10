Dash.namespace('BigGraph.Timeline');

Dash.BigGraph.Timeline = function(args) {
  var graph = this.graph = args.graph;
  var element = args.element;

  this.elements = { timeline: element };
  this.data = {};

  // style the timeline
  element.classList.add('dash_events_timeline');

  // add hook to graph update func
  var events = this;
  this.graph.onUpdate( function() { events.update() } );

  return this;
};

Dash.BigGraph.Timeline.prototype = {

  add: function(args) {
    var time     = args.time,
        content  = args.content,
        end_time = args.end;
      
    // boxes contain the text to be displayed, can have multiple at each time
    this.data[time] = this.data[time] || {};
    var event = this.data[time];
    var left = this.graph.x(time);

    // if no element for this time, create one
    if ( !event.element ) {

      // make the little circle
      event.element = document.createElement('div');
      event.element.classList.add('dash_event');
      event.element.style.display = 'block';
      this.elements.timeline.appendChild(event.element);
      
      // make the line
      event.line = document.createElement('div');
      event.line.classList.add('dash_event_line');
      this.graph.element.appendChild(event.line);
      
      event.box = document.createElement('div');
      event.box.classList.add('dash_event_text');
      this.elements.timeline.appendChild(event.box);

      // click anywhere on dot, line, box popup box up/down
      [ 'element', 'line', 'box' ].forEach(function(element) {
        event[element].addEventListener('click', function(e) {
          event.box.classList.toggle('active');
        }, false);
      });

      this.updateEvent(time);   // move the line to correct x-axis position
    }

    // add text for this event to the box
    var text = document.createElement('div');
    text.innerHTML = content;
    event.box.appendChild(text);

    return event;
  },

  deleteEvent: function(time) {
    var event = this.data[time];
    this.graph.element.removeChild(event.line);
    this.elements.timeline.removeChild(event.element);
    delete this.data[time];
    return this;
  },

  deleteEvents: function() {
    for (time in this.data) {
      if ( this.data.hasOwnProperty(time) ) {
        this.deleteEvent(time);
      }
    }
    return this;
  },

  updateEvent: function(time) {
    var event = this.data[time];
    var left = this.graph.x(time);

    // hide event if out of graph range
    if ( left < 0 || left > this.graph.x.range()[1] ) {
      event.line.style.display    = 'none';
      event.element.style.display = 'none';
    }

    event.element.style.left = left + 'px';
    event.line.style.left    = left + 'px';    
    event.box.style.left     = left + 'px';
    return this;
  },

  update: function() {
    for (time in this.data) {
      if ( this.data.hasOwnProperty(time) ) {
        this.updateEvent(time);
      }
    }
    return this;
  }
};
