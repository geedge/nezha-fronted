<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-table" ref="resizeBox">
      <div class="chart-table" :id="'chartTableDiv'+chartIndex" @mouseenter="caretShow=true"
           @mouseleave="caretShow=false">
        <loading :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
          <el-popover
            v-if="isError"
            :close-delay=10
            placement="top-start"
            trigger="hover"
            popper-class="chart-error-popper">
            <div>{{errorContent}}</div>
            <span slot="reference" style="" class="panel-info-corner panel-info-corner--error">
                <i class="nz-icon nz-icon-warning fa"></i>
                <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos" :class="{'move-able':!isLock}">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title">
<!--              <span class="chart-title-text">{{chartData.name}}</span>-->
              <span class="chart-title-text" :title="chartData.name" v-on:mouseover="changeActive()" v-on:mouseout="removeActive()">{{chartData.name}}</span>
              <transition  name="el-fade-in-linear">
                <span v-show="chartDataList" class="chart-title-pit" >{{chartData.name}}</span>
              </transition>
              <span class="chart-title-icon"  :class="{'visible':caretShow,'hidden':!caretShow}">
                <span v-if="chartData.remark">
                  <el-tooltip :content="chartData.remark" placement="top" effect="light">
                     <i class="nz-icon nz-icon-info-normal"></i>
                  </el-tooltip>
                </span>
                <span  v-has="'main_edit'" :title="$t('dashboard.refresh')" class="" @click="refreshChart">
                  <i class="nz-icon nz-icon-replay"></i>
                </span>
                 <span  @click="showAllScreen"  v-if="from !== 'chartTemp'" class="" :title="$t('dashboard.screen')">
                  <i class="nz-icon nz-icon-maxview"></i>
                 </span>
                <span  :title="$t('overall.more')"><i class="el-icon-more" @click.stop="dropdownMenuShow=!dropdownMenuShow"></i></span>
              </span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="" >
              <li  @click="editChart" class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 16px;"></i><span>{{$t('overall.edit')}}</span></li>
              <li  v-has="'main_delete'" class="el-dropdown-menu__item" @click="removeChart">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('overall.delete')}}</li>
              <li  v-has="'main_add'" class="el-dropdown-menu__item" @click="duplicate">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('overall.duplicate')}}</li>
              <li  v-has="'main_edit'"  v-if="from !== 'chartTemp'&&chartData.pid" class="el-dropdown-menu__item" @click="$emit('sync')">
                <i class="nz-icon nz-icon-sync" style="font-size: 16px;"></i>{{$t('overall.syncChart')}}</li>
            </ul>
          </el-dropdown>
        </div>
        <div class="mt-10 table-container" v-cloak v-show="firstShow">
          <el-table :id="'tableContainer'+chartIndex" ref="tableContainer" :height="tableHeight" class="chart-table"
                    :data="seriesItem" border tooltip-effect="light" v-cloak
                    @sort-change="tableDataSort" >
            <el-table-column :label="$t('overall.time')" min-width="100" prop="time"
                             :sort-orders="['ascending', 'descending']" :sortable="'custom'"></el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="element"
                             :label="$t('dashboard.dashboard.chartForm.element')" min-width="260"
                             :sort-orders="['ascending', 'descending']" :sortable="'custom'">
              <template slot-scope="scope">
                {{ scope.row.element.alias?scope.row.element.alias:scope.row.element.element}}
              </template>
            </el-table-column>
            <el-table-column :label="$t('overall.value')" class-name="custom-value" min-width="90" prop="value"
                             :resizable="false" :sort-orders="['ascending', 'descending']" :sortable="'custom'">
              <template slot-scope="scope">
                <div :style="{color:scope.row.mapping?scope.row.mapping.color.text:'#000',background:scope.row.mapping?scope.row.mapping.color.bac:'#fff'}" >
                  <span>{{ scope.row.value}}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <Pagination :pageObj="pageObj" @pageNo='pageNo' :post-page-sizes="pageSizes" @pageSize='pageSize'
                      ref="Pagination" :append-to-body="false" pop-class="out-popper-fix"></Pagination>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('overall.view')" :visible.sync="screenModal"
                   width="96%" @close="screenModal = false" :modal-append-to-body="false">
          <div slot="title">
            <span class="nz-dialog-title">{{data.name}}</span>
            <div class="float-right panel-calendar dialog-tool">
              <pick-time :refresh-data-func="dateChange" v-model="searchTime" :use-chart-unit="false" ref="pickTime" style="height: 28px;" id="table-chart"></pick-time>
            </div>
          </div>
          <el-table :data="seriesItemScreen" border height="95%" style="margin-top: 10px;"
                    ref="tableScreen"
                    @sort-change="tableDataSortScreen" tooltip-effect="light">
            <el-table-column :label="$t('overall.time')" min-width="100" prop="time"
                             :sort-orders="['ascending', 'descending']" :sortable="'custom'"></el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="element"
                             :label="$t('dashboard.dashboard.chartForm.element')" min-width="420"
                             :sort-orders="['ascending', 'descending']" :sortable="'custom'">
              <template slot-scope="scope">
                {{ scope.row.element.alias?scope.row.element.alias:scope.row.element.element}}
              </template>
            </el-table-column>
            <el-table-column :label="$t('overall.value')" class-name="custom-value" min-width="90" prop="value"
                             :resizable="false" :sort-orders="['ascending', 'descending']" :sortable="'custom'">
              <template slot-scope="scope">
                <div :style="{color:scope.row.mapping?scope.row.mapping.color.text:'#000',background:scope.row.mapping?scope.row.mapping.color.bac:'#fff'}" >
                  <span style="padding: 0px 10px;">{{ scope.row.value}}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <Pagination :pageObj="screenPageObj" :post-page-sizes="pageSizes" @pageNo='screenPageNo'
                      @pageSize='screenPageSize' ref="Pagination" :popper-append-to-body="false"></Pagination>
          <loading :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
        <span class="vue-resizable-handle" @mousedown="startResize" v-if="!isLock"></span>
      </div>
    </div>
  </div>
