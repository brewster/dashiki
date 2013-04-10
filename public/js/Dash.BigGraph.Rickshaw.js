// implements big graph for boxes display, with events timeline
Dash.namespace('BigGraph.Rickshaw');

Dash.BigGraph.Rickshaw = function(element) {
  this.series = [ { name: "initial state", data: [ {x:0, y:0} ] } ]; // start with minimal data
  this.events = [];             // event stats to show on timeline
  this.graph = new Rickshaw.Graph({
    element:  $(element)[0],
    renderer: 'area',
    stroke:   true,           // outline added to area graphs
    series:   this.series     // ref to display data
  });

  new Rickshaw.Graph.Axis.Time({
    graph: this.graph
  }).render();

  this.graph.y_axis = new Dash.Graph.Axis.Y( {
    graph: this.graph,
    orientation: 'right',
    element: document.getElementById('y_axis'),
  }).render();

  // hover shows data values
  new Rickshaw.Graph.HoverDetailWithNulls( {
    graph: this.graph
  });

  this.graph.render();
  return this;
}

Dash.BigGraph.Rickshaw.prototype = {

  // graph title
  createTitle: function(selector) {
    this.title_element = $(selector);
    return this;
  },

  // link to data source
  createLink: function(selector) {
    this.link_element = $(selector);
    return this;
  },

  // update data source link
  updateLink: function(link) {
    this.link_element.attr('href', link);
    return this;
  },

  createDownload: function(selector) {
    this.download_element = $(selector);
    return this;
  },

  updateDownload: function(link) {
    this.download_element.attr('href', link);
  },

  // setup callback for area/line/bar/scatter controls
  createRendererControls: function(selector) {
    var self = this;
    this.renderer_controls = $(selector).click(function() {
      self.graph.configure({ renderer: this.value });
      self.graph.render();
    })
    return this;
  },

  // create events timeline at given element/selector
  createTimeline: function(selector) {
    this.timeline = new Dash.BigGraph.Timeline({
      graph: this.graph,
      element: $(selector)[0]
    });
    return this;
  },

  // save array of event Stat objects
  createEvents: function(stats) {
    stats.forEach(function(stat) {
      this.events.push(stat);
    }, this);
    return this;
  },

  // delete all event lines
  deleteEventLines: function() {
    if ( this.events.length > 0 ) {
      this.timeline.deleteEvents();
    }
    return this;
  },

  // add event lines for given array of events, or saved
  addEventLines: function(from, events) {
    var self = this;
    (events || this.events).forEach(function(stat) {
      stat.updateEvent(from, function(stat) {
        self.updateEventLines(stat);
      });
    });
    return this;
  },

  // add event lines to timeline for given event
  updateEventLines: function(stat) {
    var self = this;
    stat.events.forEach(function(metric) {
      metric.epochs.forEach(function(epoch) {
        self.timeline.add({
          time: epoch,
          content: metric.target
        }).line.classList.add(stat.class); // style line according to event cfg
      });
    });
    return this;
  },

  // update title and axes to a new stat
  changeStat: function(stat) {
    this.title_element.fadeOut('fast', function() {
      $(this).html(stat.title).fadeIn('fast');
    });

    this.graph.configure({ renderer: stat.renderer });
    this.graph.y_axis.configure({ tickFormat: stat.format });
    return this;
  },

  // display new data from given stat
  updateData: function(stat) {
    this.series.length = 0;
    Array.prototype.push.apply(this.series, stat.series);

    // update colors for each series metric
    var palette = new Rickshaw.Color.Palette({ scheme: stat.colors });
    this.series.forEach(function(metric, index) {
      metric.color = palette.color();
    });

    this.graph.update();    // re-read data from series ref
    return this;
  }

};
