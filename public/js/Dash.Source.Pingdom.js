Dash.namespace('Source.Pingdom');

Dash.Source.Pingdom = function(stat) {
  // what to extract as y data (uptime or responsetime)
  this.measure = stat.measure || 'responsetime';

  var stub = stat.source + encodeURI(stat.target);
  this.url = function(period) {
    //return stub + "&from=" + Dash.Date.toEpoch(from);
    return stub + "&from=" + period.start.getTime()/1000;
  };

  // target should contain a digit of at least 6 chars
  var check = stat.target.match(/\d{6,}/)[0];
  this.link = function(period) {
    return "https://my.pingdom.com/reports/" +
      this.measure + "#check=" + check +
      "&daterange=" + period.from;
  };

  return this;
};

Dash.Source.Pingdom.prototype = {

  // how to extract response time as y data
  responsetime: function(r) {
    return r.responsetime || 0.0;
  },

  // how to extract count of non-up status as y data
  uptime: function(r) {
    return r.status == 'up' ? 0.0 : 1.0;
  },

  toSeries: function(data) {
    var results = {
      name: "pingdom.results." + this.measure,
      data: []
    };
    for (var len=data.results.length, i=len-1; i>=0; i--) {
      var result = data.results[i];
      results.data.push( {
        x: result.time,
        y: this[this.measure](result)
      } );
    }
    return [ results ];
  },

  eventEpochs: function(data) {
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
