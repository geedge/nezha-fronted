<template>
  <div class="latlng">
    <div class="input-box">
      <div class="input-box-item">
        <el-input  v-model="lnglat" >
          <template slot="prepend" v-if="showZoom">{{$t('config.system.basic.lnglat')}}</template>
        </el-input>
      </div>
      <div class="input-box-item" v-if="showZoom">
        <el-input-number controls-position="right" :min="this.mapParam.minZoom" :max="this.mapParam.maxZoom" :step="1"  v-model="mapParam.zoom">
          <template slot="prepend">{{$t('config.system.basic.zoom')}}</template>
        </el-input-number>
      </div>
      <div class="input-box-item" style="margin-right: unset !important;width: 30px !important;flex:unset;" @click="mapConfigVisible = true"><i class="nz-icon nz-icon-shuidi" style="color:rgb(238, 157, 63)"></i></div>
    </div>
    <el-dialog :visible.sync="mapConfigVisible" :title="$t('config.system.basic.mapTitle')" width="calc(50% - 10px)"  @close="mapClose" @opened="initMap" class=" nz-dialog map-config-dialog" :modal-append-to-body="appendToBody">
      <div id="map" style="height: 100%; width: 100%"></div>
    </el-dialog>
  </div>
</template>

<script>
  // 引入Leaflet对象 挂载到Vue上，便于全局使用，也可以单独页面中单独引用
  import 'leaflet/dist/leaflet.css'
  import * as L from 'leaflet'
  import icon from 'leaflet/dist/images/marker-icon.png'
  import iconShadow from 'leaflet/dist/images/marker-shadow.png'
  export default {
    name: "latlngPicker",
    props:{
      initData:{type:Object},
      appendToBody:{type:Boolean,default:true},
      showZoom:{type:Boolean,default:true}
    },
    data(){
      return{
        lnglat:"",
        mapParam:{ longitude: 116.39, latitude: 39.9, zoom: 4, minZoom: 1, maxZoom: 10 },
        map: null,
        marker: null,
        mapConfigVisible: false,
      }
    },
    created() {
      if(this.initData){
        this.mapParam = JSON.parse(JSON.stringify(this.initData));
      }else{
        this.queryDefaultMapConfig();
      }
      this.lnglat = this.mapParam.longitude+","+this.mapParam.latitude;
    },
    mounted() {
    },
    methods:{
      initMap: function () {
        if (this.map) {
          this.map.remove()
          this.map = null
        }
        this.setLatlng();
        const DefaultIcon = L.icon({
          iconUrl: icon,
          iconSize: [26, 40],
          iconAnchor: [13, 40],
          shadowUrl: iconShadow
        })
        L.Marker.prototype.options.icon = DefaultIcon
        const map = L.map('map', {
          minZoom: this.mapParam.minZoom,
          maxZoom: this.mapParam.maxZoom,
          attributionControl: false,
          zoomControl: false,
          maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
        }).setView([this.mapParam.latitude, this.mapParam.longitude], this.mapParam.zoom)

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

        const marker = L.marker([this.mapParam.latitude, this.mapParam.longitude]).addTo(map)
        map.on('click', function (e) {
          const latitude = e.latlng.lat
          const longitude = e.latlng.lng
          marker.setLatLng([latitude, longitude])
        })
        this.map = map
        this.marker = marker
      },
      mapClose: function () {
        this.mapConfigVisible = false
        const latlng = this.marker.getLatLng()
        this.mapParam.longitude = latlng.lng.toFixed(3);
        this.mapParam.latitude = latlng.lat.toFixed(3);
        this.lnglat = this.mapParam.longitude+","+this.mapParam.latitude;

        this.mapParam.zoom = this.map.getZoom();
      },
      setLatlng:function(){
        let lnglat = this.lnglat.split(",");
        this.mapParam.longitude = lnglat[0]
        this.mapParam.latitude = lnglat[1]
      },
      getAttribute:function(){
        return JSON.parse(JSON.stringify(this.mapParam));
      },
      setLnglat:function(lat,lng){
        if(lat&&lng){
          this.mapParam.latitude=lat;
          this.mapParam.longitude =lng;
          this.lnglat = this.mapParam.longitude+","+this.mapParam.latitude;
        }
      },
      queryDefaultMapConfig:function(){
        this.$get("/sysConfig?paramKey=map_center_config").then(response=>{
          if(response.code == 200){
            this.mapParam = JSON.parse(response.data.paramKey.map_center_config);
          }
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
