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
      <div class="right-box-title">Asset</div>
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
          class="nz-table"
          :height="mainTableHeight"
          style="width: 100%;"
          :data="tableData"
          v-scrollBar:el-table="'large'"
          border
          v-loading="loading"
          tooltip-effect="light"
          ref="assetTable"
          :cell-class-name="messageStyle"
          @sort-change="tableDataSort"
        >
          <el-table-column
            :resizable="true"
            v-for="(item, index) in tableTitle"
            v-if="item.show"
            :width="item.width"
            :key="`col_${index}`"
            :label="item.label"
            :fixed="item.fixed"
            :show-overflow-tooltip="item.prop != 'Alert' || item.prop != 'Module'"
            min-width="110px"
            :class-name="item.prop == 'option' ? 'content-right-options' : ''"
            :sortable="$tableSet.sortableShow(item.prop,'asset')"
            :prop="$tableSet.propTitle(item.prop,'asset')"
            :sort-orders="['ascending', 'descending']"
          >
            <template slot-scope="scope" :column="item">
              <div v-if="item.prop=='HOST'">
                <span>{{scope.row.host}}</span>
              </div>
              <div v-if="item.prop=='assetType'">
                <span>{{scope.row.model.type.value}}</span>
              </div>
              <template v-if="item.prop=='SN'">{{scope.row.sn}}</template>
              <div v-if="item.prop=='state'">
                <span>{{scope.row.state==1 ? $t('asset.inStock') : $t('asset.notInStock')}}</span>
              </div>
              <div v-if="item.prop == 'pingStatus'">
                <el-popover
                  placement="right"
                  width="200"
                  trigger="hover"
                  :content="formatPingTime(scope.row.pingLastUpdate)">
                  <div slot="reference" style="width: 20px">
                    <div :class="{'active-icon green':scope.row.pingState == 1,'active-icon red':scope.row.pingState == 0}"></div><span>{{scope.row.pingRtt?scope.row.pingRtt+'ms':''}}</span>
                  </div>
                </el-popover>
              </div>
              <template v-if="item.prop=='Alert'">

                <el-tooltip :content="scope.row.alertNum+' '+$t('overall.active')" placement="top" effect="light" :disabled=" scope.row.alertNum < 99">
              <span :id="'asset-alerts-'+scope.row.id" class="link">
                <!--@click="jumpToAlertMsg(scope.row)"-->
                {{(scope.row.alertNum < 99 ? scope.row.alertNum : 99)}}
                  <sup class="linkSup" v-if="scope.row.alertNum > 99">+</sup>
                {{' ' + $t('overall.active')}}
              </span>
                </el-tooltip>
              </template>
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
    name:"assetTable",
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
      vm=this;
      return{
        pageObj: {
          pageNo: 1,
          pageSize: 50,
          total: 0
        },
        mainTableHeight:'100%',
        tableTitle: [
          {
            label: this.$t("asset.tableTitle.host"),
            prop: 'HOST',
            show: true,
            width: 130,
            fixed:'left'
          },
          {
            label: this.$t("asset.tableTitle.device"),
            prop: 'SN',
            show: true,
            width: 130
          },
           {
            label: this.$t("asset.tableTitle.assetType"),
            prop: 'assetType',
            show: true,
          },{
            label: this.$t("asset.tableTitle.assetState"),
            prop: 'state',
            show: true,
          }, {
            label:this.$t('asset.tableTitle.assetPing'),
            prop:'pingStatus',
            show:true,
          },{
            label: this.$t("asset.tableTitle.alerts"),
            prop: 'Alert',
            show: true,
            width: 100
          },],
        searchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'id',
            disabled: false
          },{
            id: 20,
            name: 'SN',
            type: 'input',
            label: 'sn',
            disabled: false
          },{
            id: 21,
            name: 'Host',
            type: 'input',
            label: 'host',
            disabled: false
          },{
            id: 22,
            name: this.$t("asset.state"),
            type: 'select',
            label: 'assetState',
            disabled: false
          },{
            id: 23,
            name: "pingStatus",
            type: 'select',
            label: 'pingStatus',
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
      this.getTableTitle();
      this.getAssetList();
    },
    methods:{
      getAssetList: function () {
        this.loading=true;
        this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
        this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
        this.$set(this.searchLabel, "moduleId", this.moduleId);
        this.$get('asset', {...this.searchLabel}).then(response => {
          this.loading=false;
          if (response.code == 200) {
            this.tableData = response.data.list;
            this.deleteBox.ids='';
            this.pageObj.total = response.data.total;
          }
        });
      },
      pageNo(val) {
        this.pageObj.pageNo = val;
        this.getAssetList();
      },
      pageSize(val) {
        this.pageObj.pageSize = val;
        localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val);
        this.getAssetList();
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
        this.getAssetList();
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
      getTableTitle(){
        if(localStorage.getItem('nz-sys-asset-ping-switch')==='off'){
          this.tableTitle=this.tableTitle.filter(item=>item.prop!=='pingStatus');
        }
      },
      search(searchObj) {
        let orderBy = '';
        if(this.searchLabel.orderBy){
          orderBy = this.searchLabel.orderBy
        }
        this.searchLabel = {};
        this.pageObj.pageNo = 1;
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.searchLabel, item, searchObj[item]);
          }
        }
        if(orderBy){
          this.$set(this.searchLabel, 'orderBy', orderBy);
        }
        if(this.$refs.assetTable&& this.$refs.assetTable.bodyWrapper){
          this.$refs.assetTable.bodyWrapper.scrollTop = 0;
        }
        this.getAssetList();
      },
    },
    beforeDestroy(){

    }
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

