<style lang="scss">
  @import './chart.scss';
</style>
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
          <el-dropdown trigger="click" class="nz-chart-top" :key="'chartDropdown'+chartIndex" v-clickoutside="clickos">
            <el-dropdown-menu style="display: none"></el-dropdown-menu>
            <span class="el-dropdown-link chart-title" @click.stop="dropdownMenuShow=!dropdownMenuShow">
              <span class="chart-title-text">{{chartData.title}}</span>
              <span class="chart-title-icon"><i class="nz-icon nz-icon-xialaxuanze  "
                                                :class="{'visible':caretShow,'hidden':!caretShow}"></i></span>
            </span>
            <ul slot="dropdown" v-show="dropdownMenuShow" :id="'dropdownUl'+chartIndex"
                class="el-dropdown-menu nz-chart-dropdown"
                style="position: absolute; top: 30px; left: calc(50% - 79px); transform-origin: center top; z-index: 1000;">
              <li @click="refreshChart" class="el-dropdown-menu__item">
                <i class="global-active-color el-icon-refresh-right" style="font-size: 16px;"></i><span>{{$t('dashboard.refresh')}}</span>
              </li>
              <li @click="editChart" class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-edit" style="font-size: 14px; margin-right: 11px; margin-left: 1px;"></i>{{$t('dashboard.edit')}}
              </li>
              <li @click="removeChart" class="el-dropdown-menu__item">
                <i class="nz-icon nz-icon-delete" style="font-size: 16px;"></i>{{$t('dashboard.delete')}}
              </li>
              <li @click="showAllScreen" class="el-dropdown-menu__item">
                <i class="el-icon-full-screen" style="font-size: 16px;"></i>{{$t('dashboard.screen')}}
              </li>
              <li @click="duplicate" class="el-dropdown-menu__item">
                <i class="el-icon-copy-document" style="font-size: 16px;"></i>{{$t('dashboard.duplicate')}}
              </li>
            </ul>
          </el-dropdown>
        </div>
        <div class="mt-10 table-container" v-cloak v-show="firstShow">
          <el-table class="nz-table" :id="'tableContainer'+chartIndex" ref="tableContainer" :height="tableHeight"
                    :data="seriesItem" border tooltip-effect="light" v-cloak v-scrollBar:el-table
                    @sort-change="tableDataSort">
            <el-table-column sortable prop="time" :label="$t('dashboard.panel.chartTableColumn.time')" min-width="100"
                             :sort-orders="['ascending', 'descending']" :sortable="'custom'"></el-table-column>
            <el-table-column sortable prop="element" :show-overflow-tooltip="true"
                             :label="$t('dashboard.panel.chartTableColumn.element')" min-width="260"
                             :sort-orders="['ascending', 'descending']" :sortable="'custom'">
              <template slot-scope="scope">
                {{ scope.row.element.alias?scope.row.element.alias:scope.row.element.element}}
              </template>
            </el-table-column>
            <el-table-column sortable prop="value" :label="$t('dashboard.panel.chartTableColumn.value')" min-width="90"
                             :resizable="false" :sort-orders="['ascending', 'descending']" :sortable="'custom'">
              <template slot-scope="scope">
                {{ scope.row.value}}
              </template>
            </el-table-column>
          </el-table>
          <Pagination :pageObj="pageObj" @pageNo='pageNo' :post-page-sizes="pageSizes" @pageSize='pageSize'
                      ref="Pagination" :append-to-body="false" pop-class="out-popper-fix"></Pagination>
        </div>
        <!--全屏-->
        <el-dialog class="nz-dialog table-chart-dialog" :title="$t('dashboard.panel.view')" :visible.sync="screenModal"
                   width="96%" @close="screenModal = false">
          <div slot="title">
            <span class="nz-dialog-title">{{data.title}}</span>
            <div class="float-right panel-calendar dialog-tool">
              <time-picker ref="calendarPanel" class="nz-dashboard-picker" style="margin-top: -12px;"
                           @change="dateChange"></time-picker>
            </div>
          </div>
          <el-table style="margin-top: 10px;" class="nz-table" height="95%" :data="seriesItemScreen" border
                    tooltip-effect="light" v-scrollBar:el-table @sort-change="tableDataSortScreen">
            <el-table-column sortable prop="time" :label="$t('dashboard.panel.chartTableColumn.time')" min-width="100"
                             :sort-orders="['ascending', 'descending']" :sortable="'custom'"></el-table-column>
            <el-table-column sortable prop="element" :show-overflow-tooltip="true"
                             :label="$t('dashboard.panel.chartTableColumn.element')" min-width="420"
                             :sort-orders="['ascending', 'descending']" :sortable="'custom'">
              <template slot-scope="scope">
                {{ scope.row.element.alias?scope.row.element.alias:scope.row.element.element}}
              </template>
            </el-table-column>
            <el-table-column sortable prop="value" :label="$t('dashboard.panel.chartTableColumn.value')" min-width="90"
                             :resizable="false" :sort-orders="['ascending', 'descending']" :sortable="'custom'">
              <template slot-scope="scope">
                {{ scope.row.value}}
              </template>
            </el-table-column>
          </el-table>
          <Pagination :pageObj="screenPageObj" :post-page-sizes="pageSizes" @pageNo='screenPageNo'
                      @pageSize='screenPageSize' ref="Pagination" :popper-append-to-body="false"></Pagination>
          <loading :ref="'localLoadingScreen'+chartIndex"></loading>
        </el-dialog>
        <span class="vue-resizable-handle" @mousedown="startResize"></span>
      </div>
    </div>
  </div>
