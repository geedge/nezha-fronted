<template>
  <div class="mc" @click.self="clickOutside">
    <div class="right-box right-box-project-alert">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <!--<button id="edit-ep-del" type="button" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light ">-->
        <!--<span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>-->
        <!--<span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>-->
        <!--</button>-->
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">alert List</div>
      <!-- end--标题-->

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
            :resizable="false"
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
            <span class="too-long-split pointer" v-if="scope.row[item.prop].alertName" @mouseover="alertMessagehover(scope.row,scope.$index)">
                    <el-tooltip
                      :placement="scope.$index==0?'right-start':(scope.$index==tableData.length-1?'right-end':'right')"
                      effect="light">
                      <alertRuleInfo slot="content" :id="scope.row.alertRule.id" :messageLoad="scope.row.loading"></alertRuleInfo>
                      <span>{{scope.row[item.prop].alertName}}</span>
                    </el-tooltip>
                  </span>
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
              <span v-else-if="item.prop == 'severity'">
                <span v-if="scope.row[item.prop] == 'high'"><i class="el-icon-arrow-up"></i>&nbsp;{{returnSeverityLabel(scope.row[item.prop])}}</span>
                <span style="padding-left: 18px;" v-if="scope.row[item.prop] == 'medium'">{{returnSeverityLabel(scope.row[item.prop])}}</span>
                <span v-if="scope.row[item.prop] == 'low'"><i class="el-icon-arrow-down"></i>&nbsp;{{returnSeverityLabel(scope.row[item.prop])}}</span>
              </span>
              <template v-else-if="item.prop == 'labels'" class="labels">
                <el-tooltip
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
                </el-tooltip>
              </template>
              <div v-else-if="item.prop == 'state'">
                <span class="">
                  {{scope.row['state'] == 1 ? "Pending" : ""}}
                  {{scope.row['state'] == 2 ? "Expired" : ""}}
                </span>
              </div>
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
                <span :title="$t('overall.delete')" @click="toDeleteMessage(scope.row)" class="content-right-option" :id="'alert-list-delete-'+scope.row.id"><i  class="el-icon-delete"></i></span>
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
            minWidth:200
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
      alertMessagehover(item,index){
        item.loading=true;
        this.$set(this.tableData,index,item);// 调用父组件
      },
      // label 鼠标划入
      labelHover(item,index,type){
        if(this.labelToolTipDis(type)){
          return
        }
        item[type].loading=true;
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
    },

  }
</script>

<style scoped>
  .right-box-project-alert{
    width: 1220px;
  }
  .mc{
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 11;
  }
  /* end--table*/
</style>

