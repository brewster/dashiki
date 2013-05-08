Dash.namespace('Source.Opscenter');

Dash.Source.Opscenter = function(stat) {
  var params = [];
  [ 'function', 'step' ].forEach(function(setting) { // url params we might want to set
    if ( stat.hasOwnProperty(setting) ) {
      params.push(setting + '=' + encodeURI(stat[setting]));
    }
  });

  var target = stat.target || stat.metric; // backward compat
  var stub = stat.source + target.replace(/^\/*/, '/') + '?' + params.join('&');

  this.url = function(period) {
    return stub + "&start=" + period.start.getTime()/1000;
  };

  this.link = function(period) {
    return stat.source;
  };

  return this;
};

Dash.Source.Opscenter.find = function(cfg, callback) {
  var source = cfg.source || 'http://opscenter:8888',
      target = cfg.target.replace(/^\/*/, '/'), // ensure leading char is '/'
      request = {
        url:     source + target,
        headers: {},
        dataType: 'json',
        error:   function(xhr, type, err) { console.log(type + ': ' + err); }
      };

  return Dash.ajax(request, true)
    .done(function(data) {
      var keys = [];
      for (var key in data.column_families) {
        data.column_families.hasOwnProperty(key) && keys.push(key);
      }
      callback(keys.sort());
    });
};

Dash.Source.Opscenter.prototype = {

  toSeries: function(data) {
    var dataset = data["Total"] || data["Average"];
    var metrics = [];
    for (var metric in dataset) {
      if ( dataset.hasOwnProperty(metric) ) {
        metrics.push({
          name: metric,
          data: dataset[metric].map(function(point) {
            return { x: point[0], y: point[1] };
          })
        });
      }
    }
    return metrics;
  }
};
