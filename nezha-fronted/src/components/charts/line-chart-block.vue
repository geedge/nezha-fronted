<style lang="scss">
  @import './line-chart-block.scss';
</style>
<template>
  <div class="line-chart-block" >

    <div class="edit">
      <div class="list-icon" v-if="firstShow">
        <span @click="refreshChart" :title="$t('dashboard.refresh')" class="set-icon" v-if="showSetting">
          <i class="el-icon-refresh-right"></i>
        </span>
        <span @click="editChart" :title="$t('dashboard.edit')" class="set-icon" v-if="showSetting">
          <i class="el-icon-edit-outline"></i>
        </span>
        <span @click="removeChart" :title="$t('dashboard.delete')" class="set-icon" v-if="showSetting">
          <i class="el-icon-delete"></i>
        </span>
        <span @click="showAllScreen" :title="$t('dashboard.screen')" class="set-icon">
          <i class="el-icon-full-screen"></i>
        </span>
      </div>
    </div>

    <div class="line-area" ref="lineChartArea" style=""></div>
    <!--
    <Modal title="查看" v-model="screenModal" width="96%" class="line-chart-block-modal">-
    <el-dialog class="line-chart-block-modal"
      title="查看"
      :visible.sync="screenModal"
      width="90%"
      :before-close="handleClose">
     <el-row>
        <div class="float-right">
          全屏，日期选择组件
          <calendar-select placement="bottom-end" ref="dateSelect" @on-date-change="dateChange"></calendar-select>

        </div>
      </el-row>>
      <div class="line-area" ref="screenShowArea" id="lineChartArea"></div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  -->
    <!--</Modal>-->
  </div>
</template>
<script>
import axios from 'axios';
//import highstock from 'highcharts/highstock';
import echarts from 'echarts';
import bus from '../../libs/bus';
//import calendarSelect from '../page/calendar-select';
//import { getQueryChart } from '../../models/service';

//require('highcharts/modules/no-data-to-display')(highstock);

