Dash.stats()
  .add(
    {
      title:   'StatsD Number of Stats Tracked',
      target:  'statsd.numStats',
      display: 'last'
    },
    {
      title:   'StatsD Packets Received',
      target:  'stats_counts.statsd.packets_received',
      display: 'mean'
    },
    {
      title:   'StatsD Bad Lines',
      target:  'stats_counts.statsd.bad_lines_seen',
      display: 'sum'
    },
    {
      title:   'Carbon Metrics Received',
      target:  'carbon.agents.*.metricsReceived'
    },
    {
      title:   'Carbon Cache Queues',
      target:  'carbon.agents.*.cache.queues',
      display: 'last'
    },
    {
      title:   'Carbon Cache Overflow',
      target:  'carbon.agents.*.cache.overflow',
      display: 'last'
    },
    {
      title:   'Carbon Cache Errors',
      target:  'carbon.agents.*.errors',
    },
    {
      title:   'Carbon Cache avgUpdateTime',
      target:  'carbon.agents.*.avgUpdateTime',
      display: 'mean'
    }
  );
