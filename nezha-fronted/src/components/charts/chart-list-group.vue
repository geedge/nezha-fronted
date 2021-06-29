<style scoped>
  .chartBox {
    float:left;
    padding: 0px 10px 10px 0;
    position:relative;
    box-sizing: border-box;
  }
  .noData{
    text-align: center
  }
  .list-width{
    width: calc(100% - 2px);
    padding: 5px 10px 5px 0px;
    box-sizing: border-box;
    overflow: hidden;/*避免鼠标第一次放到曲线时，x轴出现滚动条后消失*/
  }
</style>
<style lang="scss">
  .vue-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    cursor: se-resize;
    box-sizing: border-box;
    user-select: none;
    z-index: 99;
  }
  .vue-resizable-handle:after {
    border-right: 2px solid #acb6bf;
    border-bottom: 2px solid #acb6bf;
    content: "";
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 5px;
    height: 5px;
    box-sizing: inherit;
  }

  .temp-dom {
    visibility: hidden;
    font-size: 14px;
    position: fixed;
  }
</style>
<template>
  <div class="list-width chart-group"  :id="'listContainer' + groupId" ref="listContainer"><!--v-drag-->

    <draggable v-model="dataList" :disabled="panelLock" :move="move" @end="end" @start="start"
               :scroll-sensitivity="150"
               :options="{
                 group:{name:'chartGroup',pull:'false'},
                 dragClass:'drag-chart-class',
                 fallbackClass:'fallback-class',
                 forceFallback:true,
                 ghostClass:'chart-ghost',
                 chosenClass:'choose-class',
                 scroll:true,
                 filter: '.drag-disabled',
                 scrollFn:function(offsetX,offsetY,originalEvent,touchEvt,hoverTargetEI){},
                 animation: 150,
                 handle: '.chart-title'
               }"
    style="width: 100%;height: 100%">
      <div :class="{'drag-disabled': !draggable,'chartBox':true}" :id="'chart-' + item.id" :key="item.id" :name="item.name" :ref="'chart' + item.id" :style="{marginBottom: extraMarginBottom}" v-for="(item, index) in dataList" v-show="!item.isHide">
        <line-chart-block v-if="item.type === 'line' || (item.type === 'bar' && (!item.param.statistics || item.param.statistics === 'null')) ||item.type == 'stackArea' || item.type === 4" :key="'inner' + item.id"
                          :from="from" :ref="'editChart'+item.id" :temp-dom="tempDom"
                          @on-refresh-data="refreshChart"
                          @on-remove-chart-block="removeChart"
                          @on-duplicate-chart-block="duplicateChart"
                          @on-drag-chart="editChartForDrag"
                          @on-edit-chart-block="editData"
                          @sync="()=>{chartBySync(item)}"
                          :panel-id="filter.panelId"
                          :is-lock="panelLock"
                          :chart-index="item.chartIndex"
                          @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                          :chart-data="item"
        ></line-chart-block>

        <chart-single-stat  :from="from" :key="'inner' + item.id" :ref="'editChart'+item.id" v-if="item.type === 'singleStat'"
                     @on-refresh-data="refreshChart"
                     @on-search-data="searchData"
                     @on-remove-chart-block="removeChart"
                     @on-duplicate-chart-block="duplicateChart"
                     @on-drag-chart="editChartForDrag"
                     @on-edit-chart-block="editData"
                            @sync="()=>{chartBySync(item)}"
                     :chart-data="item"
                     :is-lock="panelLock"
                     :panel-id="filter.panelId"
                     @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                     :chart-index="item.chartIndex"></chart-single-stat>

        <chart-table  :from="from" :key="'inner' + item.id" :ref="'editChart'+item.id" v-if="item.type === 'table'"
                      @on-refresh-data="refreshChart"
                      @on-search-data="searchData"
                      @on-remove-chart-block="removeChart"
                      @on-duplicate-chart-block="duplicateChart"
                      @on-drag-chart="editChartForDrag"
                      @on-edit-chart-block="editData"
                      @sync="()=>{chartBySync(item)}"
                      :is-lock="panelLock"
                      :panel-id="filter.panelId"
                      :chart-data="item"
                      @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                      :chart-index="item.chartIndex"></chart-table>

        <chart-url  :from="from" :key="'inner' + item.id" :ref="'editChart'+item.id" v-if="item.type === 'url'"
                     @on-refresh-data="refreshChart"
                     @on-search-data="searchData"
                     @on-remove-chart-block="removeChart"
                     @on-duplicate-chart-block="duplicateChart"
                     @on-drag-chart="editChartForDrag"
                    :is-lock="panelLock"
                     @on-edit-chart-block="editData"
                    @sync="()=>{chartBySync(item)}"
                     :panel-id="filter.panelId"
                     :chart-data="item"
                      @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                     :chart-index="item.chartIndex"></chart-url>

        <chart-detail  v-if="item.type === 'assetInfo' || item.type == 'projectInfo' || item.type == 'endpointInfo' || item.type == 'alertRuleInfo'" :ref="'editChart'+item.id" :key="'inner' + item.id"
                          :from="from" :panel-id="filter.panelId"
                          :chart-index="item.chartIndex"
                          @on-refresh-data="refreshChart"
                          :is-lock="panelLock"
                          :chart-data="item"
                          @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                          :editChartId="'editChartId' + item.id"
        ></chart-detail>

        <text-chart :from="from" :key="'inner' + item.id" :ref="'editChart'+item.id" v-if="item.type === 'text'"
                    @on-refresh-data="refreshChart"
                    @on-remove-chart-block="removeChart"
                    @on-duplicate-chart-block="duplicateChart"
                    @on-drag-chart="editChartForDrag"
                    @on-edit-chart-block="editData"
                    @sync="()=>{chartBySync(item)}"
                    @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                    :is-lock="panelLock"
                    :panel-id="filter.panelId"
                    :chart-data="item"
                    :chart-index="item.chartIndex"
        ></text-chart>

        <diagramChart :from="from" :key="'inner' + item.id" :ref="'editChart'+item.id" v-if="item.type === 'diagram'"
                      @on-refresh-data="refreshChart"
                      @on-remove-chart-block="removeChart"
                      @on-duplicate-chart-block="duplicateChart"
                      @on-drag-chart="editChartForDrag"
                      @on-edit-chart-block="editData"
                      @sync="()=>{chartBySync(item)}"
                      @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                      :is-lock="panelLock"
                      :panel-id="filter.panelId"
                      :chart-data="item"
                      :chart-index="index"
        ></diagramChart>

        <chart-alert-list  :from="from" :ref="'editChart'+item.id"
                           :panel-id="filter.panelId"
                          :chart-index="item.chartIndex"
                          v-if="item.type  === 'alertList'"
                          :editChartId="'editChartId' + item.id"
                           :is-lock="panelLock"
                          :chart-info="item"
                           :chartData="item"
                          @on-refresh-data="refreshChart"
                          @on-search-data="searchData"
                          @on-remove-chart-block="removeChart"
                          @on-duplicate-chart-block="duplicateChart"
                          @on-drag-chart="editChartForDrag"
                          @on-edit-chart-block="editData"
                           @sync="()=>{chartBySync(item)}"
                          @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
        ></chart-alert-list>
        <chartBarStatis  :from="from" :key="'inner' + item.id" :ref="'editChart'+item.id" v-if="(item.type === 'bar'&& item.param.statistics && item.param.statistics !== 'null')" :temp-dom="tempDom"
                         @on-refresh-data="refreshChart"
                         @on-search-data="searchData"
                         @on-remove-chart-block="removeChart"
                         @on-duplicate-chart-block="duplicateChart"
                         @on-drag-chart="editChartForDrag"
                         @on-edit-chart-block="editData"
                         @sync="()=>{chartBySync(item)}"
                         :chart-data="item"
                         :is-lock="panelLock"
                         :panel-id="filter.panelId"
                         @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                         :chart-index="item.chartIndex"></chartBarStatis>
        <chart-pie  :from="from" :key="'inner' + item.id" :ref="'editChart'+item.id" v-if="item.type === 'pie'" :temp-dom="tempDom"
                            @on-refresh-data="refreshChart"
                            @on-search-data="searchData"
                            @on-remove-chart-block="removeChart"
                            @on-duplicate-chart-block="duplicateChart"
                            @on-drag-chart="editChartForDrag"
                            @on-edit-chart-block="editData"
                    @sync="()=>{chartBySync(item)}"
                            :chart-data="item"
                            :is-lock="panelLock"
                            :panel-id="filter.panelId"
                            @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                            :chart-index="item.chartIndex"></chart-pie>
      </div>
   </draggable>
    <el-row v-if="dataList.length === 0"  class="noData"></el-row>
    <!--<div class="page-shadow" v-if="showShadow"></div>-->
  </div>
