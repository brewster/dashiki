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
  this.url = function(from) {
    return stub + '&json=1' + "&cs=" + from;
  };

  var linkstub = stat.source + "/ganglia?" + params.join('&');
  this.link = function(from) {
    return linkstub + "&cs=" + from;
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
