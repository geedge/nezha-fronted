export function resetZIndex (e) {
  let popId = e.target.getAttribute('aria-describedby')// 这里获取的属性 在包含slot='reference'
  if (!popId) {
    popId = e.target.parentNode.getAttribute('aria-describedby')
  }
  const pop = document.getElementById(popId)
  setTimeout(function () {
    pop.style.zIndex = 999999
  }, 100)
}
export function getUUID () {
  function S4 () {
    return (((1 + window.crypto.getRandomValues(new Uint32Array(10))[0]) * 0x10000) | 0).toString(16).substring(1)
  }

  return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
}

export const chartCache = {}

export function getChart (key) {
  return chartCache[`chart${key}`]
}

export function setChart (key, value) {
  chartCache[`chart${key}`] && chartCache[`chart${key}`].dispose()
  chartCache[`chart${key}`] = value
}
const hexagonCache = {}
export function getHexagon (key) {
  return hexagonCache[`hexagon${key}`]
}

export let topologyCache = {}

export function getTopology (key) {
  // console.log(topologyCache, 'topologyCache')
  return topologyCache[`topology${key}`]
}

export function setTopology (key, value) {
  topologyCache[`topology${key}`] = value
  if (!value) {
    delete topologyCache[`topology${key}`]
  }
}

export function clearTopologyCache () {
  topologyCache = {}
}
// const topologyImgList = localStorage.getItem('nz-imgList') ? JSON.parse(localStorage.getItem('nz-imgList')) : {}

export function getTopologyImg (key) {
  return false
}

export const topologyImg = {}

export function dealImg (url, id) {
  if (url) {
    return new Promise((resolve, reject) => {
      if (topologyImg['img' + id]) {
        resolve(topologyImg['img' + id])
        return
      }
      vm.$axios
        .get(url)
        .then((res) => {
          const imageInfo = {
            data: ('data:image/jpeg;base64,' + res.data),
            // width: res.headers.width === -1 ? 100 : (res.headers.width > 900 ? 900 : res.headers.width),
            // height: res.headers.height === -1 ? 100 : (res.headers.height > 900 ? 900 : res.headers.height)
            width: res.headers.width === -1 ? 100 : Number(res.headers.width),
            height: res.headers.height === -1 ? 100 : Number(res.headers.height)
          }
          if (imageInfo.width > 900 || imageInfo.height > 900) {
            if (imageInfo.height > imageInfo.width) {
              imageInfo.width = imageInfo.width * 900 / imageInfo.height
              imageInfo.height = 900
            } else if (imageInfo.height < imageInfo.width) {
              imageInfo.height = imageInfo.height * 900 / imageInfo.width
              imageInfo.width = 900
            } else {
              imageInfo.height = 900
              imageInfo.width = 900
            }
          }
          topologyImg['img' + id] = imageInfo
          resolve(topologyImg['img' + id])
        })
    })
  } else {
    return new Promise(resolve => {
      resolve({})
    })
  }
}

export function setTopologyImg (key, img) {
  // localStorage.setItem('nz-topologyImg-' + key, img)
}

export function setHexagon (key, value) {
  hexagonCache[`hexagon${key}`] = value
}
export function delHexagon (key) {
  delete hexagonCache[`hexagon${key}`]
}
const mousePoint = { // 在echart tooltip中获取不到鼠标在窗口的位置，在火狐没有window。event 在此兼容火狐 获取鼠标在窗口位置
  x: '',
  y: ''
}

export function lineChartMove (e) {
  const event = e || window.event
  mousePoint.x = event.pageX
  mousePoint.y = event.pageY
}

