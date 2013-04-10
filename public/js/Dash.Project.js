// a project is a collection of stats to be displayed together
Dash.namespace('Project');

Dash.Project = function() {
  this.defaults = $.extend(true, {}, Dash.defaults||{});
  this.stats = [];
  this.promises = [];
  return this;
}

Dash.Project.prototype = {

  // merge a new defaults hash with existing
  config: function(cfg) {
    $.extend(true, this.defaults, cfg);
    return this;
  },

  // add some new stats to the project, with current set of defaults applied
  add: function() {
    for (var i=0, len=arguments.length; i<len; i++) {
      var stat = $.extend({}, this.defaults, arguments[i]);
      this.stats.push(new Dash.Stat(stat));
    }
    return this;
  },

  // run data source find() method; set a callback with 'done', taking metrics arrays;
  // convenience callbacks 'each' loops metrics, 'add' runs this.add() method for each
  find: function(cfg) {
    cfg = $.extend(true, {}, this.defaults, cfg);

    var self = this,
        type = Dash.capitalize(cfg.type);

    var find = Dash.Source[type].find(cfg, function(metrics) {

      // 'done' callback: roll your own everything
      cfg.done && cfg.done.call(self, metrics);// call with Project object as this

      // 'each' callback: loops over metrics, then roll your own
      cfg.each && metrics.forEach(function(metric) {
        cfg.each.call(self, metric);
      });

      // 'add' callback: inherits settings from find() in a closure,
      // just return any changes and this.add() is called with the return value
      cfg.add && metrics.forEach(function(metric) {
        var new_cfg = $.extend({}, cfg, cfg.add.call(self, metric)); // get and merge stat cfg
        self.add(new_cfg);      // add the new stat
      });
    });
    this.promises.push(find);
    return this;
  },

  // run callback once all stats are configured for this project
  ready: function(callback) {
    $.when.apply($, this.promises).then(function() {
      callback();
    })
    return this;
  }

}
