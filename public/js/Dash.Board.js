Dash.namespace('Board');

// constructor
Dash.Board = function() {
  return $.extend({
    interval: 15000,               // polling interval in ms
    from: "-1h",                   // default time period to show in graphite format
    paused: true,                  // whether to keep polling periodically
    defaults: {                    // default settings for each stat
      type:          "graphite",            // type of data source
      source:        "http://graphite",     // url for data
      proxy:         false,                 // proxy request through sinatra if true
      headers:       {},                    // http headers
      username:      null,                  // http basic auth
      password:      null,                  // ""
      display:       'sum',                 // calculated stat to display
      format:        Dash.Format.Metric,    // function to format display value (e.g. units, etc)
      thresholds:    [],                    // functions to apply css classes
      renderer:      "area",                // big graph style: {area,line,box,scatterplot}
      interpolation: true,                  // for big graph
      span:          2,                     // size of bootstrap span to apply to statbox
      colors:        [ "#657b83", "#6c71c4", "#859900", "#d33682", "#b58900", "#cb4b16", "#268bd2", "#2aa198", "#dc322f" ]                   // big graph color scheme
    },
    stats: [],
    events: [],
    big_graph: false
  }, this);
}

Dash.Board.prototype = {

  // add to dashboard configuration from an object loaded from e.g. a config file
  config: function(cfg) {
    $.extend(true, this, cfg);
    this.stats  = Dash.Stat.createFromConfig(this.stats,  this.defaults);
    this.events = Dash.Stat.createFromConfig(this.events, this.defaults);
    return this;
  },

  // merge dashboard defaults and return a configured Dash.Stat object
  // makeStat: function(obj) {
  //   var stat = $.extend({}, this.defaults, obj);

  //   // capitalize correctly e.g. graphite -> Graphite
  //   var type = stat.type.charAt(0).toUpperCase() + stat.type.slice(1).toLowerCase();
  //   stat.data_source = new Dash.Source[type](stat);

  //   return (stat instanceof Dash.Stat) ? stat : new Dash.Stat(stat);
  // },

  createStatBoxes: function(element) {
    var boxes = this.stats.map(function(stat) {
      return this.createStatBox(stat);
    }, this);

    $(element).append(boxes);

    //boxes[0].addClass('selected'); // select first box
    this.stats[0].statbox.addClass('selected'); // select first box

    return this;
  },

  // create a statbox div wrapped in a bootstrap.js .spanX
  createStatBox: function(stat) {
    var dashboard = this;

    stat.statbox = $('<div>', {class: 'statbox'})
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

        if (dashboard.big_graph) {
          dashboard.big_graph.changeStat(stat);
          dashboard.updateSelectedStat(stat);
        }
      })
      .mouseenter(function() {
        $(this).children('.drawer').show();
      })
      .mouseleave(function() {
        $(this).children('.drawer').hide();
      });

    return $('<div>', {class: 'span'+stat.span}).append(stat.statbox);
  },

  createStatGraphs: function() {
    this.stats.forEach(function(stat) {
      this.createStatGraph(stat);
    }, this);
    return this;
  },

  // create a rickshaw graph for the statbox
  createStatGraph: function(stat) {
    stat.graph_data = [ { x:0, y:0 } ];
    stat.graph = new Rickshaw.Graph({
      element: stat.statbox.children('.graph').get(0),
      stroke: true,
      series: [ { color: 'grey', data: stat.graph_data } ]
    });
    stat.graph.render();
    return stat.graph;
  },

  updateStats: function() {
    var dashboard = this;
    this.stats.forEach(function(stat) {
      stat.update(dashboard.from, function(stat) {
        dashboard
          .updateStatboxValue(stat)
          .updateStatboxClass(stat)
          .updateStatboxGraph(stat)
          .updateStatboxDrawer(stat);

        if ( stat.statbox.hasClass('selected') && (this.big_graph) ) {
          dashboard.updateSelectedStat(stat);
        }
      });
    });

    return this;
  },

  updateStatboxClass: function(stat) {
    var classes = ["statbox"];
    stat.statbox.hasClass("selected") && classes.push("selected");
    stat.statbox.attr("class", $.merge(classes, stat.classes).join(' '))
    return this;
  },

  updateStatboxValue: function(stat) {
    stat.statbox.children('.value')
      .fadeOut('fast', function() {
        $(this)
          .text(stat.value)
          .fadeIn('fast');
      });
    return this;
  },

  updateStatboxGraph: function(stat) {
    stat.graph_data.length = 0;
    Array.prototype.push.apply(stat.graph_data, stat.aggregate.map(function(value, index) {
      return { x: index, y: value } // no axis ticks, so who cares about x values
    }));
    stat.graph.update();
    return this;
  },

  updateStatboxDrawer: function(stat) {
    stat.statbox
      .children('.drawer')
      .html('&Sigma;=' + stat.stats.sum.toFixed(1)  + '&nbsp;&nbsp;' +
            '&mu;='    + stat.stats.mean.toFixed(1) + '<br>' +
            '&uarr;'   + stat.stats.max.toFixed(1)  + '&nbsp;&nbsp;' +
            '&darr;'   + stat.stats.min.toFixed(1)  + '&nbsp;&nbsp;' +
            '&rarr;'   + stat.stats.last);
    return this;
  },

  updateSelectedStat: function(stat) {
    Dash.UI
      .updatePageTitle(stat)
      .updateFaviconBadge(stat.value, stat.statbox);
    this.big_graph
      .updateData(stat)
      .updateLink(stat.data_source.link(this.from));
    return this;
  },

  updateEvents: function() {
    if ( this.events.length > 0 ) {
      this.big_graph.timeline.deleteEvents();
    }

    this.events.forEach(function(event) {
      this.updateEvent(event);
    }, this);
    return this;
  },

  updateEvent: function(event) {
    var dashboard = this;
    var the_url = event.data_source.url(dashboard.from);
    // FIXME proxy for events
    // if ( event.proxy ) {         // proxy the url through sinatra
    //   the_url = "/_proxy_/?url=" + encodeURIComponent(the_url);
    // }
    $.ajax({
      dataType: 'json',
      error: function(xhr, type, err) { console.log(type + ': ' + err); },
      url: the_url
    }).done(function(data) {
      var series = event.data_source.eventEpochs(data);
      dashboard.big_graph.updateEvent(series, event.class);
    });
    return this;
  },

  update: function(from) {
    (from != undefined) && (this.from = from);
    return this.updateStats().updateEvents();
  },

  play: function() {
    var dashboard = this;
    this.paused = false;
    this.interval_id = setInterval(function() {
      dashboard.updateStats();
    }, this.interval);
    return this;
  },

  pause: function() {
    this.paused = true;
    clearInterval(this.interval_id);
    return this;
  }

}
