
function randomNum () {
  const array = window.crypto.getRandomValues(new Uint32Array(3))

  const avg = eval(array.join('+')) / 3

  return array[0] > avg ? avg / array[0] : array[0] / avg
}

function randomcolor () {
  let e = null
  const t = {}
  r('monochrome', null, [
    [0, 0],
    [100, 0]
  ]),
  r('red', [-26, 18], [
    [20, 100],
    [30, 92],
    [40, 89],
    [50, 85],
    [60, 78],
    [70, 70],
    [80, 60],
    [90, 55],
    [100, 50]
  ]),
  r('orange', [19, 46], [
    [20, 100],
    [30, 93],
    [40, 88],
    [50, 86],
    [60, 85],
    [70, 70],
    [100, 70]
  ]),
  r('yellow', [47, 62], [
    [25, 100],
    [40, 94],
    [50, 89],
    [60, 86],
    [70, 84],
    [80, 82],
    [90, 80],
    [100, 75]
  ]),
  r('green', [63, 178], [
    [30, 100],
    [40, 90],
    [50, 85],
    [60, 81],
    [70, 74],
    [80, 64],
    [90, 50],
    [100, 40]
  ]),
  r('blue', [179, 257], [
    [20, 100],
    [30, 86],
    [40, 80],
    [50, 74],
    [60, 60],
    [70, 52],
    [80, 44],
    [90, 39],
    [100, 35]
  ]),
  r('purple', [258, 282], [
    [20, 100],
    [30, 87],
    [40, 79],
    [50, 70],
    [60, 65],
    [70, 59],
    [80, 52],
    [90, 45],
    [100, 42]
  ]),
  r('pink', [283, 334], [
    [20, 100],
    [30, 90],
    [40, 86],
    [60, 84],
    [80, 80],
    [90, 75],
    [100, 73]
  ])
  var n = function (r) {
    if (void 0 !== (r = r || {}).seed && r.seed !== null && r.seed === parseInt(r.seed, 10)) { e = r.seed } else if (typeof r.seed === 'string') {
      e = (function (e) {
        for (var t = 0, n = 0; n !== e.length && !(t >= Number.MAX_SAFE_INTEGER); n++) { t += e.charCodeAt(n) }
        return t
      }
      (r.seed))
    } else {
      if (void 0 !== r.seed && r.seed !== null) { throw new TypeError('The seed value must be an integer or string') }
      e = null
    }
    let c,
      l
    if (r.count !== null && void 0 !== r.count) {
      const u = r.count
      const d = []
      for (r.count = null; u > d.length;) { e && r.seed && (r.seed += 1), d.push(n(r)) }
      return r.count = u,
      d
    }
    return (function (e, t) {
      switch (t.format) {
        case 'hsvArray':
          return e
        case 'hslArray':
          return a(e)
        case 'hsl':
          var n = a(e)
          return 'hsl(' + n[0] + ', ' + n[1] + '%, ' + n[2] + '%)'
        case 'hsla':
          var s = a(e)
          var o = t.alpha || randomNum()
          return 'hsla(' + s[0] + ', ' + s[1] + '%, ' + s[2] + '%, ' + o + ')'
        case 'rgbArray':
          return i(e)
        case 'rgb':
          return 'rgb(' + i(e).join(', ') + ')'
        case 'rgba':
          var r = i(e)
          o = t.alpha || randomNum()
          return 'rgba(' + r.join(', ') + ', ' + o + ')'
        default:
          return (function (e) {
            const t = i(e)

            function n (e) {
              const t = e.toString(16)
              return t.length == 1 ? '0' + t : t
            }
            return '#' + n(t[0]) + n(t[1]) + n(t[2])
          }
          (e))
      }
    }
    ([c = (function (e) {
      let n = o(function (e) {
        if (typeof parseInt(e) === 'number') {
          const n = parseInt(e)
          if (n < 360 && n > 0) { return [n, n] }
        }
        if (typeof e === 'string') {
          if (t[e]) {
            const s = t[e]
            if (s.hueRange) { return s.hueRange }
          } else if (e.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
            const o = (function (e) {
              e = (e = e.replace(/^#/, '')).length === 3 ? e.replace(/(.)/g, '$1$1') : e
              const t = parseInt(e.substr(0, 2), 16) / 255
              const n = parseInt(e.substr(2, 2), 16) / 255
              const s = parseInt(e.substr(4, 2), 16) / 255
              const o = Math.max(t, n, s)
              const r = o - Math.min(t, n, s)
              const i = o ? r / o : 0
              switch (o) {
                case t:
                  return [(n - s) / r % 6 * 60 || 0, i, o]
                case n:
                  return [60 * ((s - t) / r + 2) || 0, i, o]
                case s:
                  return [60 * ((t - n) / r + 4) || 0, i, o]
              }
            }
            (e))[0]
            return [o, o]
          }
        }
        return [0, 360]
      }
      (e.hue))
      n < 0 && (n = 360 + n)
      return n
    }
    (r)), l = (function (e, t) {
      if (t.hue === 'monochrome') { return 0 }
      if (t.luminosity === 'random') { return o([0, 100]) }
      const n = (function (e) {
        return s(e).saturationRange
      }
      (e))
      let r = n[0]
      let i = n[1]
      switch (t.luminosity) {
        case 'bright':
          r = 55
          break
        case 'dark':
          r = i - 10
          break
        case 'light':
          i = 55
      }
      return o([r, i])
    }
    (c, r)),
    (function (e, t, n) {
      let r = (function (e, t) {
        for (let n = s(e).lowerBounds, o = 0; o < n.length - 1; o++) {
          const r = n[o][0]
          const i = n[o][1]
          const a = n[o + 1][0]
          const c = n[o + 1][1]
          if (t >= r && t <= a) {
            const l = (c - i) / (a - r)
            return l * t + (i - l * r)
          }
        }
        return 0
      }
      (e, t))
      let i = 100
      switch (n.luminosity) {
        case 'dark':
          i = r + 20
          break
        case 'light':
          r = (i + r) / 2
          break
        case 'random':
          r = 0,
          i = 100
      }
      return o([r, i])
    }
    (c, l, r))
    ], r))
  }

  function s (e) {
    for (const n in e >= 334 && e <= 360 && (e -= 360), t) {
      const s = t[n]
      if (s.hueRange && e >= s.hueRange[0] && e <= s.hueRange[1]) { return t[n] }
    }
    return 'Color not found'
  }

  function o (t) {
    if (e === null) { return Math.floor(t[0] + randomNum() * (t[1] + 1 - t[0])) }
    const n = t[1] || 1
    const s = t[0] || 0
    const o = (e = (9301 * e + 49297) % 233280) / 233280
    return Math.floor(s + o * (n - s))
  }

  function r (e, n, s) {
    const o = s[0][0]
    const r = s[s.length - 1][0]
    const i = s[s.length - 1][1]
    const a = s[0][1]
    t[e] = {
      hueRange: n,
      lowerBounds: s,
      saturationRange: [o, r],
      brightnessRange: [i, a]
    }
  }

  function i (e) {
    let t = e[0]
    t === 0 && (t = 1),
    t === 360 && (t = 359),
    t /= 360
    const n = e[1] / 100
    const s = e[2] / 100
    const o = Math.floor(6 * t)
    const r = 6 * t - o
    const i = s * (1 - n)
    const a = s * (1 - r * n)
    const c = s * (1 - (1 - r) * n)
    let l = 256
    let u = 256
    let d = 256
    switch (o) {
      case 0:
        l = s,
        u = c,
        d = i
        break
      case 1:
        l = a,
        u = s,
        d = i
        break
      case 2:
        l = i,
        u = s,
        d = c
        break
      case 3:
        l = i,
        u = a,
        d = s
        break
      case 4:
        l = c,
        u = i,
        d = s
        break
      case 5:
        l = s,
        u = i,
        d = a
    }
    return [Math.floor(255 * l), Math.floor(255 * u), Math.floor(255 * d)]
  }

  function a (e) {
    const t = e[0]
    const n = e[1] / 100
    const s = e[2] / 100
    const o = (2 - n) * s
    return [t, Math.round(n * s / (o < 1 ? o : 2 - o) * 1e4) / 100, o / 2 * 100]
  }
  return n()
}

export {
  randomcolor
}
