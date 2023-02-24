<template>
  <div class="integration-dashboard">
    <div class="integration-tool" style="padding: 0 10px;">
      <h3>{{showPanel.name}}</h3>

      <top-tool-more-options
        type='integration'
        ref="topTool"
        id="integration-dashboard-tool"
        :params="filter"
        :params-type="'template'"
        class="top-tool-export margin-r-10"
        export-url="/visual/panel/export"
        import-url="/visual/panel/import"
        export-file-name="dashboard-temp"
        @afterImport="afterImport"
      >
        <template>
          <button class="nz-btn el-button--small nz-btn-style-normal" @click="importFn">
            <i class="nz-icon nz-icon-upload"></i>
            <span>{{$t('overall.importExcel')}}</span>
          </button>
        </template>
      </top-tool-more-options>
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
              name="panel"
              :panelId="showPanel.id"
              :data-list="dataList"
              :is-export-html="false"
              :nowTimeType="nowTimeType"
              :from="fromRoute.integration"
              :time-range="searchTime"
              :loading="chartListLoading"
            ></chart-list>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { chartCache } from '@/components/common/js/common'
import chartList from '@/components/chart/chartList'
import bus from '../../../../libs/bus'
import { fromRoute } from '@/components/common/js/constants'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import panelVariables from '@/components/common/panel/panelVariables'
import chartDataFormat from '@/components/chart/chartDataFormat'
export default {
  name: 'integration-dashboard',
  props: {
    dashboardTemplate: String
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
      searchTime: bus.getTimezontDateRange(),
      panel: { // 新增panel
        id: '',
        name: ''
      },
      panelData: [],
      // ---图表相关参数--start
      dataList: [], // 数据列表
      filter: {
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
    topToolMoreOptions,
    panelVariables // 处理panel变量的组件
  },
  methods: {
    importFn () {
    },
    afterImport () {
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
    getData () {
      let num = 0
      this.showPanel.charts.forEach(item => {
        item.id = ++num
        item.span = Number(item.span)
        item.height = Number(item.height)
        item.x = Number(item.x)
        item.y = Number(item.y)
        item.type = item.type.split(' ')[0].toLowerCase()
        item.unit = this.getUnitValue(item.unit)
        item.loaded = false
        item.children && item.children.forEach(subItem => {
          subItem.id = ++num
          subItem.span = Number(subItem.span)
          subItem.height = Number(subItem.height)
          subItem.x = Number(subItem.x)
          subItem.y = Number(subItem.y)
          subItem.type = subItem.type.split(' ')[0].toLowerCase()
          subItem.unit = this.getUnitValue(subItem.unit)
        })
      })
      this.dataList = this.showPanel.charts
      this.chartListLoading = false
    },
    // 公用操作
    getTableData () {
      this.panelData = JSON.parse(this.dashboardTemplate)
      if (this.panelData.length > 0) {
        this.showPanel = this.$loadsh.cloneDeep(this.panelData[0])
        this.variables = this.$loadsh.get(this.panelData, '[0].param.variables')
        this.getData()
      } else {
        this.chartListLoading = false
      }
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
    this.getTableData()
  },
  watch: {
    // 监听图表联动配置panelId
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
