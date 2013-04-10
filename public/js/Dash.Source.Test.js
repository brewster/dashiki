Dash.namespace('Source.Test');

Dash.Source.Test = function(stat) {
  var stub = "/_testdata_/?target=" + stat.target;

  this.url = function(from) {
    return stub + "&from=" + Dash.Date.toEpoch(from);
  };

  this.link = function(from) {
    return this.url(from);
  };

  return this;
}

Dash.Source.Test.find = function(server, query, callback) {
  var request = {
    url: '/_testfind_/' + query,
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
