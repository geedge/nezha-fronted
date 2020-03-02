<style lang="scss" scoped>
@import './chart-table.scss';
</style>
<template>
    <div class="chart-table" :id="'chartTableDiv'+chartIndex" v-show="divFirstShow">
        <loading  :ref="'localLoading'+chartIndex"></loading>
      <!--
        <div v-show="showLoading" class="el-loading-mask" style="background-color: rgba(0, 0, 0, 0);">
          <div class="el-loading-spinner">
            <img width="42px" height="42px"  src="../../assets/img/loading.gif"/>
            <p class="el-loading-text loading-font">loading</p>
          </div>
        </div>
        -->
        <div class="clearfix">
            <div class="table-title" v-show="firstShow">
                {{data.title}}
            </div>
            <div class="nz-btn-group nz-btn-group-light edit button-panel-height"  v-show="firstShow">
              <button type="button" @click="refreshChart" style="padding: 6px 14px 5px 14px;" class="nz-btn nz-btn-size-large nz-btn-style-light"><i style="font-size: 16px;" class="global-active-color el-icon-refresh-right"></i></button><button
              @click="editChart" type="button" class="nz-btn nz-btn-size-large nz-btn-style-light" ><i class="nz-icon nz-icon-edit"></i></button><button
              @click="removeChart" type="button" class="nz-btn nz-btn-size-large nz-btn-style-light"><i class="el-icon-delete"></i></button><button
              @click="showAllScreen" type="button" class="nz-btn nz-btn-size-large nz-btn-style-light"><i class="el-icon-full-screen"></i></button>
            </div>

        </div>
        <div class="mt-10" v-cloak  v-show="firstShow">
            <el-table class="nz-table" :id="'tableContainer'+chartIndex" ref="tableContainer" :data="seriesItem" :height="350" border  tooltip-effect="light" v-cloak v-scrollBar:el-table>
                <el-table-column sortable :show-overflow-tooltip="true" prop="metric" :label="$t('dashboard.panel.chartTableColumn.metric')" ></el-table-column>
                <el-table-column sortable :show-overflow-tooltip="true" prop="label" :label="$t('dashboard.panel.chartTableColumn.label')" ></el-table-column>
                <el-table-column sortable prop="time" :label="$t('dashboard.panel.chartTableColumn.time')" width="145" ></el-table-column>
                <el-table-column sortable prop="value" :label="$t('dashboard.panel.chartTableColumn.value')" ></el-table-column>
            </el-table>
        </div>
        <!--全屏-->
          <el-dialog class="nz-dialog" :title="$t('dashboard.panel.view')"  :visible.sync="screenModal" width="96%"  @close="screenModal = false;" >
            <div slot="title">
              <span class="nz-dialog-title">{{data.title}}</span>
              <div class="float-right panel-calendar dialog-tool">
                <el-date-picker prefix-icon=" " size="mini" class="nz-dashboard-picker" ref="calendar" format="yyyy/MM/dd HH:mm" @change="dateChange" v-model="searchTime" type="datetimerange" :picker-options="pickerOptions" :range-separator="$t('dashboard.panel.to')" :start-placeholder="$t('dashboard.panel.startTime')" :end-placeholder="$t('dashboard.panel.endTime')" align="right">
                </el-date-picker>
                <!--<button @click="refreshChart" type="button" class="nz-btn nz-btn-size-normal nz-btn-style-light"><i style="font-size: 14px;" class="el-icon-refresh-right"></i></button>-->
              </div>
            </div>
                <el-table style="margin-top: 30px;" class="nz-table" :data="seriesItemScreen" :height="350" border  tooltip-effect="light" v-scrollBar:el-table>
                    <el-table-column sortable :show-overflow-tooltip="true" prop="metric" :label="$t('dashboard.panel.chartTableColumn.metric')" ></el-table-column>
                    <el-table-column sortable :show-overflow-tooltip="true" prop="label" :label="$t('dashboard.panel.chartTableColumn.label')" ></el-table-column>
                    <el-table-column sortable prop="time" :label="$t('dashboard.panel.chartTableColumn.time')" width="145" ></el-table-column>
                    <el-table-column sortable prop="value" :label="$t('dashboard.panel.chartTableColumn.value')" ></el-table-column>

                </el-table>
                <loading  :ref="'localLoadingScreen'+chartIndex"></loading>
            <!--
                <div v-show="showLoadingScreen" class="el-loading-mask" style="background-color: rgba(0, 0, 0, 0);">
                  <div class="el-loading-spinner">
                    <img width="42px" height="42px"  src="../../assets/img/loading.gif"/>
                    <p class="el-loading-text loading-font">loading</p>
                  </div>
                </div>
                -->
        </el-dialog>
    </div>
