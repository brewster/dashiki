// usage:
//
// - go to https://code.google.com/apis/console for your project
// - go to Services and turn Analytics API 'on'
// - go to API Access and create a project (e.g. called 'Dashboard')
// - create a Service account and download the private key to e.g. ./keys/google
// - copy the public_key associated with the file
// - copy the Email address, go to Team and add view permissions for this email
//
// auth in a Dash.pre() hook, e.g.:
//
//  Dash.stats()
//    .pre(function() {
//      Dash.Source.Googleanalytics.auth({
//        public_key:    '2hds78j89dfs54sadf7sdfh',
//        private_key:   'keys/google/2hds78j89dfs54sadf7sdfh-privatekey.p12',
//        email_address: '12345-123gf7823gf8723@developer.gserviceaccount.com',
//        password:      'notasecret'
//      })
//    })
//    .add({
//      type:   'googleanalytics',
//      ids:    'ga:123456789',     // project id from ga dashboard
//      title:  'Visits',
//      target: 'ga:visits'         // see http://ga-dev-tools.appspot.com/explorer/ for metrics
//    })

Dash.namespace('Source.Googleanalytics');

Dash.Source.Googleanalytics = function(stat) {

  var params = {
    'ids'       : stat.ids,                          // analytics profile ID
    'public_key': stat.public_key,                   // matches private_key file used to auth
    'dimensions': 'ga:year,ga:month,ga:day,ga:hour', // need all date components for x-axis
    'sort'      : 'ga:year,ga:month,ga:day,ga:hour', // ... in a known order
    'metrics'   : stat.target,
    'filters'   : stat.filters  // e.g. ga:eventLabel==feed-notification
  };
  
  this.url = function(period) {
    console.log(period);
    // this.toSeries() will be needing these for filtering date range
    //this.from_epoch = Dash.Date.toEpoch(from);
    this.from_epoch = period.start.getTime()/1000;
    this.to_epoch   = Math.floor((new Date).getTime()/1000); // current epoch in sec

    // ga needs dates as 'yyyy-mm-dd'
    params['start-date'] = (new Date(this.from_epoch*1000)).toISOString().split('T')[0];
    params['end-date']   = (new Date(this.to_epoch*1000  )).toISOString().split('T')[0];

    return '/_google_/get?' + $.map(params, function(v, k) {
      return v ? k + '=' + v : null;
    }).join('&');
  };

  this.link = function(period) {
    return this.url(period);
  };

  this.toSeries = function(data) {
    var self = this;
    
    return [{
      name: stat.target,
      data: Dash.grep(data, function(point) {
        var x = Date.parse(point.slice(0,3).join('-') + ' ' + point[3] + ':00')/1000; // epoch
        return x > self.from_epoch && x < self.to_epoch ? { x:x, y:parseInt(point[4]) } : null;
      })                        // filter out hours not in from/to range
    }];
  };
  
  return this;
}

Dash.Source.Googleanalytics.prototype = {

  toEvents: function(data) {
    return;                  // FIXME implement me suckaz
  }

};

Dash.Source.Googleanalytics.auth = function(params) {
  Dash.ajax({
    type: 'POST',
    async: false, // FIXME: temporary evil until I think of a promises-based solution
    url: '/_google_/auth',
    data: params
  })
};
