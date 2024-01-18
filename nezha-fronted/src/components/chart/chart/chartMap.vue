<template>
  <div class="overview" >
    <div class="content-col-content" style="padding:0">
      <div :id="'map' + (isFullscreen ? '-screen-' : '' ) + chartInfo.id " style="height: 100%; width: 100%"></div>
    </div>
    <!--自定义地图鼠标悬浮提示dom，避免被overflow：hidden裁剪-->
    <div :style="{'left': `${tooltip.x}px`, 'top': `${tooltip.y}px`}" class="my-pane" :class="'my-pane-' + chartId" v-if="tooltip.show">
      <div class="leaflet-pane leaflet-my-pane">
        <div class="leaflet-tooltip leaflet-zoom-animated leaflet-tooltip-left" style="opacity: 0.9; transform: translate3d(251px, 196px, 0px);">
          <div class="nz-tooltip-bac tooltip-map" style="z-index: 11111;width: 175px">
            <div class="tooltip--title">{{dcStat.name}}</div>
            <div class="tooltip--row">
              <div class="legend-value legend-value-asset">
                <div class="map-asset">
                  <div class="progress-title">{{$t('dashboard.assetOk')}}</div>
                  <div class="success-progress progress-box">
                    <div class="top-progress" :style="{width: (dcStat.asset.ok / dcStat.asset.total) * 100 + '%' }"></div>
                    <div style="width: 100%" class="bottom-progress"></div>
                  </div>
                  <div class="success-progress progress-content">{{dcStat.asset.ok}}</div>
                </div>
                <div class="map-asset">
                  <div class="progress-title">{{$t('dashboard.assetAlarm')}}</div>
                  <div class="error-progress progress-box">
                    <div class="top-progress" :style="{width: (dcStat.asset.alarm / dcStat.asset.total) * 100 + '%'}"></div>
                    <div style="width: 100%" class="bottom-progress"></div>
                  </div>
                  <div class="error-progress progress-content">{{dcStat.asset.alarm}}</div>
                </div>
              </div>
              <div class="partition"></div>
              <div class="legend-value legend-value-agent">
                <div class="map-asset">
                  <div class="progress-title">{{$t('overall.agent')}} {{$t('config.agent.up')}}</div>
                  <div class="success-progress progress-box">
                    <div class="top-progress" :style="{width: (dcStat.agent.up / (dcStat.agent.up + dcStat.agent.down)) * 100 + '%'}"></div>
                    <div style="width: 100%" class="bottom-progress"></div>
                  </div>
                  <div class="success-progress progress-content">{{dcStat.agent.up}}</div>
                </div>
                <div class="map-asset">
                  <div class="progress-title">{{$t('overall.agent')}} {{$t('asset.down')}}</div>
                  <div class="error-progress progress-box">
                    <div class="top-progress" :style="{width: (dcStat.agent.down / (dcStat.agent.up + dcStat.agent.down)) * 100 + '%'}"></div>
                    <div style="width: 100%" class="bottom-progress"></div>
                  </div>
                  <div class="error-progress progress-content">{{dcStat.agent.down}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import chartMixin from '@/components/chart/chartMixin'
import chartFormat from '@/components/chart/chartFormat'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'
import maplibregl from 'maplibre-gl'
import mapAllStyle from './mapStyle'
import { getChart, setChart, chartCache } from '@/components/common/js/common'
const regNum = /^[0-9]+.?[0-9]*/
export default {
  name: 'chartMap',
  mixins: [chartMixin, chartFormat],
  data () {
    const theme = localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`) || 'light'
    return {
      mapId: null,
      tooltip: {
        x: 0,
        y: 0,
        show: false
      },
      dcStat: {},
      theme,
      timer: null,
      requestAnimationFrame: '',
      pbfUrl: {
        m: [],
        c: []
      }
    }
  },
  mounted () {
    this.chartInfo.loaded && this.initChart()
    // 监听header改变主题
    bus.$on('headerThemeChange', this.themeChange)
  },
  methods: {
    themeChange (theme) {
      this.theme = theme
      this.resize()
    },
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

        })
        this.isInit = false
        return loadPromise
      }, 500)
    },
    loadMapConfig () {
      const self = this
      return new Promise(resolve => {
        this.$get('/sys/config/key/map_center_config').then(response => {
          if (response.code == 200) {
            const mapStyle = mapAllStyle[this.theme]
            const mapConfig = JSON.parse(response.data.paramValue)
            mapStyle.center = [Number(mapConfig.longitude), Number(mapConfig.latitude)]
            mapStyle.zoom = Number(mapConfig.zoom)
            const mapId = this.mapId = this.isFullscreen ? ('map-screen-' + this.chartInfo.id) : ('map' + this.chartInfo.id)
            let map = getChart(mapId) || null
            if (map) {
              map.remove()
              map = null
              setChart(this.mapId, map)
            }
            map = new maplibregl.Map({
              container: mapId,
              style: mapStyle,
              maxZoom: mapConfig.maxZoom || 7,
              minZoom: mapConfig.minZoom || 1,
              renderWorldCopies: false,
              maxBounds: [[-179, -85], [179, 85]],
              hash: false,
              transformRequest: function (url, resourceType) {
                if (resourceType === 'Tile' && url.indexOf('https://api.maptiler.com/tiles/v3') > -1) {
                  const urlParams = url.split('.pbf')[0].split('/')
                  const z = urlParams[urlParams.length - 3]
                  const x = urlParams[urlParams.length - 2]
                  const y = urlParams[urlParams.length - 1]
                  const newUrl1 = `nzMap:///static/Titles/${z}/${x}/${y}.pbf`
                  return {
                    url: newUrl1,
                    credentials: 'include',
                    method: 'GET'
                    // Include cookies for cross-origin requests
                  }
                }
                if (resourceType === 'SpriteJSON') {
                  return {
                    url: 'nzMap:///static/Titles/sprite.json',
                    credentials: 'include',
                    method: 'GET'
                    // Include cookies for cross-origin requests
                  }
                }
                if (resourceType === 'SpriteImage') {
                  return {
                    url: 'nzMap:///static/Titles/sprite.png',
                    credentials: 'include',
                    method: 'GET'
                    // Include cookies for cross-origin requests
                  }
                }
              }
            })
            map.on('load', this.mapLoad)
            setChart(mapId, map)
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
    mapLoad () {
      const map = getChart(this.mapId)
      if (!map) {
        return
      }
      this.loadDataCenterMapData()
      map.addControl(new maplibregl.NavigationControl(), 'bottom-right')
      const mapboxglInner = document.getElementsByClassName('mapboxgl-ctrl-attrib-inner')
      mapboxglInner[0].innerHTML = '<span>&copy; MapTiler</span> <span>&copy; OpenStreetMap contributors</span>'
    },
    loadDataCenterMapData () {
      const self = this
      const map = getChart(this.mapId)
      if (!map) {
        return
      }
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
          const bigScatter = 18
          const mediumScatter = 13
          const smallScatter = 10
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
              dcStat.symbolSize = symbolSize
            }
          })
          this.renderPoint(dcStats)
          map.on('mouseenter', 'pointLayer', self.pointEnter)
          map.on('mouseleave', 'pointLayer', self.pointLeave)
          self.pointAnimation(0)
        })
      })
    },
    pointEnter (param) {
      const point = param.point
      const event = param.originalEvent
      const boxWidth = window.innerWidth / 2
      const boxHeight = window.innerHeight / 2
      this.tooltip.x = event.clientX + point.x - event.layerX + 15
      this.tooltip.y = event.clientY + point.y - event.layerY + 15
      if (this.tooltip.x > boxWidth) {
        this.tooltip.x = this.tooltip.x - 200 - 15
      }
      if (this.tooltip.y > boxHeight) {
        this.tooltip.y = this.tooltip.y - 160 - 15
      }
      this.dcStat = {
        ...param.features[0].properties,
        asset: JSON.parse(param.features[0].properties.asset),
        agent: JSON.parse(param.features[0].properties.agent)
      }
      this.tooltip.show = true
    },
    pointLeave () {
      this.tooltip.show = false
      this.dcStat = ''
    },
    renderPoint (dcStats) {
      const arr = []
      const map = getChart(this.mapId)
      if (!map) {
        return
      }
      dcStats.forEach(dcStat => {
        arr.push({
          type: 'Feature',
          properties: {
            ...dcStat
          },
          geometry: {
            type: 'Point',
            coordinates: [dcStat.longitude, dcStat.latitude]
          }
        })
      })
      map.addSource('pointData', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: arr
        }
      })
      map.addLayer({
        id: 'pointLayer',
        type: 'circle',
        source: 'pointData',
        paint: {
          'circle-radius': [
            'step',
            ['get', 'symbolSize'],
            10,
            13,
            13,
            18,
            18
          ],
          'circle-color': [
            'step',
            ['get', 'color'],
            '#23BF9A',
            2,
            '#EC7F66',
            3,
            '#9e9c98'
          ],
          'circle-opacity': 0.5
        }
      })
    },
    pointAnimation (timeStep) {
      const map = getChart(this.mapId)
      const opacity = 0.5 + (timeStep % 1000) / 1000 / 2
      if (map) {
        map.setPaintProperty('pointLayer', 'circle-opacity', [
          'step',
          ['get', 'color'],
          0.5,
          2,
          opacity,
          3,
          0.5
        ])
        requestAnimationFrame(this.pointAnimation)
      }
    },
    resize () {
      setTimeout(() => {
        let map = getChart(this.mapId)
        if (!map) {
          return
        }
        map && map.remove()
        map = null
        setChart(this.mapId, null)
        this.initChart()
      }, 100)
    }
  },
  beforeDestroy () {
    bus.$off('headerThemeChange', this.themeChange)
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    let map = getChart(this.mapId)
    if (!map) {
      return
    }
    map.off('load', this.mapLoad)
    map.off('mouseenter', 'pointLayer', this.pointEnter)
    map.off('mouseleave', 'pointLayer', this.pointLeave)
    map.remove()
    map = null
    setChart(this.mapId, null)
  }
}
</script>
