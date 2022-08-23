<template>
  <div class="latlng">
    <div class="input-box">
      <div class="input-box-item" style="display: none;">
        <el-input v-model="lnglat" @blur="setLatlng" @change="setLatlng">
          <template slot="prepend" v-if="showZoom">{{$t('config.system.basic.lnglat')}}</template>
        </el-input>
      </div>
      <div class="input-box-item" v-if="showZoom">
        <el-input v-model="zoom" :max="mapParam.maxZoom" :min="mapParam.minZoom" :step="1"  controls-position="right">
          <template v-if="showZoom" slot="prepend">{{$t('config.system.basic.zoom')}}</template>
        </el-input>
      </div>
      <div class="input-box-item" style="margin-right: unset !important;width: 30px !important;flex:unset;" @click="mapConfigVisible = true"><i class="nz-icon nz-icon-weizhi" style="color:rgb(238, 157, 63)"></i></div>
    </div>
    <el-dialog :visible.sync="mapConfigVisible" :title="$t('config.system.basic.mapTitle')" width="calc(50% - 10px)"  @close="mapClose" @opened="initMap" class=" nz-dialog map-config-dialog" :modal-append-to-body="appendToBody">
      <div id="map" style="height: 100%; width: 100%"></div>
    </el-dialog>
  </div>
</template>

<script>
// 引入Leaflet对象 挂载到Vue上，便于全局使用，也可以单独页面中单独引用
import 'leaflet/dist/leaflet.css'
import maplibregl from 'maplibre-gl'
import mapAllStyle from '@/components/chart/chart/mapStyle'
export default {
  name: 'latlngPicker',
  props: {
    initData: { },
    appendToBody: { type: Boolean, default: true },
    showZoom: { type: Boolean, default: true }
  },
  data () {
    return {
      theme: localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`) || 'light',
      lnglat: '',
      oldlnglat: '',
      mapParam: { longitude: 116.39, latitude: 39.9, zoom: 4, minZoom: 1, maxZoom: 7 },
      map: null,
      marker: null,
      mapConfigVisible: false,
      changeZoom: false,
      zoom: null
    }
  },
  watch: {
    initData: {
      immediate: true,
      handler (n) {
        this.queryDefaultMapConfig(n).then(() => {
          this.lnglat = this.mapParam.longitude + ',' + this.mapParam.latitude
        })
      }
    }
  },
  mounted () {
  },
  methods: {
    initMap () {
      if (this.map) {
        this.map.remove()
        this.map = null
      }
      this.setLatlng()
      let mapStyle = mapAllStyle[this.theme]
      mapStyle.center = [Number(this.mapParam.longitude), Number(this.mapParam.latitude)]
      mapStyle.zoom = Number(this.zoom)
      const mapId = document.getElementById('map')
      this.map = new maplibregl.Map({
        container: mapId,
        style: mapStyle,
        maxZoom: 7,
        minZoom: 1,
        // renderWorldCopies: false,
        hash: false,
        transformRequest: function (url, resourceType) {
          console.log(resourceType)
          if (resourceType === 'Tile' && url.indexOf('https://api.maptiler.com/tiles/v3') > -1) {
            const urlParams = url.split('.pbf')[0].split('/')
            const z = urlParams[urlParams.length - 3]
            const x = urlParams[urlParams.length - 2]
            const y = urlParams[urlParams.length - 1]
            const newUrl1 = `nzMap://static/Titles/${z}/${x}/${y}.pbf`
            return {
              url: newUrl1,
              credentials: 'include',
              method: 'GET'
              // Include cookies for cross-origin requests
            }
          }
          if (resourceType === 'SpriteJSON') {
            return {
              url: 'nzMap://static/Titles/sprite.json',
              credentials: 'include',
              method: 'GET'
              // Include cookies for cross-origin requests
            }
          }
          if (resourceType === 'SpriteImage') {
            return {
              url: 'nzMap://static/Titles/sprite.png',
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
      const marker = ''
      const self = this
      const geoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [Number(self.mapParam.longitude), Number(self.mapParam.latitude)]
            }
          }
        ]
      }
      this.map.on('load', function () {
        self.map.addSource('centerMarker',
          {
            type: 'geojson',
            data: geoJSON
          })
        self.map.addLayer({
          id: 'centerMarkerLayer',
          type: 'circle',
          source: 'centerMarker',
          paint: {
            'circle-radius': 8,
            'circle-color': '#23BF9A',
            'circle-opacity': 1
          }
        })
      })
      // const marker = L.marker([this.mapParam.latitude, this.mapParam.longitude]).addTo(map)
      this.map.on('click', function (e) {
        console.log(e, e.lngLat)
        const coords = e.lngLat
        geoJSON.features[0].geometry.coordinates = [coords.lng, coords.lat]
        self.map.getSource('centerMarker').setData(geoJSON)
      })
      // this.marker = marker
    },
    mapClose () {
      this.changZoom = true
      this.mapConfigVisible = false
      const latlng = this.map.getSource('centerMarker')._data.features[0].geometry.coordinates
      this.mapParam.longitude = latlng[0].toFixed(7)
      this.mapParam.latitude = latlng[1].toFixed(7)
      this.lnglat = this.mapParam.longitude + ',' + this.mapParam.latitude
      this.zoom = this.map.getZoom()
      this.setLatlng()
    },
    setLatlng () {
      const lnglat = this.lnglat.split(',')
      const lnglatValue = /^\d+(\.\d{1,7})?$/
      if (lnglat[0] !== 'undefined' && lnglat[1] !== 'undefined' && lnglatValue.test(lnglat[1]) && lnglatValue.test(lnglat[0])) {
        this.mapParam.longitude = lnglat[0]
        this.mapParam.latitude = lnglat[1]
      } else {
        this.mapParam.longitude = '-33.9257813'
        this.mapParam.latitude = '55.5761251'
      }
      this.$emit('lnglatChange', this.lnglat, this.zoom)
    },
    getAttribute () {
      return JSON.parse(JSON.stringify({ ...this.mapParam, zoom: this.zoom }))
    },
    setLnglat (lat, lng) {
      if (lat && lng) {
        this.mapParam.latitude = lat
        this.mapParam.longitude = lng
        this.lnglat = this.mapParam.longitude + ',' + this.mapParam.latitude
      }
    },
    queryDefaultMapConfig (data) {
      return new Promise(resolve => {
        this.$get('/sysConfig?paramKey=map_center_config').then(response => {
          if (response.code == 200) {
            const mapParam = JSON.parse(response.data.paramKey.map_center_config)
            if (data) {
              const coord = data.split(',')
              this.mapParam = { ...mapParam, longitude: coord[0], latitude: coord[1] }
            } else {
              this.mapParam = { ...mapParam }
            }
            if (!this.zoom) {
              this.zoom = mapParam.zoom
            }
            resolve()
          }
        })
      })
    }
  }
}
</script>

<style scoped>
  .latlng .input-box{
    width: 100%;
    display: flex;
  }
  .latlng .input-box .input-box-item{
    margin-right: 20px;
    flex: 1;
  }
  .latlng .input-box .el-input,.latlng .input-box .el-input-number{
    width: 100%;
  }
</style>

<style>
  .latlng .map-config-dialog .el-dialog{
    height: 45%;
  }
  .latlng .map-config-dialog .el-dialog__body{
    height: calc(100% - 48px) !important;

  }
  .latlng .input-box .el-input .el-input-group__prepend{
    padding:0px 5px!important;
  }
</style>
