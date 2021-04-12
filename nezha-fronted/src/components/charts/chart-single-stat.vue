<style lang="scss">
@import './chart.scss';
</style>
<template>
  <div class="nz-chart-resize">
    <div class="resize-shadow" ref="resizeShadow"></div>
    <div class="resize-box resize-box-single" ref="resizeBox">
      <div class="chart-single-stat"  :id="'chartSingleStatDiv'+chartIndex" @mouseenter="caretShow=true" @mouseleave="caretShow=false">
        <loading  :ref="'localLoading'+chartIndex"></loading>
        <div class="clearfix chartTitle" :class="{'dragTitle':dragTitleShow}" :id="'chartTitle'+chartIndex">
          <el-popover
            v-if="isError"
            :close-delay=10
            placement="top-start"
            trigger="hover"
            popper-class="chart-error-popper">
            <div >{{errorContent}}</div>
            <span slot="reference" style="" class="panel-info-corner panel-info-corner--error">
              <i class="nz-icon nz-icon-warning fa"></i>
              <span class="panel-info-corner-inner"></span>
            </span>
          </el-popover>
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex"  v-clickoutside="clickos" :class="{'move-able':!isLock}">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title">
              <span class="chart-title-text">{{chartData.name}}</span>
              <span class="chart-title-icon"   :class="{'visible':caretShow,'hidden':!caretShow}">
               <span v-if="chartData.remark">
                  <el-tooltip :content="chartData.remark" placement="top" effect="light">
                     <i class="nz-icon nz-icon-info-normal"></i>
                  </el-tooltip>
                </span>
                <span  @click="refreshChart" class="" v-has="`${from}_chart_toEdit`" :title="$t('dashboard.refresh')">
                  <i class="nz-icon nz-icon-replay"></i>
                </span>
                 <span  @click="showAllScreen" class="" :title="$t('dashboard.screen')">
                  <i class="nz-icon nz-icon-maxview"></i>
                 </span>
                <span><i class="el-icon-more" @click.stop="dropdownMenuShow=!dropdownMenuShow"></i></span>
              </span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow"  :id="'dropdownUl'+chartIndex"  class="el-dropdown-menu nz-chart-dropdown"  style="" >
              <li  @click="editChart" class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 16px;"></i><span>{{$t('dashboard.edit')}}</span></li>
              <li  @click="removeChart" class="el-dropdown-menu__item" v-has="`${from}_chart_delete`">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}</li>
              <li  @click="duplicate" class="el-dropdown-menu__item" v-has="`${from}_chart_duplicate`">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('dashboard.duplicate')}}</li>
            </ul>
          </el-dropdown>
        </div>
        <div class="mt-10 single-stat-container" v-cloak  v-show="firstShow" >
          <div :id="'chartContainer'+chartIndex"  :style="{color:mapping?mapping.color.text:'#000',background:mapping?mapping.color.bac:'#fff'}" class="single-stat-content" ref="chartContainer">
            {{serieSingleStat}}
            <div class="chart-no-data" v-show="noData">No Data</div>
          </div>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')"
                   :visible.sync="screenModal"
                   width="96%"  @close="screenModal = false" >
          <div slot="title">
            <span class="nz-dialog-title">{{data.name}}</span>
            <div class="float-right panel-calendar dialog-tool">
<!--              <time-picker ref="calendarPanel" class="nz-dashboard-picker" style="margin-top: -12px;" @change="dateChange"></time-picker>-->
              <pick-time :refresh-data-func="dateChange" v-model="searchTime" :use-chart-unit="false" ref="pickTime" style="height: 28px;" id="single-chart"></pick-time>
            </div>
<!--            <span class="float-right  dialog-tool" @click="screenRefreshChart" style="margin-right: 15px"><i class="global-active-color nz-icon nz-icon-refresh"/></span>-->
          </div>
          <div class="single-stat-screen-container"  >
            <div :style="{color:mapping?mapping.color.text:'#000',background:mapping?mapping.color.bac:'#fff'}"  class="single-stat-content" id="chartScreenContainer" ref="chartScreenContainer">
              {{serieSingleStat}}
              <div class="chart-no-data" v-show="noData">No Data</div>
            </div>
          </div>
          <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
      </div>
      <span class="vue-resizable-handle" @mousedown="startResize" v-if="!isLock"></span>
    </div>
  </div>
</template>

<script>
import chartDataFormat from './chartDataFormat'