</template>

<script>
  import bus from '../../libs/bus';
  import {Loading} from 'element-ui';
  import chartDataFormat from './chartDataFormat'
  import loading from "../common/loading";
  import timePicker from '../common/timePicker'

  export default {
    name: 'chartTable',
    components: {
      'loading': loading,
      'time-picker': timePicker
    },
    props: {
      chartData: {
        type: Object
      },
      // 看板id
      panelId: {
        type: Number,
        default: 0,
      },
      editChartId: {
        type: String,
        default: 'editChartId',
      },
      chartIndex: {
        type: Number,
        default: 0,
      }
    },
    data() {
      return {
        tableHeight: 0,
        data: {}, // 该图表信息,chartItem
        unit: {},
        isError: false,
        errorContent: '',
        pageSizes: [50, 100, 200],
        pageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        screenPageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        storedTableDataOld: [],//原始信息
        storedTableDataScreenOld: [],//全屏原始信息
        storedTableData: [],
        storedScreanTableData: [],
        seriesItem: [], // 保存信息
        seriesItemScreen: [],//全屏数据,
        orderBy: null,//排序非全屏
        orderByScreen: null,//排序全屏
        images: '',
        loading: Object,
        items: {
          metric_name: [], // 每条数据列名称
          xAxis: [],
          theData: [], // series数据组
        },
        panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
        firstLoad: false, // 是否第一次加载
        chartType: 'table', // 图表类型
        screenModal: false,
        // 查询数据使用
        filter: {
          start_time: '',
          end_time: '',
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
          }
          , {
            title: '采集时间',
            key: 'time',
            width: 160,
            render: (h, params) => h('span', bus.timeFormate(params.row.time, 'yyyy-MM-dd hh:mm:ss')),
          }, {
            title: '数值',
            key: 'value',
            width: 160,
            sortable: true,
            render: (h, params) => h('span', this.getNumStr(params.row.value)),
          }],
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],//全屏显示的时间
        oldSearchTime: [],
      };
    },
    created() {
      this.pageObj.pageSize = this.pageSizes[0];
      this.screenPageObj.pageSize = this.pageSizes[0];
    },
    computed: {},
    watch: {},
    methods: {
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.seriesItem = this.filterShowData(this.storedTableData, this.pageObj, 'series')
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        this.seriesItem = this.filterShowData(this.storedTableData, this.pageObj, 'series')
      },
      filterShowData(source, pageObj, from) {
        let orderBy = null;
        let sourceData = null;
        if (from === 'series') {
          sourceData = this.storedTableDataOld;
          orderBy = this.orderBy;
        }
        if (from === 'seriesScreen') {
          sourceData = this.storedTableDataScreenOld;
          orderBy = this.orderByScreen;
        }
        if (!orderBy || !orderBy.order) {//没有排序 恢复默认值
          source = Object.assign([], sourceData);
        } else {//排序之后的顺序
          if (orderBy.order === 'ascending') {
            source = source.sort(this.$tableSet.asce(orderBy.prop));
          }
          if (orderBy.order === 'descending') {
            source = source.sort(this.$tableSet.desc(orderBy.prop));
          }
        }
        return source.slice((pageObj.pageNo - 1) * pageObj.pageSize, pageObj.pageNo * pageObj.pageSize)

      },
      startResize(e) {
        let vm = this;
        this.$chartResizeTool.start(vm, this.data, e);
      },
      screenPageNo(val) {
        this.screenPageObj.pageNo = val;
        this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj, 'seriesScreen')
      },
      screenPageSize(val) {
        this.screenPageObj.pageSize = val;
        this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj, 'seriesScreen')
      },
      startLoading(area) {
        if (area === 'screen') {
          this.$refs['localLoadingScreen' + this.chartIndex].startLoading();
        } else {
          this.$refs['localLoading' + this.chartIndex].startLoading();
        }
      },
      endLoading(area) {
        if (area === 'screen') {
          this.$refs['localLoadingScreen' + this.chartIndex].endLoading();
        } else {
          this.$refs['localLoading' + this.chartIndex].endLoading();
        }
      },
      resize(chartItem) {
        let deHeight = this.$chartResizeTool.titleHeight + this.$chartResizeTool.chartTableBlankHeight;
        let container = document.querySelector('#chartTableDiv' + this.chartIndex + " .table-container");
        container.style.height = `calc(100% - ${deHeight * 2}px)`;
        this.tableHeight = `calc(100% - ${this.$refs.Pagination.$el.offsetHeight}px)`;
        this.$nextTick(() => {
          container.querySelector(".el-table__body-wrapper")._ps_.update();
        });
      },
      showLoad(chartItem) {
        //设置高度 chart-table
        this.$nextTick(() => {
          this.resize(chartItem);
        });
        this.startLoading();
        this.divFirstShow = true;
      },
      // 重新请求数据 刷新操作-local
      refreshChart() {
        this.dropdownMenuShow = false;
        this.startLoading();
        this.firstShow = false;
        this.$emit('on-refresh-data', this.data.id);
      },
      // 编辑图表
      editChart() {
        this.dropdownMenuShow = false;
        this.$emit('on-edit-chart-block', this.data.id);
      },
      // 删除该图表
      removeChart() {
        this.dropdownMenuShow = false;
        this.$emit('on-remove-chart-block', this.data.id);
      },
      //全屏时间条件查询
      dateChange(time) {
        this.searchTime = [...time];
        this.seriesItemScreen = [];
        for (let i = 0; i < 8; i++) {
          this.seriesItemScreen.push({//表格数据
            element: '',
            time: '',//采集时间
            value: '',//数值
          });
        }
        this.startLoading('screen');
        this.$emit('on-search-data', this.data.id, this.searchTime);
      },
      clickos() {
        this.dropdownMenuShow = false;
      },
      clearChart() {
        this.data = {};
      },
      duplicate() {
        this.dropdownMenuShow = false;
        const param = {id: this.data.id};
        this.$post('panel/' + this.data.panelId + '/charts/duplicate', (param)).then(response => {
          if (response.code === 200) {
            this.$message({
              duration: 2000,
              type: 'success',
              message: this.$t("tip.duplicateSuccess")
            });
            this.$emit('on-duplicate-chart-block', this.data.id, response.data);
          } else {
            if (response.msg) {
              this.$message.error(response.msg);
            } else if (response.error) {
              this.$message.error(response.error);
            } else {
              this.$message.error(response);
            }
          }
        });
      },
      // 全屏查看
      showAllScreen() {
        this.dropdownMenuShow = false;
        // 初始化同步时间
        this.searchTime = [];
        this.$set(this.searchTime, 0, this.oldSearchTime[0]);
        this.$set(this.searchTime, 1, this.oldSearchTime[1]);
        this.$refs.calendarPanel.setCustomTime(this.searchTime);

        this.seriesItemScreen = this.seriesItem;
        this.screenModal = true;
      },
      // 设置数据, filter区分
      setData(chartItem, seriesItem, panelId, filter, area, errorMsg) {
        if (errorMsg && errorMsg !== '') {
          this.isError = true;
          this.errorContent = errorMsg;
        } else {
          this.isError = false;
          this.errorContent = '';
        }
        this.data = chartItem;
        this.unit = chartDataFormat.getUnit(this.data.unit);
        seriesItem=seriesItem.map(item=>{
          if(chartItem.param.valueMapping && chartItem.param.valueMapping.type){
            let type=chartItem.param.valueMapping.type;
            let mappings=chartItem.param.valueMapping.mapping?chartItem.param.valueMapping.mapping:[];
            let value = item.value;

            let mapping;
            if(type == 'value'){
              mapping=mappings.find(t=>{return t.value == value})
            }else{
              mapping=mappings.find(t=>{return t.from <= value&& t.to >= value});
            }
            item.value = mapping?mapping.text:chartDataFormat.getUnit(chartItem.unit?chartItem.unit:2).compute(value,null,2);
          }
          return item;
        })
        if (area === 'showFullScreen') {//全屏按时间查询

          this.searchTime[0] = filter.start_time;//将列表的查询时间复制给全屏的查询时间
          this.searchTime[1] = filter.end_time;
          // this.seriesItemScreen = seriesItem;
          this.storedScreanTableData = seriesItem;
          this.storedScreanTableData = Object.assign([], this.storedScreanTableData.reverse());
          this.storedTableDataScreenOld = Object.assign([], this.storedScreanTableData);
          this.screenPageObj.total = this.storedScreanTableData.length;
          this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj, 'seriesScreen');
          this.endLoading('screen');
        } else {
          //设置高度 chart-table
          this.divFirstShow = true;
          this.$nextTick(() => {
            this.resize(chartItem);
          });
          this.firstShow = true; // 展示操作按键

          this.panelIdInner = panelId;
          this.storedTableData = seriesItem;
          this.storedScreanTableData = seriesItem;
          this.storedTableData = Object.assign([], this.storedTableData.reverse());
          this.storedScreanTableData = Object.assign([], this.storedScreanTableData.reverse());
          this.storedTableDataOld = Object.assign([], this.storedTableData);
          this.storedTableDataScreenOld = Object.assign([], this.storedScreanTableData);
          this.pageObj.total = this.storedTableData.length;
          this.screenPageObj.total = this.storedScreanTableData.length;
          this.seriesItem = this.filterShowData(this.storedTableData, this.pageObj, 'series');
          this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj, 'seriesScreen')
          if (filter) { // 保存数据,用于同步时间
            this.searchTime[0] = filter.start_time;//将列表的查询时间复制给全屏的查询时间
            this.searchTime[1] = filter.end_time;
            this.oldSearchTime[0] = this.searchTime[0];
            this.oldSearchTime[1] = this.searchTime[1];
          }
          this.endLoading();
        }
      },
      // 数据排序
      tableDataSort(item) {
        this.orderBy = {order: item.order, prop: item.prop};
        this.seriesItem = this.filterShowData(this.storedTableData, this.pageObj, 'series');
      },
      // 全屏数据排序
      tableDataSortScreen(item) {
        this.orderByScreen = {order: item.order, prop: item.prop};
        this.seriesItemScreen = this.filterShowData(this.storedScreanTableData, this.screenPageObj, 'seriesScreen')
      },
      dealLegendAlias: function (legend, expression) {
        if (/\{\{.+\}\}/.test(expression)) {
          let labelValue = expression.replace(/(\{\{.+?\}\})/g, function (i) {
            let label = i.substr(i.indexOf('{{') + 2, i.indexOf('}}') - i.indexOf('{{') - 2)
            let reg = new RegExp(label + '=".+?"')
            let value = null;
            if (reg.test(legend)) {
              let find = legend.match(reg)[0];
              value = find.substr(find.indexOf('"') + 1, find.lastIndexOf('"') - find.indexOf('"') - 1);
            }
            return value ? value : label;
          })
          return labelValue
        } else {
          return expression;
        }
      },
      // 获取格式
      getNumStr(num) {
        if (num) {
          if (num >= 1000) {
            const kbNum = num / 1000;
            if (kbNum >= 1000) {
              const mbNum = kbNum / 1000;
              if (mbNum >= 1000) {
                const gbNum = mbNum / 1000;
                if (gbNum >= 1000) {
                  const tbNum = gbNum / 1000;
                  if (tbNum >= 1000) {
                    const pbNum = tbNum / 1000;
                    return `${pbNum.toFixed(2)}PB`;
                  }
                  return `${tbNum.toFixed(2)}TB`;
                }
                return `${gbNum.toFixed(2)}GB`;
              }
              return `${mbNum.toFixed(2)}MB`;
            }
            return `${kbNum.toFixed(2)}KB`;
          }
          return num.toFixed(2);
        }
        return num;
      },
    },
    mounted() {
      this.firstLoad = false;
    },
    beforeDestroy() {
      this.clearChart();
    },
  };
</script>
