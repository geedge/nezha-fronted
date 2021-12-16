<template>
  <div class="overview">
    <div class="content-col-content">
      <div :id="'map' + chartInfo.id" style="height: 100%; width: 100%" :style="theme=='light'? '': ' filter: invert(1) hue-rotate(0.5turn);opacity: 0.75;'"></div>
    </div>
    <!--自定义地图鼠标悬浮提示dom，避免被overflow：hidden裁剪-->
    <div :style="{'left': `${tooltip.x}px`, 'top': `${tooltip.y}px`}" class="my-pane"></div>
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
import * as echarts from 'echarts'
import chartConfig from '@/components/page/dashboard/overview/chartConfig'
// 引入Leaflet对象 挂载到Vue上，便于全局使用，也可以单独页面中单独引用

let tooltipEndpointChart
let tooltipPrometheusChart
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
      theme: localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`)
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      let loadPromise
      this.loadMapConfig().then((mapConfig) => {
        if (mapConfig && this.map) {
          loadPromise = this.loadDataCenterMapData()
        }
      })
      return loadPromise
    },
    loadMapConfig () {
      const vm = this
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
            if (this.map) {
              this.map.remove()
              this.map = null
            }
            const mapId = 'map' + this.chartInfo.id
            const map = L.map(mapId, {
              minZoom: mapConfig.minZoom,
              maxZoom: mapConfig.maxZoom,
              attributionControl: false,
              zoomControl: false,
              maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
            }).setView([mapConfig.latitude, mapConfig.longitude], mapConfig.zoom)
            map.createPane('myPane', document.querySelector('.my-pane'))
            map.on('tooltipopen', function (param) {
              setTimeout(() => {
                vm.initTooltipChart(param)
              }, 100)
            })
            map.on('tooltipclose', function (param) {
              tooltipEndpointChart && tooltipEndpointChart.clear()
              tooltipPrometheusChart && tooltipPrometheusChart.clear()
            })
            this.map = map

            L.tileLayer(
              '/static/Tiles/{z}/{x}/{y}.png',
              { noWrap: true }
            ).addTo(map)

            const attribution = L.control.attribution({ position: 'bottomright', prefix: '' })
            attribution.addAttribution(' © OpenStreetMap contributors')
            attribution.addTo(map)

            L.control.zoom({
              position: 'bottomright',
              zoomInText: '<i class="nz-icon nz-icon-enlarge"></i>',
              zoomOutText: '<i class="nz-icon nz-icon-narrow"></i>',
              zoomInTitle: '',
              zoomOutTitle: ''
            }).addTo(map)

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
          const maxAssetTotal = dcInfos[dcInfos.length - 1] ? dcInfos[dcInfos.length - 1].assetNum : '' // 获取asset数量最大值

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
                console.log(param)
                const point = param.containerPoint
                const event = param.originalEvent
                const boxWidth = window.innerWidth / 2
                this.tooltip.x = event.clientX + point.x - event.layerX - 5
                this.tooltip.y = event.clientY + point.y - event.layerY
                if (boxWidth > this.tooltip.x) {
                  this.tooltip.x = this.tooltip.x + 434 + 10
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
      return `<div class="tooltip" style="z-index: 11111">
          <div class="tooltip--title">${dcStat.name}</div>
          <div class="tooltip--row">
            <div class="legend-value legend-value-asset">
              <div>${dcStat.asset.ok}</div>
              <div>${dcStat.asset.alarm}</div>
            </div>
            <div class="legend-value legend-value-agent">
              <div>${dcStat.agent.up}</div>
              <div>${dcStat.agent.down}</div>
            </div>
            <div class="tooltip-chart" id="tooltip-chart--endpoint"></div>
            <div class="tooltip-chart" id="tooltip-chart--prometheus"></div>
          </div>
        </div>`

      // return tooltip;
    },
    initTooltipChart (param) {
      const vm = this
      setTimeout(() => {
        const data = param.tooltip.options.data
        // console.info(tooltipEndpointChart);
        tooltipEndpointChart = echarts.init(document.querySelector('#tooltip-chart--endpoint'))
        tooltipPrometheusChart = echarts.init(document.querySelector('#tooltip-chart--prometheus'))
        const endpointOption = chartConfig.getOption('tooltipPie')
        const prometheusOption = chartConfig.getOption('tooltipPie')
        endpointOption.series[0].label.formatter = data.asset.total + ''
        endpointOption.series[0].data = [
          { name: vm.$t('dashboard.overview.asset.ok'), value: data.asset.ok ? data.asset.ok : 0 },
          { name: vm.$t('dashboard.overview.asset.alarm'), value: data.asset.alarm ? data.asset.alarm : 0 }
          // { name: vm.$t('dashboard.overview.asset.total'), value: data.asset.total ? data.asset.total : 0 }
        ]
        endpointOption.title.text = vm.$t('asset.asset')
        endpointOption.legend.data = [vm.$t('dashboard.overview.asset.ok'), vm.$t('dashboard.overview.asset.alarm')]
        prometheusOption.series[0].label.formatter = data.agent.up + ''
        prometheusOption.series[0].data = [
          { name: vm.$t('config.agent.up'), value: data.agent.up ? data.agent.up : 0 },
          { name: vm.$t('config.agent.down'), value: data.agent.down ? data.agent.down : 0 }
        ]
        prometheusOption.title.text = vm.$t('config.agent.agent.agent')
        prometheusOption.legend.data = [vm.$t('config.agent.up'), vm.$t('config.agent.down')]
        tooltipEndpointChart && tooltipEndpointChart.setOption(endpointOption, true)
        tooltipPrometheusChart && tooltipPrometheusChart.setOption(prometheusOption, true)
      }, 100)
      /* setTimeout(function() {
          tooltipEndpointChart.setOption(endpointOption);
          tooltipPrometheusChart.setOption(prometheusOption);
        }, 100); */
    },
    resize () {
      this.initMap()
    }
  },
  beforeDestroy () {
    // this.map.remove()
    this.map = null
  }
}
</script>

<style scoped>

</style>