export default {
  name: 'lineChartBlock',
  components: {
    //calendarSelect,
  },
  props: {
    editChartId: {
      type: String,
      default: 'editChartId',
    },
    // 看板id
    panelId: {
      type: Number,
      default: 0,
    },
    // 展示设置内容
    showSetting: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      data: {}, // 该图表信息,chartItem
      seriesItem: [], // 保存信息
      images: '',
      toolbox: false,
      items: {
        metric_name: [], // 每条数据列名称
        xAxis: [],
        theData: [], // series数据组
      },
      panelIdInner: '', // 看板id=panelId,原写作chart,由set_data获取
      chartName: '',
      firstLoad: false, // 是否第一次加载
      highchartStore: null, // 保存图表数据
      echartStore:null,// 保存图表数据
      highchartModalStore: null, // 全屏查看时数据
      chartType: 'line', // 图表类型
      screenModal: false,
      // 查询数据使用
      filter: {
        start_time: '',
        end_time: '',
      },
      stableFilter: {}, // 保存数据使用,初始化起止时间,单图or多图等
      firstShow: false, // 默认不显示操作按钮,
    };
  },
  computed: {
    /*
    typeVisible() {
      if (this.data.type === 'line' || this.data.type === 'bar' || this.data.type === 4) {
        return true;
      }
      return false;
    },
*/
  },
  watch: {},
  methods: {
    // chartSite用于区分是全屏显示还是局部显示
    initChart(chartInfo, dataArg, ele, chartSite,legend) {
      this.firstShow = true; // 展示操作按键
      const self = this;
      this.chartType = ''; // 图表类型
      if ( chartInfo.type === 4) {//line,bar
        this.chartType = 'line';
      }

      //var myEchart = echarts.init(document.getElementById('lineChartArea'));
      this.echartStore = echarts.init(ele);
      var option = {
        title: {
          text: chartInfo.title || null,
          textAlign: 'left',
          useHTML: true,
          textStyle: {
            //display: 'inline-block',//无此属性
            width: '300px',
          }
        },
        color: ['#7bbfea', '#b3424a', '#f05b72', '#596032', '#bd6758',
          '#cd9a5b', '#918597', '#70a19f', '#005344', '#FF00FF',
          '#f7acbc', '#5f5d46', '#66ffff', '#ccFF66', '#f47920',
          '#769149', '#1d953f', '#abc88b', '#7f7522', '#9b95c9',
          '#f3715c', '#ea66a6', '#d1c7b7', '#9d9087', '#77787b',
          '#f58220', '#c37e00', '#00ae9d', '#f26522', '#76becc',
          '#76624c', '#d71345', '#2468a2', '#ca8687', '#1b315e',
        ],
        tooltip: {
          trigger: 'axis',
          confine:true
        },
        legend: {
          show:true,
          formatter:function(name){
            if(!name){
              return '';
            }
            if(name.length>5){
              return name.slice(0,5)+'...';
            }
          },
          tooltip:{show:true},
          data: legend,
          //orient:'vertical',
          x:'center',
          y:'top',
          top:'5%',
          //bottom:0
        },
        grid: {

          bottom: '10%',
          containLabel: true
        },
        dataZoom: [{
          type: 'inside',
          start: 0,
          end: 100,
          height:15
        }, {
          start: 0,
          end: 100,
          handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%',
          handleStyle: {
            color: '#fff',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          }
        }],

        xAxis: {
          type: 'time',
          //boundaryGap: false,//line-false; bar-true;
          //data: ['20190101', '20190102', '周三', '周四', '周五', '周六', '周日']
          axisLabel: {
            intervale: 0,
            rotate: 0,
            formatter: function (value) {
              var t_date = new Date(value);
              return [t_date.getFullYear(), t_date.getMonth() + 1, t_date.getDate()].join('-') + "\n"
                + [t_date.getHours(), t_date.getMinutes()].join(':');
            }
          },
          axisPointer: {//y轴上显示指针对应的值
            show: true,
          },
          splitLine:{
            show:false
          }
        },
        yAxis: {
          type: 'value',
          splitLine:{
            show:true
          }
        },
        useUTC: false,//使用本地时间
        series: dataArg
      };

      // params.series = dataArg;
      if (chartSite === 'local') { // 本地显示
        /*
        option.series = dataArg.map((item) => {// params.series = dataArg.map((item) => {
          const obj = Object.assign(item);
          /*
          obj.events = {
            // eslint-disable-next-line
            legendItemClick: function(event) {//点击metric的事件，可以用默认的先
              event.preventDefault();
              let visibleAll = true; // 全部显示
              let visibleThis = true; // 点击是否是当前显示的那个条目
              self.highchartStore.series.forEach((serie, i) => {
                // 最后一个为导航,排除。
                if (i !== self.highchartStore.series.length - 1) {
                  // 查看是否为显示一条状态数据,如果有非显示状态的,表示当前只显示一条数据
                  if (!serie.visible) {
                    visibleAll = false;
                    // 点击前显示单个,判断是否点击为正在显示那个,该种情况表示点击了其他隐藏状态数据
                    if (event.target.index === i) { // one to another
                      visibleThis = false;
                    }
                  }
                }
              });
              // 根据visibleAll和visibleThis判断是要显示一个还是全显示
              // 当visibleAll为true(表示all => one)
              // visibleAll为false: visibleThis为false(one => another one)。
              // visibleAll为false: visibleThis为true(one => all)。
              if (visibleAll || !visibleThis) { // 隐藏显示其中一个
                self.highchartStore.series.forEach((serie, i) => {
                  const operateObj = serie;
                  // 除显示条目以外,还有一条serie是导航栏
                  if (i !== self.highchartStore.series.length - 1) {
                    if (event.target.index === i) {
                      operateObj.setVisible(true, false);
                    } else {
                      operateObj.setVisible(false, false);
                    }
                  } else {
                    operateObj.setVisible(true, false);
                  }
                });
                self.highchartStore.redraw();
              } else { // 全部显示
                self.highchartStore.series.forEach((serie) => {
                  const operateObj = serie;
                  operateObj.setVisible(true, false);
                });
                self.highchartStore.redraw();
              }
            },
          };

          return obj;
        });
        */
        this.echartStore.setOption(option);//创建图表
      } else if (chartSite === 'screen') { // 全屏显示
        option.series = dataArg.map((item) => {// params.series = dataArg.map((item) => {
          const obj = Object.assign(item);
          obj.events = {
            // eslint-disable-next-line
            legendItemClick: function(event) {
              event.preventDefault();
              let visibleAll = true; // 全部显示
              let visibleThis = true; // 点击是否是当前显示的那个条目
              self.highchartModalStore.series.forEach((serie, i) => {
                if (i !== self.highchartModalStore.series.length - 1) {
                  if (!serie.visible) {
                    visibleAll = false;
                    if (event.target.index === i) {
                      visibleThis = false;
                    }
                  }
                }
              });
              if (visibleAll || !visibleThis) {
                self.highchartModalStore.series.forEach((serie, i) => {
                  const operateObj = serie;
                  if (i !== self.highchartModalStore.series.length - 1) {
                    if (event.target.index === i) {
                      operateObj.setVisible(true, false);
                    } else {
                      operateObj.setVisible(false, false);
                    }
                  } else {
                    operateObj.setVisible(true, false);
                  }
                });
                self.highchartModalStore.redraw();
              } else {
                self.highchartModalStore.series.forEach((serie) => {
                  const operateObj = serie;
                  operateObj.setVisible(true, false);
                });
                self.highchartModalStore.redraw();
              }
            },
          };
          return obj;
        });
        // eslint-disable-next-line
        this.echartStore.setOption(option);//显示全屏界面
      }
    },
    // 设置数据, filter区分
    setData(chartItem, seriesItem, panelId, filter,legend) {
      if (filter) { // 保存数据,用于同步时间
        this.stableFilter = filter;
      }
      this.panelIdInner = panelId;
      this.data = chartItem;
      this.seriesItem = seriesItem;
      this.initChart(chartItem, seriesItem, this.$refs.lineChartArea, 'local',legend);
      if (chartItem.type === 'line' || chartItem.type === 'bar' || chartItem.type === 4) {
        this.initChart(chartItem, seriesItem, this.$refs.lineChartArea, 'local',legend);
      }
    },
    // 删除该图表
    removeChart() {
      this.$emit('on-remove-chart-block', this.data.id);
    }
    /*
    handleClose(done) {
      /*
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => {});

    },*/
  /*
    // 展示图表编辑区
    showTool() {
      this.toolbox = !this.toolbox;
    },
    // 修改图表类型
    changeChart(type) {
      this.chartType = type;
      this.highchartStore.update({
        chart: {
          type: this.chartType,
        },
      });
    },
    // 重新请求数据 刷新操作-> console, create-board
    refreshChart() {
      this.highchartStore.showLoading();
      this.$emit('on-refresh-data', this.data.id);
    },
    // 编辑图表
    editChart() {
      this.$emit('on-edit-chart-block', this.data.id);
    },
    },
    // 全屏查看
    showAllScreen() {
      // 初始化同步时间
      this.filter.start_time = this.stableFilter.start_time;
      this.filter.end_time = this.stableFilter.end_time;
      this.screenModal = true;
      // 全屏绘图
      this.initChart(this.data, this.seriesItem, this.$refs.screenShowArea, 'screen');
      // 日期组件同步时间
      this.$refs.dateSelect.initTime({
        start: this.stableFilter.start_time,
        end: this.stableFilter.end_time,
      });
    },
    dateChange(time) {
      this.filter.start_time = `${time[0]}:00`;
      this.filter.end_time = `${time[1]}:59`;
      if (this.showSetting) {
        this.getQueryChart('list');
      } else {
        this.getQueryChart('dashboard');
      }
    },
    // 查询数据,修改日期查询全屏数据
    getQueryChart(type) {
      if (this.highchartModalStore) {
        this.highchartModalStore.showLoading();
      }
      let axiosArr = [];
      if (type === 'list') { // 普通模式,主控台使用
        axiosArr = this.data.elements.map((ele) => {
          const filterItem = ele;
          return getQueryChart({
            product_id: this.productId,
            metric: filterItem.metric,
            tags: filterItem.tags,
            start: this.filter.start_time,
            end: this.filter.end_time,
          });
        });
      } else if (type === 'dashboard') { // 概览模式,指标概览中使用
        // 概览模式,需要区分单独一个和多个
        if (this.stableFilter.chartCount === 'multiple') {
          // 所有tag标签
          const tagAllArr = this.proTags(this.data.tags);
          // 根据title格式化的标签
          const titles = this.data.title.split(',');
          const titleArr = titles.map(item => item.trim());
          // 获取所需标签
          const tagArr = this.getCompilation(tagAllArr, titleArr);
          axiosArr = [getQueryChart({
            product_id: this.productId,
            metric: this.data.metric,
            tags: tagArr.toString(),
            start: this.filter.start_time,
            end: this.filter.end_time,
          })];
        } else {
          axiosArr = [getQueryChart({
            product_id: this.productId,
            metric: this.data.metric,
            tags: this.data.tags,
            start: this.filter.start_time,
            end: this.filter.end_time,
          })];
        }
      }
      // 一个图表
      axios.all(axiosArr).then((res) => {
        if (res.length > 0) {
          const series = [];
          const sumData = {
            name: 'sum',
            data: [],
            visible: true,
            threshold: null,
          };
          res.forEach((response) => {
            if (response.data.code === 200) {
              if (response.data.data) {
                // 循环处理每个elements下获取的数据列
                response.data.data.forEach((queryItem) => {
                  const seriesItem = {
                    theData: {
                      name: '',
                      data: [],
                      visible: true,
                      threshold: null,
                    },
                    metric_name: '',
                  };
                  // 图表中每条线的名字,后半部分
                  let host = `${queryItem.metric}, `;
                  const tagsArr = Object.keys(queryItem.tags);
                  // 设置时间-数据格式对
                  const dpsArr = Object.entries(queryItem.dps);
                  if (tagsArr.length > 0 && dpsArr.length > 0) {
                    tagsArr.forEach((tag, i) => {
                      if (tag !== 'uuid') {
                        host += i === 0 ? `${tag}=${queryItem.tags[tag]}` : `, ${tag}=${queryItem.tags[tag]}`;
                      }
                    });
                    // 图表中每条线的名字,去掉最后的逗号与空格
                    seriesItem.theData.name = host;
                    seriesItem.metric_name = seriesItem.theData.name;
                    // 将秒改为毫秒
                    seriesItem.theData.data = dpsArr.map((dpsItem, dpsIndex) => {
                      if (sumData.data[dpsIndex]) {
                        const sumNum = sumData.data[dpsIndex][1] || 0;
                        sumData.data[dpsIndex][1] = sumNum + dpsItem[1];
                      } else {
                        sumData.data[dpsIndex] = [dpsItem[0] * 1000, dpsItem[1]];
                      }
                      return [dpsItem[0] * 1000, dpsItem[1]];
                    });
                    series.push(seriesItem.theData);
                  }
                });
              }
            }
          });
          if (series.length && this.data.type === 4) {
            series.push(sumData);
          }
          this.initChart(this.data, series, this.$refs.screenShowArea, 'screen');
        }
      }).catch((error) => {
        if (error) {
          this.$Message.warning({
            content: '请稍后刷新',
            duration: 3,
          });
        }
      });
    },

    showLoad() {
      if (this.highchartStore) {
        this.highchartStore.showLoading();
      }
    },
    // 获取格式
    getNumStr(num) {
      if (num >= 1000) {
        const kbNum = num / 1000;
        if (kbNum >= 1000) {
          const mbNum = kbNum / 1000;
          if (mbNum > 1000) {
            const gbNum = mbNum / 1000;
            if (gbNum > 1000) {
              const tbNum = gbNum / 1000;
              if (tbNum > 1000) {
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
    },
    // 获取tag数组
    proTags(data) {
      const dou = data.indexOf(',');
      const tmp = [];
      if (dou === -1) {
        const set = data.split('=');
        if (set[1].indexOf('|') > -1) {
          const valueArr = set[1].split('|');
          valueArr.forEach((keyV) => {
            tmp.push(`${set[0]}=${keyV}`);
          });
        } else {
          tmp.push(`${set[0]}=${set[1]}`);
        }
      } else {
        const mid = data.split(','); // ['key=v1','key=v2',....]
        mid.forEach((item) => {
          const setInner = item.split('=');
          if (setInner[1].indexOf('|') > -1) {
            const valueArr = setInner[1].split('|');
            valueArr.forEach((keyV) => {
              tmp.push(`${setInner[0]}=${keyV}`);
            });
          } else {
            tmp.push(`${setInner[0]}=${setInner[1]}`);
          }
        });
      }
      return tmp;
    },
    // 获取交集,取得所需tags进行查询,k1=v1,k2=v2
    getCompilation(arr1, arr2) {
      const arr = [];
      if (arr1.length && arr2.length) {
        arr1.forEach((item) => {
          if (arr2.indexOf(item) > -1) {
            arr.push(item);
          }
        });
        return arr;
      }
      return [];
    },
    */
  },
  mounted() {
    this.firstLoad = false;
  },
  beforeDestroy() {},
};

</script>
