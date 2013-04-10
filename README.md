# Dashiki

What does it do?

* allows you to build dashboards that surface data from graphite,
  ganglia and other sources of time series data.

## How do I run it?

    symlink your config directory (for example: cd dashboard && ln -s cfg-examples cfg)
    ruby ./server.rb, or set it up like any Sinatra app with Phusion Passenger

## Configuration

* configuration files should like under cfg/. See examples in cfg-examples

### Simple configuration

Configuration files are javascript files, organized in directory trees
under `cfg/`. Files starting with underscore are ignored (use this for
defaults and events configurations to be loaded explicitly).

The default data source is a graphite server reachable at
`http://graphite/`, so to add a project with two graphite metrics:

```javascript
Dash.stats()
  .add(
    {
      title:   'Current Foo Bar',
      target:  'stats_counts.production.foo.bar',
      display: 'last'
    },
    {
      title:   'Mean Barf Count',
      target:  'stats_counts.production.barf.count',
      display: 'mean'
    }
  )
```

### Alternative data sources

See `public/Dash.Source.*.js`. To use an alternative data source,
such as ganglia:

```javascript
Dash.stats()
  .add({
    title:     'Web server Current CPU',
    type:      'ganglia',
    source:    'http://ganglia-01',
    graph:     'cpu_report',
    cluster:   'WebServers',
    aggregate: 'sum',
    format:    function(x) { return x.toFixed(0) + '%' },
    display:   'last'
   })
```

Note the format function, which takes the display value and can
return a string to display in its place (in this case set precision
and append percent sign). The default format function is the supplied
Dash.Format.Metric, which converts e.g. '1000' to '1K', etc. See
`public/Dash.Format.js` for some more useful format functions.

A consistent config can be applied to multiple stats as follows:

```javascript
Dash.stats()
  .config(
    {
      type:      'ganglia',
      source:    'http://ganglia-01',
      aggregate: 'sum',
      format:    function(x) { return x.toFixed(0) + '%' },
      display:   'last'
    }
  )
  .add(
    {
      title:     'Web server Current CPU',
      graph:     'cpu_report',
      cluster:   'WebServers'
    },
    {
      title:     Database Current CPU',
      graph:     'cpu_report',
      cluster:   'DbServers'
    }
  )
```

### Thresholds

Thresholds work in a similar fashion to format functions: they take
the display value and if function returns true, apply the given
class(es) to the display box.

```javascript
Dash.stats()
  .add({
    title:  'Volume',
    target: 'stats.gauges.amp.volume',
    display: 'last',
    thresholds: [
      { class: 'green',     test: function(x) { return x<8 } },
      { class: 'red',       test: function(x) { return x>=8 && x<=10 } },
      { class: 'spinaltap', test: function(x) { return x==11 } }
    ]
  })
```

### Dynamically finding metrics

For graphite it is possible to configure stats dynamically using a
wildcard metric:

```javascript
Dash.stats()
  .find({
    target: 'stats.gauges.amp.*',
    done: function(metrics) {
      metrics.forEach(function(metric) {
        var control = metric.split('.').slice(-1).join();
        this.add({
          title:   Dash.capitalize(control),
          target:  metric,
          display: 'last',
        });
      }, this);
    }
  })
```

There are convenience callbacks that may be used as alternatives to `done`:
`each: function(metric) {...}` puts an implicit loop over metrics, and
`add: function(metric) {...}` is `each` with an implicit `this.add` on
the object returned.

### Proxy

Say your browser can't reach a given data source with an XHR, because
of firewall restrictions or same-origin policy (which you are unable
to configure around on the source for some reason). Set 
```proxy: true``` for the given stat and dashboard will route the
request through a simple GET proxy on the dashboard server.

## License

Dashboard is distributed under the MIT license. See the attached LICENSE
file for all the sordid details.
