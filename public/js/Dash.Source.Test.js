Dash.namespace('Source.Test');

Dash.Source.Test = function(stat) {
  var stub = "/_test_/data/?target=" + stat.target;

  this.url = function(period) {
    return stub + "&from=" + period.start.getTime()/1000;
  };

  this.link = function(period) {
    return this.url(period);
  };

  return this;
}

Dash.Source.Test.find = function(server, query, callback) {
  var request = {
    url: '/_test_/find/' + query,
    dataType: 'json'
  };
  return Dash.ajax(request)
    .done(function(data) {
      callback(data);
    });
}

Dash.Source.Test.prototype = {
  toSeries: function(data) {
    return data;
  },

  toEvents: function(data) {
    return data.map(function(metric) {
      return {
        target: metric.name,
        epochs: metric.data.filter(function(point) {
          return point.y > 0;
        }).map(function(point) {
          return point.x;
        })
      }
    });
  }
};
