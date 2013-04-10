Dash.namespace('Source.Errplane');

Dash.Source.Errplane = function(stat) {
  var rollup      = 60,              // use 1min rollups
      stub        = 'https://apiv2.errplane.com/databases/' + stat.app_id + stat.environment,
      target      = encodeURIComponent(stat.target),
      show        = stat.show || 'counts'; // counts or times

  this.url_counts = function(from) {
    var last = Math.floor(Dash.Date.toSec(from)/rollup); // number of time buckets to get
    return stub + '/rollups/' + rollup +
      '?api_key=' + stat.api_key + '&name=' + target + '&last=' + last;
  };

  this.url_times = function(from) {
    var start = Dash.Date.toEpoch(from),
        end   = Math.floor((new Date).getTime()/1000); // current epoch in sec
    return stub + '/series?api_key=' + stat.api_key + '&name=' + target +
      '&include_ids=true&start=' + start + '&end=' + end + '&last=5000';
  };

  this.url = this['url_'+show]; // count or times
  
  this.link = function(from) {
    return 'https://errplane.com/databases/' + stat.app_id + stat.environment +
      '/time_series#' + stat.target;
  };

  this.toSeries_counts = function(data) {
    return [{
      name: "counts",
      data: data.map(function(point) { return { x: point[4], y: point[3] } })
    }];
  },

  this.toSeries_times = function(data) {
    return [{
      name: "times",
      data: data.map(function(point) { return { x: point[2], y: point[1] } })
    }];
  },
  
  this.toSeries = this['toSeries_'+show]; // count or times

  return this;
}

// list time series in environment
Dash.Source.Errplane.find = function(cfg, callback) {
  var source = "https://apiv2.errplane.com/databases/",
      stub = source + cfg.app_id + 'production/lists' + '?api_key=' + cfg.api_key,
      request = {
        url: stub,
        dataType: 'json'
      };
  return Dash.ajax(request)
    .done(function(data) {
      callback(data.map(function(metric) { return metric.name }));
    });
};

Dash.Source.Errplane.prototype = {

  // FIXME
  toEvents: function(data) {
    console.log(data);
    return data;
  }
};
