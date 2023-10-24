const logqlHint = {
  functions: [{
    label: 'rate',
    detail: 'functions',
    info: 'Calculates the number of entries per second.',
    type: 'functions'
  }, {
    label: 'count_over_time',
    detail: 'functions',
    info: 'Counts the entries for each log stream within the given range.',
    type: 'functions'
  }, {
    label: 'bytes_rate',
    detail: 'functions',
    info: 'Calculates the number of bytes per second for each stream.',
    type: 'functions'
  }, {
    label: 'bytes_over_time',
    detail: 'functions',
    info: 'counts the amount of bytes used by each log stream for a given range.',
    type: 'functions'
  }, {
    label: 'absent_over_time',
    detail: 'functions',
    info: 'returns an empty vector if the range vector passed to it has any elements and a 1-element vector with the value 1 if the range vector passed to it has no elements. (absent_over_time is useful for alerting on when no time series and logs stream exist for label combination for a certain amount of time.)',
    type: 'functions'
  }
  ],
  aggregateOp: [{
    label: 'duration_seconds',
    detail: 'aggregation',
    info: 'which will convert the label value in seconds from the go duration format (e.g 5m, 24s30ms).',
    type: 'keyword'
  }, {
    label: 'duration',
    detail: 'aggregation',
    info: 'which will convert the label value in seconds from the go duration format (e.g 5m, 24s30ms).',
    type: 'keyword'
  }, {
    label: 'bytes',
    detail: 'aggregation',
    info: 'which will convert the label value to raw bytes applying the bytes unit (e.g. 5 MiB, 3k, 1G).',
    type: 'keyword'
  }, {
    label: 'rate',
    detail: 'aggregation',
    info: 'calculates per second rate of the sum of all values in the specified interval.',
    type: 'keyword'
  }, {
    label: 'rate_counter',
    detail: 'aggregation',
    info: 'calculates per second rate of the values in the specified interval and treating them as “counter metric”.',
    type: 'keyword'
  }, {
    label: 'sum_over_time',
    detail: 'aggregation',
    info: 'the sum of all values in the specified interval.',
    type: 'keyword'
  }, {
    label: 'avg_over_time',
    detail: 'aggregation',
    info: 'the average value of all points in the specified interval.',
    type: 'keyword'
  }, {
    label: 'max_over_time',
    detail: 'aggregation',
    info: 'the maximum value of all points in the specified interval.',
    type: 'keyword'
  }, {
    label: 'min_over_time',
    detail: 'aggregation',
    info: 'the minimum value of all points in the specified interval.',
    type: 'keyword'
  }, {
    label: 'min_over_time',
    detail: 'aggregation',
    info: 'the minimum value of all points in the specified interval.',
    type: 'keyword'
  }, {
    label: 'first_over_time',
    detail: 'aggregation',
    info: 'the first value of all points in the specified interval.',
    type: 'keyword'
  }, {
    label: 'last_over_time',
    detail: 'aggregation',
    info: 'the last value of all points in the specified interval.',
    type: 'keyword'
  }, {
    label: 'stdvar_over_time',
    detail: 'aggregation',
    info: 'the population standard variance of the values in the specified interval.',
    type: 'keyword'
  }, {
    label: 'stddev_over_time',
    detail: 'aggregation',
    info: 'the population standard deviation of the values in the specified interval.',
    type: 'keyword'
  }, {
    label: 'quantile_over_time',
    detail: 'aggregation',
    info: 'the φ-quantile (0 ≤ φ ≤ 1) of the values in the specified interval.',
    type: 'keyword'
  }, {
    label: 'absent_over_time',
    detail: 'aggregation',
    info: 'returns an empty vector if the range vector passed to it has any elements and a 1-element vector with the value 1 if the range vector passed to it has no elements. (absent_over_time is useful for alerting on when no time series and logs stream exist for label combination for a certain amount of time.)',
    type: 'keyword'
  },
  {
    label: 'sum',
    detail: 'aggregation',
    info: 'Calculate sum over labels',
    type: 'keyword'
  },
  {
    label: 'avg',
    detail: 'aggregation',
    info: 'Calculate the average over labels',
    type: 'keyword'
  },
  {
    label: 'min',
    detail: 'aggregation',
    info: 'Select minimum over labels',
    type: 'keyword'
  },
  {
    label: 'max',
    detail: 'aggregation',
    info: 'Select maximum over labels',
    type: 'keyword'
  },
  {
    label: 'stddev',
    detail: 'aggregation',
    info: 'Calculate the population standard deviation over labels',
    type: 'keyword'
  },
  {
    label: 'stdvar',
    detail: 'aggregation',
    info: 'Calculate the population standard variance over labels',
    type: 'keyword'
  },
  {
    label: 'count',
    detail: 'aggregation',
    info: 'Count number of elements in the vector',
    type: 'keyword'
  },
  {
    label: 'topk',
    detail: 'aggregation',
    info: 'Select largest k elements by sample value',
    type: 'keyword'
  },
  {
    label: 'bottomk',
    detail: 'aggregation',
    info: 'Select smallest k elements by sample value',
    type: 'keyword'
  },
  {
    label: 'sort',
    detail: 'aggregation',
    info: 'returns vector elements sorted by their sample values, in ascending order.',
    type: 'keyword'
  },
  {
    label: 'sort_desc',
    detail: 'aggregation',
    info: 'Same as sort, but sorts in descending order.',
    type: 'keyword'
  }
  ]
}
export default logqlHint
