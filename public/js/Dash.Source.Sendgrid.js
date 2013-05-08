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
    '&api_key='  + stat.api_key;

  this.url = function(period) {
    // sendgrid api has barftastic timezone issues and always looks up dates in CT;
    // ahead of CT and request a date sendgrid considers future? you will get a 400;
    // hence use 'days' param instead of dates; 0 days will give us today's data,
    // or ask for number of days in addition to today (e.g. days=6 for last week of data)
    var num_days = Math.floor(period.length/(24*3600*1000));
    (num_days > 0) && (num_days -= 1);
    
    return stub + '&days=' + num_days;
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
