<template>
  <div class="overview">
    <div class="content-col-content" style="padding:0">
      <div :id="'map' + (isFullscreen ? '-screen-' : '' ) + chartInfo.id " style="height: 100%; width: 100%" :style="theme=='dark'? 'filter: invert(1) hue-rotate(0.5turn);opacity: 0.75;': ''"></div>
    </div>
    <!--自定义地图鼠标悬浮提示dom，避免被overflow：hidden裁剪-->
    <div :style="{'left': `${tooltip.x}px`, 'top': `${tooltip.y}px`}" class="my-pane" :class="'my-pane-' + chartId"></div>
  </div>
</template>

<script>
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import * as L from 'leaflet'
import axios from 'axios'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import maplibregl from 'maplibre-gl'
import mapStyle from './mapStyle'
const regNum = /^[0-9]+.?[0-9]*/
export default {
  name: 'chartMap',
  mixins: [chartMixin, chartFormat],
  data () {
    return {
      map: null,
      tooltip: {
        x: 0,
        y: 0
      },
      theme: localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`),
      timer: null
    }
  },
  mounted () {
    this.chartInfo.loaded && this.initChart()
  },
  methods: {
    initChart () {
      this.initMap()
    },
    initMap () {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        let loadPromise
        this.loadMapConfig().then((mapConfig) => {
          // if (mapConfig && this.map) {
          //   loadPromise = this.loadDataCenterMapData()
          // }
        })
        this.isInit = false
        return loadPromise
      }, 500)
    },
    loadMapConfig () {
      return new Promise(resolve => {
        const DefaultIcon = L.icon({
          iconUrl: icon,
          shadowUrl: iconShadow
        })
        L.Marker.prototype.options.icon = DefaultIcon
        const param = { paramKey: 'map_center_config' }
        this.$get('sysConfig', param).then(response => {
          if (response.code == 200) {
            const mapConfig = JSON.parse(response.data.paramKey.map_center_config)
            mapStyle.center = [Number(mapConfig.longitude), Number(mapConfig.latitude)]
            if (this.map) {
              this.map.remove()
              this.map = null
            }
            const mapId = this.isFullscreen ? document.getElementById('map-screen-' + this.chartInfo.id) : document.getElementById('map' + this.chartInfo.id)
            this.map = new maplibregl.Map({
              container: mapId,
              style: mapStyle,
              maxZoom: 7,
              minZoom: 0,
              renderWorldCopies: false,
              hash: false,
              transformRequest: function (url, resourceType) {
                console.log(url, resourceType)
                if (resourceType === 'Tile' && url.indexOf('https://api.maptiler.com/tiles/v3') > -1) {
                  const urlParams = url.split('.pbf')[0].split('/')
                  const z = urlParams[urlParams.length - 3]
                  const x = urlParams[urlParams.length - 2]
                  const y = urlParams[urlParams.length - 1]
                  const newUrl1 = `nzMap://static/maplibreTitles/${z}/${x}/${y}.pbf`
                  return {
                    url: newUrl1,
                    credentials: 'include',
                    method: 'GET'
                    // Include cookies for cross-origin requests
                  }
                }
              }
            })
            maplibregl.addProtocol('nzMap', (params, callback) => { // 切片显示接口 防止跨域的问题
              fetch(`${params.url.split('://')[1]}`)
                .then(t => {
                  if (t.status == 200) {
                    t.arrayBuffer().then(arr => {
                      callback(null, arr, null, null)
                    })
                  } else {
                    callback(new Error(`Tile fetch error: ${t.statusText}`))
                  }
                })
                .catch(e => {
                  callback(new Error(e))
                })
              return { cancel: () => { } }
            })
            resolve(mapConfig)
          }
        })
      })
    },
    loadDataCenterMapData () {
      return new Promise(resolve => {
        const requests = [axios.get('dc?pageSize=-1'), axios.get('/stat/overview/map')]
        axios.all(requests).then(result => {
          const dcInfos = result[0].data.data.list
          const dcStats = result[1].data.data.list.filter(dc => dc.asset)
          dcStats.sort((a, b) => {
            return a.asset.total - b.asset.total
          })
          dcStats.forEach(s => {
            const dc = dcInfos.find(i => i.name === s.name)
            dc && (s = { ...s, latitude: dc.latitude, longitude: dc.longitude })
          })
          const bigScatter = 10
          const mediumScatter = 8
          const smallScatter = 6
          const maxAssetTotal = dcInfos[0] ? dcInfos[0].assetNum : '' // 获取asset数量最大值
          const bigBoundary = Number.parseInt(maxAssetTotal / 3 * 2) // 根据最大值定下大图标、中图标的阈值
          const mediumBoundary = Number.parseInt(maxAssetTotal / 3)
          dcStats.forEach(dcStat => {
            if (regNum.test(dcStat.latitude) && regNum.test(dcStat.longitude)) {
              let symbolSize
              if (dcStat.asset.total >= bigBoundary) {
                symbolSize = bigScatter
              } else if (dcStat.asset.total < bigBoundary && dcStat.asset.total >= mediumBoundary) {
                symbolSize = mediumScatter
              } else {
                symbolSize = smallScatter
              }
              let shadowMarker
              let marker
              if (dcStat.color === 1) {
                shadowMarker = L.circleMarker([dcStat.latitude, dcStat.longitude], { opacity: 0, fillOpacity: 0, radius: symbolSize + 10 })
                marker = L.circleMarker([dcStat.latitude, dcStat.longitude], { interactive: false, color: '#23BF9A', opacity: 0.42, fillColor: '#23BF9A', fillOpacity: 0.5, radius: symbolSize, className: 'real-marker' })
              } else if (dcStat.color === 2) {
                shadowMarker = L.circleMarker([dcStat.latitude, dcStat.longitude], { opacity: 0, fillOpacity: 0, radius: symbolSize + 10 })
                marker = L.circleMarker([dcStat.latitude, dcStat.longitude], { interactive: false, color: '#EC7F66', opacity: 0.42, fillColor: '#EC7F66', fillOpacity: 0.5, radius: symbolSize, className: 'real-marker error-item' })
              } else if (dcStat.color === 3) {
                shadowMarker = L.circleMarker([dcStat.latitude, dcStat.longitude], { opacity: 0, fillOpacity: 0, radius: symbolSize + 10 })
                marker = L.circleMarker([dcStat.latitude, dcStat.longitude], { interactive: false, color: '#9e9c98', opacity: 0.42, fillColor: '#9e9c98', fillOpacity: 0.5, radius: symbolSize, className: 'real-marker' })
              }
              shadowMarker.bindTooltip(this.mapTooltipFormatter(dcStat), { sticky: false, pane: 'myPane', direction: 'left', data: dcStat })
              shadowMarker.on('mouseover', (param) => {
                const point = param.containerPoint
                const event = param.originalEvent
                const boxWidth = window.innerWidth / 2
                this.tooltip.x = event.clientX + point.x - event.layerX - 5
                this.tooltip.y = event.clientY + point.y - event.layerY
                if (boxWidth > this.tooltip.x) {
                  this.tooltip.x = this.tooltip.x + 175 + 10
                }
              })
              shadowMarker.addTo(this.map)
              marker.addTo(this.map)
            }
          })
        })
      })
    },
    mapTooltipFormatter (dcStat) {
      const self = this
      return `<div class="nz-tooltip-bac tooltip-map" style="z-index: 11111;width: 175px">
          <div class="tooltip--title">${dcStat.name}</div>
          <div class="tooltip--row">
            <div class="legend-value legend-value-asset">
             <div class="map-asset">
                <div class="progress-title">${self.$t('panel.assetOk')}</div>
                <div class="success-progress progress-box">
                    <div class="top-progress" style="width: ${(dcStat.asset.ok / dcStat.asset.total) * 100}%"></div>
                    <div style="width: 100%" class="bottom-progress"></div>
                </div>
                <div class="success-progress progress-content">${dcStat.asset.ok}</div>
              </div>
             <div class="map-asset">
                <div class="progress-title">${self.$t('panel.assetAlarm')}</div>
                <div class="error-progress progress-box">
                    <div class="top-progress" style="width: ${(dcStat.asset.alarm / dcStat.asset.total) * 100}%"></div>
                    <div style="width: 100%" class="bottom-progress"></div>
                </div>
                <div class="error-progress progress-content">${dcStat.asset.alarm}</div>
              </div>
            </div>
            <div class="partition"></div>
            <div class="legend-value legend-value-agent">
            <div class="map-asset">
                <div class="progress-title">${self.$t('overall.agent')} ${self.$t('config.agent.up')}</div>
                <div class="success-progress progress-box">
                    <div class="top-progress" style="width: ${(dcStat.agent.up / (dcStat.agent.up + dcStat.agent.down)) * 100}%"></div>
                    <div style="width: 100%" class="bottom-progress"></div>
                </div>
                <div class="success-progress progress-content">${dcStat.agent.up}</div>
             </div>
             <div class="map-asset">
                <div class="progress-title">${self.$t('overall.agent')} ${self.$t('asset.down')}</div>
                <div class="error-progress progress-box">
                    <div class="top-progress" style="width: ${(dcStat.agent.down / (dcStat.agent.up + dcStat.agent.down)) * 100}%"></div>
                    <div style="width: 100%" class="bottom-progress"></div>
                </div>
                <div class="error-progress progress-content">${dcStat.agent.down}</div>
             </div>
            </div>
          </div>
        </div>`

      // return tooltip;
    },
    resize () {
      this.initMap()
    }
  },
  beforeDestroy () {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.map && this.map.remove()
    this.map = null
  }
}
</script>

<style scoped>

</style>
