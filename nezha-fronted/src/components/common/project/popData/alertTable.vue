<template>
  <div class="mc" @click.self="clickOutside">
    <div class="right-box right-box-project-alert">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <!--<button id="edit-ep-del" type="button" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light ">-->
        <!--<span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>-->
        <!--<span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>-->
        <!--</button>-->
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">Alert messages</div>
      <!-- end--标题-->

      <!-- begin搜素框-->
      <div class="top-tools">
        <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': false}">
          <pick-time :refresh-data-func="getAlertList" v-model="searchTime" :use-chart-unit="false" :use-refresh="false" :default-pick="12" :show-empty="true"></pick-time>
          <div class="top-tool-search">
            <search-input :searchMsg="searchMsg" @search="search" :bottomBox.inTransform="true"></search-input>
          </div>
          <!--<button type="button" @click="showExportDialog" :title="$t('overall.exportExcelLower')"-->
                  <!--class="nz-btn nz-btn-size-normal nz-btn-style-light margin-l-20" id="alert-list-export">-->
            <!--<i class="nz-icon nz-icon-download1"></i>-->
          <!--</button>-->
        </div>
        <div class="pagination-top pagination-top-hide display-none"></div>
      </div>
      <!-- end搜素框-->

      <!-- begin--表格-->
      <el-scrollbar class="right-box-form-box">
        <el-table
          class="nz-table tabelH100"
          :data="tableData"
          border
          ref="alertListTable"
          tooltip-effect="light"
          :height="tableHeight"
          v-scrollBar:el-table="'large'"
          v-loading="loading"
          :cell-class-name="labelsClassName"
          @selection-change="selectChange"
          style="width: 100%;height: 100%"
          @sort-change="tableDataSort"
          :id="projectId"
        >
          <!--<el-table-column-->
            <!--:resizable="false"-->
            <!--type="selection"-->
            <!--width="38"-->
            <!--align="center"-->
          <!--&gt;-->
          <!--</el-table-column>-->
          <el-table-column
            :resizable="true"
            v-for="(item, index) in tableTitle"
            v-if="item.show"
            :width="item.width"
            :minWidth="item.minWidth"
            :key="`col-${index}`"
            :label="item.label"
            :show-overflow-tooltip="item.prop != 'labels'"
            min-width="110px"
            :sortable="$tableSet.sortableShow(item.prop,'alertMessage')"
            :prop="$tableSet.propTitle(item.prop,'alertMessage')"
            :sort-orders="['ascending', 'descending']"
          >
            <template slot-scope="scope" :column="item">
              <template v-if="item.prop == 'alertRule'">
                <div v-if="scope.row.alertRule.alertName" >
                  <span @mouseenter="alertMessagehover(scope.row.alertRule, true, $event)" @mouseleave="alertMessagehover(scope.row.alertRule, false)">{{scope.row.alertRule.alertName}}</span>
                  <alertRuleInfo v-if="scope.row.alertRule.loading" :id="scope.row.alertRule.id" :that="scope.row.alertRule"></alertRuleInfo>
                </div>
                <template v-else>-</template>
              </template>
              <template v-else-if="item.prop == 'summary'">
                <template v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
                <template v-else>-</template>
              </template>
              <template v-else-if="item.prop == 'description'">
                <template v-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
                <span v-else>-</span>
              </template>
              <span v-else-if="item.prop == 'severity'" class="severity">
                <span v-if="scope.row[item.prop] == 'P1'" class="P1">P1</span>
                    <!--<i class="nz-icon nz-icon-arrow-up"></i> {{returnSeverityLabel(scope.row[item.prop])}}-->
                <span v-if="scope.row[item.prop] == 'P2'" class="P2">P2</span>
                    <!--{{returnSeverityLabel(scope.row[item.prop])}}-->
                <span v-if="scope.row[item.prop] == 'P3'" class="P3">P3</span>
                    <!--<i class="nz-icon nz-icon-arrow-down"></i>&nbsp;{{returnSeverityLabel(scope.row[item.prop])}}-->
              </span>
              <template v-else-if="item.prop == 'labels'" class="labels">
                <span v-for="(item,i) in labelsSort(scope.row.labels)">
              <span @mouseenter="labelHover(scope.row,scope.$index, item.label, true, $event)" @mouseleave="labelHover(scope.row,scope.$index, item.label, false)">
                <nz-alert-tag
                  :label="item.label" :type="tagType(item.label)" style="margin: 5px 0 5px 5px;"
                  :cursor-point="tagType(item.label) == 'info' ? false : true"
                  :key="item.label"
                  v-if="item.label != 'alertname' && item.label != 'severity'"
                >
                 {{item.value}}
                </nz-alert-tag>
              </span>
                  <alertLabel
                    v-if="(item.label === 'asset' ||item.label === 'module' || item.label === 'project') && scope.row[item.label] && scope.row[item.label].loading"
                    :id="scope.row[item.label].id"
                    :that="scope.row[item.label]"
                    :type="item.label"
                  ></alertLabel>
                </span>

                <!--<el-tooltip
                  v-for="(item,i) in labelsSort(scope.row.labels)"
                  :placement="scope.$index==0?'right-start':(scope.$index==tableData.length-1?'right-end':'right')"
                  effect="light"
                  :disabled="!(item.label === 'asset' ||item.label === 'module' || item.label === 'project')"
                  :key="item.label"
                >
                  <alertLabel
                    v-if="item.label === 'asset' ||item.label === 'module' || item.label === 'project'"
                    slot="content"
                    :id="scope.row[item.label].id"
                    :type="item.label"
                    :labelLoading="scope.row[item.label].loading"
                  ></alertLabel>
                  <span @mouseover="labelHover(scope.row,scope.$index,item.label)" >
                         <nz-alert-tag
                           :label="item.label" :type="tagType(item.label)" style="margin: 5px 0 5px 5px;"
                           :cursor-point="tagType(item.label) == 'info' ? false : true"
                           :key="item.label"
                           v-if="item.label != 'alertname' && item.label != 'severity'"
                         >
                           {{item.value}}
                         </nz-alert-tag>
                  </span>
                </el-tooltip>-->

              </template>
              <span v-else-if="item.prop == 'state'" :class="{'green': scope.row['state'] == 2, 'red': scope.row['state'] == 1}">
                {{scope.row['state'] == 1 ? "Pending" : ""}}
                {{scope.row['state'] == 2 ? "Expired" : ""}}
              </span>
              <div v-else-if="item.prop == 'current'" class="too-long-split pointer" @click="detail(scope.row)">
                <span v-if="!scope.row.current">-</span>
                <el-popover v-else placement="right" trigger="hover">
                  <div slot="reference">
                    <span class="content-right-option" :id="'alert-list-detail-'+scope.row.id"><i class="nz-icon nz-icon-chart"></i></span>
                    <span>{{formatThreshold(scope.row.current[1],scope.row.alertRule.unit)}}</span>
                  </div>
                  <div>{{$unixTimeParseToString(scope.row.current[0])}}</div>
                </el-popover>
              </div>
              <div v-else-if="item.prop == 'option'" class="content-right-options">
                <span :title="$t('overall.delete')" @click="toDeleteMessage(scope.row)" class="content-right-option" :id="'alert-list-delete-'+scope.row.id"><i  class="nz-icon nz-icon-delete"></i></span>
              </div>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              <template v-else>-</template>
            </template>
          </el-table-column>

          <!--<el-table-column width="28" :resizable="false">-->
            <!--<template slot="header" slot-scope="scope">-->
          <!--<span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)" class="nz-table-gear">-->
            <!--<i class="nz-icon nz-icon-gear"></i>-->
          <!--</span>-->
            <!--</template>-->
            <!--<template v-slot="scope">-->
              <!--<button v-if="scope.$index == 0" class="to-top" :style="{top: tools.toTopBtnTop}" :class="{'to-top-is-hover': tools.tableHover}" v-show="tools.showTopBtn && tools.mainResizeShow" @click="$toTop('ps', 0)"><i class="nz-icon nz-icon-top"></i></button>-->
            <!--</template>-->
          <!--</el-table-column>-->
        </el-table>
      </el-scrollbar>
      <!-- end--表格-->

      <!--底部分頁-->
      <div class="pagination-bottom">
        <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import bus from '@/libs/bus';
  import axios from 'axios';
  import nzAlertTag from '@/components/page/alert/nzAlertTag';
  import alertRuleInfo from '@/components/common/alert/alertRuleInfo'
  import alertLabel from '@/components/common/alert/alertLabel'
  export default {
    name:"alertTable",
    props:{
      moduleId:{},
      projectId:{},
    },
    components: {
      'nz-alert-tag': nzAlertTag,
      'alertRuleInfo':alertRuleInfo,
      'alertLabel':alertLabel,
    },
    watch:{
      tableData(){
        if(this.$refs.alertListTable&&this.$refs.alertListTable.bodyWrapper){
          this.$refs.alertListTable.bodyWrapper.scrollTop = 0;
        }
      },
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
    data(){
      return{
        pageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        tableTitle: [
          {
            label: this.$t("alert.alertName"),
            prop: 'alertRule',
            show: true,
            width: 180
          }, {
            label: this.$t("alert.list.labels"),
            prop: 'labels',
            show: true,
            NotSet:true,
            minWidth:200
          }, {
            label: this.$t("alert.severity"),
            prop: 'severity',
            show: true,
            width: 110,
          }, {
            label: this.$t('alert.summary'),
            prop: 'summary',
            show: true,
            minWidth:100
          },  {
            label: this.$t('alert.list.state'),
            prop: 'state',
            show: true,
            width: 100
          }, {
            label: this.$t("alert.startAt"),
            prop: 'startAt',
            show: true,
            width: 150
          },
        ],
        searchTime: [],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: this.$t('alert.alertName'),
            type: 'input',
            label: 'alertName',
            disabled: false
          }, /*{
            id: 3,
            name: this.$t('alert.list.type'),
            type: 'select',
            label: 'alertType',
            disabled: false
          }, */{
            id: 20,
            name: this.$t('alert.severity'),
            type: 'selectString',
            label: 'severity',
            disabled: false
          }, {
            id: 21,
            name: this.$t('asset.asset'),
            type: 'asset',
            label: 'asset',
            disabled: false
          }, {
            id:22,
            name: this.$t('project.project.project'),
            type: 'project',
            label: 'project',
            disabled: false
          }, {
            id:23,
            name: this.$t('project.module.module'),
            type: 'module',
            label: 'module',
            disabled: false
          }, {
            id:24,
            name: this.$t('project.endpoint.endpoint'),
            type: 'input',
            label: 'endpointId',
            disabled: false
          }, {
            id:25,
            name: this.$t('alert.list.state'),
            type: 'select',
            label: 'alertMessageState',
            disabled: false
          }],
        },
        tableData:[],
        loading:false,
        tableHeight:'100%',
        searchLabel:{

        },
        deleteBox:{}
      }
    },
    mounted(){
      this.getAlertList();
    },
    methods:{
      getAlertList: function () {
        this.loading=true;
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$set(this.searchLabel, "moduleId", this.moduleId);
        if(this.searchTime&& this.searchTime.length>1){
          this.$set(this.searchLabel, "startAt", bus.timeFormate(this.searchTime[0], 'yyyy-MM-dd hh:mm:ss'));
          this.$set(this.searchLabel, "endAt", bus.timeFormate(this.searchTime[1], 'yyyy-MM-dd hh:mm:ss'));
        }else{
          delete this.searchLabel.startAt
          delete this.searchLabel.endAt
        }
        this.$get('alert/message', {...this.searchLabel}).then(response => {
          this.loading=false;
          if (response.code == 200) {
            this.tableData = response.data.list;
            this.tableData.forEach((item) => {
              item.labels = JSON.parse(item.labels);
            });
            this.deleteBox.ids='';
            this.pageObj.total = response.data.total;
          }
        });
      },
      labelsSort:function(obj){
        let buildIn=['asset','endpoint','module','project','datacenter']
        let labels=JSON.parse(JSON.stringify(obj));
        let result=[];
        for(let key of buildIn){
          if(key in labels){
            result.push({label:key,value:labels[key]})
            delete labels[key]
          }
        }
        Object.keys(labels).sort().forEach(key=>{
          result.push({label:key,value:labels[key]})
        });
        return result;
      },
      labelsClassName(row) {
        if (row.column.label == this.$t("alert.list.labels")) {
          return "alert-message-list-labels";
        } else {
          return "";
        }
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
      selectChange(s) {
        let ids = [];
        this.deleteBox.ids = "";
        s.forEach(item => {
          ids.push(item.id);
        });
        this.deleteBox.ids = ids.join(",");
      },
      // alertNmae鼠标划入
      alertMessagehover(item, loading, e) {
        if (e) {
          let dom = e.currentTarget;
          let position = dom.getBoundingClientRect();
          this.$set(item, "position", position);
        }
        this.$set(item, "loading", loading);
        //item.loading = true;
        //this.$set(this.tableData,index,item);// 调用父组件
      },
      // label 鼠标划入
      labelHover(item,index, type, loading, e){
        if(this.labelToolTipDis(type)){
          return;
        }
        if (e) {
          let dom = e.currentTarget;
          let position = dom.getBoundingClientRect();
          this.$set(item[type], "position", position);
        }
        this.$set(item[type], "loading", loading);
        this.$set(this.tableData,index,item);// 调用父组件
      },
      // label tooltip是否显示
      labelToolTipDis(labelType){
        switch(labelType){
          case 'asset':
          case 'module':
          case 'project':
            return false;
          default: return true;
        }
      },
      // Severity Label
      returnSeverityLabel(key){
        return this.$CONSTANTS.alertMessage.severityData.find(s => {return s.value == key}).label
      },
      tableDataSort(item){
        let orderBy='';
        if(item.order==='ascending'){
          orderBy=item.prop;
        }
        if(item.order==='descending'){
          orderBy='-'+item.prop;
        }
        this.pageObj.orderBy=orderBy;
        this.$set(this.searchLabel, "orderBy", orderBy);
        this.getAlertList();
      },
      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },
      clickOutside() {
        this.esc(false);
      },
      search(searchObj) {
        let orderBy='';
        if(this.searchLabel.orderBy){
          orderBy=this.searchLabel.orderBy
        }
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            if (item == "alertMessageState") {
              this.$set(this.searchLabel, "state", searchObj[item]);
            } else{
              this.$set(this.searchLabel, item, searchObj[item]);
            }
          }
        }
        if(orderBy){
          this.$set(this.searchLabel, 'orderBy', orderBy);
        }
        this.getAlertList();
      },

      showExportDialog() {
        this.importBox.show = true;
      },
    },

  }
</script>

<style scoped>
  .right-box-project-alert{
    width: 850px;
    padding-right: 30px;
  }
  .right-box-title{
    font-weight: bold;
  }
  .mc{
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 11;
  }
  .top-tools{
    float: right;
  }
  /deep/ .top-tools>div{
    margin-top: 6px;
  }
  /deep/.el-tooltip{
    display: inline-block;
  }
  .red,.green{
    color: white;
    padding: 2px 5px;
    border-radius: 4px;
  }
  .severity .P1{
    background: #F5846A;
    border-radius: 2px;
    font-size: 12px;
    color: #FFFFFF;
    padding: 2px 6px;
  }
  .severity .P2{
    background: #F7A54A;
    border-radius: 2px;
    font-size: 12px;
    color: #FFFFFF;
    padding: 2px 6px;
  }
  .severity .P3{
    background: #F1C13D;
    border-radius: 2px;
    font-size: 12px;
    color: #FFFFFF;
    padding: 2px 6px;
  }
  /* end--table*/
</style>