export default {
  name: 'chartSingleStat',
  props: {
    chartData: {
      type: Object
    },
    // 看板id
    panelId: {
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
  data () {
    return {
      data: {}, // 该图表信息,chartItem
      noData: false,
      unit: {},
      isError: false,
      errorContent: '',
      seriesItem: [], // 保存信息
      seriesItemScreen: [], // 全屏数据
      serieSingleStat: '',
      mapping: '', // 满足valueMapping时 mapping的值
      images: '',
      loading: Object,
      items: {
        metric_name: [], // 每条数据列名称
        xAxis: [],
        theData: [] // series数据组
      },
      panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
      firstLoad: false, // 是否第一次加载
      screenModal: false,
      // 查询数据使用
      filter: {
        start_time: '',
        end_time: ''
      },
      stableFilter: {},
      firstShow: false, // 默认不显示操作按钮,
      caretShow: false,
      dragTitleShow: false,
      dropdownMenuShow: false,
      divFirstShow: false,
      searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()], // 全屏显示的时间
      oldSearchTime: []
    }
  },
  created () {
  },
  computed: {},
  watch: {
    dropdownMenuShow (n) {
      this.$emit('dropmenu-change', n)
    }
  },
  methods: {
    startResize (e) {
      const vm = this
      this.$chartResizeTool.start(vm, this.data, e)
    },
    dragResize: function (e) {
      const diffWidth = 20 // 界面的宽度空白的地方的宽度
      const chartBoxPadding = 22
      const targetDiv = document.getElementById('chartSingleStatDiv' + this.chartIndex) // e.target.parentNode.parentNode;.children[0]
      const targetDivContainer = document.getElementById('listContainer') // e.target.parentNode.parentNode;.children[0]
      const maxWidth = targetDivContainer.offsetWidth - diffWidth
      const minWidth = maxWidth / 12
      const stepWidth = maxWidth / 12
      const stepHeight = 10

      // 得到点击时该容器的宽高：
      const targetDivHeight = targetDiv.offsetHeight
      const targetDivWidth = targetDiv.offsetWidth
      const startY = e.clientY
      const startX = e.clientX
      const _this = this

      document.onmousemove = function (e) {
        e.preventDefault()
        // 得到鼠标拖动的宽高距离：取绝对值
        const distY = Math.abs(e.clientY - startY)
        const distX = Math.abs(e.clientX - startX)

        // 往上方拖动：
        if (e.clientY < startY) {
          targetDiv.style.height = targetDivHeight - distY + 'px'
          // heightTmp = targetDivHeight-distY;
        }
        if (e.clientX < startX) {
          targetDiv.style.width = targetDivWidth - distX + 'px'
          // widthTmp = targetDivWidth-distX;
        }
        // 往下方拖动：
        if (e.clientY > startY) {
          targetDiv.style.height = (targetDivHeight + distY) + 'px'
          // heightTmp = targetDivHeight+distY;
        }
        if (e.clientX > startX) {
          targetDiv.style.width = (targetDivWidth + distX) + 'px'
          // widthTmp = targetDivWidth+distX;
        }

        if (parseInt(targetDiv.style.height) <= _this.minHeight) {
          targetDiv.style.height = _this.minHeight + 'px'
          // heightTmp = _this.minHeight;
        }

        if (parseInt(targetDiv.style.width) >= maxWidth) {
          targetDiv.style.width = maxWidth + 'px'
          // widthTmp = maxWidth;
        }
        if (parseInt(targetDiv.style.width) <= minWidth) {
          targetDiv.style.width = minWidth + 'px'
          // widthTmp = minWidth;
        }
        // 调整表格大小
        const containerHeight = parseInt(targetDiv.style.height)
        const containerWidth = parseInt(targetDiv.style.width)
        const chartBox = document.getElementsByClassName('chartBox')
        chartBox[_this.chartIndex].style.width = (containerWidth + chartBoxPadding) + 'px'
        // chartBox[_this.chartIndex].style.height = `${containerHeight}px`;
        // 表格的高度
        const chartSingleStatBox = document.getElementById('chartContainer' + _this.chartIndex)
        chartSingleStatBox.style.height = `${containerHeight - _this.titleHeight}px`// -75-32+25
      }

      document.onmouseup = function () {
        const targetDivHeightNew = parseInt(targetDiv.style.height)
        // let targetDivHeightNew = heightTmp
        const targetDivWidthNew = parseInt(targetDiv.style.width)
        // let targetDivWidthNew = widthTmp;

        const diffHeight = Math.abs(targetDivHeight - targetDivHeightNew)
        if (targetDivHeight > targetDivHeightNew) {
          const finalDiffHeight = Math.floor(diffHeight / stepHeight) * stepHeight
          // alert('oldWidth='+targetDivHeight+"===diffHeight+"+diffHeight+"==finalDiffHeight="+finalDiffHeight);
          targetDiv.style.height = (targetDivHeight - finalDiffHeight) + 'px'
        }
        if (targetDivHeight < targetDivHeightNew) {
          const finalDiffHeight = Math.ceil(diffHeight / stepHeight) * stepHeight
          targetDiv.style.height = (targetDivHeight + finalDiffHeight) + 'px'
        }

        let span = _this.data.span
        if (targetDivWidth > targetDivWidthNew) {
          span = Math.floor((targetDivWidthNew * 12) / maxWidth)
          const finalWidth = Math.floor((targetDivWidthNew * 12) / maxWidth) * stepWidth
          if ((finalWidth) < minWidth) {
            targetDiv.style.width = minWidth + 'px'
            span = 1
          } else {
            targetDiv.style.width = finalWidth + 'px'
          }
        }
        if (targetDivWidth < targetDivWidthNew) {
          span = Math.ceil((targetDivWidthNew * 12) / maxWidth)
          const spanUnit = Math.ceil((targetDivWidthNew * 12) / maxWidth)
          const finalWidth = spanUnit * stepWidth
          if (finalWidth > maxWidth || spanUnit === 12) {
            targetDiv.style.width = maxWidth + 'px'
            span = 12
          } else {
            targetDiv.style.width = finalWidth + 'px'
          }
        }
        // 调整表格大小
        const containerHeight = parseInt(targetDiv.style.height)
        const containerWidth = parseInt(targetDiv.style.width)

        const chartBox = document.getElementsByClassName('chartBox')
        chartBox[_this.chartIndex].style.width = (containerWidth + chartBoxPadding) + 'px'
        // chartBox[_this.chartIndex].style.height = `${containerHeight}px`;
        // 表格的高度
        const chartSingleStatBox = document.getElementById('chartContainer' + _this.chartIndex)
        chartSingleStatBox.style.height = `${containerHeight - _this.titleHeight}px`

        const modifyParams = {
          id: _this.data.id,
          span: span,
          height: (containerHeight + _this.chartSpaceHeight),
          prev: parseInt(_this.data.prev),
          next: parseInt(_this.data.next)
        }
        targetDiv.style.height = (Math.floor((containerHeight + _this.chartSpaceHeight) / 10) * 10 - _this.chartSpaceHeight) + 'px'// 图表实际渲染高度，采用个位数字四舍五入
        _this.$put('panel/' + _this.panelIdInner + '/charts/modify', modifyParams).then(response => {
          if (response.code === 200) {
            // 更新当前图表数据
            _this.data.span = span
            _this.data.height = containerHeight + _this.chartSpaceHeight
            _this.$emit('on-drag-chart', _this.data)
          } else {
            if (response.msg) {
              _this.$message.error(response.msg)
            } else if (response.error) {
              _this.$message.error(response.error)
            } else {
              _this.$message.error(response)
            }
          }
        })
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    startLoading (area) {
      if (area === 'screen') {
        this.$refs['localLoadingScreen' + this.chartIndex].startLoading()
      } else {
        // this.showLoading = true;
        this.$refs['localLoading' + this.chartIndex].startLoading()
      }
    },
    endLoading (area) {
      if (area === 'screen') {
        // this.showLoadingScreen = false;
        this.$refs['localLoadingScreen' + this.chartIndex].endLoading()
      } else {
        // this.showLoading = false;
        this.$refs['localLoading' + this.chartIndex].endLoading()
      }
    },
    showLoad (chartItem) {
      this.$nextTick(() => {
        const chartBox = document.getElementById('chartSingleStatDiv' + this.chartIndex)
        let height = Math.floor(chartItem.height / 10) * 10// 图表高度四舍五入
        if (height < this.minHeight) {
          height = this.minHeight
        }
        chartBox.style.height = `${height - this.chartSpaceHeight}px`
        const singleStatBox = document.getElementById('chartContainer' + this.chartIndex)
        singleStatBox.style.height = `${height - this.chartSpaceHeight - this.titleHeight}px`// -75-32
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
      this.serieSingleStat = ''
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
      this.searchTime = []
      this.$set(this.searchTime, 0, this.oldSearchTime[0])
      this.$set(this.searchTime, 1, this.oldSearchTime[1])
      this.$refs.pickTime.$refs.timePicker.setCustomTime(this.stableFilter)

      this.seriesItemScreen = this.seriesItem
      this.screenModal = true
    },
    resize (chartItem) {
      document.querySelector('#chartSingleStatDiv' + this.chartIndex + ' .single-stat-container').style.height = `calc(100% - ${this.$chartResizeTool.titleHeight}px)`
    },
    // 设置数据, filter区分
    setData (chartItem, seriesItem, panelId, filter, area, errorMsg) {
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
      if (seriesItem || (typeof seriesItem === 'number' && seriesItem == 0) || (typeof seriesItem === 'string' && seriesItem != '')) { // 0 为false
        this.noData = false
      } else {
        this.noData = true
      }

      if (area === 'showFullScreen') { // 全屏按时间查询
        this.data = chartItem
        this.unit = chartDataFormat.getUnit(this.data.unit)
        if (Number(seriesItem)) {
          const singleStatTmp = parseFloat(Number(seriesItem).toFixed(2))// parseFloat ：如果没有小数点，或者小数点后都是零，parseFloat() 会返回整数。
          if (chartItem.param.valueMapping && chartItem.param.valueMapping.type) {
            const type = chartItem.param.valueMapping.type
            const mappings = chartItem.param.valueMapping.mapping ? chartItem.param.valueMapping.mapping : []
            let mapping
            if (type == 'value') {
              mapping = mappings.find(item => { return item.value == singleStatTmp })
            } else {
              mapping = mappings.find(item => { return item.from <= singleStatTmp && item.to >= singleStatTmp })
            }
            this.mapping = mapping
            if (this.mapping && !this.mapping.color) {
              this.mapping.color = { bac: '#fff', text: '#000' }
            }
            this.serieSingleStat = mapping ? mapping.text.replace('{{value}}', singleStatTmp).replace('{{name}}', chartItem.elements[0].legend) : chartDataFormat.getUnit(chartItem.unit ? chartItem.unit : 2).compute(singleStatTmp, null, 2)
          } else {
            this.serieSingleStat = chartDataFormat.getUnit(chartItem.unit ? chartItem.unit : 2).compute(singleStatTmp, null, 2)
          }
        } else {
          this.serieSingleStat = seriesItem
        }
        this.searchTime[0] = filter.start_time// 将列表的查询时间复制给全屏的查询时间
        this.searchTime[1] = filter.end_time
        this.endLoading('screen')
      } else {
        this.$nextTick(() => {
          this.resize(chartItem)
        })
        this.divFirstShow = true

        this.firstShow = true // 展示操作按键

        this.panelIdInner = panelId
        this.data = chartItem
        this.unit = chartDataFormat.getUnit(this.data.unit)
        if (Number(seriesItem)) {
          const singleStatTmp = parseFloat(Number(seriesItem).toFixed(2))// parseFloat ：如果没有小数点，或者小数点后都是零，parseFloat() 会返回整数。
          if (chartItem.param.valueMapping && chartItem.param.valueMapping.type) {
            const type = chartItem.param.valueMapping.type
            const mappings = chartItem.param.valueMapping.mapping ? chartItem.param.valueMapping.mapping : []
            let mapping
            if (type == 'value') {
              mapping = mappings.find(item => { return item.value == singleStatTmp })
            } else {
              mapping = mappings.find(item => { return item.from <= singleStatTmp && item.to >= singleStatTmp })
            }
            this.mapping = mapping
            if (this.mapping && !this.mapping.color) {
              this.mapping.color = { bac: '#fff', text: '#000' }
            }
            this.serieSingleStat = mapping ? mapping.text.replace('{{value}}', singleStatTmp).replace('{{name}}', chartItem.elements[0].legend) : chartDataFormat.getUnit(chartItem.unit ? chartItem.unit : 2).compute(singleStatTmp, null, 2)
          } else {
            this.serieSingleStat = chartDataFormat.getUnit(chartItem.unit ? chartItem.unit : 2).compute(singleStatTmp, null, 2)
          }
        } else {
          this.serieSingleStat = seriesItem
        }
        if (filter) { // 保存数据,用于同步时间
          this.searchTime[0] = filter.start_time// 将列表的查询时间复制给全屏的查询时间
          this.searchTime[1] = filter.end_time
          this.oldSearchTime[0] = this.searchTime[0]
          this.oldSearchTime[1] = this.searchTime[1]
        }
        this.endLoading()
      }
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
