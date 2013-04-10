Dash.namespace('Source.Graphite');

Dash.Source.Graphite = function(stat) {
  var stub = stat.source + "/render?target=" + encodeURI(stat.target);

  this.url = function(from) {          // how to get data
    return stub + "&from=" + from + "&format=json";
  };

  this.link = function(from) {         // link to the original data source
    return stub + "&from=" + from + "&height=600&width=800";
  };

  return this;
}

Dash.Source.Graphite.find = function(cfg, callback) {
  var source = cfg.source || "http://graphite",
      request = {
        url: source + '/metrics/find?format=completer&query=' + cfg.target,
        dataType: 'json'
      };

  return Dash.ajax(request)
    .done(function(data) {
      var metrics = data.metrics.filter(function(metric) {
        return metric.is_leaf == 1;
      }).map(function(metric) {
        return metric.path;
      });
      callback(metrics);
    });
};

Dash.Source.Graphite.prototype = {

  toSeries: function(data) {
    return data.map(function(metric) {
      return {
        name:  metric.target,
        data:  metric.datapoints.map(function(point) {
          return { x: point[1], y: point[0] };
        })
      }
    });
  },

  // return sparse series of epochs where x>0
  toEvents: function(data) {
    return data.map(function(metric) {
      return {
        target: metric.target,
        epochs: metric.datapoints.filter(function(point) {
          var x = point[0];
          return x > 0;
        }).map(function(point) {
          return point[1];
        })
      }
    });
  }
};
