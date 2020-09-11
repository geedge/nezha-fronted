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
      <div class="right-box-title">Endpoint</div>
      <!-- end--标题-->

      <!-- begin搜素框-->
      <div class="top-tools">
        <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': false}">
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
          :data="tableData"
          border
          class="nz-table endpoint-table"
          :height="mainTableHeight"
          v-scrollBar:el-table="'large'"
          ref="endpointTable"
          v-loading="loading"
          style="width: 100%;"
          @sort-change="tableDataSort"
        >
          <el-table-column
            :resizable="false"
            v-for="(item, index) in tableTitle"
            v-if="item.show"
            :width="item.width"
            :key="`col-${index}`"
            :label="item.label"
            min-width="110px"
            :sortable="$tableSet.sortableShow(item.prop,'project')"
            :prop="$tableSet.propTitle(item.prop,'project')"
            :sort-orders="['ascending', 'descending']"
          >
            <template slot-scope="scope" :column="item" >
              <span v-if="item.prop == 'asset' && scope.row[item.prop]">{{scope.row[item.prop].host}}</span>
              <span v-else-if="item.prop == 'param'">
              <template v-if="scope.row.paramObj">
                <span v-for="(p,i) in scope.row.paramObj">{{p.key}}={{p.value}}<span v-if="i < scope.row.paramObj.length-1">，</span></span>
              </template>
              <template v-else>-</template>
            </span>
              <template v-else-if="item.prop == 'type'">{{currentModule.type}}</template>
              <div v-else-if="item.prop == 'option'" class="content-right-options">
                <span :title="$t('overall.view')" @click="detailEndpoint(scope.row)" class="content-right-option" :id="'edp-detail-'+scope.row.id"><i class="nz-icon nz-icon-view"></i></span>
                &nbsp;
                <span :title="$t('overall.query')" @click="query(scope.row)" class="content-right-option" :id="'edp-query-'+scope.row.id"><i class="nz-icon nz-icon-search"></i></span>
                &nbsp;
                <span :title="$t('overall.edit')" @click="editEndpoint(scope.row)" class="content-right-option" :id="'edp-edit-'+scope.row.id"><i class="nz-icon nz-icon-edit"></i></span>
              </div>
              <span v-else-if="item.prop == 'state'" >
              <el-popover placement="right" width="50" trigger="hover" :popper-class="scope.row.state == '1'?'small-pop':''">
                <div slot="reference" style="width: 20px">
                  <div :class="{'active-icon green':scope.row.state == '1','active-icon red':scope.row.state == '0'}"></div>
                </div>
                <div >
                  <div v-if="scope.row.state == '1'">up</div>
                  <div v-else>down:<br/>{{getStateErrorMsg(scope.row)}}</div>
                </div>
              </el-popover>
            </span>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
              <template v-else>-</template>
            </template>
          </el-table-column>
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
    name:"endpointTable",
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
        mainTableHeight:'100%',
        tableTitle: [
          {
            label: this.$t("project.endpoint.endpointId"),
            prop: 'id',
            show: true,
            width: 150
          },{
            label: this.$t("project.endpoint.asset"),
            prop: 'asset',
            show: true,
          },{
            label: this.$t("project.endpoint.port"),
            prop: 'port',
            show: true,
          },{
            label: this.$t("project.endpoint.path"),
            prop: 'path',
            show: true,
          },{
            label: this.$t("alert.list.state"),
            prop: 'state',
            show: true,
          },
          // {
          //   label: this.$t("project.endpoint.lastUpdate"),
          //   prop: 'lastUpdate',
          //   show: true,
          // },
        ],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: "ID",
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 11,
            name: this.$t('asset.asset'),
            type: 'asset',
            label: 'asset',
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
      this.getEndpointList();
    },
    methods:{
      getEndpointList: function () {
        this.loading=true;
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$set(this.searchLabel, "moduleId", this.moduleId);
        this.$get('endpoint', this.searchLabel).then(response => {
          this.loading = false;
          if (response.code === 200) {
            // for (let i = 0; i < response.data.list.length; i++) {
            //   try {
            //     let tempObj = JSON.parse(response.data.list[i].param);
            //     response.data.list[i].paramObj = [];
            //     for (let k in tempObj) {
            //       response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
            //     }
            //   } catch (err) {
            //     //console.error(response.data.list[i], err);
            //   }
            // }
            this.tableData = response.data.list;
            this.pageObj.total = response.data.total;
          }
        });
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getEndpointList();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getEndpointList();
      },
      selectChange(s) {
        let ids = [];
        this.deleteBox.ids = "";
        s.forEach(item => {
          ids.push(item.id);
        });
        this.deleteBox.ids = ids.join(",");
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
        this.getEndpointList();
      },
      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },
      clickOutside() {
        this.esc(false);
      },
      messageStyle(e) {
        if (e.column.label == 'Alerts' || e.column.label == this.$t("asset.tableTitle.alerts")) {
          if (e.row.alertNum > 0) {
            return 'danger';
          } else {
            return 'success';
          }
        }
        return '';
      },
      formatPingTime:function(str){
        if(!str || str == ''){
          return this.$t('asset.assetStatPre')+this.$t('asset.assetStatDown');
        }
        let ds='-';
        let ts=':';
        let time=new Date(str);
        let year=time.getFullYear();
        let month=time.getMonth()+1 > 9 ? time.getMonth()+1 : ('0'+(time.getMonth()+1));
        let day=time.getDate() > 9 ? time.getDate():('0'+time.getDate());
        let hours=time.getHours() > 9? time.getHours():('0'+time.getHours());
        let minutes=time.getMinutes() > 9 ?time.getMinutes():('0'+time.getMinutes());
        let seconds=time.getSeconds() > 9 ? time.getSeconds():('0'+time.getSeconds());
        return this.$t('asset.assetStatPre')+year+ds+month+ds+day+' '+hours+ts+minutes+ts+seconds;

      },
      getStateErrorMsg(row) {
        let errCodes = [230009, 230010, 230011];
        if(row){
          if(row.state == 0){
            if(errCodes.find((item)=>{return row.stateInfo.code == item})){
              return this.$t('project.endpoint.stateInfo_'+row.stateInfo.code)
            }else{
              return row.stateInfo.msg;
              this.$message.error('state code error');
            }
          }
        }
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
        this.getEndpointList();
      },
    },

  }
</script>

<style scoped>
  .right-box-project-alert{
    width: 1220px;
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
  /deep/.resize-box .danger{
    background-color: #f9f9f9 !important;
  }
  .top-tools{
    float: right;
  }
  /deep/ .top-tools>div{
    margin-top: 6px;
  }
  /* end--table*/
</style>