</template>

<script>
import axios from 'axios'
import bus from '../../libs/bus'
import lineChartBlock from './line-chart-block'
import chartTable from './chart-table'
import chartUrl from './chart-url'
import chartSingleStat from './chart-single-stat'
import chartDetail from './chart-detail'
import draggable from 'vuedraggable'
import chartDataFormat from './chartDataFormat'
import chartAlertList from './chart-alert-list'
import textChart from './text-chart'
import diagramChart from './diagram-chart'
import chartPie from './chart-pie'
import chartBarStatis from './chart-bar-statistics'
import { fromRoute } from '@/components/common/js/constants'
import chartTempData from '@/components/charts/chartTempData'
// import visNetwork from './visNetwork'
export default {
  name: 'chartList',
  props: {
    isModel: { type: Boolean, default: false },
    additionalInfo: {},
    draggable: { type: Boolean, default: true },
    detail: Object,
    from: { type: String },
    panelLock: { type: Boolean, default: false },
    hasGroup: { type: Boolean, default: true },
    groupList: {},
    filterParent: {},
    groupId: {}
  },

  components: {
    chartAlertList,
    chartDetail,
    lineChartBlock,
    chartTable,
    chartUrl,
    chartSingleStat,
    draggable,
    textChart,
    chartPie,
    chartBarStatis,
    diagramChart
    // visNetwork,
  },
  watch: {
    groupList: {
      immediate: true,
      handler (n) {
        this.dataList = [...n]
        this.dataTotalListBak = [...n]
        this.$nextTick(() => {
          this.dataList.forEach((item, index) => {
            // this.getChartData(item, index, this.filter)
            this.setChartSize(item, index)
            const chartBox = document.getElementById('chart-' + item.id)// this.$refs['editChart'+item.id][0];
            this.handleElementInViewport(chartBox, 0, item, index, true)
          })
        })
      }
    },
    filterParent: {
      immediate: true,
      handler (n) {
        this.filter = { ...n }
        this.pagePanelId = this.filter.panelId
      }
    }
  },
  data () {
    return {
      filter: {},
      dataList: [], // 看板中所有图表信息
      dataListDragTmp: [],
      time: {
        start: '',
        end: ''
      },
      extraMarginBottom: 0, // dom额外的margin
      panelId: '',
      timer: null,
      dataTotalList: [], // 懒加载：总记录数
      dataTotalListBak: [], // 用于查询：懒加载，总记录备份
      isPage: false, // 是否分页懒加载
      currentRecordNum: 0, // 懒加载：本次取记录的index，第一次从0开始取，每次取3行
      lineNum: 3, // 每页加载的行数
      pagePanelId: '', // 当前分页的panelId
      dragging: null,
      // chartDataCacheGroup:new Map,//图表数据缓存，用于查询：id:{}
      stepHeight: 50,

      tempDom: { height: '', width: '' }
      // showShadow:false,
    }
  },
  methods: {
    dropmenuChange (id, show) {
      if (show) {
        const chart = this.$refs['chart' + id][0]
        const container = this.$refs.listContainer
        const heightDifference = container.offsetHeight - chart.offsetTop
        if (heightDifference < 235) {
          this.extraMarginBottom = 235 - heightDifference
          this.$nextTick(() => {
            container.scrollTop = container.offsetHeight
          })
        }
      } else {
        this.extraMarginBottom = 0
      }
    },
    tempDomInit () {
      const span = document.querySelector('.temp-dom')
      this.tempDom.width = span.offsetWidth
    },
    start (event) {
      event.item.querySelector('.chartTitle').style.background = '#d8dce1'
      const projectAndAssetFeatureInfos = event.item.querySelectorAll('.feature-content')
      if (projectAndAssetFeatureInfos && projectAndAssetFeatureInfos.length > 0) {
        projectAndAssetFeatureInfos.forEach(item => {
          item.classList.remove('unfold')
          item.classList.remove('fold')
        })
      }
      this.dataListDragTmp = [...this.dataList]
    },
    end (event) {
      if (event.oldIndex !== event.newIndex) {
        this.$emit('moveGroupItem', this.dataList)
        // 处理所有group数据后 调用上层移动 保存
      }
    },
    move (event, orgin) {
      const dragClass = document.querySelector('.drag-chart-class')// drag-chart-class:yellow chart-ghost:green  fallback-class choose-class:purple

      const chartTitle = dragClass.querySelector('.chartTitle')
      chartTitle.style.background = '#d8dce1'
    },
    clone (event) {
      const canvas = event.item.querySelector('canvas')
      const canvasclone = event.clone.querySelector('canvas')
      canvasclone.style.border = 'solid 1px yellow'
      if (canvas && canvasclone) {
        const image = new Image()
        image.src = canvas.toDataURL()
        const ctxClone = canvasclone.getContext('2d')
        // ctxClone.drawImage(image,0,0);
        image.onload = function () {
          ctxClone.drawImage(image, 0, 0)
        }
      }
    },
    dragPosition (e) {
      const odiv = e// 目标元素e.target
      // var targetDiv= document.getElementById('lineChartDiv'+this.chartIndex); //
      // 得到点击时该容器的：
      /* const startY = e.clientY
      const startX = e.clientX
      const _this = this */
      // 鼠标相对元素的位置
      const distY = e.clientY - odiv.offsetLeft
      const distX = e.clientX - odiv.offsetTop
      document.onmousemove = function (e) {
        e.preventDefault()
        const left = e.clientX - distX
        const top = e.clientY - distY
        odiv.style.top = top + 'px'
        odiv.style.left = left + 'px'
      }

      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    handleDragStart (e, item) {
      this.dragging = item
    },
    handleDragEnd (e, item) {
      this.dragging = null
    },
    // 首先把div变成可以放置的元素，即重写dragenter/dragover
    handleDragOver (e) {
      e.dataTransfer.dropEffect = 'move'// e.dataTransfer.dropEffect="move";//在dragenter中针对放置目标来设置!
    },
    handleDragEnter (e, item) {
      e.dataTransfer.effectAllowed = 'move'// 为需要移动的元素设置dragstart事件
      if (item === this.dragging) {
        return
      }
      const newItems = [...this.dataList]
      const src = newItems.indexOf(this.dragging)
      const dst = newItems.indexOf(item)

      newItems.splice(dst, 0, ...newItems.splice(src, 1))

      this.dataList = newItems
    },
    initCurrentRecordNum () {
      this.currentRecordNum = 0
    },
    cleanData () {
      this.dataList = []
      this.chartDataCacheGroup.clear()
    },
    initData (filter) {
      this.cleanData()
      // 内含 panelId,开始时间,结束时间
      this.filter = filter
      this.pagePanelId = this.filter.panelId
      this.getData(this.filter)
    },
    searchCharts (searchName) {
      // this.dataList = [];
      // this.dataTotalList = [];
      const chartListTmp = []
      if (searchName && searchName.trim() !== '') {
        this.dataTotalListBak.forEach((item) => {
          if (item.name.indexOf(searchName) > -1) {
            item.isLoaded = false
            item.isHide = false
            chartListTmp.push(item)
          } else {
            item.isLoaded = true
            item.isHide = true
            chartListTmp.push(item)
          }
        })
      } else {
        this.dataTotalListBak.forEach((item) => {
          item.isLoaded = false
          item.isHide = false
          chartListTmp.push(item)
        })
      }

      this.dataTotalList = [...chartListTmp]
      this.dataList = [...this.dataTotalList]

      this.$nextTick(() => {
        if (this.dataList.length > 0) {
          this.dataList.forEach((item, index) => {
            this.$refs['editChart' + item.id][0].showLoad(item)// 之后要实现
            this.setChartSize(item.span, index)// 设置该图表宽度
            if (!item.isLoaded) {
              // 获得当前显示在浏览器的图表，从后台获取数据
              const chartBox = document.getElementById('chart-' + item.id)// this.$refs['editChart'+item.id][0];
              this.handleElementInViewport(chartBox, 0, item, index, true)
            }
          })
        }
      })
    },
    pageDataList (isAdd, panelId, isSearch) {
      if (panelId !== this.pagePanelId) {
        this.currentRecordNum = 0
      }
      if (this.dataTotalList && this.dataTotalList.length > 0) {
        if (this.currentRecordNum >= this.dataTotalList.length) {
          // alert('数据加载完毕！');
        } else {
          const dataTmpList = []
          let spanSum = 0
          let line = 0// 行数
          let isDataFull = false
          const curRecNum = this.currentRecordNum
          const len = this.dataTotalList.length
          for (let i = curRecNum; !isDataFull && i < len; i++) {
            if (line < this.lineNum) {
              const item = this.dataTotalList[i]
              const span = item.span
              const sumTmp = spanSum + span
              if (sumTmp <= 12) {
                spanSum = sumTmp
              } else { // 大于12表示够1行了，
                line = line + 1
                spanSum = span
              }
              if (line < this.lineNum) {
                dataTmpList.push(item)
                this.currentRecordNum = i + 1
              } else {
                this.currentRecordNum = i
                break
              }
            } else { // 数据加载够了
              isDataFull = true
              this.currentRecordNum = i
              break
            }
          }
          if (isAdd) {
            const oldDataListLen = this.dataList.length
            const dataListTmp = [...this.dataList]
            this.dataList = [...dataListTmp.concat(dataTmpList)]
            this.$nextTick(() => {
              this.dataSetFirst(dataTmpList, oldDataListLen, isSearch)
            })
          } else {
            this.dataList = [...dataTmpList]
          }
        }
      }
    },

    // 获取panel详情数据,获取panel下所有chart列表
    getData (params) {
      this.dataList.forEach((item, index) => {
        // this.getChartData(item, index, this.filter)
        this.setChartSize(item, index)
        const chartBox = document.getElementById('chart-' + item.id)// this.$refs['editChart'+item.id][0];
        this.handleElementInViewport(chartBox, 0, item, index, true)
      })
    },
    loadChartData (scrollTop) {
      if (this.dataList.length > 0) {
        this.dataList.forEach((item, index) => {
          if (!item.isLoaded) {
            // 获得当前显示在浏览器的图表，从后台获取数据
            const chartBox = document.getElementById('chart-' + item.id)// this.$refs['editChart'+item.id][0];
            this.handleElementInViewport(chartBox, scrollTop, item, index)
          }
        })
      }
    },
    // arr: 该panel下图表list,生成该看板下所有图表
    dataSetFirst (arr, oldDataListLen, isSearch) {
      if (arr.length) {
        arr.forEach((item, index) => {
          let realIndex = index
          if (oldDataListLen) {
            realIndex += oldDataListLen
          }
          const chartType = item.type
          if (chartType !== 'url') {
            if (isSearch) {
              this.getChartDataForSearch(item, realIndex)
            } else {
              this.getChartData(item, realIndex)
            }
          } else {
            if (!isSearch && this.$refs['editChart' + item.id] && this.$refs['editChart' + item.id][0]) {
              this.$refs['editChart' + item.id][0].showLoad(item)
            }
            this.setChartSize(item, realIndex) // 设置该图表宽度
          }
        })
      }
    },
    getChartDataForSearch (chartItem, realIndex) {
      let chartData = this.chartDataCacheGroup.get(chartItem.id)
      if (chartData) {
        const filterType = chartData.filterType
        const errorMsg = chartData.errorMsg
        const tableData = chartData.tableData
        const panelId = chartData.panelId
        const filter = chartData.filter
        const legend = chartData.legend
        const series = chartData.series
        const singleStatRlt = chartData.singleStatRlt
        if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
          if (chartItem.type === 'table') { // 表格
            if (filterType === 'showFullScreen') { // 全屏查询
              this.$refs['editChart' + chartItem.id][0].setData(chartItem, tableData,
                panelId, filter, filterType, errorMsg)
            } else {
              this.$refs['editChart' + chartItem.id][0].setData(chartItem, tableData,
                panelId, filter, '', errorMsg)
            }
          } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4 || chartItem.type === 'pie') {
            if (filterType === 'showFullScreen') { // 全屏查询
              this.$refs['editChart' + chartItem.id][0].setData(chartItem, series,
                panelId, filter, legend, filterType, errorMsg)
            } else {
              this.$refs['editChart' + chartItem.id][0].setData(chartItem, series,
                panelId, filter, legend, '', errorMsg)
            }
          } else if (chartItem.type === 'singleStat') {
            if (filterType === 'showFullScreen') { // 全屏查询
              this.$refs['editChart' + chartItem.id][0].setData(chartItem, singleStatRlt,
                this.filter.panelId, this.filter, filterType, errorMsg)
            } else {
              this.$refs['editChart' + chartItem.id][0].setData(chartItem, singleStatRlt,
                this.filter.panelId, this.filter, '', errorMsg)
            }
          } else if (chartItem.type == 'text') {
            if (filterType === 'showFullScreen') { // 全屏查询
              this.$refs['editChart' + chartItem.id][0].setData(chartItem, null,
                panelId, filter, null, filterType)
            } else {
              this.$refs['editChart' + chartItem.id][0].setData(chartItem, null,
                panelId, filter, null, '')
            }
          }
        }
      } else {
        this.getChartData(chartItem, realIndex)
      }
      chartData = null
    },
    // 获取一个图表具体数据,图表信息，图表位置index
    getChartData (chartInfo, pos, filterType) {
      const chartItem = chartInfo
      if (chartItem.type === 'assetInfo') {
        if (chartItem.from != this.$CONSTANTS.fromRoute.endpoint) {
          this.$set(chartItem, 'draggable', true)
          this.$set(chartItem, 'resizable', true)
        }
        this.getAssetInfoChartData(chartItem)
        return
      }
      if (chartItem.type === 'endpointInfo') {
        this.getEndpointInfoChartData(chartItem)
        return
      }
      if (chartItem.type == 'projectInfo') {
        chartItem.name = this.$t('project.chart.projectInfo')
        this.getProjectInfoChartData(chartItem)
        return
      }
      if (chartItem.type === 'alertList') {
        this.getAlertListChartData(chartItem, filterType)
        return
      }
      if (chartItem.type === 'alertRuleInfo') {
        this.getAlertRuleChartData(chartItem)
        return
      }

      if (chartItem.type == 'text') {
        if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
          if (filterType === 'showFullScreen') { // 全屏查询
            this.$refs['editChart' + chartItem.id][0].setData(chartItem, null,
              this.filter.panelId, null, filterType)
          } else {
            this.$refs['editChart' + chartItem.id][0].setData(chartItem, null,
              this.filter.panelId, null, '')
          }
        }
        return
      }

      if (this.isModel) {
        this.modelStaticData(chartInfo, filterType)
      } else {
        // 没有数据的设置提示信息暂无数据-针对每一个图
        const len = chartItem.elements ? chartItem.elements.length : 0
        if (len === 0) {
          this.$nextTick(() => {
            if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
              this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId, this.filter)// ????怎么设置的无数据？？
            }
          })
        } else {
          let startTime = ''
          let endTime = ''
          if (filterType === 'refresh') { // 刷新
            const now = new Date(bus.computeTimezone(new Date().getTime()))
            const origin = new Date(this.filter.end_time)
            const numInterval = now.getTime() - origin.getTime()
            if (numInterval >= 60000) { // 大于1分钟，则start、end均往后移numInterval，否则时间不变
              startTime = this.getNewTime(this.filter.start_time, numInterval)
              endTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss')
            } else {
              startTime = this.filter.start_time
              endTime = this.filter.end_time
            }
          } else if (filterType === 'showFullScreen') { // 全屏时间查询
            startTime = this.filter.start_time
            endTime = this.filter.end_time
            // this.$parent.refreshTime(startTime,endTime);全屏查询，不更新panel列表的时间条件
          } else {
            startTime = this.filter.start_time
            endTime = this.filter.end_time
          }

          const step = bus.getStep(startTime, endTime)
          this.$nextTick(() => {
            const axiosArr = chartItem.elements.map((ele) => {
              const filterItem = ele
              let query = filterItem.expression
              if ((chartInfo.type === 'line' || chartInfo.type === 'bar' || chartInfo.type === 'stackArea' || chartInfo.type === 'table') && chartInfo.param) { // 如果是这三个 默认给null
                chartInfo.param.nullType = chartInfo.param.nullType || 'null'
                query += '&nullType=' + chartInfo.param.nullType
              }
              // if(chartInfo.type === 'table'&&chartInfo.param&&chartInfo.param.last == 1){
              //   return this.$get('/prom/api/v1/query_range?query=' + query + "&start=" + this.$stringTimeParseToUnix(endTime) + "&end=" + this.$stringTimeParseToUnix(endTime) + '&step=' + step);
              // }

              if (this.from === fromRoute.chartTemp) {
                return new Promise(resolve => resolve(chartTempData))
              }
              return this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=' + step)
            })
            // 一个图表的所有element单独获取数据
            axios.all(axiosArr).then((res) => {
              if (res.length > 0) {
                const series = []
                let singleStatRlt = ''
                const legend = []
                const tableData = []
                /* let sumData = {
                    name: 'sum',
                    data: [],
                    visible: true,
                    threshold: null,
                  }; */
                let errorMsg = ''
                let pieSeries
                if (chartInfo.type === 'pie') {
                  pieSeries = {
                    type: 'pie',
                    radius: '100%',
                    center: ['50%', '50%'],
                    top: '20%',
                    bottom: '20%',
                    // roseType: 'radius',
                    minAngle: 10,
                    itemStyle: {
                      borderRadius: 5,
                      borderColor: '#fff',
                      borderWidth: 1
                    },
                    label: {
                      show: false
                    },
                    emphasis: {
                      label: {
                        show: false
                      }
                    },
                    data: []
                  }
                }
                if (chartInfo.type === 'bar' && chartInfo.param.statistics && chartInfo.param.statistics !== 'null') {
                  pieSeries = {
                    type: 'bar',
                    // roseType: 'radius',
                    itemStyle: {
                      borderRadius: 5,
                      borderColor: '#fff',
                      borderWidth: 1
                    },
                    label: {
                      show: false
                    },
                    emphasis: {
                      label: {
                        show: false
                      }
                    },
                    data: []
                  }
                }
                res.forEach((response, innerPos) => {
                  if (response.status === 'success') {
                    errorMsg = ''
                    if (response.data.result) {
                      // 循环处理每个elements下获取的数据列
                      if (chartItem.type === 'singleStat') {
                        if (response.data.result.length === 1) {
                          const statistics = chartItem.param.statistics || 'null'
                          if (response.data.result[0].values) {
                            singleStatRlt = bus.getSingleStatRlt(statistics, response.data.result[0].values)
                          }
                        } else if (response.data.result.length > 1) {
                          singleStatRlt = this.$t('dashboard.panel.singleStatErrorTip')
                        }
                      } else {
                        response.data.result.forEach((queryItem, resIndex) => {
                          let seriesItem = {
                            theData: {
                              name: '',
                              symbol: 'emptyCircle', // 去掉点
                              symbolSize: [2, 2],
                              smooth: 0.2, // 曲线变平滑
                              showSymbol: false,
                              data: [],
                              lineStyle: {
                                width: 1,
                                opacity: 0.9
                              },
                              animation: false,
                              type: chartInfo.type
                            },
                            metric_name: ''
                          }

                          if (chartInfo.type === 'stackArea') {
                            seriesItem.theData.type = 'line'
                            seriesItem.theData.stack = chartInfo.name
                            seriesItem.theData.areaStyle = { opacity: 0.3 }
                          }
                          if ((chartInfo.type === 'line' || chartInfo.type === 'stackArea' || chartInfo.type === 'bar') && chartInfo.param && chartInfo.param.threshold) {
                            seriesItem.theData.markLine = {
                              silent: true,
                              symbol: ['circle', 'circle'],
                              label: {
                                distance: this.computeDistance(chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(chartInfo.param.threshold)),
                                formatter (params) {
                                  return chartDataFormat.getUnit(chartInfo.unit ? chartInfo.unit : 2).compute(params.value)
                                }
                              },
                              lineStyle: {
                                color: '#d64f40',
                                width: 2,
                                type: 'dotted'
                              },
                              data: [{
                                yAxis: Number(chartInfo.param.threshold)
                              }]
                            }
                          }
                          // 图表中每条线的名字,后半部分
                          let host = ''// up,
                          if (queryItem.metric.__name__) {
                            host = `${queryItem.metric.__name__}{`// up,
                          }
                          const tagsArr = Object.keys(queryItem.metric)// ["__name__","asset","idc","instance","job","module","project"]
                          // 设置时间-数据格式对
                          let tempArr = []
                          let dpsArr = []
                          tempArr = queryItem.values
                          dpsArr = Object.entries(queryItem.values)// [ ["0",[1577959830.781,"0"]], ["1",[1577959845.781,"0"]] ]
                          dpsArr = dpsArr.map(item => {
                            return [item[0], [item[1][0], Number(item[1][1])]]
                          })
                          // 判断是否有数据, && tagsArr.length > 0
                          if (dpsArr.length > 0 && this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
                            tagsArr.forEach((tag, i) => {
                              if (tag !== '__name__') {
                                host += `${tag}="${queryItem.metric[tag]}",`
                              }
                            })
                            if (host.endsWith(',')) {
                              host = host.substr(0, host.length - 1)
                            }
                            if (queryItem.metric.__name__) {
                              host += '}'
                            }
                            if (!host || host === '') {
                              host = chartItem.elements[innerPos].expression
                            }
                            // 处理legend别名
                            let alias = this.$refs['editChart' + chartItem.id][0].dealLegendAlias(host, chartItem.elements[innerPos].legend)
                            if (!alias || alias === '') {
                              alias = host
                            }
                            legend.push({ name: host + '-' + chartItem.elements[innerPos].id + '-' + resIndex, alias: alias })
                            // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c

                            seriesItem.theData.name = host + '-' + chartItem.elements[innerPos].id + '-' + resIndex
                            // alert(seriesItem.theData.name);
                            seriesItem.metric_name = seriesItem.theData.name
                            // 将秒改为毫秒
                            // alert('table=='+JSON.stringify(queryItem))
                            seriesItem.theData.data = tempArr.map((dpsItem, dpsIndex) => {
                              /* 曲线汇总暂不需要
                                if (sumData.data[dpsIndex]) {
                                  const sumNum = sumData.data[dpsIndex][1] || 0;
                                  sumData.data[dpsIndex][1] = sumNum + dpsItem[1];
                                } else {
                                  sumData.data[dpsIndex] = [dpsItem[0] * 1000, dpsItem[1]];
                                }
                                */
                              // let t_date = new Date(dpsItem[0] * 1000);
                              // let timeTmp = bus.timeFormate(t_date, 'yyyy-MM-dd hh:mm:ss');
                              tableData.push({ // 表格数据
                                // label: host.slice(host.indexOf('{') + 1,host.indexOf('}')),//label
                                // metric: queryItem.metric.__name__?queryItem.metric.__name__:'',//metric列
                                element: { element: host, alias: alias },
                                // time: timeTmp,//采集时间
                                // value: dpsItem[1],//数值
                                data: [dpsItem[0] * 1000, dpsItem[1]]
                              })
                              return [dpsItem[0] * 1000, dpsItem[1]]
                            })
                            if (chartInfo.type === 'pie') {
                              pieSeries.data.push({ value: bus.getSingleStatRlt(chartInfo.param.statistics, seriesItem.theData.data), name: host + '-' + chartItem.elements[innerPos].id + '-' + resIndex })
                            } else if (chartInfo.type === 'bar' && chartInfo.param.statistics && chartInfo.param.statistics !== 'null') {
                              pieSeries.data.push({ value: bus.getSingleStatRlt(chartInfo.param.statistics, seriesItem.theData.data), name: host + '-' + chartItem.elements[innerPos].id + '-' + resIndex })
                            } else {
                              series.push(seriesItem.theData)
                              seriesItem = null
                            }
                          } else if (chartItem.elements && chartItem.elements[innerPos]) {
                            // 无数据提示
                            /*
                              const currentInfo = chartItem.elements[innerPos];
                              const errorMsg = `图表 ${chartItem.name} 中 ${currentInfo.metric},${currentInfo.tags} 无数据`;
                              this.$message.warning({
                                duration: 15,
                                content: errorMsg,
                                closable: true,
                              });
                              */
                          }
                        })
                      }
                    }
                  } else {
                    if (response.msg) {
                      // this.$message.error(response.msg);
                      errorMsg = response.msg
                    } else if (response.error) {
                      // this.$message.error(response.error);
                      errorMsg = response.error
                    } else {
                      // this.$message.error(response);
                      errorMsg = response
                    }
                  }
                })
                if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
                  if (chartInfo.type === 'pie') {
                    series.push(pieSeries)
                  }
                  if (chartInfo.type === 'bar' && chartInfo.param.statistics && chartInfo.param.statistics !== 'null') {
                    series.push(pieSeries)
                  }
                  const chartData = {
                    chartItem: chartItem,
                    series: series,
                    singleStatRlt: singleStatRlt,
                    legend: legend,
                    tableData: tableData,
                    panelId: this.filter.panelId,
                    filter: this.filter,
                    filterType: filterType,
                    errorMsg: errorMsg
                  }
                  this.chartDataCacheGroup.set(chartInfo.id, chartData)
                  if (chartItem.type === 'table') { // 表格
                    if (filterType === 'showFullScreen') { // 全屏查询
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, tableData,
                        this.filter.panelId, this.filter, filterType, errorMsg)
                    } else {
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, tableData,
                        this.filter.panelId, this.filter, '', errorMsg)
                    }
                  } else if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 'stackArea' || chartItem.type === 4 || chartItem.type == 'pie') {
                    if (series.length && chartItem.type === 4) { // 曲线汇总
                      // series.push(sumData);//后续需要
                    }
                    if (filterType === 'showFullScreen') { // 全屏查询
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, series,
                        this.filter.panelId, this.filter, legend, filterType, errorMsg)
                    } else {
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, series,
                        this.filter.panelId, this.filter, legend, '', errorMsg)
                    }
                  } else if (chartItem.type === 'singleStat') {
                    if (filterType === 'showFullScreen') { // 全屏查询
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, singleStatRlt,
                        this.filter.panelId, this.filter, filterType, errorMsg)
                    } else {
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, singleStatRlt,
                        this.filter.panelId, this.filter, '', errorMsg)
                    }
                  }
                }
              } else {
                const type = chartItem.type
                if (this.$refs['editChart' + chartItem.id] && this.$refs['editChart' + chartItem.id].length > 0) {
                  if (type === 'table') {
                    if (filterType === 'showFullScreen') { // table的全屏查询
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                        this.filter, filterType)
                    } else {
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                        this.filter)
                    }
                  } else if (type === 'line' || type === 'bar' || type === 'stackArea' || chartItem.type === 4 || chartItem.type === 'pie') {
                    if (filterType === 'showFullScreen') { // table的全屏查询
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                        this.filter, filterType)
                    } else {
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, [], this.filter.panelId,
                        this.filter)
                    }
                  } else if (chartItem.type === 'singleStat') {
                    if (filterType === 'showFullScreen') { // 全屏查询
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, '',
                        this.filter.panelId, this.filter, filterType)
                    } else {
                      this.$refs['editChart' + chartItem.id][0].setData(chartItem, '',
                        this.filter.panelId, this.filter)
                    }
                  }
                }
              }
            }).catch((error) => {
              if (error) {
                this.$message.error(error.toString())
                console.error(error)
              }
            })
          })
        }
      }
    },
    computeDistance (str) {
      const span = document.querySelector('.temp-dom')
      if (span) {
        span.textContent = str
        const txtWidth = parseFloat(window.getComputedStyle(span).width)
        return Number('-' + (txtWidth + 5))
      }
    },
    modelStaticData (chartInfo, filterType) {
      const series = []
      const legend = []
      const tableData = []
      const singleStatRlt = 999
      if (chartInfo.type === 'singleStat') {
        // const statistics = chartInfo.param.statistics
      } else {
        const seriesItem = {
          theData: {
            name: '',
            symbol: 'emptyCircle', // 去掉点
            symbolSize: [2, 2],
            smooth: 0.2, // 曲线变平滑
            showSymbol: false,
            data: [],
            lineStyle: {
              width: 1,
              opacity: 0.9
            },
            type: chartInfo.type
          },
          // visible: true,
          // threshold: null,
          metric_name: ''
        }
        if (chartInfo.type === 'stackArea') {
          seriesItem.theData.type = 'line'
          seriesItem.theData.stack = chartInfo.name
          seriesItem.theData.areaStyle = { opacity: 0.3 }
        }
        // 图表中每条线的名字,后半部分
        let host = 'host'// up,
        const queryItem = { metric: { item1: 'item1', item2: 'item2', item3: 'item3' }, values: [] }
        const tagsArr = Object.keys(queryItem.metric)// ["__name__","asset","idc","instance","job","module","project"]
        // 设置时间-数据格式对
        const tempArr = []
        const dpsArr = []
        const timeStamp = Math.floor(new Date().getTime() / 1000)
        for (let i = 0; i < 20; i++) {
          tempArr.push([timeStamp - (20 - i) * 15, Math.floor(Math.random() * 10) + ''])
          queryItem.values.push(tempArr[i])
          dpsArr.push([i + '', tempArr[i]])
        }
        // 判断是否有数据, && tagsArr.length > 0
        if (dpsArr.length > 0 && this.$refs['editChart' + chartInfo.id] && this.$refs['editChart' + chartInfo.id].length > 0) {
          tagsArr.forEach((tag, i) => {
            if (tag !== '__name__') {
              host += `${tag}="${queryItem.metric[tag]}",`
            }
          })
          if (queryItem.metric.__name__) {
            host += '}'
          }
          // 处理legend别名
          let alias = this.$refs['editChart' + chartInfo.id][0].dealLegendAlias(host, chartInfo.elements[0].legend)
          if (!alias || alias === '') {
            alias = host
          }
          legend.push({ name: host, alias: alias })
          // 图表中每条线的名字,去掉最后的逗号与空格:metric名称,  标签1=a,标签2=c
          seriesItem.theData.name = host
          // alert(seriesItem.theData.name);
          seriesItem.metric_name = seriesItem.theData.name
          // 将秒改为毫秒
          // alert('table=='+JSON.stringify(queryItem))
          seriesItem.theData.data = tempArr.map((dpsItem, dpsIndex) => {
            const tData = new Date(dpsItem[0] * 1000)
            const timeTmp = bus.timeFormate(tData, 'yyyy-MM-dd hh:mm:ss')
            tableData.push({ // 表格数据
              // label: host.slice(host.indexOf('{') + 1,host.indexOf('}')),//label
              // metric: queryItem.metric.__name__?queryItem.metric.__name__:'',//metric列
              element: { element: host, alias: alias },
              time: timeTmp, // 采集时间
              value: dpsItem[1]// 数值
            })
            return [dpsItem[0] * 1000, dpsItem[1]]
          })
          series.push(seriesItem.theData)
        }
      }
      if (this.$refs['editChart' + chartInfo.id] && this.$refs['editChart' + chartInfo.id].length > 0) {
        const errorMsg = ''
        const chartData = {
          chartItem: chartInfo,
          series: series,
          singleStatRlt: singleStatRlt,
          legend: legend,
          tableData: tableData,
          panelId: this.filter.panelId,
          filter: this.filter,
          filterType: filterType,
          errorMsg: errorMsg
        }
        this.chartDataCacheGroup.set(chartInfo.id, chartData)
        if (chartInfo.type === 'table') { // 表格
          if (filterType === 'showFullScreen') { // 全屏查询
            this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, tableData,
              this.filter.panelId, this.filter, filterType, '')
          } else {
            this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, tableData,
              this.filter.panelId, this.filter, '', '')
          }
        } else if (chartInfo.type === 'line' || chartInfo.type === 'bar' || chartInfo.type === 'stackArea' || chartInfo.type === 4) {
          if (series.length && chartInfo.type === 4) { // 曲线汇总
            // series.push(sumData);//后续需要
          }
          if (filterType === 'showFullScreen') { // 全屏查询
            this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, series,
              this.filter.panelId, this.filter, legend, filterType, errorMsg)
          } else {
            this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, series,
              this.filter.panelId, this.filter, legend, '', errorMsg)
          }
        } else if (chartInfo.type === 'singleStat') {
          if (filterType === 'showFullScreen') { // 全屏查询
            this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, singleStatRlt,
              this.filter.panelId, this.filter, filterType, errorMsg)
          } else {
            this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, singleStatRlt,
              this.filter.panelId, this.filter, '', errorMsg)
          }
        }
      }
    },
    getEndpointInfoChartData (chartInfo) {
      const detail = []
      this.$refs['editChart' + chartInfo.id][0].showLoad()
      chartInfo.name = this.$t('project.chart.endpointInfo')

      const basicInfo = JSON.parse(JSON.stringify(this.detail))
      const basicInfoReq = new Promise((resolve, reject) => {
        const now = new Date()
        const startTime = bus.timeFormate(new Date(now).setHours(now.getHours() - 1), 'yyyy-MM-dd hh:mm:ss')
        const endTime = bus.timeFormate(now, 'yyyy-MM-dd hh:mm:ss')
        // const step = bus.getStep(startTime, endTime)
        this.$nextTick(() => {
          let query = chartInfo.elements[0].expression
          if ((chartInfo.type === 'line' || chartInfo.type === 'bar' || chartInfo.type === 'stackArea') && chartInfo.param) {
            chartInfo.param.nullType = chartInfo.param.nullType || 'null'
            query += '&nullType=' + chartInfo.param.nullType
          }
          this.$get('/prom/api/v1/query_range?query=' + query + '&start=' + this.$stringTimeParseToUnix(startTime) + '&end=' + this.$stringTimeParseToUnix(endTime) + '&step=5m').then(response => {
            if (response.status === 'success') {
              if (response.data.result) {
                const series = {
                  name: '',
                  symbol: 'emptyCircle', // 去掉点
                  symbolSize: 4,
                  smooth: 0.2, // 曲线变平滑
                  showSymbol: false,
                  data: [],
                  type: 'line',
                  lineStyle: {
                    width: 1,
                    opacity: 0.9
                  },
                  itemStyle: {
                    color (params) {
                      if (params.data[1] == '1') {
                        return '#50d050'
                      } else {
                        return '#d64f40'
                      }
                    }
                  }
                }
                response.data.result.forEach((queryItem, resInnerPos) => {
                  // 将秒改为毫秒
                  series.data = queryItem.values.map((dpsItem, dpsIndex) => {
                    return [dpsItem[0] * 1000, dpsItem[1]]
                  })
                })
                basicInfo.stateSeries = [series]
                basicInfo.state = ''
                resolve({ title: this.$t('project.chart.basicTitle'), data: basicInfo, type: 'endpointInfo' })
              }
            }
          })
        })
      })

      const endpointId = this.additionalInfo.id
      const alertMsg = new Promise((resolve, reject) => {
        this.$get('/alert/message?endpointId=' + endpointId + '&state=1&pageSize=-1').then(response => {
          if (response.code == 200) {
            const alerts = {}
            if (response.data) {
              response.data.list.forEach(t => {
                const alertRule = t.alertRule.alertName
                if (alerts[alertRule]) {
                  alerts[alertRule]++
                } else {
                  alerts[alertRule] = 1
                }
              })
            }
            resolve({ title: this.$t('overall.alert'), data: alerts })
          }
        })
      })
      Promise.all([basicInfoReq, alertMsg]).then(resolves => {
        resolves.forEach(t => detail.push(t))
        this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, detail)
      })
    },
    getAssetInfoChartData (chartInfo) {
      const vm = this
      chartInfo.name = this.$t('asset.assetInfo')
      const detail = []
      if (!this.isModel) {
        this.$refs['editChart' + chartInfo.id][0].showLoad()
        const assetId = this.additionalInfo.assetId ? this.additionalInfo.assetId : this.additionalInfo.id
        this.$get('/asset/info?id=' + assetId).then(response => {
          if (response.code == 200) {
            response.data && (function () {
              response.data.Basic && detail.push({
                title: vm.$t('project.chart.basicTitle'),
                type: 'basic',
                data: response.data.Basic
              })
              response.data.Attribute && detail.push({
                title: vm.$t('asset.featureTitle'),
                type: 'attribute',
                data: response.data.Attribute
              })
            }())
          }
          this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, detail, this.filter.panelId, this.filter)
        })
      } else {
        detail.push({
          title: vm.$t('project.chart.basicTitle'),
          type: 'basic',
          data: {
            sn: 'assetInfo Test',
            host: '192.168.40.42',
            pingStatus: 1,
            pingRtt: 80,
            cpuNum: '8',
            memery: '12GB',
            memery$_$free: '3GB'
          }
        })
        detail.push({
          title: vm.$t('asset.featureTitle'),
          type: 'feature',
          data: {
            CPU: 'Intel E500',
            Memory: '256GB',
            NetworkInterface: ['eth0', 'eth1'],
            Disk: [{
              mount: '/',
              total: '256GB',
              free: '128GB',
              usageRate: '50%'
            }]
          }
        })
        this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, detail, this.filter.panelId, this.filter)
      }
    },
    getProjectInfoChartData (chartInfo) {
      const vm = this
      const detail = []
      if (!this.isModel) {
        this.$refs['editChart' + chartInfo.id][0].showLoad(chartInfo)
        this.$get('/project/info?id=' + this.additionalInfo.id).then(response => {
          if (response.code == 200) {
            response.data && (function () {
              response.data.basic && detail.push({
                title: vm.$t('project.chart.basicTitle'),
                data: response.data.basic,
                type: 'project'
              })
              response.data.module && (function () {
                response.data.module.forEach(d => {
                  detail.push({
                    title: `${vm.$t('project.module.module')}：${d.name}`,
                    data: d,
                    type: 'module'
                  })
                })
              }())
            }())
          }
          this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, detail, this.filter.panelId, this.filter, response.msg)
        })
      } else {
        detail.push({
          title: 'system',
          data: {
            id: 1,
            name: 'system',
            remark: '描述信息',
            alertStat: [1, 2, 3]
          }
        })
        detail.push({
          title: `${this.$t('project.module.module')}：kafka`,
          data: {
            id: 1,
            name: 'kafka',
            type: 'http',
            remark: '描述信息',
            endpointStat: [3, 23],
            alertStat: [2, 3, 4]
          }
        })
        detail.push({
          title: `${this.$t('project.module.module')}：kafkakafkakafkakafkakafkakafkakafka`,
          data: {
            id: 2,
            name: 'kafkakafkakafkakafkakafkakafkakafka',
            type: 'http',
            remark: '描述信息',
            endpointStat: [3, 23],
            alertStat: [2, 0, 4]
          }
        })
        detail.push({
          title: `${this.$t('project.module.module')}：kafkakafka`,
          data: {
            id: 3,
            name: 'kafkakafka',
            type: 'snmp',
            remark: '描述信息',
            endpointStat: [3, 0],
            alertStat: [2, 3, 4]
          }
        })
        this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, detail, this.filter.panelId, this.filter)
      }
    },
    getAlertListChartData (chartInfo, filterType) {
      if (this.additionalInfo) {
        this.$set(chartInfo, 'param', { endpointId: this.additionalInfo.id })
      }
      this.$refs['editChart' + chartInfo.id][0].getAlertList(filterType)
    },
    getAlertRuleChartData (chartInfo) {
      const vm = this
      const detail = []
      const req = new Promise((resolve, reject) => {
        this.$get('alert/rule/stat?id=' + this.additionalInfo.id).then(response => {
          if (response.code == 200) {
            response.data && (function () {
              if (response.data.project && response.data.project.length > 0) {
                detail.push({ title: vm.$t('overall.entity'), data: convert(response.data.project) })
              }
              /* if (response.data.module && response.data.module.length > 0) {
                  detail.push({title: vm.$t("project.module.module"), data: convert(response.data.module)});
                }
                if (response.data.endpoint && response.data.endpoint.length > 0) {
                  detail.push({title: vm.$t("project.endpoint.endpoint"), data: convert(response.data.endpoint)});
                } */
              if (response.data.asset && response.data.asset.length > 0) {
                detail.push({ title: vm.$t('asset.asset'), data: convert(response.data.asset) })
              }
            }())
            resolve(true)
          }
        })
      })
      req.then(result => {
        this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, detail)
      })

      function convert (d) {
        const data = {}
        d.forEach(item => {
          data[item.name] = item.nums
          !data._module_ && (data._module_ = {})
          if (item.module && item.module instanceof Array && item.module.length > 0) {
            data._module_[item.name] = {}
            item.module.forEach(m => {
              data._module_[item.name][m.name] = m.nums
              !data._module_[item.name]._endpoint_ && (data._module_[item.name]._endpoint_ = {})
              if (m.endpoint && m.endpoint instanceof Array && m.endpoint.length > 0) {
                data._module_[item.name]._endpoint_[m.name] = {}
                m.endpoint.forEach(e => {
                  data._module_[item.name]._endpoint_[m.name][e.name] = e.nums
                })
              }
            })
          }
        })
        return data
      }
    },

    // 设置图表的尺寸
    setChartSize (item, index) {
      this.$nextTick(() => {
        const chartBox = document.getElementById('chart-' + item.id)
        if (chartBox) {
          chartBox.style.width = `${(item.span / 12) * 100}%`
          chartBox.style.height = `${document.getElementById('listContainer').offsetWidth / 12 * item.height}px`
        }
      })
    },
    getNewTime (time, num) {
      const date = new Date(time)
      const newDate = new Date(parseInt(date.getTime(), 10) + num)
      return bus.timeFormate(newDate, 'yyyy-MM-dd hh:mm:ss')
    },
    // 删除图表
    removeChart (chartId) { // from 区分从哪里点击的删除 1.从图表面板 2.从编辑框
      const chart = this.dataList.find(item => item.id === chartId)
      if (chart) {
        this.$emit('on-remove-group-chart', chart)
      }
    },
    // 复制图表
    duplicateChart (chartId) {
      const chart = this.dataList.find(item => item.id === chartId)
      if (chart) {
        this.$emit('on-duplicate-group-chart', chart)
      }
    },
    // 编辑图表
    editData (chartId) {
      // 获取该id下chart的相关信息
      const chart = this.dataList.find(item => item.id === chartId)
      if (chart) {
        this.$emit('on-edit-group-chart', chart)
      }
    },

    editChartForDrag (chartItem) {
      const chart = this.dataList.find(item => item.id === chartItem.id)
      chart.span = chartItem.span
      chart.height = chartItem.height
    },
    // 刷新列表中的一个图表
    refreshChart (chartId, searchTime) {
      this.dataList.forEach((item, index) => {
        if (item.id === chartId) {
          this.getChartData(item, index, 'refresh')
        }
      })
    },
    refresh () {
      this.dataList.forEach((item, index) => {
        this.getChartData(item, index, this.filter)
      })
    },
    searchData (chartId, searchTime) {
      if (searchTime) { // 全屏时间查询
        this.filter.start_time = bus.timeFormate(searchTime[0], 'yyyy-MM-dd hh:mm:ss')
        this.filter.end_time = bus.timeFormate(searchTime[1], 'yyyy-MM-dd hh:mm:ss')
      }
      this.dataList.forEach((item, index) => {
        if (item.id === chartId) {
          this.getChartData(item, index, 'showFullScreen')
        }
      })
    },
    // 懒加载，判断网页区域，加载可见区的prom数据
    handleElementInViewport (ele, scrollTop, item, index, isSearch) {
      /*
        网页被卷去的高：document.body.scrollTop
        网页正文全文高：document.body.scrollHeight
        网页可见区域高（包括边线的高）：document.body.offsetHeight；
        网页可见区域高：document.body.clientHeight
        */
      const that = this
      setTimeout(function () {
        const itemHeight = item.height
        // 1.元素距离页面顶部的距离
        const mainOffsetTop = ele.offsetTop// offsetTop: 当前元素顶部距离最近父元素顶部的距离,和有没有滚动条没有关系。单位px，只读元素。
        // 2.元素的高度
        const mainHeight = itemHeight// ele.offsetHeight;//itemHeight;
        // 3.页面滚动的距离
        const windowScrollTop = scrollTop// document.documentElement.scrollTop || document.body.scrollTop;
        // 4.浏览器可见区域的高度
        const windowHeight = (window.innerHeight || document.documentElement.clientHeight) - 50 - 42

        /*
          * 在窗口上下滚动的情况下, 一个页面元素的状态有下面3种：
          1.向上滚动超出可见区域
          2.向下滚动超出可视区域
          3.在可视区域内
          * 第一种情况   由于元素随页面向上滚动, 整个页面滚动的距离  大于 （元素距离页面顶部的距离 + 元素本身的高度 ）-> 超出
          * 第二种情况   由于元素随页面向下滚动, 整个页面滚动的距离  小于 （元素距离页面顶部的距离 - 浏览器可见区域高度 ）-> 超出
          * */
        /* console.log("___isInView____","元素距离页面顶部的距离mainOffsetTop="+mainOffsetTop)//不变
          console.log("___isInView____","元素高度mainHeight="+mainHeight)//不变
          console.log("___isInView____","scrollTop页面滚动的距离windowScrollTop="+windowScrollTop)//变
          console.log("___isInView____","浏览器可见区域高度windowHeight="+windowHeight)//不变
          console.log(item.name,(mainOffsetTop+mainHeight/3),"<",(windowScrollTop+windowHeight),((mainOffsetTop+mainHeight/3) < (windowScrollTop+windowHeight))) */
        if ((mainOffsetTop + mainHeight / 3) < (windowScrollTop + windowHeight)) {
          const chartType = item.type
          item.isLoaded = true
          if (chartType !== 'url') {
            that.getChartDataForSearch(item, index)
          } else {
            that.$refs['editChart' + item.id][0].showLoad(item)
          }
        }
      }, 500)
    },
    chartBySync (item) {
      this.$post('visual/panel/chart/syncTmpl', { ids: [item.id] }).then(res => {
        if (res.code === 200) {
          this.getData(this.filter)
          this.$message.success(this.$t('tip.syncSuccess'))
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  },
  created () {
    this.chartDataCacheGroup = new Map()
  },
  mounted () {
    this.tempDomInit()
  }

}

</script>
