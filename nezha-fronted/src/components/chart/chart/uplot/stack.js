import uPlot from 'uplot'
function stack (data, omit) {
  const data2 = []
  let bands = []
  const d0Len = data[0].length
  const accum = Array(d0Len)

  for (let i = 0; i < d0Len; i++) { accum[i] = 0 }

  for (let i = 1; i < data.length; i++) {
    data2.push(data[i].map((v, i) => {
      if (typeof (v) === 'undefined') {
        return accum[i]
      }
      if (isNaN(v)) {
        return accum[i]
      }
      return (accum[i] += +v)
    }))
  }

  for (let i = 1; i < data.length; i++) {
    !omit(i) && bands.push({
      dir: -1,
      series: [
        data.findIndex((s, j) => j > i && !omit(j)),
        i
      ]
    })
  }

  bands = bands.filter(b => b.series[1] > -1)
  bands = bands.filter(b => b.series[0] > -1)
  bands = bands.reverse()
  return {
    data: [data[0]].concat(data2),
    // bands
  }
}

export default function getStackedOpts (title, opt, data, interp) {
  const opts = opt
  const interped = interp ? interp(data) : data

  const stacked = stack(interped, i => false)
  // opts.bands = stacked.bands

  opts.cursor = opts.cursor || {}

  opts.series.forEach(s => {
    s.value = (u, v, si, i) => data[si][i]
  })
  // restack on toggle

  return { opts, data: stacked.data }
}
