Dash.namespace('Source.Influxdb');

Dash.Source.Influxdb = function(stat) {

  var query =
    'select ' + (stat.func || 'sum') + '(' + stat.column + ')' +
    ' from ' + stat.series +
    ' where ' + (stat.where ? stat.where + 'and ' : '');
    
  var params = [
    'u=' + (stat.username || 'root'),
    'p=' + (stat.password || 'root'),
    'time_precision=s',
    'q=' + encodeURI(query)
  ];
  
  var stub = stat.source + '/db/' + stat.database + '/series?' + params.join('&');
  
  this.url = function(period) {
    var group = ' group by time(10s)';
    var url = stub + encodeURI('time>now()' + period.from + group);
    return url;
  };

  this.link = function(period) {
    return this.url(period);
  };
  
  return this;
};

Dash.Source.Influxdb.prototype = {

  // FIXME: this handles sparse data pretty badly
  toSeries: function(data) {
    return data.map(function(metric) {
      return {
        name:  metric.name,
        data:  metric.points.reverse().map(function(point) {
          return { x: point[0], y: point[1] };
        })
      }
    });
  },

  // sparse data is desired here
  toEvents: function(data) {
    return this.toSeries(data);
  }
  
};
