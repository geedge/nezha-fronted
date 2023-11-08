import uPlot from 'uplot'
function stack (data, omit) {
  const data2 = []
  let bands = []
  const d0Len = data[0].length
  const accum = Array(d0Len)

  for (let i = 0; i < d0Len; i++) { accum[i] = 0 }

  for (let i = 1; i < data.length; i++) { data2.push(omit(i) ? data[i] : data[i].map((v, i) => (accum[i] += +v))) }

  for (let i = 1; i < data.length; i++) {
    !omit(i) && bands.push({
      series: [
        data.findIndex((s, j) => j > i && !omit(j)),
        i
      ]
    })
  }

  bands = bands.filter(b => b.series[1] > -1)

  return {
    data: [data[0]].concat(data2),
    bands
  }
}

export default function getStackedOpts (title, opt, data, interp) {
  const opts = opt
  const interped = interp ? interp(data) : data

  const stacked = stack(interped, i => false)
  opts.bands = stacked.bands

  opts.cursor = opts.cursor || {}
  opts.cursor.dataIdx = (u, seriesIdx, closestIdx, xValue) => {
    return data[seriesIdx][closestIdx] == null ? null : closestIdx
  }

  opts.series.forEach(s => {
    s.value = (u, v, si, i) => data[si][i]

    s.points = s.points || {}

    // scan raw unstacked data to return only real points
    s.points.filter = (u, seriesIdx, show, gaps) => {
      if (show) {
        const pts = []
        data[seriesIdx].forEach((v, i) => {
          v != null && pts.push(i)
        })
        return pts
      }
    }
  })
  // restack on toggle
  opts.hooks = {
    setSeries: [
      (u, i) => {
        const stacked = stack(data, i => !u.series[i].show)
        u.delBand(null)
        stacked.bands.forEach(b => u.addBand(b))
        u.setData(stacked.data)
      }
    ]
  }

  return { opts, data: stacked.data }
}
