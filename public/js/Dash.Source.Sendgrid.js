// query sendgrid api (see http://sendgrid.com/docs/api_workshop.html)
// data is daily, so not much point in looking at anything less than 1d view
//
// usage:
//
//   var dash = Dash.stats()
//     .config({
//       type:     'sendgrid',
//       proxy:    true,
//       api_user: 'myusername',
//       api_key:  'mypasswd'
//     });
//   [
//     'requests',
//     'delivered',
//     'blocked',
//     'bounces',
//     'repeat_bounces',
//     'spamreports',
//     'repeat_spamreports',
//     'unsubscribes',
//     'repeat_unsubscribes',
//     'invalid_email',
//     'spam_drop',
//     'opens',
//     'unique_opens',
//     'clicks',
//     'unique_clicks'
//   ].forEach(function(metric) {
//     dash.add({
//       title: Dash.capitalize(metric),
//       target: metric
//     })
//   });

Dash.namespace('Source.Sendgrid');

Dash.Source.Sendgrid = function(stat) {
  var stub = 'http://sendgrid.com/api/stats.get.json' +
    '?api_user=' + stat.api_user +
    '&api_key=' + stat.api_key;

  this.url = function(period) {
    this.from_epoch = period.start.getTime()/1000;
    this.to_epoch   = Math.floor((new Date).getTime()/1000); // current epoch in sec

    var start_date = (new Date(this.from_epoch*1000)).toISOString().split('T')[0],
        end_date   = (new Date(this.to_epoch*1000  )).toISOString().split('T')[0];
    
    return stub + '&start_date=' + start_date + '&end_date=' + end_date;
  };
  
  this.link = function(period) {
    return 'http://sendgrid.com/statistics';
  };

  this.toSeries = function(data) {
    return [{
      name: 'sendgrid.stats',
      data: data.map(function(point) {
        return {
          x: Date.parse(point.date)/1000, // epoch
          y: point[stat.target]
        }
      })
    }];
  };
}