</template>

<script>
import bus from '../../libs/bus';
import {Loading} from 'element-ui';
import loading from "../common/loading";

export default {
    name: 'chartTable',
  components: {
    'loading': loading,
  },
    props: {
        // 看板id
        panelId: {
            type: Number,
            default: 0,
        },
        editChartId: {
          type: String,
          default: 'editChartId',
        },
        chartIndex:{
          type: Number,
          default: 0,
        }
    },
    data() {
        return {
            data: {}, // 该图表信息,chartItem
            seriesItem: [], // 保存信息
            seriesItemScreen:[],//全屏数据
            images: '',
            //toolbox: false,
            loading:Object,
            items: {
                metric_name: [], // 每条数据列名称
                xAxis: [],
                theData: [], // series数据组
            },
            panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
            firstLoad: false, // 是否第一次加载
            //showLoading:true,
            //showLoadingScreen:false,
            //showTable:true,
            chartType: 'table', // 图表类型
            screenModal: false,
            // 查询数据使用
            filter: {
                start_time: '',
                end_time: '',
            },
            stableFilter: {}, // 保存数据使用,初始化起止时间,单图or多图等
            firstShow: false, // 默认不显示操作按钮,
            divFirstShow:false,
            //tableLoading: false,
            columns: [{
                title: 'metric',
                key: 'metric',
                width: 200,
                sortable: true,
            }, {
                title: 'Label', //tag
                key: 'name',
                minWidth: 200,
                sortable: true,
            }, {
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
            pickerOptions: {
                shortcuts: [{
                    text: this.$t("dashboard.panel.recOne"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setHours(start.getHours() - 1);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.recFour"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setHours(start.getHours() - 4);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.recOneDay"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(start.getDate() - 1);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.yesterday"),
                    onClick(picker) {
                        const start = new Date();
                        const end = new Date();
                        start.setDate(start.getDate() - 1);
                        start.setHours(0);
                        start.setMinutes(0);
                        start.setSeconds(0);
                        end.setDate(end.getDate() - 1);
                        end.setHours(23);
                        end.setMinutes(59);
                        end.setSeconds(59);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.recSevenDay"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(start.getDate() - 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.recOneMonth"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(start.getDate() - 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.curMonth"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(1);
                        start.setHours(0);
                        start.setMinutes(0);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: this.$t("dashboard.panel.lastMonth"),
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(1);
                        start.setMonth(start.getMonth() - 1);
                        end.setDate(0);
                        start.setStart();
                        end.setEnd();
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
        };
    },
    computed: {},
    watch: {},
    methods: {
        startLoading(area){
          if(area==='screen'){
            //this.showLoadingScreen = true;
            this.$refs['localLoadingScreen'+this.chartIndex].startLoading();
          }else {
            //this.showLoading = true;
            this.$refs['localLoading'+this.chartIndex].startLoading();
          }
/*
          //this.loading = this.$loading({
          this.loading = Loading.service({
            lock:true,
            text:'loading',
            background:'rgba(0,0,0,0)',
            customClass:'loading-font',
            //fullscreen: false,
            target:document.getElementById('chartTableDiv')
          })
*/
        },
        endLoading(area){
          if(area==='screen'){
            //this.showLoadingScreen = false;
            this.$refs['localLoadingScreen'+this.chartIndex].endLoading();
          }else {
            //this.showLoading = false;
            this.$refs['localLoading'+this.chartIndex].endLoading();
          }
        },
        clearData(){
        },
        showLoad(chartItem) {
          //设置高度 chart-table
          this.$nextTick(() => {
            const chartBox = document.getElementById('chartTableDiv'+this.chartIndex);
            let height = chartItem.height;
            if(height<200){
              height = 200;
            }
            chartBox.style.height = `${height-25}px`;
            const tableBox = document.getElementById('tableContainer'+this.chartIndex);
            tableBox.style.height = `${height-75}px`;
          });
          this.startLoading();
          this.divFirstShow = true;
          //this.tableLoading = true;
        },
        // 展示图表编辑区
      /*
        showTool() {
            this.toolbox = !this.toolbox;
        },
        */
        // 重新请求数据 刷新操作-local
        refreshChart() {
            this.startLoading();
            this.firstShow = false;
            this.$emit('on-refresh-data', this.data.id);
        },
        // 编辑图表
        editChart() {
            this.$emit('on-edit-chart-block', this.data.id);
        },
        // 删除该图表
        removeChart() {
            this.$emit('on-remove-chart-block', this.data.id);
        },
        //全屏时间条件查询
        dateChange(time) {
            //this.filter.start_time = bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss');
            //this.filter.end_time = bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss');
            //this.showTable = false;
            this.seriesItemScreen = [];
            for(let i=0;i<8;i++){
              this.seriesItemScreen.push({//表格数据
                label: '',//label
                metric: '',//metric列
                time: '',//采集时间
                value: '',//数值
              });
            }
            this.startLoading('screen');
            //this.tableLoading = true;
            //this.firstShow = false;
            this.$emit('on-search-data', this.data.id, this.searchTime);
        },
        // 全屏查看
        showAllScreen() {
            // 初始化同步时间
            //this.searchTime = this.oldSearchTime;
          //alert(JSON.stringify(this.oldSearchTime));
            this.searchTime = [];
            this.searchTime[0] = this.oldSearchTime[0];//将列表的查询时间复制给全屏的查询时间
            this.searchTime[1] = this.oldSearchTime[1];
            this.seriesItemScreen = this.seriesItem;
            this.screenModal = true;
            //this.startLoading('screen');
            //this.endLoading('screen');
        },
        // 设置数据, filter区分
        setData(chartItem, seriesItem, panelId, filter,area) {
            if(area==='showFullScreen'){//全屏按时间查询
              this.data = chartItem;
              this.searchTime[0] = filter.start_time;//将列表的查询时间复制给全屏的查询时间
              this.searchTime[1] = filter.end_time;
              this.seriesItemScreen = seriesItem;
              this.endLoading('screen');
            }else{
              //设置高度 chart-table
              this.$nextTick(() => {
                const chartBox = document.getElementById('chartTableDiv'+this.chartIndex);
                let height = chartItem.height;
                if(height<200){
                  height = 200;
                }
                chartBox.style.height = `${height-25}px`;
                const tableBox = document.getElementById('tableContainer'+this.chartIndex);
                tableBox.style.height = `${height-75}px`;
              });
              this.divFirstShow = true;

              this.firstShow = true; // 展示操作按键

              this.panelIdInner = panelId;
              this.data = chartItem;
              this.seriesItem = seriesItem;
              this.seriesItemScreen = seriesItem;
              if (filter) { // 保存数据,用于同步时间
                this.searchTime[0] = filter.start_time;//将列表的查询时间复制给全屏的查询时间
                this.searchTime[1] = filter.end_time;
                this.oldSearchTime[0] = this.searchTime[0];
                this.oldSearchTime[1] = this.searchTime[1];
              }

              this.endLoading();
              //this.showTable = true;
              //this.tableLoading = false;
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
    beforeDestroy() {},
};
</script>
