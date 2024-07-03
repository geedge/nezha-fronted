<template>
  <div class="notebook-detail">
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :layout="[]"
      :tabs="tabs"
      :targetTab="targetTab"
      @changeTab="changeTab"
      class="full-width-height"
      :showPagination="false"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot:top-tool-right>
        <div v-has="'notebook_edit'">
          <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" v-if="!notebookEdit" @click="edit">
            <i class="nz-icon nz-icon-edit"></i>
            <span>{{$t('overall.edit')}}</span>
          </button>
          <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" v-else @click="done">
            <span>{{$t('notebook.done')}}</span>
          </button>
        </div>
        <pick-time ref="pickTime" v-model="searchTime" :refresh-data-func="dateChange" :show-locked="true" :use-chart-unit="false" :sign="'notebook' + obj.id"></pick-time>
        <el-dropdown v-has="['notebook_view']" trigger="click" size="medium" class="nz-el-dropdown">
          <button class="top-tool-btn" :title="$t('overall.download')">
            <i class="nz-icon nz-icon-download1"></i>
          </button>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top nz-el-dropdown-menu">
            <el-dropdown-item v-has="'notebook_view'">
              <div @click="download('pdf')">{{$t('notebook.downloadAs',{format:'PDF'})}}</div>
            </el-dropdown-item>
            <el-dropdown-item v-has="'notebook_view'">
              <div @click="download('markdown')">{{$t('notebook.downloadAs',{format:'markdown'})}}</div>
            </el-dropdown-item>
            <el-dropdown-item v-has="'notebook_view'">
              <div @click="downloadJson()">{{$t('notebook.downloadNotebook')}} JSON</div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
      <!--图表-->
      <div ref="scrollbar" class="notebook-scrollWrap" v-my-loading="notebookLoading">
        <div class="notebook-content">
          <h2 class="notebook-title" v-if="!notebookEdit">{{notebookName}}</h2>
          <el-input class="notebook-title-input" v-else v-model="notebookName" maxlength="64" placeholder="" size="small"></el-input>
          <notebook-list
            ref="notebookList"
            :from="fromRoute.notebook"
            :variablesInit="true"
            :data-list="dataList"
            :is-export-html="false"
            :time-range="searchTime"
            :nowTimeType="nowTimeType"
          >
          </notebook-list>
          <div class="notebook-add" v-if="!notebookLoading&&notebookEdit">
            <p class="notebook-add-title">{{$t('notebook.addchart')}}</p>
            <ul class="notebook-add-list">
              <li class="notebook-add-item"
                v-show="!isShowLess||item.less"
                v-for="item in typeList"
                :key="item.name"
                @click="addChartBefore(item)">
                <svg class="notebook-chart-icon" aria-hidden="true">
                  <use :xlink:href="item.icon"></use>
                </svg>
                <span>{{item.name}}</span>
              </li>
            </ul>
            <p class="notebook-add-show" @click="showChange">
              <span>{{isShowLess?$t('notebook.showAll'):$t('notebook.showLess')}}</span>
            </p>
          </div>
        </div>
      </div>
    </nz-bottom-data-list>

    <transition name="right-box">
      <chart-right-box
        v-if="chartRightBoxShow"
        v-my-loading="rightBox.loading"
        ref="addChartModal"
        :chart="chart"
        :from="fromRoute.notebook"
        :show-panel="showPanel"
        @close="closeChartBox"
        @on-create-success="createSuccess"
      ></chart-right-box>
    </transition>

    <!-- 快照进度 -->
    <snapshotProgress v-if="snapshotVisible" :showPanel="showPanel" :searchTime="searchTime" :snapshotVisible.sync="snapshotVisible" api="notebook"></snapshotProgress>
  </div>
</template>

