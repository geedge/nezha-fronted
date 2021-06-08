<style lang="scss" scoped>
  .chartBox {
    float:left;
    padding: 0 10px 10px 0;
    position:relative;
    box-sizing: border-box;
  }
  .noData{
    text-align: center
  }
  .list-width{
    width: 100%;
    /*height: 100%;*/
    padding: 0 10px 5px 20px;
    box-sizing: border-box;
    overflow: hidden;/*避免鼠标第一次放到曲线时，x轴出现滚动条后消失*/

    /*&>div {*/
    /*  height: 100%;*/
    /*  overflow-y: auto;*/
    /*}*/
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
</style>
<template>
  <div class="list-width"  id="listContainer" ref="listContainer"><!--v-drag-->

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
               }"  >
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
                          :chart-index="index"
                          @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                          :chart-data="item"></line-chart-block>

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
                     :chart-index="index"></chart-single-stat>

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
                      :chart-index="index"></chart-table>

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
                     :chart-index="index"></chart-url>

        <chart-detail  v-if="item.type === 'assetInfo' || item.type === 'projectInfo' || item.type === 'endpointInfo' || item.type === 'alertRuleInfo'" :key="'inner' + item.id" :ref="'editChart'+item.id"
                          :from="from" :panel-id="filter.panelId"
                          :chart-index="index"
                          @on-refresh-data="refreshChart"
                       @sync="()=>{chartBySync(item)}"
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
                    :chart-index="index"
        ></text-chart>

        <chart-alert-list :ref="'editChart'+item.id" :chartData="item"
                          :from="from"
                          :chart-index="index"
                          v-if="item.type  === 'alertList'"
                          :editChartId="'editChartId' + item.id"
                          :is-lock="panelLock"
                          :chart-info="item"
                          @on-refresh-data="refreshChart"
                          @on-search-data="searchData"
                          @on-remove-chart-block="removeChart"
                          @on-duplicate-chart-block="duplicateChart"
                          @on-drag-chart="editChartForDrag"
                          @on-edit-chart-block="editData"
                          :panel-id="filter.panelId"
                          @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                          @sync="()=>{chartBySync(item)}"
        ></chart-alert-list>

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
                            :chart-index="index"></chart-pie>
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
                    :chart-index="index"></chartBarStatis>
        <chart-group  :from="from" :key="'inner' + item.id" :ref="'editChart'+item.id" v-if="item.type === 'group'"
                      @on-refresh-data="refreshChart"
                      @on-search-data="searchData"
                      @on-remove-chart-block="removeChart"
                      @on-duplicate-chart-block="duplicateChart"
                      @on-drag-chart="editChartForDrag"
                      :is-lock="panelLock"
                      :panelLock="panelLock"
                      :filter="filter"
                      @on-edit-chart-block="editData"
                       @sync="()=>{chartBySync(item)}"
                      @on-edit-group-chart="editDataGroup"
                      @on-remove-group-chart="removeChartGroup"
                      @on-duplicate-group-chart="duplicateChartGroup"
                      @on-add-group-item-chart="addGroupItem"
                      @moveGroupItem="moveGroupItem"
                      :panel-id="filter.panelId"
                      :chart-data="item"
                      :dataList='dataList'
                      @dropmenu-change="(show) => {dropmenuChange(item.id, show)}"
                      :chart-index="index"></chart-group>
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
import chartPie from './chart-pie'
import chartBarStatis from './chart-bar-statistics'
import chartGroup from './chart-group'
import { fromRoute } from '@/components/common/js/constants'
import chartTempData from '@/components/charts/chartTempData'
import { chartResizeTool } from '@/components/common/js/tools'
export default {
  name: 'chartList',
  props: {
    fromRoute,
    isModel: { type: Boolean, default: false },
    draggable: { type: Boolean, default: true },
    from: { type: String },
    obj: Object,
    panelLock: { type: Boolean, default: false },
    hasGroup: { type: Boolean, default: true },
    panelDataList: Array
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
    chartGroup,
    chartBarStatis
    // visNetwork,
  },
  data () {
    return {
      chartResizeTool: chartResizeTool,
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
      stepWidth: null,

      tempDom: { height: '', width: '' }
      // showShadow:false,
    }
  },
  watch: {
    panelDataList (n) {
      this.getData(this.filter)
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
        const newWeights = []
        let i = 0
        this.dataList.forEach((item, index) => {
          item.weight = index
          newWeights.push({ id: item.id, weight: index })
          if (item.type === 'group' && item.children) {
            item.children.forEach(chart => {
              i++
              newWeights.push({ id: chart.id, groupId: item.id, weight: this.dataList.length + i })
            })
          } else {
            item.children = []
          }
        })
        const panelId = this.pagePanelId
        this.$put('/visual/panel/chart/weights', { panelId, charts: newWeights })
      }
    },
    moveGroupItem (group) {
      const newWeights = []
      let i = 0
      this.dataList.forEach((item, index) => {
        item.weight = index
        newWeights.push({ id: item.id, weight: index })
        if (item.type === 'group' && group.groupId !== item.id && item.children) {
          item.children.forEach(chart => {
            i++
            newWeights.push({ id: chart.id, groupId: item.id, weight: this.dataList.length + i })
          })
        } else if (item.type === 'group' && group.groupId == item.id && item.children) {
          group.children.forEach(chart => {
            i++
            newWeights.push({ id: chart.id, groupId: item.id, weight: this.dataList.length + i })
          })
        } else {
          item.children = []
        }
      })
      const panelId = this.pagePanelId
      this.$put('/visual/panel/chart/weights', { panelId, charts: newWeights })
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
            if (item.type === 'group' && item.children) {
              item.children.forEach(groupItem => {
                if (groupItem.name.indexOf(searchName) > -1) {
                  item.isLoaded = false
                  item.isHide = false
                  chartListTmp.push(item)
                }
              })
            } else {
              chartListTmp.push(item)
            }
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
            if (item.type === 'group') {
              this.$refs['editChart' + item.id][0].$refs.listGroup.searchCharts(searchName)
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
      const param = {
        panelId: params.panelId,
        query: params.query,
        from: params.from
      }
      // alert-rule单独处理
      if (param.from === fromRoute.alertRule) {
        this.dataList = []
        this.dataList.push({
          id: -10,
          panelId: 0,
          title: this.$t('alert.config.chart.affectEntity'),
          span: 4,
          height: 3,
          type: 'alertRuleInfo',
          prev: 0,
          next: -9,
          buildIn: 1,
          draggable: false,
          resizable: false,
          editable: false
        })
        this.dataList.push({
          id: -9,
          panelId: 0,
          title: this.$t('alert.config.chart.alertNumTrend'),
          span: 8,
          height: 6,
          type: 'line',
          prev: -10,
          next: -1,
          unit: 1,
          buildIn: 1,
          elements: [{
            id: '',
            expression: `nz_alert_nums{id="${this.obj.id}"}`,
            type: ''
          }]
        })
        this.$set(this.filter, 'start_time', bus.timeFormate(new Date().getTime() - 24 * 60 * 60 * 1000, 'yyyy-MM-dd hh:mm:ss'))
        this.$set(this.filter, 'end_time', bus.timeFormate(new Date().getTime(), 'yyyy-MM-dd hh:mm:ss'))
        this.$nextTick(() => {
          this.dataList.forEach((item, index) => {
            this.$set(item, 'from', params.from)
            this.setChartSize(item, index)// 设置该图表宽度
            const chartBox = document.getElementById('chart-' + item.id)
            this.handleElementInViewport(chartBox, 0, item, index)
            if (item.type === 'group') {
              this.$refs['editChart' + item.id][0].$refs.listGroup.getData(params)
            }
          })
        })
        return
      }
      if (param.from == fromRoute.chartTemp) { // 模板列表
        if (this.panelDataList[0] && this.panelDataList[0].children) {
          this.panelDataList[0].children.forEach((item1, i) => {
            item1.chartIndex = i
          })
        }
        this.dataList = this.panelDataList
        this.$nextTick(() => {
          this.dataList.forEach((item, index) => {
            this.$set(item, 'from', params.from)
            this.setChartSize(item, index)// 设置该图表宽度
            const chartBox = document.getElementById('chart-' + item.id)
            this.handleElementInViewport(chartBox, 0, item, index)
            if (item.type === 'group') {
              this.$refs['editChart' + item.id][0].$refs.listGroup.getData(params)
            }
          })
        })
        return
      }
      if (!param.query) delete param.query
      // 根据panelId获得panel下的所有图表
      // const groupId = true ? '&groupId=0' : ''
      this.$get('visual/panel/chart?panelId=' + params.panelId + '&groupId=0' + '&pageSize=-1').then(response => {
        if (response.code === 200) {
          response.data.list.forEach((item, index) => {
            item.isLoaded = false
          })
          // chart数据存在dataTotalListBak中
          if (response.data.list) {
            this.dataTotalListBak = response.data.list
          } else {
            this.dataTotalListBak = response.data
          }

          let chartListTmp = []
          // 查询条件带name
          if (this.filter.searchName) {
            const searchTitleStr = this.filter.searchName
            this.dataTotalListBak.forEach((item) => {
              if (item.name.indexOf(searchTitleStr) > -1) {
                chartListTmp.push(item)
              }
            })
          } else {
            chartListTmp = this.dataTotalListBak
          }
          this.dataTotalList = [...chartListTmp]

          this.dataList = [...this.dataTotalList]
          let addGroupIndex = 0
          this.dataList.forEach((item) => {
            if (item.type === 'group' && item.children) {
              item.children.forEach(chart => {
                addGroupIndex++
                chart.chartIndex = this.dataList.length + addGroupIndex
              })
            } else {
              item.children = []
            }
          })
          // this.showShadow=false;
          this.$nextTick(() => {
            if (this.dataList.length > 0) {
              this.dataList.forEach((item, index) => {
                this.setChartSize(item, index)// 设置该图表宽度
                this.$set(item, 'from', params.from)
                this.$set(item, 'draggable', true)
                this.$set(item, 'resizable', true)
                this.$set(item, 'editable', true)
                if (!item.isLoaded) {
                  // 获得当前显示在浏览器的图表，从后台获取数据
                  const chartBox = document.getElementById('chart-' + item.id)
                  this.handleElementInViewport(chartBox, 0, item, index)
                }
                if (item.type === 'group') {
                  this.$refs['editChart' + item.id][0].$refs.listGroup.getData(params)
                }
              })
            }
          })
        }
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
          if (item.type === 'group') {
            this.$refs['editChart' + item.id][0].$refs.listGroup.loadChartData(scrollTop)
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
          } else if (chartItem.type === 'text') {
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
      if (chartItem.type === 'group') {
        this.$refs['editChart' + chartItem.id][0].setData(chartItem)
        return
      }
      if (chartItem.type === 'assetInfo') {
        if (chartItem.from !== fromRoute.endpoint) {
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
      if (chartItem.type === 'projectInfo') {
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
                return chartTempData
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
                              const errorMsg = `图表 ${chartItem.title} 中 ${currentInfo.metric},${currentInfo.tags} 无数据`;
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
    addGroupItem (id) {
      this.$emit('on-add-group-item-chart', id)
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
      chartInfo.from = fromRoute.endpoint
      const basicInfo = JSON.parse(JSON.stringify(this.obj))
      detail.push(
        {
          data: {
            id: basicInfo.id,
            name: basicInfo.name,
            type: basicInfo.module.type,
            project: basicInfo.project.name,
            module: basicInfo.module.name,
            alerts: basicInfo.alertNum,
            state: basicInfo.state === 1 ? 'up' : 'down'
          },
          type: 'endpointInfo',
          title: this.$t('project.chart.basicTitle')
        }
      )
      this.$refs['editChart' + chartInfo.id][0].setData(chartInfo, detail)
    },
    getAssetInfoChartData (chartInfo) {
      const vm = this
      chartInfo.name = this.$t('asset.assetInfo')
      const detail = []
      if (!this.isModel) {
        const assetId = this.obj.assetId ? this.obj.assetId : this.obj.id
        const arr = []
        arr.push(this.$get(`/asset/asset/${assetId}`))
        arr.push(this.$get(`/asset/asset/feature/${assetId}`))
        this.$refs['editChart' + chartInfo.id][0].showLoad()

        // this.$get('/asset/info?id=' + assetId).then(response => {
        //   if (response.code == 200) {
        //     response.data && (function () {
        //       response.data.Basic && detail.push({
        //         title: vm.$t('project.chart.basicTitle'),
        //         type: 'basic',
        //         data: response.data.Basic
        //       })
        //       response.data.Attribute && detail.push({
        //         title: vm.$t('asset.featureTitle'),
        //         type: 'attribute',
        //         data: response.data.Attribute
        //       })
        //     }())
        //   }
        // })
        Promise.all(arr).then(res => {
          if (res) {
            const basic = res[0].data
            // basic.cabinet = basic.cabinet ? basic.cabinet.name : '-'
            const obj = {
              id: basic.id,
              host: basic.pingInfo ? basic.pingInfo.host : '-',
              assetType: basic.type ? basic.type.name : '-',
              state: basic.state ? basic.state.name : '-',
              pingRtt: basic.pingInfo ? basic.pingInfo.rtt : '',
              dataCenter: basic.dc ? basic.dc.name : '-',
              cabinet: basic.cabinet ? basic.cabinet.name : '-',
              alert: basic.alertNum,
              endpoint: basic.endpointNum,
              purchaseDate: basic.purchaseDate,
              vendor: basic.brand ? basic.brand.name : '-',
              model: basic.model ? basic.model.name : '-',
              sn: basic.sn,
              tags: basic.fields,
              pingStatus: basic.pingInfo ? basic.pingInfo.status : '-',
              cabinetStart: basic.cabinetStart,
              cabinetEnd: basic.cabinetEnd,
              pingLastReply: basic.pingInfo ? basic.pingInfo.lastUpdate : ''
              // principal: basic.dc ? basic.dc.principal : '-',
              // tel: basic.tel,
            }
            basic && detail.push({
              title: vm.$t('project.chart.basicTitle'),
              type: 'basic',
              data: obj
            })
            res[1] && detail.push({
              title: vm.$t('asset.featureTitle'),
              type: 'attribute',
              data: res[1].data
            })
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
        this.$get('/project/info?id=' + this.obj.id).then(response => {
          if (response.code === 200) {
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
      if (this.obj) {
        this.$set(chartInfo, 'param', { endpointId: this.obj.id })
      }
      this.$refs['editChart' + chartInfo.id][0].getAlertList(null, null, chartInfo)
    },
    getAlertRuleChartData (chartInfo) {
      const vm = this
      const detail = []
      const req = new Promise((resolve, reject) => {
        this.$get('alert/rule/stat?id=' + this.obj.id).then(response => {
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
          chartBox.style.height = `${Math.floor(this.stepWidth * item.height)}px`
          if (item.type === 'group') {
            chartBox.style.height = 'auto'
          }
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
        this.$emit('on-remove-chart', chart)
      }
    },
    // 删除图表
    removeChartGroup (chart) { // from 区分从哪里点击的删除 1.从图表面板 2.从编辑框
      if (chart) {
        this.$emit('on-remove-chart', chart)
      }
    },
    // 复制图表
    duplicateChart (chartId, duplicateChartBack) {
      const chart = this.dataList.find(item => {
        return item.id === chartId
      })
      if (chart) {
        const copyChart = { ...chart }
        delete copyChart.id
        delete copyChart.pid
        delete copyChart.varId
        delete copyChart.varType
        copyChart.name = 'Copy_' + copyChart.name
        this.$emit('on-edit-chart', copyChart)
      }
    },
    duplicateChartGroup (chart) {
      if (chart) {
        const copyChart = { ...chart }
        delete copyChart.id
        delete copyChart.pid
        delete copyChart.varId
        delete copyChart.varType
        copyChart.name = 'Copy_' + copyChart.name
        this.$emit('on-edit-chart', copyChart)
      }
    },
    // 编辑图表
    editData (chartId) {
      // 获取该id下chart的相关信息
      const chart = this.dataList.find(item => {
        return item.id === chartId
      })
      if (chart) {
        this.$emit('on-edit-chart', chart)
      }
    },
    // 编辑 group下的图表
    editDataGroup (chart) {
      if (chart) {
        this.$emit('on-edit-chart', chart)
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
        const mainOffsetTop = ele.offsetTop // offsetTop: 当前元素顶部距离最近父元素顶部的距离,和有没有滚动条没有关系。单位px，只读元素。
        // 2.元素的高度
        const mainHeight = itemHeight // ele.offsetHeight;//itemHeight;
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
          console.log(item.title,(mainOffsetTop+mainHeight/3),"<",(windowScrollTop+windowHeight),((mainOffsetTop+mainHeight/3) < (windowScrollTop+windowHeight))) */
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
    resize () {
      this.init()
      this.$nextTick(() => {
        this.$parent.$parent.dateChange()
      })
    },
    init () {
      const dom = document.getElementById('listContainer')
      if (dom) {
        this.stepWidth = this.chartResizeTool.stepWidth(dom.offsetWidth - 14)
        this.tempDomInit()
      }
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
    this.init()
    window.addEventListener('resize', () => this.resize(), false)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resize, false)
  }
}

</script>
