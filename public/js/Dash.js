var Dash = {
  namespace: function(ns) {
    var parts  = ns.split('.'),
        parent = Dash;

    if (parts[0] === "Dash") {  // allow call without parent in ns
      parts = parts.slice(1);
    }

    for (var i=0, len=parts.length; i<len; i++) {
      if (typeof parent[parts[i]] === "undefined") {
        parent[parts[i]] = {};  // create if not exist
      }
      parent = parent[parts[i]];
    }

    return parent;
  }
};

Dash.capitalize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// simple list comprehensions: map() excluding null elements
Dash.grep = function(array, fn) {
  var data = [];
  array.forEach(function(x) {
    var y = fn(x);
    (y === null) || data.push(y);
  });
  return data;
};

// return last [count] element(s) of array as string
// string arg will be split on '.' to help working with metrics
Dash.last = function(array, count) {
  if ( typeof array == 'string' ) {
    array = array.split('.');
  }

  if ( count === undefined ) {
    count = 1;
  }
  
  return array.slice(0 - count).join(' ');
}

// wrapper on jQuery.ajax() that allows proxy
Dash.ajax = function(request, proxy) {
  if ( proxy ) {
    request.type = 'POST';
    request.data = {
      url:     request.url,
      headers: request.headers
    };
    request.url = "/_proxy_/";
  }
  return $.ajax(request);
};

Dash.stats_list = [];
Dash.stats = function() {
  var stats = new Dash.Project();
  this.stats_list.push(stats);
  return stats;
};

Dash.events_list = [];
Dash.events = function() {
  var events = new Dash.Project();
  this.events_list.push(events);
  return events;
};
