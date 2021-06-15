<template>
  <div class="overview list-page">
    <!--自定义地图鼠标悬浮提示dom，避免被overflow：hidden裁剪-->
    <div :style="{'left': `${tooltip.x}px`, 'top': `${tooltip.y}px`}" class="my-pane"></div>
    <!--标题-->
    <div class="overview-content-header">
      <div :class="{'hide-div':!isFullScreen}" class="header-title">{{systemName&&systemName != 'undefined'&&systemName != null?systemName: $t('dashboard.overview.contentTitle')}}</div>
      <div class="header-tool">
        <div class="overview-loading"><loading ref="overviewLoading" ></loading></div>
        <div class="tool-container top-tools">
          <div class="time">{{sysTime}}</div>
          <div class="date">
            <div class="week">{{sysWeek}}</div>
            <div class="sys-date">{{sysDate}}</div>
          </div>
          <pick-time id="overview-search" ref="pickTime" v-model="searchTime" :refresh-data-func="setFreshDataTimer" :showTimePicker="false" :use-chart-unit="false" class="float-right pickTime margin-l-5"></pick-time>
          <div id="overview-full-screen" class="operation" @click="switchFullScreen"><span ><i :class="{'nz-icon-maxview':!isFullScreen,'nz-icon-exit-full-screen':isFullScreen}" class="nz-icon screen-icon"></i></span></div>
        </div>
      </div>
    </div>
    <!--内容-->
    <div class="overview-content">
      <!--第一行-->
      <div class="content-row-box">
        <div class="content-col-box">
          <div id="overview-to-asset" v-loading="assetLoading" class="content-col-content clickable" @click="jumpTo('asset')">
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-overview-project"></i></div>
            <div class="content-num-box">
              <el-tooltip :content="`${assetData}`" class="item" effect="light" placement="top">
                <div class="content-col-content-num">
                  <vue-count-up :decimals="assetData < 1000 ? 0 : 1" :duration="1" :end-value="assetData | numberFormat"
                               :start-value="0"></vue-count-up>
                  <span class="overview-row-unit">{{assetData | unitFormat}}</span>
                  <span v-if="assetData > 1000 " class="over-num">+</span>
                </div>
              </el-tooltip>
              <div class="content-col-content-title">{{$t("dashboard.overview.asset.title")}}</div>
            </div>
          </div>
        </div>
        <div class="content-col-box">
          <div v-loading="projectLoading" class="content-col-content clickable" @click="jumpTo('project')">
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-project"></i></div>
            <div class="content-num-box">
              <el-tooltip :content="`${projectData.total}`" class="item" effect="light" placement="top">
                <div class="content-col-content-num">
                  <vue-count-up :decimals="projectData.total < 1000 ? 0 : 1" :duration="1" :end-value="projectData.total | numberFormat" :start-value="0"></vue-count-up>
                  <span class="overview-row-unit">{{projectData.total | unitFormat}}</span>
                  <span v-if="projectData.total > 1000 " class="over-num">+</span>
                </div>
              </el-tooltip>
              <div class="content-col-content-title">{{$t("dashboard.overview.project.project")}}</div>
            </div>
          </div>
        </div>
        <div class="content-col-box">
          <div v-loading="moduleLoading" class="content-col-content clickable" @click="jumpTo('module')">
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-overview-module"></i></div>
            <div class="content-num-box">
              <el-tooltip :content="`${moduleData.total}`" class="item" effect="light" placement="top">
                <div class="content-col-content-num">
                  <vue-count-up :decimals="moduleData.total < 1000 ? 0 : 1" :duration="1" :end-value="moduleData.total | numberFormat" :start-value="0"></vue-count-up>
                  <span class="overview-row-unit">{{moduleData.total | unitFormat}}</span>
                  <span v-if="moduleData.total > 1000 " class="over-num">+</span>
                </div>
              </el-tooltip>
              <div class="content-col-content-title">{{$t("dashboard.overview.module.module")}}</div>
            </div>
          </div>
        </div>
        <div class="content-col-box">
          <div v-loading="endpointLoading" class="content-col-content clickable" @click="jumpTo('endpoint')">
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-overview-endpoint"></i></div>
            <div class="content-num-box">
              <el-tooltip :content="`${endpointData.num}`" class="item" effect="light" placement="top">
                <div class="content-col-content-num">
                  <vue-count-up :decimals="endpointData.num < 1000 ? 0 : 1" :duration="1" :end-value="endpointData.num | numberFormat" :start-value="0"></vue-count-up>
                  <span class="overview-row-unit">{{endpointData.num | unitFormat}}</span>
                  <span v-if="endpointData.num > 1000 " class="over-num">+</span>
                </div>
              </el-tooltip>
              <div class="content-col-content-title">{{$t("dashboard.overview.endpoint.endpoint")}}</div>
            </div>
          </div>
        </div>
        <div class="content-col-box">
          <div id="overview-to-alertlist" v-loading="alertMessageLoading" class="content-col-content clickable" @click="jumpTo('alertList')">
            <div class="content-col-content-icon"><i class="nz-icon nz-icon-overview-alert"></i></div>
            <div class="content-num-box">
              <el-tooltip :content="`${alertMessageData.num}`" class="item" effect="light" placement="top">
                <div class="content-col-content-num">
                  <vue-count-up :decimals="alertMessageData.num < 1000 ? 0 : 1" :duration="1" :end-value="alertMessageData.num | numberFormat" :start-value="0"></vue-count-up>
                  <span class="overview-row-unit">{{alertMessageData.num | unitFormat}}</span>
                  <span v-if="alertMessageData.num > 1000 " class="over-num">+</span>
                </div>
              </el-tooltip>
              <div class="content-col-content-title">{{$t("overall.alert")}}</div>
            </div>
            <div class="content-alert-num">{{$t("dashboard.overview.alert.ruleNum")}}&nbsp;:&nbsp;{{(alertRuleData ? alertRuleData : "") | numberFormat}}</div>
          </div>
        </div>
      </div>
      <!--第二行-->
      <div class="content-row-box">
        <div class="content-col-box">
          <div class="content-col-title">
            <span>{{$t("dashboard.overview.projectTopoLogy")}}</span>
          </div>
          <div v-loading="topologyLoading"  class="content-col-content">
            <transition name = "el-zoom-in-center">
              <div v-if="allProject&&allProject.length>0" style="width: 100%;height: 100%;position: relative">
                <el-carousel :interval="5000" :trigger="'click'" arrow="hover">
                  <el-carousel-item v-for="(item,index) in allProject" :key="index">
                    <div class="maskLayer" @click="toProject(item)"></div>
                    <span class="project-name">{{item.name}}</span>
                    <topology
                      :fromOverView="true"
                      :obj="item"
                      :topologyIndexF="index"
                    />
                  </el-carousel-item>
                </el-carousel>
              </div>
            </transition>
            <div v-if="allProject.length===0" class="chart-no-data">No Data</div>
          </div>
        </div>
        <div class="content-col-box">
          <div class="content-col-title">{{$t("dashboard.overview.dataCenter.dataCenter")}}</div>
          <div class="content-col-content">
            <div id="map" style="height: 100%; width: 100%"></div>
          </div>
        </div>
      </div>
      <!--第三行-->
      <div class="content-row-box content-bottom-box">
        <!--第一个图-->
        <div class="content-col-box">
          <div class="content-col-title">
            <span>{{$t("dashboard.overview.asset.assetState")}}</span>
          </div>
          <div class="content-col-content">
            <chart-box ref="assetTypePie" :show-toolbox="false" :tooltip-formatter="assetStateFormatter" chart-type="pie" name="assetTypePie" @is-loading="(isLoading)=>{this.assetTypeLoading = isLoading}"></chart-box>
            <div v-if="!assetTypeLoading && (!assetTypeData || assetTypeData.length === 0)" class="chart-no-data">No Data</div>
          </div>
        </div>

        <!--第二个图-->
        <div class="content-col-box">
          <div class="content-col-title">
            <span>
              <span v-if="alertMessageShow === 'asset'">{{$t("dashboard.overview.alert.assetTopN")}}</span>
              <span v-if="alertMessageShow === 'module'">{{$t("dashboard.overview.alert.moduleTopN")}}</span>
            </span>
          </div>
          <div class="content-col-content" style="overflow: hidden">
            <messageAsset v-show="messageAssetData.length>0" ref="assetHexagon" :col="col" :data="messageAssetData" :from="'asset'" :from-type="'asset'" :hexagonSvgID="'hexagonSvg1'" :length="length" :show-tooltip="true"/>
            <div v-if="messageAssetData.length===0" class="chart-no-data">No Data</div>
          </div>
        </div>
        <!--第三个图-->
        <div class="content-col-box">
          <div class="content-col-title">
            <span>{{$t("dashboard.overview.alert.moduleTopN")}}</span>
          </div>
          <div class="content-col-content" style="overflow: hidden">
            <messageAsset v-show="messageModuleData.length>0" ref="moduleHexagon" :col="col" :data="messageModuleData" :from="'module'" :from-type="'module'" :hexagonSvgID="'hexagonSvg2'" :length="length" :show-tooltip="true"/>
            <div v-if="messageModuleData.length===0" class="chart-no-data">No Data</div>
          </div>
        </div>
      </div>
    </div>
    <div class="axis-tooltip el-popover yAxis-text-style"></div>
    <!--用于assetType饼图label-->
    <img id="upPic" src='../../../../assets/img/up.png' style="display: none;">
    <img id="downPic" src='../../../../assets/img/down.png' style="display: none;">
  </div>
