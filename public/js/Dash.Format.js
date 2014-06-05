Dash.namespace("Format");

Dash.Format.Metric = function(y) {
  if      (typeof y !== 'number') { return y }
  else if (y >= 1000000000000)    { return Math.round(y/1000000000000) + "T" }
  else if (y >= 1000000000)       { return Math.round(y/1000000000)    + "B" }
  else if (y >= 1000000)          { return Math.round(y/1000000)       + "M" }
  else if (y >= 1000)             { return Math.round(y/1000)          + "K" }
  else if (y < 1 && y > 0)        { return y.toFixed(1) }
  else                            { return Math.round(y) }
};

Dash.Format.Base1024 = function(y) {
  if      (y >= 1125899906842624)  { return Math.round(y / 1125899906842624) + "P" }
  else if (y >= 1099511627776)     { return Math.round(y / 1099511627776) + "T" }
  else if (y >= 1073741824)        { return Math.round(y / 1073741824) + "G" }
  else if (y >= 1048576)           { return Math.round(y / 1048576) + "M" }
  else if (y >= 1024)              { return Math.round(y / 1024) + "K" }
  else if (y < 1 && y > 0)         { return y.toFixed(2) }
  else                             { return Math.round(y) }
};

// convert seconds to wdhms as a string
Dash.Format.Time = function(s) {
  if (typeof s !== 'number') {
     return s;
  }

  if (s == 0) {
    return s;
  }

  var min = Math.floor(s/60),   sec = Math.round(s%60),
      hr  = Math.floor(min/60), min = min%60,
      day = Math.floor(hr/24),  hr  = hr%24,
      wk  = Math.floor(day/7),  day = day%7;
  
  return [ [wk, 'w'], [day, 'd'], [hr, 'h'], [min, 'm'], [sec, 's'] ].filter(function(x) {
    return x[0] != 0;
  }).map(function(x) {
    return x[0] + x[1];
  }).join('');
};

// convert millisec to nearest whole units
Dash.Format.Milliseconds = function(ms) {
  if (typeof ms !== 'number') {
    debugger;
    return ms;
  }

  var sec = Math.floor(ms/1000), msec = Math.round(ms%1000),
      min = Math.floor(sec/60),  sec  = Math.round(sec%60),
      hr  = Math.floor(min/60),  min  = min%60;
  debugger;
  if (hr > 0) {
    return hr + 'h ' + min + 'm';
  } else if (min > 0) {
    return min + 'm ' + sec + 's';
  } else if (sec > 0) {
    return sec + 's ' + msec + 'ms';
  } else if (msec > 0) {
    return msec + 'ms';
  } else {
    return '0';
  }
};



// convert microsec to nearest whole units
Dash.Format.Microseconds = function(us) {
  if (typeof us !== 'number') {
     return us;
  }

  var msec = Math.floor(us/1000),   usec = Math.round(us%1000),
      sec  = Math.floor(msec/1000), msec = Math.round(msec%1000),
      min  = Math.floor(sec/60),    sec  = Math.round(sec%60),
      hr   = Math.floor(min/60),    min  = min%60;

  if (hr > 0) {
    return hr + 'h';
  } else if (min > 0) {
    return min + 'm'
  } else if (sec > 0) {
    return sec + 's';
  } else if (msec > 0) {
    return msec + 'ms';
  } else if (usec > 0) {
    return usec + 'μs';
  } else {
    return '0';
  }
};

// append a '%' to a reasonably-formatted number
Dash.Format.Percentage = function(x) {
  return (typeof x === 'number') ? x.toFixed(0) + '%' : x;
}