</template>

<script>
import bus from '../../../libs/bus'
import chartDataFormat from '../chartDataFormat'
import chartDataList from '@/components/common/mixin/chartDataList'

export default {
  name: 'chartTable',
  props: {
    chartData: {
      type: Object
    },
    // 看板id
    dashboardId: {
      type: Number,
      default: 0
    },
    editChartId: {
      type: String,
      default: 'editChartId'
    },
    chartIndex: {
      type: Number,
      default: 0
    },
    from: { type: String },
    isLock: { type: Boolean, default: false }
  },
  mixins: [chartDataList],
  data () {
    return {
      tableHeight: 0,
      data: {}, // 该图表信息,chartItem
      unit: {},
      isError: false,
      errorContent: '',
      pageSizes: [20, 50, 100],
      pageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      screenPageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      storedTableDataOld: [], // 原始信息
      storedTableDataScreenOld: [], // 全屏原始信息
      storedTableData: [],
      storedScreanTableData: [],
      seriesItem: [], // 保存信息
      seriesItemScreen: [], // 全屏数据,
      orderBy: null, // 排序非全屏
      orderByScreen: null, // 排序全屏
      images: '',
      loading: Object,
      items: {
        metric_name: [], // 每条数据列名称
        xAxis: [],
        theData: [] // series数据组
      },
      panelIdInner: '', // 看板id=dashboardId,原写作chart,由set_data获取
      firstLoad: false, // 是否第一次加载
      chartType: 'table', // 图表类型
      screenModal: false,
      // 查询数据使用
      filter: {
        start_time: '',
        end_time: ''
      },
      stableFilter: {}, // 保存数据使用,初始化起止时间,单图or多图等
      firstShow: false, // 默认不显示操作按钮,
      caretShow: false,
      dragTitleShow: false,
      dropdownMenuShow: false,
      divFirstShow: false,
      columns: [
        {
          title: 'Element',
          key: 'element',
          sortable: true
        },
        {
          title: '采集时间',
          key: 'time',
          width: 160,
          render: (h, params) => h('span', bus.timeFormate(params.row.time, 'YYYY-MM-DD HH:mm:ss'))
        }, {
          title: '数值',
          key: 'value',
          width: 160,
          sortable: true,
          render: (h, params) => h('span', this.getNumStr(params.row.value))
        }],
      searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()], // 全屏显示的时间
      oldSearchTime: [],
      mapping: {}
    }
  },
  created () {
    this.pageObj.pageSize = this.pageSizes[0]
    this.screenPageObj.pageSize = this.pageSizes[0]
  },
  computed: {},
  watch: {
    dropdownMenuShow (n) {
      this.$emit('dropmenu-change', n)
    }
  },
  methods: {
    pageNo (val) {
      this.pageObj.pageNo = val
      this.seriesItem = this.filterShowData(this.storedTableData, this.pageObj, 'series')
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      this.seriesItem = this.filterShowData(this.storedTableData, this.pageObj, 'series')
    },
    filterShowData (source, pageObj, from) {
      let orderBy = null
      let sourceData = null
      if (from === 'series') {
        sourceData = this.storedTableDataOld
        orderBy = this.orderBy
      }
      if (from === 'seriesScreen') {
        sourceData = this.storedTableDataScreenOld
        orderBy = this.orderByScreen
      }
      if (!orderBy || !orderBy.order) { // 没有排序 恢复默认值
        source = Object.assign([], sourceData)
      } else { // 排序之后的顺序
        if (orderBy.order === 'ascending') {
          source = source.sort(this.$tableSet.asce(orderBy.prop))
        }
        if (orderBy.order === 'descending') {
          source = source.sort(this.$tableSet.desc(orderBy.prop))
        }
      }
      return source.slice((pageObj.pageNo - 1) * pageObj.pageSize, pageObj.pageNo * pageObj.pageSize)
    },
    startResize (e) {
      const vm = this
      this.$chartResizeTool.start(vm, this.data, e)
    },
    screenPageNo (val) {
      this.screenPageObj.pageNo = val
      this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj, 'seriesScreen')
    },
    screenPageSize (val) {
      this.screenPageObj.pageSize = val
      this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj, 'seriesScreen')
    },
    startLoading (area) {
      if (area === 'screen') {
        this.$refs['localLoadingScreen' + this.chartIndex].startLoading()
      } else {
        this.$refs['localLoading' + this.chartIndex].startLoading()
      }
    },
    endLoading (area) {
      if (area === 'screen') {
        this.$refs['localLoadingScreen' + this.chartIndex].endLoading()
      } else {
        this.$refs['localLoading' + this.chartIndex] && this.$refs['localLoading' + this.chartIndex].endLoading()
      }
    },
    resize (chartItem) {
      const deHeight = this.$chartResizeTool.titleHeight + this.$chartResizeTool.chartTableBlankHeight
      const container = document.querySelector('#chartTableDiv' + this.chartIndex + ' .table-container')
      container.style.height = `calc(100% - ${deHeight}px)`
      this.tableHeight = `calc(100% - ${this.$refs.Pagination.$el.offsetHeight}px)`
    },
    showLoad (chartItem) {
      // 设置高度 chart-table
      this.$nextTick(() => {
        this.resize(chartItem)
      })
      this.startLoading()
      this.divFirstShow = true
    },
    screenRefreshChart () {
      this.$refs.calendarPanel.timeChange(this.$refs.calendarPanel.nowTimeType, 'chart')
    },
    // 重新请求数据 刷新操作-local
    refreshChart () {
      this.dropdownMenuShow = false
      this.startLoading()
      this.firstShow = false
      this.$emit('on-refresh-data', this.data.id)
    },
    // 编辑图表
    editChart () {
      this.dropdownMenuShow = false
      this.$emit('on-edit-chart-block', this.data.id)
    },
    // 删除该图表
    removeChart () {
      this.dropdownMenuShow = false
      this.$emit('on-remove-chart-block', this.data.id)
    },
    // 全屏时间条件查询
    dateChange (time) {
      this.seriesItemScreen = []
      for (let i = 0; i < 8; i++) {
        this.seriesItemScreen.push({ // 表格数据
          element: '',
          time: '', // 采集时间
          value: ''// 数值
        })
      }
      this.startLoading('screen')
      this.$emit('on-search-data', this.data.id, this.searchTime)
    },
    clickos () {
      this.dropdownMenuShow = false
    },
    clearChart () {
      this.data = {}
    },
    duplicate () {
      this.dropdownMenuShow = false
      this.$emit('on-duplicate-chart-block', this.data.id)
    },
    // 全屏查看
    showAllScreen () {
      this.dropdownMenuShow = false
      // 初始化同步时间
      this.searchTime = []
      this.$set(this.searchTime, 0, this.oldSearchTime[0])
      this.$set(this.searchTime, 1, this.oldSearchTime[1])
      this.$refs.pickTime.$refs.timePicker.setCustomTime(this.stableFilter)

      this.seriesItemScreen = this.seriesItem
      this.screenModal = true
      this.screenPageObj.pageNo = 1
      this.screenPageObj.pageSize = this.pageObj.pageSize
    },
    // 设置数据, filter区分
    setData (chartItem, seriesItem, dashboardId, filter, area, errorMsg) {
      if (filter) {
        this.stableFilter = filter
      }
      if (errorMsg && errorMsg !== '') {
        this.isError = true
        this.errorContent = errorMsg
      } else {
        this.isError = false
        this.errorContent = ''
      }
      this.data = chartItem
      this.unit = chartDataFormat.getUnit(this.data.unit)
      const statistics = chartItem.param.statistics || 'null'
      seriesItem = this.getStatisticsResult(statistics, seriesItem)
      seriesItem && (seriesItem = seriesItem.map(item => {
        if (chartItem.param && chartItem.param.valueMapping && chartItem.param.valueMapping.type) {
          const type = chartItem.param.valueMapping.type
          const mappings = chartItem.param.valueMapping.mapping ? chartItem.param.valueMapping.mapping : []
          const value = Number(item.value)

          let mapping
          if (type == 'value') {
            mapping = mappings.find(t => {
              const mappingValue = t.value === '' ? '' : Number(t.value) // Number('') 值为0
              return mappingValue === value
            })
          } else {
            mapping = mappings.find(t => {
              const mappingFrom = t.from === '' ? '' : Number(t.from)
              const mappingTo = t.to === '' ? '' : Number(t.to)
              return Number(mappingFrom) <= value && Number(mappingTo) >= value
            })
          }
          this.mapping = mapping
          item.mapping = mapping
          item.oldValue = item.value
          item.value = mapping ? mapping.text.replace('{{value}}', item.value).replace('{{name}}', item.element.alias) : chartDataFormat.getUnit(chartItem.unit ? chartItem.unit : 2).compute(value, null, 2)
        }
        return item
      }))
      if (area === 'showFullScreen') { // 全屏按时间查询
        this.searchTime[0] = filter.start_time// 将列表的查询时间复制给全屏的查询时间
        this.searchTime[1] = filter.end_time
        // this.seriesItemScreen = seriesItem;
        this.storedScreanTableData = seriesItem
        this.storedScreanTableData = Object.assign([], this.storedScreanTableData.reverse())
        this.storedTableDataScreenOld = Object.assign([], this.storedScreanTableData)
        this.screenPageObj.total = this.storedScreanTableData.length
        this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj, 'seriesScreen')
        this.endLoading('screen')
      } else {
        // 设置高度 chart-table
        this.divFirstShow = true
        this.$nextTick(() => {
          this.resize(chartItem)
        })
        this.firstShow = true // 展示操作按键

        this.panelIdInner = dashboardId
        this.storedTableData = seriesItem
        this.storedScreanTableData = seriesItem
        this.storedTableData = Object.assign([], this.storedTableData.reverse())
        this.storedScreanTableData = Object.assign([], this.storedScreanTableData.reverse())
        this.storedTableDataOld = Object.assign([], this.storedTableData)
        this.storedTableDataScreenOld = Object.assign([], this.storedScreanTableData)
        this.pageObj.total = this.storedTableData.length
        this.screenPageObj.total = this.storedScreanTableData.length
        this.seriesItem = this.filterShowData(this.storedTableData, this.pageObj, 'series')
        this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj, 'seriesScreen')
        if (filter) { // 保存数据,用于同步时间
          this.searchTime[0] = filter.start_time// 将列表的查询时间复制给全屏的查询时间
          this.searchTime[1] = filter.end_time
          this.oldSearchTime[0] = this.searchTime[0]
          this.oldSearchTime[1] = this.searchTime[1]
        }
        this.endLoading()
      }
    },
    getStatisticsResult: function (statistics, seriesItem) {
      if (!seriesItem || !seriesItem.length > 0) return []
      if (!statistics) return seriesItem
      const copy = JSON.parse(JSON.stringify(seriesItem))
      const classifies = []
      let maxGroup = 0
      const map = new Map()// 用于记录在第几组
      copy.forEach(item => {
        const element = item.element.element
        const group = map.get(element)
        if (typeof group != 'undefined') {
          classifies[group].push(item)
        } else {
          classifies.push([item])
          map.set(element, maxGroup++)
        }
      })

      let result
      switch (statistics) {
        case 'null': {
          copy.sort((x, y) => { return parseFloat(y.data[0]) - parseFloat(x.data[0]) })
          result = copy.map(item => {
            return {
              element: item.element,
              time: bus.timeFormate(new Date(item.data[0]), 'YYYY-MM-DD HH:mm:ss'),
              value: item.data[1]
            }
          })
          break
        }
        case 'min': {
          result = classifies.map(group => {
            const groupMin = group.sort((x, y) => {
              return parseFloat(x.data[1]) - parseFloat(y.data[1])
            })[0]

            return {
              element: groupMin.element,
              time: bus.timeFormate(new Date(groupMin.data[0]), 'YYYY-MM-DD HH:mm:ss'),
              value: groupMin.data[1]
            }
          })
          break
        }
        case 'max': {
          result = classifies.map(group => {
            const groupMax = group.sort((x, y) => {
              return parseFloat(y.data[1]) - parseFloat(x.data[1])
            })[0]

            return {
              element: groupMax.element,
              time: bus.timeFormate(new Date(groupMax.data[0]), 'YYYY-MM-DD HH:mm:ss'),
              value: groupMax.data[1]
            }
          })
          break
        }
        case 'avg': {
          result = classifies.map(group => {
            const groupData = group.map(t => parseFloat(t.data[1]))
            const sum = eval(groupData.join('+'))
            const avg = sum / groupData.length
            const last = group.sort((x, y) => {
              return parseFloat(y.data[0]) - parseFloat(x.data[0])
            })[0]
            return {
              element: last.element,
              time: bus.timeFormate(new Date(last.data[0]), 'YYYY-MM-DD HH:mm:ss'),
              value: avg
            }
          })
          break
        }
        case 'total': {
          result = classifies.map(group => {
            const groupData = group.map(t => parseFloat(t.data[1]))
            const total = eval(groupData.join('+'))
            const last = group.sort((x, y) => {
              return parseFloat(y.data[0]) - parseFloat(x.data[0])
            })[0]
            return {
              element: last.element,
              time: bus.timeFormate(new Date(last.data[0]), 'YYYY-MM-DD HH:mm:ss'),
              value: total
            }
          })
          break
        }
        case 'first': {
          result = classifies.map(group => {
            const first = group.sort((x, y) => {
              return parseFloat(y.data[0]) - parseFloat(x.data[0])
            })[copy.length - 1]

            return {
              element: first.element,
              time: bus.timeFormate(new Date(first.data[0]), 'YYYY-MM-DD HH:mm:ss'),
              value: first.data[1]
            }
          })
          break
        }
        case 'last': {
          result = classifies.map(group => {
            const last = group.sort((x, y) => {
              return parseFloat(y.data[0]) - parseFloat(x.data[0])
            })[0]
            return {
              element: last.element,
              time: bus.timeFormate(new Date(last.data[0]), 'YYYY-MM-DD HH:mm:ss'),
              value: last.data[1]
            }
          })
          break
        }
        case 'range': {
          result = classifies.map(group => {
            const sort = JSON.parse(JSON.stringify(group)).sort((x, y) => {
              return parseFloat(y.data[1]) - parseFloat(x.data[1])
            })
            const last = group.sort((x, y) => {
              return parseFloat(y.data[0]) - parseFloat(x.data[0])
            })[0]
            const max = sort[0]
            const min = sort[sort.length - 1]
            const range = max.data[1] - min.data[1]
            return {
              element: last.element,
              time: bus.timeFormate(new Date(last.data[0]), 'YYYY-MM-DD HH:mm:ss'),
              value: range
            }
          })
          break
        }
        case 'different': {
          result = classifies.map(group => {
            const sort = group.sort((x, y) => {
              return parseFloat(y.data[0]) - parseFloat(x.data[0])
            })
            const last = sort[0]
            const first = sort[copy.length - 1]
            return {
              element: last.element,
              time: bus.timeFormate(new Date(last.data[0]), 'YYYY-MM-DD HH:mm:ss'),
              value: last.data[1] - first.data[1]
            }
          })

          break
        }
        default : {
          copy.sort((x, y) => { return parseFloat(y.data[0]) - parseFloat(x.data[0]) })
          result = copy.map(item => {
            return {
              element: item.element,
              time: bus.timeFormate(new Date(item.data[0]), 'YYYY-MM-DD HH:mm:ss'),
              value: item.data[1]
            }
          })
          break
        }
      }
      return result
    },
    // 数据排序
    tableDataSort (item) {
      this.orderBy = { order: item.order, prop: item.prop }
      this.seriesItem = this.filterShowData(this.storedTableData, this.pageObj, 'series')
    },
    // 全屏数据排序
    tableDataSortScreen (item) {
      this.orderByScreen = { order: item.order, prop: item.prop }
      this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj, 'seriesScreen')
    },
    // 获取格式
    getNumStr (num) {
      if (num) {
        if (num >= 1000) {
          const kbNum = num / 1000
          if (kbNum >= 1000) {
            const mbNum = kbNum / 1000
            if (mbNum >= 1000) {
              const gbNum = mbNum / 1000
              if (gbNum >= 1000) {
                const tbNum = gbNum / 1000
                if (tbNum >= 1000) {
                  const pbNum = tbNum / 1000
                  return `${pbNum.toFixed(2)}PB`
                }
                return `${tbNum.toFixed(2)}TB`
              }
              return `${gbNum.toFixed(2)}GB`
            }
            return `${mbNum.toFixed(2)}MB`
          }
          return `${kbNum.toFixed(2)}KB`
        }
        return num.toFixed(2)
      }
      return num
    }
  },
  mounted () {
    this.firstLoad = false
  },
  beforeDestroy () {
    this.clearChart()
  }
}
</script>
