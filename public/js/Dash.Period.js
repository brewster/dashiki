Dash.namespace('Period');

Dash.Period = function(from, to) {
  this.from = from;
  this.to   = to;
  this.now = new Date;
  this.start = new Dash.Period.relativeDate(from, this.now);
  this.end   = new Dash.Period.relativeDate(to,   this.now);
  this.length = this.end.date - this.start.date;
  return this;
}

Dash.Period.units = {
  s:  1,
  mi: 60,
  h:  3600,
  d:  86400,
  w:  604800,
  mo: 2592000,
  y:  31536000
};

Dash.Period.relativeDate = function(str, now) {
  var date = new Date,
      m;

  if ( m = str.match(/^-(\d+)(s|mi|h|d|w|mo|y)/) ) { // e.g. -2hours
    var msecs_ago = (m[1] * Dash.Period.units[m[2]]) * 1000;    // millisec
    date.setTime(date - msecs_ago);
  }
  else if ( m = str.match(/^(\d+):(\d\d)/) ) { // hh:mm
    date.setHours(m[1]);
    date.setMinutes(m[2]);
    if ( date > now ) {            // if in future, wind back a day
      date.setDate(date.getDate() - 1);
    }
  }
  
  return date;
}
