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
