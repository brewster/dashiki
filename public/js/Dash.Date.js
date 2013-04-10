// a buncf of date-handling routines
Dash.namespace('Date');

Dash.Date.multipliers = {
  s:  1,
  mi: 60,
  h:  3600,
  d:  86400,
  w:  604800,
  mo: 2592000,
  y:  31536000
};

// worst.date-parser.ever.
// convert -N{s,min,h,d,w,mon,y} or hh:mm into epoch
Dash.Date.toEpoch = function(date) {
  var multipliers = {
    s:  1,
    mi: 60,
    h:  3600,
    d:  86400,
    w:  604800,
    mo: 2592000,
    y:  31536000
  },
  now = new Date,
  epoch,
  m;

  if ( m = date.match(/^-(\d+)(s|mi|h|d|w|mo|y)/) ) { // e.g. -2hours
    msecs_ago = (m[1] * multipliers[m[2]]) * 1000;    // millisec
    epoch = now - msecs_ago;
  } else if ( m = date.match(/^(\d+):(\d\d)/) ) { // hh:mm
    var d = new Date;
    d.setHours(m[1]);
    d.setMinutes(m[2]);
    if ( d > now ) {            // if in future, wind back a day
      d.setDate(d.getDate() - 1);
    }
    epoch = d.getTime();
  } else {
    console.log('unable to parse date: ' + date);
  }

  return Math.round(epoch/1000); // js epoch in msec, convert to sec
};

// convert -N{s,min,h,d,w,mon,y} or hh:mm into seconds ago
Dash.Date.toSec = function(date) {
  var secs_ago;
  
  if ( m = date.match(/^-(\d+)(s|mi|h|d|w|mo|y)/) ) { // e.g. -2hours
    secs_ago = m[1] * Dash.Date.multipliers[m[2]];
  } else if ( m = date.match(/^(\d+):(\d\d)/) ) { // hh:mm
    secs_ago = (m[1]*3600) + (m[2]*60);
  }
  return secs_ago;
};
