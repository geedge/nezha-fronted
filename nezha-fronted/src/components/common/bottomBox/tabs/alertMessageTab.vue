<template>
  <span>
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">
          <template v-if="from == 'asset'">{{obj.host}}</template>
          <template v-if="from == 'alertRule'">{{obj.alertName}}</template>
        </div><div
        class="sub-list-tab" @click="changeTab(from == 'asset' || from == 'alertRule' ? 'panel' : 'detail')">{{$t("overall.detail")}}</div><div
        class="sub-list-tab sub-list-tab-active">{{$t("asset.tableTitle.alerts")}}</div><div v-if="from == 'asset'"
        class="sub-list-tab" @click="changeTab('endpoint')">{{$t("asset.tableTitle.modules")}}</div>
      </div>
      <div class="top-tool-right">
        <div class="top-tool-search">
          <search-input :default-item="'alertMessageState'" :default-value="defaultSearchValue" :searchMsg="searchMsg" @search="search"></search-input>
        </div>
        <button type="button" @click="importBox.show = true" :title="$t('overall.exportExcelLower')"
            class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="alert-list-export">
          <i class="el-icon-download"></i>
        </button>
      </div>
    </div>
    <alertMessageTable
      :tableData="tableData"
      :loading="loading"
      :tableHeight="$tableHeight.openSubList.subList"
      :tableId="tableId"
      @tableDataSort="tableDataSort"
      @deleteMessage="deleteMessage"
      :from="'alertMessageTab'"
      :fromPath="'/alertList'"
    ></alertMessageTable>
    <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
    <!--<element-set-->
      <!--v-if="showElementSet"-->
      <!--v-clickoutside="elementsetHide"-->
      <!--:table-title="tableTitle"-->
      <!--:dropCol="dropCol"-->
      <!--:path="'/alertList'"-->
      <!--@close="elementsetHide"-->
      <!--@tablelable="tablelabelEmit"-->
      <!--ref="elementset"-->
    <!--&gt;</element-set>-->
    <!--导出-->
    <div class="export-xlsx">
      <el-dialog :visible.sync="importBox.show" :title="importBox.title" :modal-append-to-body='false' :show-close="true" width="300px" @close="importBox.show = false" class="nz-dialog">
        <div class="upload-body">
          <button @click="exportCur" class="el-button el-button--default el-button--small">
            <span>{{$t('overall.exportCur')}}</span>
          </button>
          <button @click="exportAll" class="el-button el-button--default el-button--small">
            <span>{{$t('overall.exportAll')}}</span>
          </button>
        </div>
      </el-dialog>
    </div>
    <!--export-->
    <div class="export-xlsx">
      <el-dialog :visible.sync="deleteBox.show" :title="$t('overall.delete')" :modal-append-to-body='false' :show-close="true" width="300px" @close="deleteBox.show = false" class="nz-message">
        <div class="upload-body">
          <el-input type="textarea" :placeholder="$t('alert.description')" v-model="deleteBox.remark"></el-input>
          <div style="text-align: right; margin-top: 10px;">
            <button @click="deleteBox.show = false" class="el-button el-button--default el-button--small">
              <span>{{$t('tip.no')}}</span>
            </button>
            <button @click="deleteMessage" class="el-button el-button--default el-button--small el-button--primary">
              <span>{{$t('tip.yes')}}</span>
            </button>
          </div>
        </div>
      </el-dialog>
    </div>

    <el-dialog class="line-chart-block-modal nz-dialog endpoint-dialog"
               :title="$t('overall.detail')"
               :visible.sync="graphShow"
               width="90%"
               id="viewGraphDialog"
               @close="dialogClose">
      <div slot="title">
        {{$t("project.endpoint.dialogTitle")}}
        <div class="float-right panel-calendar dialog-tool" style="display: flex">
          <pick-time :refresh-data-func="queryChartDate" :use-refresh="false" v-model="searchTime" style="height: 28px;" @unitChange="chartUnitChange"></pick-time>
        </div>
      </div>
      <chart ref="messageChart" :unit="chartUnit"></chart>
    </el-dialog>
  </span>