<script>
import axios from 'axios'
import bus from '../../../../libs/bus'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
import chartRightBox from '@/components/common/rightBox/chart/chartRightBox'
import { fromRoute } from '@/components/common/js/constants'
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import snapshotProgress from '@/components/common/snapshotProgress/snapshotProgress.vue'
import notebookList from '@/components/page/notebook/notebookList.vue'
import { initColor } from '@/components/chart/chart/tools'
export default {
  name: 'notebookTab',
  mixins: [subDataListMixin, detailViewRightMixin],
  props: {
  },
  computed: {
    delChartFlag () {
      return this.$store.getters.getDelChart
    },
    chartRightBoxShow () {
      return this.$store.getters.getShowRightBox
    },
    timePickerLocked () {
      return this.$store.getters.getTimePickerLocked
    },
    timePickerRange () {
      return this.$store.getters.getTimePickerRange
    },
    notebookEdit () { // 是否是编辑状态
      return this.$store.getters.getNotebookEdit
    }
  },
  data () {
    return {
      fromRoute,
      notebookLoading: true,
      searchTime: bus.getTimezontDateRange(),
      nowTimeType: {},
      snapshotVisible: false,
      dataList: [],
      notebookName: '',
      isShowLess: false,
      typeList: [
        { icon: '#nz-icon-text2', name: this.$t('dashboard.dashboard.chartForm.typeVal.text.label'), type: 'text', less: true, datasource: 'misc' },
        { icon: '#nz-icon-line_chart', name: this.$t('dashboard.dashboard.chartForm.typeVal.line.label'), type: 'line', less: true, datasource: 'metrics' },
        { icon: '#nz-icon-a-Areacharts', name: this.$t('dashboard.dashboard.chartForm.typeVal.stackArea.label'), type: 'area', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Point', name: this.$t('dashboard.dashboard.chartForm.typeVal.point.label'), type: 'point', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Stat', name: this.$t('dashboard.dashboard.chartForm.typeVal.singleStat.label'), type: 'stat', less: true, datasource: 'metrics' },
        { icon: '#nz-icon-hexagon', name: this.$t('dashboard.dashboard.chartForm.typeVal.hexagonFigure.label'), type: 'hexagon', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Bar_chart', name: this.$t('dashboard.dashboard.chartForm.typeVal.bar.label'), type: 'bar', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-a-Piechat', name: this.$t('dashboard.dashboard.chartForm.typeVal.pie.label'), type: 'pie', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-a-Doughnutchart', name: this.$t('dashboard.dashboard.chartForm.typeVal.doughnut.label'), type: 'doughnut', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-a-Rosechart', name: this.$t('dashboard.dashboard.chartForm.typeVal.rose.label'), type: 'rose', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Bubble', name: this.$t('dashboard.dashboard.chartForm.typeVal.bubble.label'), type: 'bubble', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-funnel1', name: this.$t('dashboard.dashboard.chartForm.typeVal.funnel.label'), type: 'funnel', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-rank1', name: this.$t('dashboard.dashboard.chartForm.typeVal.rank.label'), type: 'rank', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Sankey', name: this.$t('dashboard.dashboard.chartForm.typeVal.sankey.label'), type: 'sankey', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Guage', name: this.$t('dashboard.dashboard.chartForm.typeVal.gauge.label'), type: 'gauge', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Treemap', name: this.$t('dashboard.dashboard.chartForm.typeVal.treemap.label'), type: 'treemap', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Table', name: this.$t('dashboard.dashboard.chartForm.typeVal.table.label'), type: 'table', less: true, datasource: 'metrics' }
      ],
      rightBox: { // 面板弹出框相关
      },
      chart: {},
      showPanel: {}
    }
  },
  components: {
    nzBottomDataList,
    chartRightBox,
    snapshotProgress, // 快照进度
    notebookList
  },
  methods: {
    done () {
      let charts = this.$lodash.cloneDeep(this.$refs.notebookList.copyDataList)
      charts = charts.filter(item => item.name !== 'groupTemp')
      charts.forEach(item => {
        if (item.datasource == 'metrics' || item.datasource == 'log') {
          item.elements.forEach((subItem, subIndex) => {
            subItem.expression = item.oldElements[subIndex].expression
          })
        }
        delete item.x
        delete item.y
        delete item.modifiedName
        delete item.oldElements
        if (item.type === 'text') {
          delete item.param.isEdit
          delete item.param.oldText
        }
      })
      const params = {
        name: this.notebookName,
        charts
      }
      if (!this.obj.id) { // 新增
        this.$post('visual/notebook', params).then(response => {
          if (response.code === 200) {
            bus.$emit('notebookSave', { id: response.data.id, ...params })
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
            this.$emit('getTableData')
            this.$store.commit('setNotebookEdit', false)
          } else {
            this.$message.error(response.msg)
          }
        })
      } else { // 编辑
        params.id = this.obj.id
        this.$put('visual/notebook', params).then(response => {
          if (response.code === 200) {
            bus.$emit('notebookSave', params)
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
            this.$emit('getTableData')
            this.$store.commit('setNotebookEdit', false)
          } else {
            this.$message.error(response.msg)
          }
        })
      }
    },
    // 图表创建成功，回调panel页面，进行图表的刷新
    createSuccess (chart) {
      delete chart.panelName
      chart.loaded = false
      if (chart.id) { // 编辑
        const index = this.$refs.notebookList.copyDataList.findIndex(item => item.id == chart.id)
        this.$refs.notebookList.copyDataList.splice(index, 1, chart)
      } else { // 新增
        const id = this.getMaxId(this.$refs.notebookList.copyDataList) + 1
        chart.id = id
        if (chart.position) {
          const index = this.$refs.notebookList.copyDataList.findIndex(item => item.id == chart.position.id)
          if (chart.position.position === 'before') { // 向前追加
            delete chart.position
            this.$refs.notebookList.copyDataList.splice(index, 0, chart)
          } else { // 向后追加
            delete chart.position
            this.$refs.notebookList.copyDataList.splice(index + 1, 0, chart)
          }
        } else {
          this.$refs.notebookList.copyDataList.push(chart)
        }
      }
      this.$refs.notebookList.onScroll(this.scrollbarWrap.scrollTop)
      this.$store.dispatch('clearPanel')
    },
    addNotebook (data) {
      this.addChartBefore(data)
    },
    // 编辑图表信息,打开编辑弹窗
    editChart (data, copy) {
      if (copy) {
        this.chart = JSON.parse(JSON.stringify(data))
        this.chart.position = { position: 'after', id: data.id }
        this.chart.panelName = this.showPanel.name
        this.chart.id = ''
        if (this.chart.datasource == 'metrics' || this.chart.datasource == 'log') {
          this.chart.elements.forEach((item, index) => {
            item.expression = this.chart.oldElements[index].expression
          })
        }
        this.$nextTick(() => {
          this.$refs.addChartModal.isStable = 'stable'
        })
      } else {
        this.chart = JSON.parse(JSON.stringify(data))
        this.chart.panelName = this.showPanel.name
        if (this.chart.datasource == 'metrics' || this.chart.datasource == 'log') {
          this.chart.elements.forEach((item, index) => {
            item.expression = this.chart.oldElements[index].expression
          })
        }
        this.$nextTick(() => {
          this.$refs.addChartModal.isStable = 'stable'
        })
      }
    },
    delChart (chart) {
      const index = this.$refs.notebookList.copyDataList.findIndex(item => item.id == chart.id)
      this.$refs.notebookList.copyDataList.splice(index, 1)
      this.$refs.notebookList.onScroll(this.scrollbarWrap.scrollTop)
      this.chart = {}
      this.$store.dispatch('clearPanel')
    },
    /* 图表相关操作--start */
    addChart (chart) {
      this.chart = {
        name: '',
        type: chart.type,
        unit: 2,
        datasource: chart.datasource,
        param: this.newChart(chart.type)
      }
      this.chart.position = chart.position
      if (this.chart.datasource === 'metrics') {
        this.chart.elements = [{ expression: '', legend: '', type: 'expert', id: '', name: 'A', state: 1, step: undefined }]
      }
      this.chart.panelName = this.showPanel.name
      this.$nextTick(() => {
        this.$refs.addChartModal.isStable = 'stable'
      })
    },
    addText (position) {
      const chart = {
        type: 'text',
        unit: 2,
        datasource: 'misc',
        param: this.newChart('text')
      }
      if (position) {
        chart.position = position
      }
      this.createSuccess(chart)
    },
    copyChartText (data) {
      const chart = JSON.parse(JSON.stringify(data))
      chart.param.isEdit = false
      chart.position = { position: 'after', id: chart.id }
      delete chart.id
      this.createSuccess(chart)
    },
    getMaxId (arr) { // 获取当前列表最大的id
      if (!arr.length) {
        return 1
      }
      const maxElement = arr.reduce(function (prev, current) {
        return (prev.id > current.id) ? prev : current
      })
      return Math.max(maxElement.id, 1)
    },
    newChart (type) {
      let param = {}
      switch (type) {
        case 'line':
        case 'area':
        case 'point':
          param = {
            min: undefined,
            max: undefined,
            color: {
              schemeType: 'palette',
              mode: 'palette',
              paletteColors: initColor(20),
              fixedColor: '',
              continuousType: ''
            },
            stack: 0,
            link: '',
            nullType: 'null',
            legend: { placement: 'bottom', values: [], show: true },
            thresholdShow: true,
            thresholds: [{ value: undefined, color: randomcolor() }],
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false,
              visibility: false,
              rightYAxis: false,
              tooltip: true
            },
            showHeader: 1,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            rightYAxis: {
              elementNames: [],
              style: 'line',
              unit: 2,
              label: '',
              min: undefined,
              max: undefined
            },
            dataLink: [],
            tooltip: {
              mode: 'all',
              sort: 'none'
            }
          }
          break
        case 'stat':
        case 'hexagon':
        case 'gauge':
        case 'sankey':
        case 'bubble':
        case 'rank':
        case 'funnel':
          param = {
            min: undefined,
            max: undefined,
            color: {
              schemeType: 'palette',
              mode: 'palette',
              paletteColors: initColor(20),
              fixedColor: '',
              continuousType: ''
            },
            link: '',
            nullType: 'null',
            statistics: 'last',
            text: 'value',
            valueMapping: [],
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false,
              visibility: false
            },
            showHeader: 1,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            dataLink: []
          }
          break
        case 'bar':
        case 'treemap':
        case 'pie':
        case 'doughnut':
        case 'rose':
          param = {
            min: undefined,
            max: undefined,
            color: {
              schemeType: 'palette',
              mode: 'palette',
              paletteColors: initColor(20),
              fixedColor: '',
              continuousType: ''
            },
            link: '',
            nullType: 'null',
            statistics: 'last',
            text: 'value',
            valueMapping: [],
            legend: { placement: 'bottom', values: [], show: true },
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false,
              visibility: false
            },
            showHeader: 1,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            dataLink: []
          }
          break
        case 'table':
          param = {
            link: '',
            nullType: 'null',
            statistics: 'last',
            columns: [],
            tags: [],
            indexs: '',
            valueMapping: [],
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false,
              visibility: false
            },
            showHeader: 1,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            tableOptions: {
              showTableHeader: 'enabled',
              pagination: 'enabled',
              defaultSortColumn: null,
              defaultSort: null
            },
            dataLink: []
          }
          break
        case 'text':
          param = {
            link: '',
            text: '',
            enable: {
              visibility: false
            },
            showHeader: 1,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            editorType: 'markdown',
            isEdit: true
          }
          break
      }
      return param
    },
    addChartBefore (chart) {
      if (chart.type === 'text') {
        this.addText(chart.position)
        return false
      }
      this.$store.dispatch('dispatchEditChart', {
        chart: chart,
        type: 'add'
      })
    },
    disposeChart () {
      const chartInfo = this.$store.getters.getChart
      const type = this.$store.getters.getType
      if (type === 'add') {
        this.addChart(chartInfo)
      }
      if (type === 'edit') {
        this.editChart(chartInfo)
      }
      if (type === 'delete') {
        this.delChart(chartInfo)
      }
      if (type === 'duplicate') {
        this.editChart(chartInfo, true)
      }
    },
    closeChartBox (refresh) {
      this.chart = {}
      this.$store.dispatch('clearPanel')
    },
    showChange () {
      this.isShowLess = !this.isShowLess
    },
    edit () {
      this.$store.commit('setNotebookEdit', true)
    },
    download (type) {
      this.showPanel.format = type
      this.snapshotVisible = true
    },
    downloadJson () {
      if (!this.obj.id) {
        return this.$message.error(this.$t('NOTEBOOK_ID_ISNULL'))
      }
      const params = {
        format: 3,
        ids: this.obj.id
      }
      axios.get('/visual/notebook/export', { responseType: 'blob', params: params }).then(res => {
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, this.obj.name + '.json')
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = this.obj.name + '.json'
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    // 获取数据,用在子页面
    getData () {
      this.dataList = []
      this.notebookLoading = true
      if (this.obj.id) {
        this.$get('/visual/notebook/' + this.obj.id).then(response => {
          if (response.code === 200) {
            this.notebookLoading = false
            this.dataList = response.data.charts.map(item => {
              return {
                ...item,
                loaded: false
              }
            })
          }
        })
      } else {
        this.notebookLoading = false
      }
    },
    refreshData (timeRange) { // 选择时间范围 还是刷新
      const refresh = !timeRange
      this.$refs.notebookList.refreshData(refresh)
    },
    dateChange (timeRange) {
      if (this.$refs.pickTime) {
        const nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
        this.nowTimeType = this.$refs.pickTime.$refs.timePicker.nowTimeType
        this.setSearchTime('searchTime', nowTimeType, this.storeDispatchPanelTime)
        this.refreshData(timeRange)
        this.$store.dispatch('dispatchPanelTime', {
          time: this.searchTime,
          nowTimeType: this.nowTimeType
        })
        this.$store.dispatch('dispatchTimePickerRange', {
          time: this.searchTime,
          nowTimeType: this.nowTimeType
        })
      }
    },
    setTimePickerRange () {
      this.$nextTick(() => {
        if (this.timePickerLocked) {
          const nowTimeType = this.nowTimeType = this.timePickerRange.nowTimeType
          this.searchTime = this.timePickerRange.time
          this.$refs.pickTime && this.$refs.pickTime.$refs.timePicker.setTimeRange(this.nowTimeType, this.searchTime)
          this.setSearchTime('searchTime', nowTimeType, this.storeDispatchPanelTime)
        }
      })
    },
    storeDispatchPanelTime () { // 设置searchTime
      this.$store.dispatch('dispatchPanelTime', {
        time: this.searchTime,
        nowTimeType: this.nowTimeType
      })
    },
    // 切换tab
    changeTab (tab) {
      this.$emit('changeTab', tab)
    },
    // 滚动事件触发下拉加载
    onScroll: bus.debounce(function () {
      this.$refs.notebookList.onScroll(this.scrollbarWrap.scrollTop)
    }, 300)
  },
  mounted () {
    this.setTimePickerRange()
    this.scrollbarWrap = this.$refs.scrollbar
    this.scrollbarWrap.addEventListener('scroll', this.onScroll)
    bus.$on('addNotebook', this.addNotebook)
    bus.$on('copyChartText', this.copyChartText)
  },
  beforeDestroy () {
    this.$store.dispatch('dispatchPanelTime', {
      time: [],
      nowTimeType: {}
    })
    if (this.scrollbarWrap) {
      this.scrollbarWrap.removeEventListener('scroll', this.onScroll)
    }
    bus.$off('addNotebook', this.addNotebook)
    bus.$off('copyChartText', this.copyChartText)
    this.$store.commit('setNotebookEdit', false)
  },
  watch: {
    obj: {
      immediate: true,
      handler (n) {
        this.notebookName = n.name
        this.showPanel = {
          id: n.id,
          name: n.name
        }
        this.getData()
        if (!n.id) {
          this.$store.commit('setNotebookEdit', true)
        }
      }
    },
    chartRightBoxShow: {
      immediate: false,
      deep: true,
      handler (n) {
        if (n) {
          this.disposeChart()
        } else {
          this.$refs.addChartModal.isStable = 'instability'
        }
      }
    },
    delChartFlag: {
      immediate: false,
      deep: true,
      handler (n) {
        if (n) {
          this.disposeChart()
        }
      }
    }
  }
}
</script>