export function getMousePoint () {
  return mousePoint
}
export const coordinatePoint = {
  Libra: {
    name: 'Libra',
    offsetX: '6.5%',
    offsetY: '15.6%',
    point: [
      { x: 10, y: 70 },
      { x: 45, y: 55 },
      { x: 70, y: 10 },
      { x: 110, y: 50 },
      { x: 100, y: 110 },
      { x: 60, y: 130 },
      { x: 58, y: 150 },
      { x: 60, y: 130 },
      { x: 100, y: 110 },
      { x: 70, y: 10 }
    ],
    dot: [
      [[10, 70], [45, 55]],
      [[45, 55], [70, 10]],
      [[100, 110], [70, 10]]
    ]
  },
  Cancer: {
    name: 'Cancer',
    offsetX: '20%',
    offsetY: '12.4%',
    point: [
      { x: 65, y: 130 },
      { x: 60, y: 70 },
      { x: 145, y: 100 },
      { x: 60, y: 70 },
      // { x: 45, y: 50 },
      { x: 10, y: 10 }],
    dot: [
      [[60, 70], [145, 100]]
    ]
  },
  Taurus: {
    name: 'Taurus',
    offsetX: '34.9%',
    offsetY: '6.5%',
    point: [
      { x: 200, y: 240 },
      // { x: 198, y: 225 },
      { x: 140, y: 190, disabled: true },
      { x: 110, y: 145 },
      // { x: 95, y: 135 },
      { x: 83, y: 130, disabled: true },
      { x: 10, y: 55 },
      { x: 83, y: 130, disabled: true },
      // { x: 95, y: 135 },
      { x: 110, y: 145 },
      // { x: 115, y: 125 },
      // { x: 105, y: 120 },
      // { x: 105, y: 105 },
      { x: 90, y: 70 },
      { x: 50, y: 10 }],
    dot: [
      [[110, 145], [83, 130]],
      [[83, 130], [10, 55]]
    ]
  },
  Gemini: {
    name: 'Gemini',
    offsetX: '53%',
    offsetY: '5.1%',
    point: [
      { x: 175, y: 180 },
      { x: 185, y: 140, disabled: true },
      { x: 65, y: 100 },
      { x: 15, y: 80 },
      { x: 10, y: 55 },
      { x: 30, y: 10 },
      // { x: 45, y: 10 , disabled: true},
      { x: 70, y: 15 },
      { x: 165, y: 55 },
      { x: 205, y: 65 },
      { x: 225, y: 60 },
      { x: 205, y: 65 },
      { x: 185, y: 140, disabled: true }],
    dot: [
      [[205, 65], [185, 140]]
    ]
  },
  Gapricorn: {
    name: 'Gapricorn',
    offsetX: '73.4%',
    offsetY: '12.5%',
    point: [
      { x: 10, y: 180 },
      // { x: 15, y: 160 },
      { x: 30, y: 140 },
      { x: 50, y: 110 },
      { x: 80, y: 10 },
      { x: 130, y: 110 },
      { x: 135, y: 130 },
      { x: 110, y: 140 },
      { x: 70, y: 165 },
      { x: 35, y: 170 },
      { x: 10, y: 180 }]
  },
  Leo: {
    name: 'Leo',
    offsetX: '86.6%',
    offsetY: '31.5%',
    point: [
      { x: 80, y: 10 },
      { x: 60, y: 15 },
      { x: 55, y: 60 },
      { x: 70, y: 80 },
      { x: 100, y: 75 },
      { x: 130, y: 95 },
      { x: 40, y: 195 },
      { x: 10, y: 245 },
      { x: 10, y: 160 },
      { x: 70, y: 80 }],
    dot: [
      [[80, 10], [60, 15]],
      [[60, 15], [55, 60]],
      [[55, 60], [70, 80]]
    ],
    dasharray: '4 10'
  },
  Aries: {
    name: 'Aries',
    offsetX: '89%',
    offsetY: '57.8%',
    point: [
      { x: 10, y: 10 },
      { x: 130, y: 40 },
      { x: 180, y: 70 },
      { x: 190, y: 90 }]
  },
  Pisces: {
    name: 'Pisces',
    offsetX: '79.6%',
    offsetY: '71.4%',
    point: [
      { x: 10, y: 275 },
      { x: 30, y: 295 },
      { x: 50, y: 270 },
      { x: 110, y: 270 },
      { x: 150, y: 270 },
      { x: 200, y: 285 },
      { x: 160, y: 235 },
      { x: 130, y: 205 },
      { x: 115, y: 175 },
      { x: 90, y: 105 },
      { x: 80, y: 75 },
      { x: 65, y: 55 },
      { x: 70, y: 25 },
      { x: 90, y: 10 },
      { x: 120, y: 30 },
      { x: 125, y: 55 },
      { x: 110, y: 80 },
      { x: 80, y: 75 }],
    dot: [
      [[10, 275], [30, 295]],
      [[30, 295], [50, 270]],
      [[50, 270], [110, 270]],
      [[110, 270], [150, 270]],
      [[150, 270], [200, 285]]
    ]
  },
  Sagittarius: {
    name: 'Sagittarius',
    offsetX: '61.8%',
    offsetY: '82.9%',
    point: [
      { x: 90, y: 185 },
      { x: 60, y: 205 },
      { x: 95, y: 215 },
      { x: 60, y: 205 },
      { x: 35, y: 165 },
      { x: 10, y: 115 },
      { x: 15, y: 100, disabled: true },
      { x: 45, y: 65 },
      { x: 95, y: 85 },
      { x: 120, y: 70 },
      { x: 100, y: 35 },
      { x: 85, y: 30, disabled: true },
      { x: 55, y: 10 },
      { x: 85, y: 30, disabled: true },
      { x: 100, y: 35 },
      { x: 115, y: 20 },
      { x: 100, y: 35 },
      { x: 120, y: 70 },
      { x: 135, y: 75 },
      { x: 135, y: 75 },
      { x: 170, y: 65 },
      { x: 185, y: 15 },
      { x: 170, y: 65 },
      { x: 180, y: 95 },
      { x: 210, y: 105 },
      { x: 215, y: 95, disabled: true },
      { x: 255, y: 65 },
      { x: 215, y: 95, disabled: true },
      { x: 210, y: 105 },
      { x: 180, y: 95 },
      { x: 180, y: 125 },
      { x: 195, y: 145 },
      { x: 180, y: 125 },
      { x: 180, y: 95 },
      { x: 170, y: 65 },
      { x: 135, y: 75 },
      { x: 110, y: 105 },
      { x: 95, y: 85 }],
    dot: [
      [[110, 105], [135, 75]],
      [[135, 75], [170, 65]],
      [[170, 65], [185, 15]],
      [[170, 65], [180, 95]],
      [[180, 95], [210, 105]],
      [[210, 105], [215, 95]],
      [[255, 65], [215, 95]]
    ]
  },
  Virgo: {
    name: 'Virgo',
    offsetX: '37.1%',
    offsetY: '81.2%',
    point: [
      { x: 110, y: 10 },
      { x: 115, y: 50 },
      { x: 105, y: 80 },
      { x: 70, y: 90 },
      { x: 20, y: 80 },
      { x: 70, y: 90 },
      { x: 75, y: 150 },
      { x: 40, y: 180 },
      { x: 10, y: 240 },
      { x: 40, y: 180 },
      { x: 75, y: 150 },
      { x: 130, y: 170 },
      { x: 110, y: 220 },
      { x: 90, y: 215 },
      { x: 75, y: 265 },
      { x: 90, y: 215 },
      { x: 110, y: 220 },
      { x: 130, y: 170 },
      { x: 110, y: 135 },
      { x: 105, y: 80 }],
    dot: [
      [[130, 170], [110, 220]],
      [[110, 220], [90, 215]],
      [[90, 215], [75, 265]]
    ]
  },
  Scorpio: {
    name: 'Scorpio',
    offsetX: '17.2%',
    offsetY: '77.5%',
    point: [
      { x: 40, y: 130 },
      { x: 20, y: 150, disabled: true },
      { x: 10, y: 160 },
      { x: 30, y: 180 },
      { x: 70, y: 185 },
      { x: 100, y: 175 },
      { x: 110, y: 150 },
      { x: 120, y: 120 },
      { x: 160, y: 70 },
      { x: 170, y: 60, disabled: true },
      { x: 190, y: 50 },
      { x: 230, y: 30 },
      { x: 220, y: 10 },
      { x: 230, y: 30 },
      { x: 235, y: 50 },
      { x: 235, y: 70 }]
  },
  Aquarius: {
    name: 'Aquarius',
    offsetX: '12%',
    offsetY: '47.5%',
    point: [
      { x: 160, y: 260 },
      { x: 120, y: 230, disabled: true },
      { x: 110, y: 220 },
      { x: 70, y: 225 },
      { x: 65, y: 260 },
      { x: 10, y: 180 },
      { x: 15, y: 165 },
      { x: 30, y: 150 },
      { x: 25, y: 120 },
      { x: 80, y: 140 },
      { x: 130, y: 130 },
      { x: 80, y: 140 },
      { x: 25, y: 120 },
      { x: 90, y: 70 },
      { x: 160, y: 10 }],
    dot: [
      [[25, 120], [80, 140]],
      [[80, 140], [130, 130]]
    ]
  }
}
