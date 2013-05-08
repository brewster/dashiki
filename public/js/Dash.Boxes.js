Dash.namespace('Boxes');

Dash.Boxes = function(cfg) {
  $.extend(true, this, cfg);
  this.stats = [];
  this.pre_hooks = [];
  //this.events = [];
  return this;
}

Dash.Boxes.prototype = {
  
  // pre_hooks are functions to be called before each dashboard update
  addPreHooks: function(hooks) {
    hooks.forEach(function(hook) {
      this.pre_hooks.push(hook);
    }, this);
    return this;
  },
  
  // add stat boxes to dom for an array of Stat objects
  createBoxes: function(element, stats) {
    var boxes = stats.map(function(stat) {
      this.stats.push(stat);
      return this.createBox(stat);
    }, this);
    $(element).append(boxes);   // insert all stat boxes into dom
    boxes[0].children('.statbox').addClass('selected'); // select the first one
    this.big_graph.changeStat(stats[0]);                // and set title, etc
    return this;
  },

  // return element for a new stat box
  createBox: function(stat) {
    var self = this;
    stat.box = $('<div>', {class: 'statbox'})
      .append(
        $('<span>', { class: 'title' }).text(stat.title),
        $('<span>', { class: 'display' }).html(stat.displaySymbol()),
        $('<div>',  { class: 'value' }).text(0),
        $('<div>',  { class: 'graph' }),
        $('<div>',  { class: 'drawer' }).hide()
      )
      .click(function() {
        $('.statbox').removeClass('selected');
        $(this).addClass('selected');
        self.updateTitle(stat);
        
        if (self.big_graph) {
          self.big_graph.changeStat(stat);
          self.updateBigGraph(stat);
        }
      })
      .mouseenter(function() {
        $(this).children('.drawer').show();
      })
      .mouseleave(function() {
        $(this).children('.drawer').hide();
      });

    return $('<div>', {class: 'span2'}).append(stat.box);
  },

  createGraphs: function(stats) {
    stats.forEach(function(stat) {
      this.createGraph(stat);
    }, this);
    return this;
  },

  // add mini-graph to stat box
  createGraph: function(stat) {
    stat.graph_data = [ { x:0, y:0 } ];
    stat.graph = new Rickshaw.Graph({
      element: stat.box.children('.graph').get(0),
      stroke: true,
      series: [ { color: 'grey', data: stat.graph_data } ]
    });
    stat.graph.render();
    return stat.graph;
  },

  // update all stats
  updateStats: function(stats) {
    var self = this;

    this.pre_hooks.forEach(function(hook) {
      hook();
    });

    (stats || this.stats).forEach(function(stat) {
      stat.update(self.period, function(stat) {
        self
          .updateBoxValue(stat)
          .updateBoxClass(stat)
          .updateBoxGraph(stat)
          .updateBoxDrawer(stat);
        
        if ( stat.box.hasClass('selected') ) {
          self.updateTitle(stat)
          self.big_graph && self.updateBigGraph(stat);
        }
      });
    });
    return this;
  },

  // set display value
  updateBoxValue: function(stat) {
    stat.box.children('.value')
      .fadeOut('fast', function() {
        $(this)
          .text(stat.value)
          .fadeIn('fast');
      });
    return this;
  },

  // set box class (e.g. set by threshold)
  updateBoxClass: function(stat) {
    var classes = ["statbox"];
    stat.box.hasClass("selected") && classes.push("selected");
    stat.box.attr("class", $.merge(classes, stat.classes).join(' '))
    return this;
  },

  // update mini-graph
  updateBoxGraph: function(stat) {
    stat.graph_data.length = 0;
    Array.prototype.push.apply(stat.graph_data, stat.aggregate.map(function(value, index) {
      return { x: index, y: value } // no axis ticks, so who cares about x values
    }));
    stat.graph.update();
    return this;
  },

  // update displayed values in sliding drawer
  updateBoxDrawer: function(stat) {
    stat.box
      .children('.drawer')
      .html('&Sigma;=' + stat.stats.sum.toFixed(1)  + '&nbsp;&nbsp;' +
            '&mu;='    + stat.stats.avg.toFixed(1)  + '<br>' +
            '&uarr;'   + stat.stats.max.toFixed(1)  + '&nbsp;&nbsp;' +
            '&darr;'   + stat.stats.min.toFixed(1)  + '&nbsp;&nbsp;' +
            '&rarr;'   + stat.stats.last);
    return this;
  },

  // update page title and favicon
  updateTitle: function(stat) {
    Dash.UI
      .updatePageTitle(stat)
      .updateFaviconBadge(stat.value, stat.box);
    return this;
  },

  // called for currently-selected stat
  updateBigGraph: function(stat) {
    this.big_graph
      .updateData(stat)
      .updateLink(stat.data_source.link(this.period))
      .updateDownload(stat.data_source.url(this.period));
    return this;
  },

  // update data for everything
  update: function(from) {
    if ( from != undefined ) {
      this.period = new Dash.Period(from, 'now');
    }
    
    this.big_graph.deleteEventLines();
    this.updateStats();
    this.show_events && this.big_graph.addEventLines(this.period);
    return this;
  },

  // turn events on or off
  showEvents: function(state) {
    if ( state === true ) {
      (this.show_events === false) && this.big_graph.addEventLines(this.period);
      this.show_events = true;
    }
    else if ( state === false ) {
      //(this.show_events === true) && this.big_graph.deleteEventLines();
      this.big_graph.deleteEventLines();
      this.show_events = false;
    }
    return this.show_events;
  },
  
  // toggle auto-updates on
  play: function() {
    var self = this;
    this.interval_id = setInterval(function() {
      self.updateStats();
    }, this.interval);
    return this;
  },

  // toggle auto-updates off
  pause: function() {
    clearInterval(this.interval_id);
    return this;
  }

}
