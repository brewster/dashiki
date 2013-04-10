Dash.namespace('Source.Logstash');

Dash.Source.Logstash = function(stat) {
  var stub = 'http://logstash:9200';

  var request_data = {          // logstash wants request params as json data
    size: 0,                    // do not want to receive actual log lines
    query: {
      filtered: {
        query: {
          query_string: {
            default_operator: 'AND',
            query: stat.target
          }
        },
        filter: {
          range: {} // @timestamp filled-in by url() below
        }
      }
    },
    facets: {
      count: {
        date_histogram: {
          field: "@timestamp",
          interval: 60000       // FIXME: make dynamic intervals based on period length
        }
      }
    }
  };

  this.url = function(from) {
    var now       = new Date(),
        from_date = (new Date(Dash.Date.toEpoch(from)*1000)).toJSON(), // ISO date
        to_date   = now.toJSON(), // ISO date
        url_date  = to_date.split('T')[0].replace(/-/g, '.'); // yyyy.MM.dd (no sprintf rly?)

    request_data.query.filtered.filter.range['@timestamp'] = {
      from: from_date,
      to:   to_date
    };
    
    // at the moment we just request logstash index with now's date, but FIXME to
    // do multiple requests where range spans midnight (or figure out if the api
    // allows an alternative?)
    return {
      type: 'POST',
      url:  stub + '/logstash-' + url_date + '/_search',
      data: JSON.stringify(request_data),
      dataType: 'json'
    };
  };

  this.link = function(from) {
    return stub;                // FIXME: make a proper logstash link
  };

  return this;
}

Dash.Source.Logstash.prototype = {
  
  toSeries: function(data) {
    return [{
      name: "logstash",
      data: data.facets.count.entries.map(function(point) {
        return { x: Math.floor(point.time/1000), y: point.count };
      })
    }];
  },

  toEvents: function(data) {
    return 0;                   //FIXME: make sparse data
  }
};
