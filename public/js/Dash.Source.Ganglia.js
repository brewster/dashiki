Dash.namespace('Source.Ganglia');

Dash.Source.Ganglia = function(stat) {
  var settings = {              // possible ganglia stat settings
    metric:  'm',
    cluster: 'c',
    graph:   'g'
  };

  var params = [];
  for (x in settings) {         // add those set in cfg
    if ( settings.hasOwnProperty(x) && stat.hasOwnProperty(x) ) {
      params.push(settings[x] + '=' + encodeURI(stat[x]));
    }
  }

  var stub = stat.source + "/ganglia/graph.php?" + params.join('&');
  this.url = function(period) {
    return stub + '&json=1' + "&cs=" + period.from;
  };

  var linkstub = stat.source + "/ganglia?" + params.join('&');
  this.link = function(period) {
    return linkstub + "&cs=" + period.from;
  };

  return this;
}

Dash.Source.Ganglia.prototype = {

  toSeries: function(data) {
    return data.map(function(metric) {
      return {
        name: metric.metric_name,
        data: Dash.grep(metric.datapoints, function(point) {
          return isNaN(point[0]) ? null : { x: point[1], y: point[0] };
        })
      };
    });
  }

};

// filter to use in your metrics to use num of cpus in load report
// to convert the total load to a ratio, where ratio of 1 means actual
// loadavg is same as total cpus
Dash.Source.Ganglia.convertLoadReportToRatio = function(data) {
  return [{
    metric_name: 'load_ratio',
    datapoints: data[0].datapoints.map(function(x, i) {
      var num_cpus = data[2].datapoints[i][0];
      // last cpu value can be zero, do not divide by this or the universe will end
      var ratio = (num_cpus === 0) ? 0 : x[0]/num_cpus;
      return [ ratio, x[1] ];
    })
  }];
};

// filter to skip 'Total' mem (last metric)
Dash.Source.Ganglia.skipTotalMetric = function(data) {
  return data.slice(0,4);
};

// filter to skip 'Idle' metric for cpu report
Dash.Source.Ganglia.removeIdleMetric = function(data) {
  return data.slice(0,3);
};