</template>

<script>
  import axios from 'axios';
  import nzAlertTag from '../../../page/alert/nzAlertTag';
  import chart from '../../../page/dashboard/overview/chart'
  import bus from '../../../../libs/bus'
  import alertMessageTable from '@/components/common/alert/alertMessageTable.vue'
  export default {
    name: "alertMessageTab",
    components: {
      'nz-alert-tag': nzAlertTag,
      'chart': chart,
      'alertMessageTable':alertMessageTable,
    },
    props: {
      from: String, //来自哪个主页面，有："asset"、"alertRule"
      obj: Object, //关联的实体对象
    },
    data() {
      return {
        //详情相关
        graphShow: false,
        chartDatas: [],
        legend: [],
        sameLabels: ['instance','module','project','asset','endpoint','datacenter'],
        searchTime: [new Date().setHours(new Date().getHours() - 1), new Date()],
        currentMsg: {},
        chartUnit: 5,
        requestIndex:0,
        defaultSearchValue: this.obj.alertNum ? 1 : 0,
        showElementSet: false,
        tableId: 'alertListTable', //需要分页的table的id，用于记录每页数量
        showTopBtn: false, //top按钮是否显示
        loading: false,
        pageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },

        tableHover: false, //控制滚动条和top按钮同时出现

        importBox: {show: false, title:this.$t('overall.exportExcel')},
        deleteBox: {show: false, ids: "", remark: '', state: 2},

        tableTitle: [
          {
            label: 'ID',
            prop: 'id',
            show: true,
            width: 80
          }, {
            label: this.$t("alert.alertName"),
            prop: 'alertRule',
            show: true,
            width: 180
          }, {
            label: this.$t("alert.list.labels"),
            prop: 'labels',
            show: true,
          }, {
            label: this.$t("alert.severity"),
            prop: 'severity',
            show: true,
            width: 100
          }, {
            label: this.$t('alert.summary'),
            prop: 'summary',
            show: true
          }, {
            label: this.$t('alert.description'),
            prop: 'description',
            show: true
          }, {
            label: this.$t('alert.list.state'),
            prop: 'state',
            show: true,
            width: 100
          }, {
            label: this.$t("alert.startAt"),
            prop: 'startAt',
            show: true,
          }, {
            label: this.$t('alert.endAt'),
            prop: 'endAt',
            show: true,
          }, {
            label: this.$t('overall.value'),
            prop: 'current',
            show: true
          }, {
            label: this.$t('overall.option'),
            prop: 'option',
            show: true,
            width: 90
          }
        ],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 2,
            name: this.$t('alert.alertName'),
            type: 'input',
            label: 'alertName',
            disabled: false
          }, {
            id:20,
            name: this.$t('project.project.project'),
            type: 'project',
            label: 'project',
            disabled: false
          }, {
            id:21,
            name: this.$t('project.module.module'),
            type: 'module',
            label: 'module',
            disabled: false
          }, {
            id:22,
            name: this.$t('project.endpoint.endpoint'),
            type: 'input',
            label: 'endpointId',
            disabled: false
          }, {
            id: 4,
            name: this.$t('alert.severity'),
            type: 'selectString',
            label: 'severity',
            disabled: false
          }, {
            id: 11,
            name: this.$t('asset.asset'),
            type: 'asset',
            label: 'asset',
            disabled: false
          }, {
            id: 12,
            name: this.$t('alert.list.state'),
            type: 'select',
            label: 'alertMessageState',
            disabled: false
          }],
        },
        searchLabel: { //搜索参数

        },
        tablelable: [],
        dropCol: [],
        tableData: [],
      }
    },
    computed: {
      tagType() {
        return (key) => {
          if (key == 'asset' || key == 'module' || key == 'project' || key == 'datacenter' || key == 'endpoint') {
            return "normal";
          } else {
            return "info";
          }
        }
      },
      tagValue() {
        return (key, value) => {
          if (key == 'type') {
            if (value ==  1) {
              value = this.$t("project.project.project");
            } else if (value == 2) {
              value = this.$t("module.module.module");
            } else if (value == 3) {
              value = this.$t("asset.asset");
            }
          }
          return key + "：" + value;
        }
      }
    },
    methods: {
      elementsetShow(s, e) {
        this.showElementSet = true;
        this.$nextTick(() => {
          var eventfixed = {
            shezhi: 0,
            screen: 0
          };
          eventfixed[s] = 1;
          e.preventDefault();
          this.$store.commit('setHeaderTable', this.tablelable);
          this.$store.commit('setEventfixed', eventfixed);
          const h = document.documentElement.clientHeight;
          const w = document.documentElement.clientWidth;
          const dw = this.$refs.elementset.$el.offsetWidth;
          const dh = this.$refs.elementset.$el.offsetHeight;
          let positionx =
            e.clientX + dw <= w - 10 ? e.clientX + 14 : e.clientX + 14 - dw;
          let positiony =
            e.clientY + dh <= h - 10
              ? e.clientY
              : e.clientY - (e.clientY + dh - h);
          this.$store.commit('setPosition', {positionx, positiony});
        });
      },
      elementsetHide() {
        //悬浮点击空白隐藏
        //this.$refs.elementset.elementsetHide();
        this.showElementSet = false;
      },
      tablelabelEmit(data) {
        //获取子组件传过来的参数
        this.$store.commit('setHeaderTable', data);
        this.tablelable = data;
        this.dropCol = data;
      },
      // 切换tab
      changeTab(tab) {
        this.$emit('changeTab', tab);
      },
      deleteMessage(deleteBox) {
        this.$put("alert/message", deleteBox).then(res => {
          if (res.code === 200) {
            this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.getAlertList();
          } else {
            this.$message.error(res.msg);
          }
        })
      },
      exportCur:function(){
        this.exportExcel(this.searchLabel);
        this.importBox.show = false;
      },
      getTimeString:function(){
        let split='-';
        let date=new Date();
        let year=date.getFullYear();
        let month=this.formatNum(date.getMonth()+1);
        let day=this.formatNum(date.getDate());
        let hours=this.formatNum(date.getHours());
        let minutes=this.formatNum(date.getMinutes());
        let seconds=this.formatNum(date.getSeconds());
        return year + split + month + split + day + ' ' + hours + split + minutes + split + seconds;
      },
      formatNum:function(num){
        return num>9?num:'0'+num;
      },
      exportAll:function(){
        let temp = JSON.parse(JSON.stringify(this.searchLabel));
        temp.pageSize = -1;
        this.exportExcel(temp);
        this.importBox.show = false;
      },
      exportExcel:function(params){
        let temp=this;
        if(!params){
          params=temp.params;
        }
        axios.get("alert/message/export", {responseType:'blob', params: params}).then(res=>{
          let fileName = 'alert-message-'+temp.getTimeString()+'.xlsx';
          if(window.navigator.msSaveOrOpenBlob){
            // 兼容ie11
            let blobObject = new Blob([res.data]);
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
          }else{
            let url = URL.createObjectURL(new Blob([res.data]));
            let a = document.createElement('a');
            document.body.appendChild(a); //此处增加了将创建的添加到body当中
            a.href = url;
            a.download = fileName;
            a.target = '_blank';
            a.click();
            a.remove(); //将a标签移除
          }
        })
      },
      queryChartDate() {
        let start = this.searchTime[0]?this.searchTime[0]:this.getTime(-1, 'h');
        let end = this.searchTime[1]?this.searchTime[1]:this.getTime(0, 'h')
        this.searchTime = [start, end];
        let timeDiff = (new Date(end).getTime()-new Date(start).getTime())/1000/(24*60*60);
        let step = '15s';
        if(timeDiff< 1){
          step='15s';
        }else if(timeDiff < 7){
          step='5m';
        }else if(timeDiff<30){
          step='10m';
        }else{
          step='30m';
        }
        let axiosArr=[];
        let paramStr = JSON.stringify(this.promQueryParamConvert(this.currentMsg));
        axiosArr.push(axios.get("/prom/api/v1/query_range?query="+paramStr.substring(1, paramStr.length-1).replace(/\+/g, "%2B").replace(/ /g, "%20").replace(/\\/g, "")+"&start="+this.$stringTimeParseToUnix(start)+"&end="+this.$stringTimeParseToUnix(end)+"&step="+step));
        this.legend = [];
        this.chartDatas = [];
        axios.all(axiosArr).then(res =>{
          try {
            res.forEach((response, promIndex) => {
              if (response.status == 200) {
                if (response.data.status == 'success') {
                  let queryData = response.data.data.result[0];
                  if (queryData) {
                    let chartData = {
                      type: "line",
                      symbol: 'none',  //去掉点
                      smooth: 0.2,  //曲线变平滑
                      name: '',
                      lineStyle: {
                        width: 1,
                        opacity: 0.9
                      },
                    };
                    chartData.name += "{";
                    alias += "{";
                    Object.keys(queryData.metric).forEach((item, index) => {
                      let label = item;
                      let value = queryData.metric[label];
                      chartData.name += label + "='" + value + "',";
                    });
                    chartData.name = chartData.name.charAt(chartData.name.length - 1) == "," ? chartData.name.substr(0, chartData.name.length - 1) : chartData.name;
                    chartData.name += "}";
                    let alias = chartData.name;
                    let legend = {
                      name: chartData.name,
                      alias: alias,
                      isGray: false
                    }
                    this.legend.push(legend);
                    chartData.data = queryData.values.map((dpsItem, dpsIndex) => {
                      return [bus.computeTimezone(dpsItem[0]) * 1000, parseFloat(dpsItem[1]).toFixed(2)];
                    });
                    this.chartDatas.push(chartData);

                  }
                } else {
                  this.$message.error(response.data.error)
                  console.error(response.data)
                }
              }
            });
            this.$nextTick(() => {
              this.$refs.messageChart.setRandomColors(this.chartDatas.length);
              this.$refs.messageChart.setLegend(this.legend);
              this.$refs.messageChart.setSeries(this.chartDatas);
              this.$refs.messageChart.endLoading();
            });
          } catch(err) {
            this.$message.error(err);
            this.$refs.messageChart.endLoading();
          }
        })
      },
      detail(obj) {
        this.chartDatas = [];
        this.legend = [];
        this.graphShow = true;
        this.currentMsg = obj;
        this.$nextTick(() => {
          this.$refs.messageChart.startLoading();
          this.queryChartDate();
        });
      },
      chartUnitChange:function(unit){
        this.chartUnit=unit;
        this.$nextTick(()=>{
          this.queryChartDate()
        })
      },

      dialogClose() {
        this.graphShow = false;
      },
      del(u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("alert/message?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getAlertList();
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      getAlertList() {
        this.tableData = [];
        this.loading = true;
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        setTimeout(() => {
          this.$get('alert/message', this.searchLabel).then(response => {
            this.loading = false;
            if (response.code == 200) {
              this.tableData = response.data.list;
              this.tableData.forEach((item) => {
                item.labels = JSON.parse(item.labels);
                let paramStr = JSON.stringify(this.promQueryParamConvert(item));
                this.$get('/prom/api/v1/query?query=' + paramStr.substring(1, paramStr.length-1).replace(/\+/g, "%2B").replace(/ /g, "%20").replace(/\\/g, "")).then(response2 => {
                  let current = [];
                  if (response2.data && response2.data.result && response2.data.result.length > 0) {
                    current = response2.data.result[0].value.map((item, i) => {
                      if (i == 0) {
                        return bus.computeTimezone(item);
                      } else {
                        return parseFloat(item).toFixed(2);
                      }
                    });
                  }
                  this.requestIndex+=1;
                  item.current=current;
                  if(this.requestIndex===this.tableData.length){
                    this.$set(item, "current", current);
                    this.requestIndex=0;
                  }
                });
              });
              this.pageObj.total = response.data.total;
            }
          });
        }, 1000);
      },
      promQueryParamConvert(obj) {
        return "(" + obj.alertRule.expr + ") and (" + function(){
          let q = "{";
          for (let k in obj.labels) {
            if (k != 'alertname' && k != 'severity') {
              q += k;
              q += "=";
              q += ("'" + obj.labels[k] + "',");
            }
          };
          if (q.length > 1) {
            q = q.substring(0, q.length-1);
          }
          q += "}";
          return q;
        }() + ")";
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getAlertList();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getAlertList();
      },
      labelsClassName(row) {
        if (row.column.label == this.$t("alert.list.labels")) {
          return "alert-message-list-labels";
        } else {
          return "";
        }
      },
      fillProject: function (module) {
        this.$get('project', {"id": module.projectId}).then(response => {
          if (response.code == 200) {
            module.project = response.data.list[0];
          }
        })
      },
      search(searchObj) {
        this.searchLabel = {};
        let orderBy='';
        if(this.searchLabel.orderBy){
          orderBy=this.searchLabel.orderBy
        }
        if (this.from == "alertRule") {
          this.searchLabel.ruleId = this.obj.id;
        } else if (this.from == "asset") {
          this.searchLabel.assetId = this.obj.id;
        }
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        if(orderBy){
          this.$set(this.searchLabel, 'orderBy', orderBy);
        }
        this.getAlertList();
      },
      //是否需要排序
      sortableShow(prop){
        switch(prop){
          case 'id':
          case 'state':
          case 'alertRule':
          case 'severity':
          case 'startAt':
          case 'endAt':
            return'custom';
          default : return false;
        }
      },
      // prop字段
      propTitle(prop){
        switch(prop){
          case 'id': return'am.id';
          case 'state': return'am.state';
          case 'alertRule': return'ar.alert_name';
          case 'severity': return'am.severity';
          case 'startAt': return'am.start_at';
          case 'endAt': return'am.end_at';
          default : return prop;
        }
      },
      // 数据排序
      tableDataSort(item){
        let orderBy='';
        if(item.order==='ascending'){
          orderBy=item.prop;
        }
        if(item.order==='descending'){
          orderBy='-'+item.prop;
        }
        this.$set(this.searchLabel, "orderBy", orderBy);
        this.getAlertList();
      },
    },
    watch: {
      obj: {
        immediate: true,
        deep: true,
        handler(n) {
          if (this.from == "alertRule") {
            this.searchMsg.searchLabelList = this.searchMsg.searchLabelList.filter((item, index) => {
              return item.label != "alertName" && item.label != "severity"
            });
            this.searchLabel.ruleId = n.id;
          } else if (this.from == "asset") {
            this.searchMsg.searchLabelList = this.searchMsg.searchLabelList.filter((item, index) => {
              return item.label != "alertType" && item.label != "asset"
            });
            this.searchLabel.assetId = n.id;
          }
          if (n.alertNum) {
            this.defaultSearchValue = 1;
          }
          this.getAlertList();
        }
      }
    },
    mounted() {
      //是否存在分页缓存
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if (pageSize) {
        this.pageObj.pageSize = pageSize
      }
      this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList")
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList"))
        : this.tableTitle;
      this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList")
        ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-/alertList"))
        : this.tableTitle;
      console.log( this.tablelable);
      console.log( this.dropCol)
    }
  }
</script>

<style scoped>

</style>
