<template>
  <div class="integration-dashboard">
    <div class="integration-tool" style="padding: 0 10px;">
      <h3 v-if="showName">{{showPanel.name}}</h3>

      <button class="nz-btn el-button--small nz-btn-style-normal" @click="importFn" v-if="showImport">
        <i class="nz-icon nz-icon-upload"></i>
        <span>{{$t('overall.importExcel')}}</span>
      </button>
    </div>

    <div class="dashboard-container">
      <!--图表-->
      <div id="tableList" class="table-list" style='overflow-y: unset'>
        <div class="table-list-box">
          <div id="dashboardScrollbar" class="box-content" v-my-loading="chartListLoading"  ref="dashboardScrollbar" style='overflow-y: auto;display: flex;flex-direction: column;overflow-x: hidden'>
            <panel-variables :labelArrs="variables" :time-range="searchTime" @getPanelData="getPanelData"></panel-variables>
            <chart-list
              ref="chartList"
              :variablesInit="variablesInit"
              :timeRange="time"
              name="dashboard"
              :dashboardId="showPanel.id"
              :data-list="dataList"
              :is-export-html="false"
              :nowTimeType="nowTimeType"
              :from="from"
              :time-range="searchTime"
              :showTool="false"
              :loading="chartListLoading"
            ></chart-list>
          </div>
        </div>
      </div>
    </div>

    <!-- dashboard模板 -->
    <transition name="right-box">
      <dashboardTempBox v-if="rightBox.dashboardTemp.show" :from="fromRoute.integration" @close="closeDashboardTempBox"></dashboardTempBox>
    </transition>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { chartCache } from '@/components/common/js/common'
import chartList from '@/components/chart/chartList'
import bus from '../../../../libs/bus'
import { fromRoute } from '@/components/common/js/constants'
import panelVariables from '@/components/common/panel/panelVariables'
import dashboardTempBox from '@/components/common/rightBox/dashboardTempBox'
import chartDataFormat from '@/components/chart/chartDataFormat'
export default {
  name: 'integration-dashboard',
  props: {
    tempId: Number,
    showImport: {
      type: Boolean,
      default: true
    },
    showName: {
      type: Boolean,
      default: true
    },
    urlType: {
      type: String,
      default: 'template'
    },
    time: {},
    from: {
      type: String,
      default: fromRoute.integration
    }
  },
  computed: {
    chartRightBoxShow () {
      return this.$store.getters.getShowRightBox
    },
    delChartFlag () {
      return this.$store.getters.getDelChart
    }
  },
  data () {
    return {
      fromRoute,
      chartListLoading: true,
      rightBox: { // 面板弹出框相关
        dashboardTemp: { show: false }
      },
      searchTime: bus.getTimezontDateRange(),
      panel: { // 新增panel
        id: '',
        name: ''
      },
      panelData: [],
      // ---图表相关参数--start
      dataList: [], // 数据列表
      filter: { // 过滤条件
        dashboardId: -1,
        start_time: '',
        end_time: ''
      },
      showPanel: {
        name: '',
        type: 'integration',
        id: null
      },
      showTopLine: false,
      nowTimeType: {},
      scrollbarWrap: null,
      variables: [],
      variablesInit: false
    }
  },
  components: {
    chartList,
    panelVariables, // 处理panel变量的组件
    dashboardTempBox
  },
  methods: {
    importFn () {
      this.rightBox.dashboardTemp.show = true
      bus.$emit('clickModalClose', false)
    },
    closeDashboardTempBox (refresh) {
      this.rightBox.dashboardTemp.show = false
      setTimeout(() => {
        bus.$emit('clickModalClose', true)
      }, 100)
    },
    // 滚动事件触发下拉加载
    onScroll () {
      const _self = this
      this.scrollbarWrap.addEventListener('scroll', bus.debounce(function () {
        _self.$refs.chartList.onScroll(_self.scrollbarWrap.scrollTop)
      }, 300, function () {
        _self.showTopLine = _self.scrollbarWrap.scrollTop > 10
      }))
    },
    getUnitValue (type) {
      const unitsList = []
      chartDataFormat.unitOptions().forEach((item, index) => {
        item.children.forEach((n, i) => {
          unitsList.push({ ...n, type: item.label })
        })
      })
      const findItem = unitsList.find(item => item.label.replace(/\s*/g, '') == type.replace(/\s*/g, ''))
      return findItem ? findItem.value : 2
    },
    getData (params) {
      this.dataList = []
      this.chartListLoading = true
      this.$get('visual/dashboard/chart?dashboardId=' + params.dashboardId + '&groupId=0' + '&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.dataList = response.data.list.map(item => {
            return {
              ...item,
              loaded: false
            }
          })
          this.chartListLoading = false
        }
      })
    },
    // 公用操作
    getTableData () {
      this.$get('visual/dashboard', { type: this.urlType, ids: this.tempId }).then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list
          if (this.panelData.length > 0) {
            this.filter.dashboardId = this.panelData[0].id
            this.showPanel = this.$lodash.cloneDeep(this.panelData[0])
            this.variables = this.$lodash.get(this.panelData, '[0].param.variables')
            this.getData(this.filter)
          }
        }
        if (this.urlType === 'template') {
          this.chartListLoading = false
        }
      }).catch((error) => {
        this.chartListLoading = false
        if (error) {
          console.error(error)
          this.$message.error(error.toString())
        }
      })
    },
    getPanelData () {
      this.variablesInit = true
      this.$nextTick(() => {
        this.$refs.chartList.onScroll(this.scrollbarWrap.scrollTop)
      })
    }
  },
  mounted () {
    this.scrollbarWrap = this.$refs.dashboardScrollbar
    this.onScroll()
    // this.getTableData()
  },
  watch: {
    urlType: { // 判断请求的是temp 还是正常访问
      immediate: true,
      handler () {}
    },
    time: { // 时间范围
      immediate: true,
      handler () {
        if (this.time) {
          this.getTableData()
          this.searchTime = this.time
        }
      }
    },
    // 监听图表联动配置
    'showPanel.param.chartShare': {
      handler (value) {
        // 每次切换联动模式 tooltip设置显示
        const option = {
          tooltip: {
            className: 'chart-time-series'
          }
        }
        for (const key in chartCache) {
          if (!chartCache[key] || chartCache[key].group !== 'timeSeriesGroup') {
            continue
          }
          chartCache[key].setOption(option)
        }
        this.$store.commit('setCurrentMousemove', 0)
        if (value && value !== 'none') {
          this.$store.commit('setConnect', value)
          echarts.connect('timeSeriesGroup')
        } else {
          this.$store.commit('setConnect', value)
          echarts.disconnect('timeSeriesGroup')
        }
      }
    }
  },
  beforeDestroy () {
    this.scrollbarWrap && this.scrollbarWrap.removeEventListener('scroll', bus.debounce)

    // 页面销毁 清除图表联动
    this.$store.commit('setCurrentMousemove', 0)
    this.$store.commit('setConnect', 'none')
    echarts.disconnect('timeSeriesGroup')
  }
}
</script>
