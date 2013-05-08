Dash.namespace('Source.Graphite');

Dash.Source.Graphite = function(stat) {
  var stub = stat.source + "/render?target=";
  
  // choose a sane resolution by period length
  this.stepSize = function(length) {
    var step;
    if ( length <= 4*3600 ) {            // 4hour
      step = '10s';                      // likely default for graphite
    } else if ( length <= 12*3600 ) {    // 12hours
      step = '1min';
    } else if ( length <= 24*3600 ) {    // 1d
      step = '5min';
    } else if ( length <= 14*24*3600 ) { // 2weeks
      step = '1h';
    } else {
      step = '1d';
    }
    return step;
  };
  
  // return graphite function call to bucket data appropriately for period
  this.summarize = function(length) {
    var func = 'smartSummarize(' + stat.target + ',"' +
      this.stepSize(length)  + '","' + stat.display + '")';
    return encodeURI(func);
  };
  
  // how to get data
  this.url = function(period) {
    return stub + this.summarize(period.length) + "&from=" + period.from + "&format=json";
  };

  // link to the original data source
  var link = stub + encodeURI(stat.target) + "&height=600&width=800";
  this.link = function(period) {
    return link + "&from=" + period.from;
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
