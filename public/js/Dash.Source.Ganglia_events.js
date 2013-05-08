// there is much unpleasantness here; ganglia events api code just returns
// json with all (some-undefined-subset-of-recent-)events; would be good to
// hack events.php to call ganglia_events_get() with start and end times for
// list action; for now we just pull all the data and filter the date range
// ourselves

Dash.namespace('Source.Ganglia_events');

Dash.Source.Ganglia_events = function(stat) {
  var stub = stat.source + '/ganglia/api/events.php?action=list';

  this.url = function(period) {

    // to{Series,Events} need these later
    this.from_epoch = period.start.getTime()/1000;
    this.to_epoch   = Math.floor((new Date).getTime()/1000); // current epoch in sec

    return stub;
  };

  this.link = function(period) {
    return stub;
  };

  // this sucks for now, do not use until I fix big_graph to deal with sparse data
  this.toSeries = function(data) {
    var self = this,
        metrics = {},
        series = [];

    data.forEach(function(event) {
      if ( event.start_time >= self.from_epoch ) {
        var m = event.summary + '.' + event.host_regex; // metric name
        (metrics[m] == undefined) && (metrics[m] = []);
        metrics[m].push({ x: event.start_time, y: 1.0 });
      }
    })

    for ( var m in metrics ) {
      if ( metrics.hasOwnProperty(m)) {
        series.push({ name: m, data: metrics[m] });
      }
    }
    
    return series;
  };

  // use this to insert sparse events
  this.toEvents = function(data) {
    var self = this,
        metrics = {},
        series = [];

    data.forEach(function(event) {
      [ 'start_time', 'end_time' ].forEach(function(t) {
        var epoch = parseInt(event[t]);
        if ( epoch != null && epoch >= self.from_epoch && epoch <= self.to_epoch ) {
          var name = [ event.summary, event.host_regex, t ].join('.'); // metric name
          (metrics[name] == undefined) && (metrics[name] = []);
          metrics[name].push(epoch);
        }
      });
    });
    
    for ( var name in metrics ) {
      metrics.hasOwnProperty(name) && series.push({
        target: name,
        epochs: metrics[name]
      });
    }

    return series;
  }
  
  return this;
}