</template>

<script>
import chart from './chart'
import i18n from '@/components/common/i18n'
import axios from 'axios'
import bus from '@/libs/bus'
import VueCountUp from 'vue-countupjs'
import 'leaflet/dist/leaflet.css'
// 引入Leaflet对象 挂载到Vue上，便于全局使用，也可以单独页面中单独引用
import * as L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import * as echarts from 'echarts'
import chartConfig from './chartConfig'
import overViewTopology from '../../../common/project/topologyL5'
import messageAsset from '../../../common/overView/messageAsset'

let tooltipEndpointChart
let tooltipPrometheusChart
const regNum = /^[0-9]+.?[0-9]*/
export default {
  name: 'overview',
  data () {
    return {
      // top tool
      isFullScreen: false,
      sysTime: '',
      sysDate: '',
      sysWeek: '',
      systemName: localStorage.getItem('nz-sys-name'),
      topologyLoading: true,

      // data
      assetLoading: false,
      assetData: [], // asset总数
      assetAlertData: [],
      assetTypeLoading: false, // 第三行第一个图
      assetTypeData: [],
      assetStateData: [],
      projectLoading: false,
      projectData: { total: 0 },
      moduleLoading: false,
      moduleData: { total: 0 },
      endpointLoading: false,
      endpointData: { num: 0 },
      alertMessageLoading: false,
      alertMessageData: { num: 0 },
      alertRuleData: 0,
      map: null,
      allProject: [],

      alertMessageShow: 'asset', // asset/module

      topFilter: {
        optionals: [10, 20, 50],
        rule: 10,
        asset: 48,
        module: 48
      },
      system_server_time: null,
      freshDateTimer: null,
      freshDataTimer: null,

      tooltip: {
        x: 0,
        y: 0
      },
      searchTime: bus.getTimezontDateRange(),
      messageAssetData: [],
      col: 10,
      length: 9,
      messageModuleData: []
    }
  },
  components: {
    'chart-box': chart,
    VueCountUp,
    topology: overViewTopology,
    messageAsset
  },
  filters: {
    numberFormat (num) {
      const fixed = 1
      if (num) {
        try {
          num = parseFloat(num)
          if (num < 1000) {
            return num
          } else if (num < 1000000) {
            num = num / 1000
            num = num.toString()
            const index = num.indexOf('.')
            if (index !== -1) {
              num = num.substring(0, fixed + index + 1)
            } else {
              num = num.substring(0)
            }
            return parseFloat(num).toFixed(fixed)
          } else if (num < 1000000000) {
            num = num / 1000000
            num = num.toString()
            const index = num.indexOf('.')
            if (index !== -1) {
              num = num.substring(0, fixed + index + 1)
            } else {
              num = num.substring(0)
            }
            return parseFloat(num).toFixed(fixed)
          }
        } catch (err) {
          return 0
        }
      }
      return 0
    },
    unitFormat (num) {
      if (num) {
        try {
          num = parseFloat(num)
          if (num < 1000) {
            return ''
          } else if (num < 1000000) {
            return ' K'
          } else if (num < 1000000000) {
            return ' M'
          }
        } catch (err) {
          return ''
        }
      }
      return ''
    }
  },
  methods: {
    /* 初始化数据 start */
    initData () {
      return [
        this.querySystemState(),
        this.queryAssetData(),
        this.queryAssetTypeData(),
        this.queryProjectData(),
        this.queryModuleData(),
        this.queryEndpointData(),
        this.queryAlertMessageData(),
        this.queryAlertRuleData(),
        this.initMap(),
        this.queryAlertStatByModule(), // 新的3-3
        this.queryAllProjectData()
      ]
    },
    setFreshDataTimer () {
      Promise.all(this.initData()).then(() => {
        if (this.$refs.overviewLoading) {
          this.$refs.overviewLoading.endLoading()
        }
      })
    },
    querySystemState () {
      return new Promise(resolve => {
        this.$get('/healthy').then(response => {
          if (response.code == 200) {
            if (response.time) {
              this.system_server_time = this.utcTimeToTimezone(response.time)
            } else {
              this.system_server_time = bus.computeTimezone(new Date().getTime())
            }
          } else {
            this.system_server_time = bus.computeTimezone(new Date().getTime())
          }
          resolve()
        })
      })
    },
    queryAllProjectData () {
      this.$get('monitor/project', { pageSize: -1 }).then(res => {
        this.topologyLoading = true
        const axiosAll = []
        const temp = []
        if (res.data.list.length === 0) {
          this.topologyLoading = false
        }
        res.data.list.forEach((item) => {
          axiosAll.push(axios.get(`monitor/project/topo?projectId=${item.id}`))
        })
        axios.all(axiosAll).then(res2 => {
          res2 = res2.map((item, index) => {
            return { ...item.data.data, ...res.data.list[index] }
          })
          res2 = res2.filter((item) => item.topo && item.topo.pens && item.topo.pens.length)
          if (res2.length == 0) {
            this.topologyLoading = false
          }
          res2.forEach(item => {
            temp.push(item)
          })
          this.allProject = temp
          this.topologyLoading = false
        })
      })
    },

    formatNodesArr (arr) {
      return new Promise(resolve => {
        const promiseArr = []
        arr.forEach((item, index) => {
          item.shape = 'image'
          item.id = item.moduleId
          this.$get('/module/stat', { id: item.id }).then(res => {
            item.state = res.data
          })
          promiseArr.push(this.dealImg(`monitor/project/topo/icon/${item.iconId}`))
        })
        Promise.all(promiseArr).then(res => {
          arr.forEach((item, index) => {
            item.image = res[index]
          })
          resolve(arr)
        })
      })
    },
    formatEdgesArr (arr) {
      arr.forEach((item) => {
        item.from = item.source
        item.to = item.target
        item.label = ''
        item.title = 'title'
        item.smooth.roundness = 0.4
      })
      return arr
    },
    dealImg (url) {
      // 处理后端传过来的图片流乱码问题
      if (url) {
        return new Promise((resolve) => {
          this.$axios
            .get(url, {
              responseType: 'arraybuffer'
            })
            .then(res => {
              return ('data:image/jpeg;base64,' + btoa(new Uint8Array(res.data).reduce((data, byte) => data + String.fromCharCode(byte), '')))
            })
            .then(data => {
              resolve(data)
            })
            .catch(err => {
              console.error(err)
            })
        })
      }
    },
    toProject (projectInfo) { // 跳转对应project页面
      this.$store.commit('setOverViewProject', projectInfo)
    },
    queryAssetData () {
      return new Promise(resolve => {
        this.assetLoading = true
        this.$refs.assetHexagon.startLoading()
        this.$get('stat/asset/total').then(response => {
          if (response.code === 200) {
            this.assetData = response.data.num
          }
        })
        this.$get('stat/alertMessage/topN', { size: 48, dimension: 'asset' }).then(response => {
          this.assetLoading = false
          this.$refs.assetHexagon.endLoading()
          if (response.code === 200) {
            this.assetAlertData = response.data.list.sort((a, b) => b.alertNum - a.alertNum)
            const alertTopAssets = this.assetAlertData.slice(0, 48)
            const requests = alertTopAssets.map(a => axios.get(`stat/alertMessage/severity?assetId=${a.id}`))
            const assetStateData = []
            axios.all(requests).then(result => {
              result.forEach((alert, i) => {
                const severityData = {}
                alert.data.data.list && alert.data.data.list.forEach(a => {
                  severityData[a.name] = a.num
                })
                !severityData.P1 && (severityData.P1 = 0)
                !severityData.P2 && (severityData.P2 = 0)
                !severityData.P3 && (severityData.P3 = 0)
                assetStateData.push({ ...alertTopAssets[i], alert: [severityData] })
              })
              this.messageAssetData = assetStateData
            })
          }
          resolve()
        })
      })
    },
    queryAssetTypeData () {
      return new Promise(resolve => {
        this.assetTypeLoading = true
        this.$get('stat/asset/state').then(response => {
          this.assetTypeLoading = false
          if (response.code === 200) {
            this.assetTypeData = response.data.list
            /* 饼图 */
            const legendData = []
            const typeSeriesData = []

            const vm = this
            /* const assetTotalCount = (function () {
              let count = 0
              vm.assetTypeData.forEach(item => {
                count += item.num
              })
              return count
            }()) */
            this.assetTypeData.forEach(item => {
              legendData.push([item.name, item.num])
              typeSeriesData.push({ name: item.name, value: item.num })
            })
            const series = [{
              name: 'Type',
              data: typeSeriesData.sort((a, b) => { return a.value > b.value ? -1 : 1 }),
              type: 'pie',
              radius: ['43%', '55%'],
              center: ['40%', '50%'],
              minAngle: 15,
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 1
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.66)',
                extraCssText: 'box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.24);',
                textStyle: { color: '#333333' },
                renderMode: 'html'
              },
              label: {
                normal: {
                  show: false,
                  position: 'center',
                  formatter: function (param) { // 设置圆饼图中间文字排版
                    return ['{name|' + param.name + '}',
                      '{percent|(' + param.percent + '%)}']
                      .join('\n')
                  },
                  rich: {
                    name: {
                      textAlign: 'center',
                      color: '#333',
                      fontSize: 19,
                      padding: 10
                    },
                    percent: {
                      textAlign: 'center',
                      color: '#333',
                      fontSize: 12,
                      padding: 10
                    }
                  }
                },
                emphasis: {
                  show: true // 文字至于中间时，这里需为true
                }
              }
            }]
            const legend = {
              show: true,
              orient: 'vertical',
              top: '30%',
              right: 25,
              icon: 'circle'
            }
            if (typeSeriesData.length === 0 || !this.assetTypeData.length === 0) {
              legend.show = false
            }
            this.assetTypeData.length !== 0 && this.$refs.assetTypePie.setSeries(series, legend, legendData)
            this.$refs.assetTypePie.endLoading()
            /* const requests = this.assetTypeData.map(t => axios.get(`stat/asset/ping?typeId=${t.id}`))
            this.assetStateData = []
            axios.all(requests).then(result => {
              result.forEach((r, i) => {
                this.assetStateData.push({ typeId: this.assetTypeData[i].id, data: r.data.list })
                this.$set(this.assetTypeData[i], 'up', result.find(r2 => r2.name === 'up'))
                this.$set(this.assetTypeData[i], 'down', result.find(r2 => r2.name === 'down'))
              })
            }) */
          }
          resolve()
        })
      })
    },
    queryProjectData () {
      return new Promise(resolve => {
        this.projectLoading = true
        this.$get('stat/project/total').then(response => {
          this.projectLoading = false
          if (response.code === 200) {
            this.projectData = response.data
          }
          resolve()
        })
      })
    },
    queryModuleData () {
      return new Promise(resolve => {
        this.moduleLoading = true
        this.$get('stat/module/total').then(response => {
          this.moduleLoading = false
          if (response.code === 200) {
            this.moduleData = response.data
          }
          resolve()
        })
      })
    },
    queryEndpointData () {
      return new Promise(resolve => {
        this.endpointLoading = true
        this.$get('stat/endpoint/total').then(response => {
          this.endpointLoading = false
          if (response.code === 200) {
            this.endpointData = response.data
          }
          resolve()
        })
      })
    },
    queryAlertMessageData () {
      return new Promise(resolve => {
        this.alertMessageLoading = true
        this.$get('stat/alertMessage/total').then(response => {
          this.alertMessageLoading = false
          if (response.code === 200) {
            this.alertMessageData = response.data
          }
          resolve()
        })
      })
    },
    queryAlertRuleData () {
      return new Promise(resolve => {
        this.$get('stat/alertRule/total').then(response => {
          if (response.code === 200) {
            this.alertRuleData = 0
            response.data.list.forEach(d => {
              this.alertRuleData += d.num
            })
          }
          resolve()
        })
      })
    },
    initMap () {
      let loadPromise
      this.loadMapConfig().then((mapConfig) => {
        if (mapConfig && this.map) {
          loadPromise = this.loadDataCenterMapData()
        }
      })
      return loadPromise
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
        tooltipEndpointChart.setOption(endpointOption, true)
        tooltipPrometheusChart.setOption(prometheusOption, true)
      }, 100)
      /* setTimeout(function() {
          tooltipEndpointChart.setOption(endpointOption);
          tooltipPrometheusChart.setOption(prometheusOption);
        }, 100); */
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
            const map = L.map('map', {
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
      const testData = [
        {
          name: 'insert-dfda321cb4cb482aa0c3787887c81a0f',
          color: 2,
          asset: {
            total: 27,
            ok: 26,
            alarm: 1
          },
          agent: {
            up: 27,
            down: 0
          },
          alert: {
            P1: 4,
            P2: 10,
            P3: 2
          }
        },
        {
          name: 'insert-a6662a7c321143e3b8fb33c832e11805',
          color: 1,
          asset: {
            total: 14,
            ok: 14,
            alarm: 0
          },
          agent: {
            up: 14,
            down: 0
          },
          alert: {
            P1: 0,
            P2: 0,
            P3: 0
          }
        },
        {
          name: 'JBXXG',
          color: 3,
          asset: {
            total: 7,
            ok: 0,
            alarm: 0
          },
          agent: {
            up: 0,
            down: 7
          },
          alert: {
            P1: 0,
            P2: 0,
            P3: 0
          }
        }
      ]
      return new Promise(resolve => {
        const requests = [axios.get('dc?pageSize=-1'), axios.get('/stat/overview/map')]
        axios.all(requests).then(result => {
          const dcInfos = result[0].data.data.list
          const dcStats = result[1].data.data.list
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
          const maxAssetTotal = dcInfos[dcInfos.length - 1].assetNum // 获取asset数量最大值

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
                marker = L.circleMarker([dcStat.latitude, dcStat.longitude], { interactive: false, color: this.theme.successColor, opacity: 0.42, fillColor: this.theme.successColor, fillOpacity: 0.5, radius: symbolSize, className: 'real-marker' })
              } else if (dcStat.color === 2) {
                shadowMarker = L.circleMarker([dcStat.latitude, dcStat.longitude], { opacity: 0, fillOpacity: 0, radius: symbolSize + 10 })
                marker = L.circleMarker([dcStat.latitude, dcStat.longitude], { interactive: false, color: this.theme.dangerColor, opacity: 0.42, fillColor: this.theme.dangerColor, fillOpacity: 0.5, radius: symbolSize, className: 'real-marker error-item' })
              } else if (dcStat.color === 3) {
                shadowMarker = L.circleMarker([dcStat.latitude, dcStat.longitude], { opacity: 0, fillOpacity: 0, radius: symbolSize + 10 })
                marker = L.circleMarker([dcStat.latitude, dcStat.longitude], { interactive: false, color: this.theme.suspendedColor, opacity: 0.42, fillColor: this.theme.suspendedColor, fillOpacity: 0.5, radius: symbolSize, className: 'real-marker' })
              }
              shadowMarker.bindTooltip(this.mapTooltipFormatter(dcStat), { sticky: false, pane: 'myPane', direction: 'left', data: dcStat })
              shadowMarker.on('mouseover', (param) => {
                const point = param.containerPoint
                const event = param.originalEvent
                this.tooltip.x = event.clientX + point.x - event.layerX - 5
                this.tooltip.y = event.clientY + point.y - event.layerY
              })
              shadowMarker.addTo(this.map)
              marker.addTo(this.map)
            }
          })
        })
      })

      /* new Promise(resolve => {
        const requests = [axios.get('dc?pageSize=-1'), axios.get('stat/dc/state')]
        axios.all(requests).then((result) => {
          if (result) {
            let dcInfos = null
            let dcStats = null
            if (result[0].data && result[0].data.code == 200) {
              dcInfos = result[0].data.data.list
            }
            if (result[1].data && result[1].data.code == 200) {
              dcStats = result[1].data.data
            }
            if (dcInfos && dcStats) {
              dcInfos.sort((a, b) => {
                return a.assetNum - b.assetNum
              })
              const bigScatter = 10
              const mediumScatter = 8
              const smallScatter = 6
              const maxAssetTotal = dcInfos[dcInfos.length - 1].assetNum // 获取asset数量最大值

              const bigBoundary = Number.parseInt(maxAssetTotal / 3 * 2) // 根据最大值定下大图标、中图标的阈值
              const mediumBoundary = Number.parseInt(maxAssetTotal / 3)
              dcInfos.forEach(dcInfo => {
                if (regNum.test(dcInfo.latitude) && regNum.test(dcInfo.longitude)) {
                  let symbolSize
                  if (dcInfo.assetNum >= bigBoundary) {
                    symbolSize = bigScatter
                  } else if (dcInfo.assetNum < bigBoundary && dcInfo.assetNum >= mediumBoundary) {
                    symbolSize = mediumScatter
                  } else {
                    symbolSize = smallScatter
                  }
                  let shadowMarker = null
                  let marker = null
                  if (dcInfo.state === 'ON') {
                    const hasAlert = dcStat.alertP1 != 0 || dcStat.alertP2 != 0 || dcStat.alertP3 != 0 || dcStat.assetPingDown != 0 || dcStat.endpointDown != 0 || dcStat.promDown != 0
                    shadowMarker = L.circleMarker([dcInfo.latitude, dcInfo.longitude], { opacity: 0, fillOpacity: 0, radius: symbolSize + 10 })
                    marker = L.circleMarker([dcInfo.latitude, dcInfo.longitude], { interactive: false, color: hasAlert ? '#DE5D3F' : '#23BF9A', opacity: 0.42, fillColor: hasAlert ? '#DE5D3F' : '#23BF9A', fillOpacity: 0.5, radius: symbolSize, className: hasAlert ? 'real-marker error-item' : 'real-marker ' })
                    shadowMarker.bindTooltip(this.mapTooltipFormatter(dcStat), { sticky: false, pane: 'myPane', direction: 'left', data: dcStat })
                  } else {
                    shadowMarker = L.circleMarker([dcInfo.latitude, dcInfo.longitude], { opacity: 0, fillOpacity: 0, radius: symbolSize + 10 })
                    marker = L.circleMarker([dcInfo.latitude, dcInfo.longitude], { interactive: false, color: '#010101', opacity: 0.35, fillColor: '#010101', fillOpacity: 0.35, radius: symbolSize, className: 'real-marker' })
                    shadowMarker.bindTooltip(this.mapTooltipFormatter(dcStat), { sticky: false, pane: 'myPane', direction: 'left', data: dcStat })
                  }
                  shadowMarker.on('mouseover', (param) => {
                    // console.info(param);
                    const point = param.containerPoint
                    const event = param.originalEvent
                    this.tooltip.x = event.clientX + point.x - event.layerX - 5
                    this.tooltip.y = event.clientY + point.y - event.layerY
                  })
                  shadowMarker.addTo(this.map)
                  marker.addTo(this.map)
                }
              })
            }
            /!* if (dcInfos && dcStats) {
              const dcStatsCopy = Object.assign([], dcStats)
              dcStatsCopy.sort((a, b) => {
                return a.assetTotal - b.assetTotal
              })
              const bigScatter = 10
              const mediumScatter = 8
              const smallScatter = 6
              const maxAssetTotal = dcStatsCopy[dcStatsCopy.length - 1].assetTotal

              const bigBoundary = Number.parseInt(maxAssetTotal / 3 * 2)
              const mediumBoundary = Number.parseInt(maxAssetTotal / 3)
              for (const dcStat of dcStats) {
                const dcId = dcStat.id
                const dcInfo = dcInfos.find((item) => {
                  return item.id == dcId
                })
                if (regNum.test(dcInfo.latitude) && regNum.test(dcInfo.longitude)) {
                  let symbolSize = mediumScatter
                  if (dcStat.assetTotal >= bigBoundary) {
                    symbolSize = bigScatter
                  } else if (dcStat.assetTotal < bigBoundary && dcStat.assetTotal >= mediumBoundary) {
                    symbolSize = mediumScatter
                  } else {
                    symbolSize = smallScatter
                  }
                  let shadowMarker = null
                  let marker = null
                  if (dcInfo.state === 'ON') {
                    const hasAlert = dcStat.alertP1 != 0 || dcStat.alertP2 != 0 || dcStat.alertP3 != 0 || dcStat.assetPingDown != 0 || dcStat.endpointDown != 0 || dcStat.promDown != 0
                    shadowMarker = L.circleMarker([dcInfo.latitude, dcInfo.longitude], { opacity: 0, fillOpacity: 0, radius: symbolSize + 10 })
                    marker = L.circleMarker([dcInfo.latitude, dcInfo.longitude], { interactive: false, color: hasAlert ? '#DE5D3F' : '#23BF9A', opacity: 0.42, fillColor: hasAlert ? '#DE5D3F' : '#23BF9A', fillOpacity: 0.5, radius: symbolSize, className: hasAlert ? 'real-marker error-item' : 'real-marker ' })
                    shadowMarker.bindTooltip(this.mapTooltipFormatter(dcStat), { sticky: false, pane: 'myPane', direction: 'left', data: dcStat })
                  } else {
                    shadowMarker = L.circleMarker([dcInfo.latitude, dcInfo.longitude], { opacity: 0, fillOpacity: 0, radius: symbolSize + 10 })
                    marker = L.circleMarker([dcInfo.latitude, dcInfo.longitude], { interactive: false, color: '#010101', opacity: 0.35, fillColor: '#010101', fillOpacity: 0.35, radius: symbolSize, className: 'real-marker' })
                    shadowMarker.bindTooltip(this.mapTooltipFormatter(dcStat), { sticky: false, pane: 'myPane', direction: 'left', data: dcStat })
                  }
                  shadowMarker.on('mouseover', (param) => {
                    // console.info(param);
                    const point = param.containerPoint
                    const event = param.originalEvent
                    this.tooltip.x = event.clientX + point.x - event.layerX - 5
                    this.tooltip.y = event.clientY + point.y - event.layerY
                  })
                  shadowMarker.addTo(this.map)
                  marker.addTo(this.map)
                }
              }
            } *!/
          }
          resolve()
        })
      }) */
    },
    queryAlertStatByModule () {
      return new Promise(resolve => {
        this.$refs.moduleHexagon.startLoading()
        this.$get('stat/alertMessage/topN', { size: 48, dimension: 'module' }).then(response => {
          this.$refs.moduleHexagon.endLoading()
          if (response.code === 200) {
            const moduleData = response.data.list
            moduleData.sort((a, b) => b.alertNum - a.alertNum)
            const alertTopModules = moduleData.slice(0, 48)
            const requests = alertTopModules.map(a => axios.get(`stat/alertMessage/severity?moduleId=${a.id}`))
            const moduleStateData = []
            axios.all(requests).then(result => {
              result.forEach((alert, i) => {
                const severityData = {}
                alert.data.data.list && alert.data.data.list.forEach(a => {
                  severityData[a.name] = a.num
                })
                !severityData.P1 && (severityData.P1 = 0)
                !severityData.P2 && (severityData.P2 = 0)
                !severityData.P3 && (severityData.P3 = 0)
                moduleStateData.push({ ...alertTopModules[i], alert: [severityData] })
              })
              this.messageModuleData = moduleStateData
            })
          }
          resolve()
        })
      })
    },
    convertTrafficData (data) {
      const result = []
      data.forEach(item => {
        const hasDc = result.some(dc => { // dc去重
          return item.idc && dc.label == item.idc.name
        })
        if (item.idc && !hasDc) {
          result.push({ label: item.idc.name, value: '$dc$::' + item.idc.name, level: 1 })
        }
      })
      return result
    },
    mapTooltipFormatter (dcStat) {
      /*  <div class="tooltip--row">
            <div class="tooltip-asset">
              <div class="tooltip-asset--title"><span>${this.$t('asset.asset')}</span><span>Total：${dcStat.assetTotal}</span></div>
              <div class="tooltip-asset--row">
                <div>${this.$t('asset.state')}</div>
                <div class="tooltip-asset--sub-rows">
                  <div class="tooltip-asset--sub-row">
                    <div class="sub-row--label">${this.$t('asset.inStock')}</div>
                    <div class="sub-row--value"><div class="sign green-sign"></div><span>${dcStat.assetInStock}</span></div>
                  </div>
                  <div class="tooltip-asset--sub-row">
                    <div class="sub-row--label">${this.$t('asset.notInStock')}</div>
                    <div class="sub-row--value"><div class="sign red-sign"></div><span>${dcStat.assetOutStock}</span></div>
                  </div>
                  <div class="tooltip-asset--sub-row">
                    <div class="sub-row--label">${this.$t('asset.suspended')}</div>
                    <div class="sub-row--value"><div class="sign gray-sign"></div><span>${dcStat.assetSuspended}</span></div>
                  </div>
                </div>
              </div>
              <div class="tooltip-asset--row tooltip-asset--ping ">
                <div style="line-height: 50px">${this.$t('asset.left.ping')}</div>
                <div class="tooltip-asset--sub-rows">
                  <div class="tooltip-asset--sub-row">
                    <div class="sub-row--label">${this.$t('dashboard.overview.asset.pingUp')}</div>
                    <div class="sub-row--value"><div class="sign green-sign"></div><span>${dcStat.assetPingUp}</span></div>
                  </div>
                  <div class="tooltip-asset--sub-row">
                    <div class="sub-row--label">${this.$t('dashboard.overview.asset.pingDown')}</div>
                    <div class="sub-row--value"><div class="sign red-sign"></div><span>${dcStat.assetPingDown}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="tooltip-alert">
              <div class="tooltip-alert--title"><span>${this.$t('dashboard.overview.asset.alert')}</span><span>${dcStat.alertTotal}</span></div>
              <div class="tooltip-alert--row">
                <div class="row--label row--label__p1">P1</div><div class="row--value row--value__p1">${dcStat.alertP1}</div>
              </div>
              <div class="tooltip-alert--row">
                <div class="row--label row--label__p2">P2</div><div class="row--value row--value__p2">${dcStat.alertP2}</div>
              </div>
              <div class="tooltip-alert--row">
                <div class="row--label row--label__p3">P3</div><div class="row--value row--value__p3">${dcStat.alertP3}</div>
              </div>
            </div>
          </div> */
      return `<div class="tooltip">
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
    simpleFormatter (params) {
      return `<div class="tooltip" style="min-width: unset;">${params.value}</div>`
    },
    assetStateFormatter (params) {
      return `<div class="tooltip" style="min-width: unset;">${params.name}:&nbsp;${params.value}</div>`
    },
    switchFullScreen () {
      this.isFullScreen = this.judgeFullScreen()
      if (this.isFullScreen) {
        this.exitFullScreen()
      } else {
        this.fullScreen()
      }
    },
    judgeFullScreen () {
      return document.isFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen
    },
    fullScreen () {
      const container = document.querySelector('.overview')
      const fullScreenFunc = container.requestFullscreen || container.mozRequestFullScreen || container.webkitRequestFullscreen || container.msRequestFullscreen
      fullScreenFunc.call(container)
      this.isFullScreen = true
    },
    exitFullScreen () {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }
      this.isFullScreen = false
    },
    /* header 时间处理 start */
    initDate () {
      this.sysTime = this.getTime(0)
      this.sysDate = this.getDate(0)
      this.sysWeek = this.getWeek(0)
      this.freshTime()
    },
    freshTime () {
      const $temp = this
      let counter = 0
      this.freshDateTimer = setInterval(function () {
        counter++
        $temp.sysTime = $temp.getTime(counter)
        $temp.sysDate = $temp.getDate(counter)
        $temp.sysWeek = $temp.getWeek(counter)
      }, 1000)
    },
    getTime (counter) {
      const date = new Date(this.system_server_time)
      date.setSeconds(date.getSeconds() + counter)
      const hours = date.getHours() > 9 ? date.getHours() : '0' + date.getHours()
      const minutes = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()
      const seconds = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds()
      return hours + ':' + minutes + ':' + seconds
    },
    getDate (counter) {
      const date = new Date(this.system_server_time)
      date.setSeconds(date.getSeconds() + counter)
      const years = date.getFullYear()
      const months = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)
      const days = date.getDate() > 9 ? date.getDate() : '0' + date.getDate()
      return years + '-' + months + '-' + days
    },
    getWeek (counter) {
      const weeks = [i18n.t('date.week.seven'), i18n.t('date.week.one'), i18n.t('date.week.two'), i18n.t('date.week.three'), i18n.t('date.week.four'), i18n.t('date.week.five'), i18n.t('date.week.six')]
      const date = new Date(this.system_server_time)
      date.setSeconds(date.getSeconds() + counter)
      const day = date.getDay()
      return weeks[day]
    },
    dateFormat (fmt, date) {
      let ret
      const opt = {
        'y+': date.getFullYear().toString(), // 年
        'm+': (date.getMonth() + 1).toString(), // 月
        'd+': date.getDate().toString(), // 日
        'H+': date.getHours().toString(), // 时
        'M+': date.getMinutes().toString(), // 分
        'S+': date.getSeconds().toString() // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
      }
      for (const k in opt) {
        ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
          fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
        };
      };
      return fmt
    },
    /* header 时间处理end */
    jumpTo (data, id) {
      if (data == 'asset') {
        bus.$emit('clear-asset-filter') // 清除leftMenu左侧菜单过滤条件
        // if(this.$store.getters.getIdcArr.length===0){return}//如果不存在idc 则不跳转
      }
      if (data === 'project' || data === 'module' || data === 'endpoint') {
        data = 'monitor/' + data
      }
      if (data === 'alertList') {
        data = 'alertMessage'
      }
      this.$router.push({
        path: '/' + data,
        query: {
          t: +new Date()
        }
      })
    },
    zoomMap (val) {
      const geo = this.$refs.dataCenterMap.getOption().geo
      if (geo && geo.length > 0) {
        const zoom = geo[0].zoom
        const limit = geo[0].scaleLimit
        const value = zoom + val
        if (value <= limit.max && value >= limit.min) {
          this.$refs.dataCenterMap.setOption({ geo: { zoom: value } })
        }
      }
    }
  },
  mounted () {
    this.initData()
    this.querySystemState().then(() => {
      this.initDate()
    })
  },
  beforeDestroy () {
    this.allProject = []
  },
  destroyed () {
    clearInterval(this.freshDataTimer)
    clearInterval(this.freshDateTimer)
    this.allProject = null
  }
}
</script>

<style lang="scss">
@import './overview2.scss';
.leaflet-control-zoom{
  border: 1px solid #E7EAED !important;
  box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77) !important;
  .leaflet-control-zoom-out,.leaflet-control-zoom-in{
    opacity: .7;
    background: #FFF;
  }
}
.leaflet-control-attribution{
  background-color: unset !important;
  color: rgba(178, 178, 178, 0.77);
}
@keyframes error-animation{
  0% {fill-opacity:.5}
  50% {fill-opacity:0.75}
  100% {fill-opacity:1}
}
.error-item{
  color: #FADED7 ;
  animation: error-animation 1s infinite ease-in-out;
  animation-direction:normal;
}
.real-marker{
  pointer-events: none;
}
.error-color{

}
.my-pane {
  position: fixed;
  width: 1px;
  z-index: 99999;
  height: 1px;
  background-color: transparent;
}
.leaflet-bottom{
  z-index: 409;
}
.el-carousel--horizontal{
  height: 100%;
}
.el-carousel__container{
  height: calc(100% - 36px);
}
.el-carousel__item .project-name {
  font-size: 18px;
  margin: 0;
  position: absolute;
  z-index: 1;
}

.el-carousel__item:nth-child(2n) {
  /*background-color: #99a9bf;*/
}

.el-carousel__item:nth-child(2n+1) {
  /*background-color: #d3dce6;*/
}
</style>
<style lang="scss" scoped>
.maskLayer{
  width: 100%;
  height: 100%;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  cursor: pointer;
}
/deep/ .el-carousel__indicator--horizontal .el-carousel__button{
  background-color: #C0C4CC;
  opacity: .24;
  height: 10px;
  width: 10px;
  border-radius: 50%;
}
/deep/ .el-carousel__indicator--horizontal.is-active .el-carousel__button{
  opacity: 1;
}

</style>
