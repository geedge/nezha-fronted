<style scoped>
  .account {
    height: 100%;
  }
  .account-list-option {
    cursor: pointer;
    display: inline-block;
    margin-right: 6px;
  }
  .account-list-option .el-icon-delete {
    color: #F98D9A;
  }
  .account-list-option .el-icon-delete:hover {
    color: #D96D7A;
  }
  .account-list-option .el-icon-view {
    color: #60BEFF;
  }
  .account-list-option .el-icon-view:hover {
    color: #409EFF;
  }
  /* begin--右侧弹框*/
  .right-box {
    position: fixed;
    top: 80px;
    right: 15px;
    z-index: 1;
    border-radius: 8px;
    box-shadow: 0 0 15px #ccc;
    background-color: white;
    padding: 0 20px;
  }
  .right-box-account {
    width: 550px;
    height: calc(100% - 100px);
  }
  /* begin--右侧弹框--顶部按钮*/
  .right-box-top-btns {
    text-align: center;
  }
  .right-box-top-btn {
    border-radius: 0 0 9px 9px;
    float: right;
    color: #656565;
    height: 30px;
    font-size: 12px;
    padding: 3px 8px 1px 8px;
    border: 1px solid #aaaaaa;
    border-top: none;
    cursor: pointer;
    margin-left: 20px;
  }
  .right-box-top-btn-full {
    background-color: #656565;
    border: 1px solid #656565;
    border-top: none;
    color: white;
   }
  /* end--右侧弹框--顶部按钮*/

  /* begin--右侧弹框--内容*/
  .right-box-title {
    height: 30px;
    line-height: 40px;
    text-align: left;
  }
  .right-box-form {
    margin-top: 35px;
  }
  .right-box-form-row {
    margin-top: 25px;
  }
  .right-box-form-label {
    margin-bottom: 8px;
    text-align: left;
  }
  .right-box-form-content {
    line-height: 32px;
    text-align: left;
    width: 100%;
  }
  .right-box-form-content-txt {
    padding-left: 11px;
  }
  .right-box-form-content .el-select {
    width: calc(100% - 38px);
    vertical-align: top;
  }
  .el-select-add-btn {
    width: 33px;
    height: 33px;
    display: inline-block;
    text-align: center;
    border-radius: 5px;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #C7C9CE;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  }
  .el-select-add-btn:hover {
    border: 1px solid #C0C4CC;
    cursor: pointer;
  }
  /* end--右侧弹框--内容*/

  /* begin--右侧弹框--底部按钮*/
  .right-box-bottom-btns {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 40px;
    left: 0;
    text-align: center;
  }
  .right-box-bottom-btn:first-of-type {
    border-bottom-left-radius: 8px;
  }
  .right-box-bottom-btn:last-of-type{
    border-bottom-right-radius: 8px;
  }
  .right-box-bottom-btn {
    display: inline-block;
    background-color: #656565;
    color: white;
    height: 100%;
    line-height: 40px;
    cursor: pointer;
    width: 100%;
  }
  .config-dropdown-label-input {
    width: 50%;
    display: inline-block;
  }
  .right-box-bottom-btn-cancel {
    background-color: #DADADA;
    color: #656565;
  }
  .right-box-bottom-btn-50 {
    width: 50%;
  }
  /* end--右侧弹框--底部按钮*/
  /* end--右侧弹框*/

  /* begin--右弹框滑入滑出动画*/
  @keyframes slide-in-from-right {
    from {right: -800px}
    to {right: 0}
  }
  @keyframes slide-out-to-right {
    from {right: 0}
    to {right: -800px}
  }
  .right-box-enter-active {
    animation: slide-in-from-right 0.4s;
  }
  .right-box-leave-active {
    animation: slide-out-to-right 0.4s;
  }
  /* end--右弹框滑入滑出动画*/
</style>
<template>
    <div class="account">
        <div class="content-left">
            <div class="sidebar-title">{{$t('alert.alert')}}</div>
            <div class="sidebar-info">
                <div class="sidebar-info-item sidebar-info-top sidebar-info-item-active">{{$t('alert.alertList')}}</div>
                <div class="sidebar-info-item" @click="jumpTo('alertConfig')">{{$t('alert.alertConfig')}}</div>
            </div>
        </div>
        <div class="content-right">
            <div class="top-tools">
                <div class="top-tool-search float-right"><search-input :searchMsg="searchMsg" @search="search"></search-input></div>
            </div>
            <el-table
                  :data="tableData"
                  border
                  height="calc(100% - 65px)"
                  style="width: 100%;">
                <el-table-column
                  :resizable="false"
                  v-for="(item, index) in tableTitle"
                  v-if="item.show"
                  :width="item.width"
                  :key="`col-${index}`"
                  :label="item.label"
                >
                    <template slot-scope="scope" :column="item">
                      <span v-if="item.prop == 'alertRule'" class="account-list-option" @click="viewRule(scope.row[item.prop].id)">
                          {{scope.row[item.prop].alertName}}
                        </span>
                        <div v-else-if="item.prop == 'type'" class="account-list-options">
                            <span v-if="scope.row[item.prop] == 1" >Project</span>
                            <span v-if="scope.row[item.prop] == 2" >Module</span>
                            <span v-if="scope.row[item.prop] == 3" >Device</span>
                        </div>
                        <span v-else-if="item.prop == 'severity'">
                            <span v-if="scope.row[item.prop] == 'high'"><i class="el-icon-arrow-up"></i>&nbsp;{{severityData[1].value}}</span>
                            <span style="padding-left: 18px;" v-if="scope.row[item.prop] == 'medium'">{{severityData[0].value}}</span>
                            <span v-if="scope.row[item.prop] == 'low'"><i class="el-icon-arrow-down"></i>&nbsp;{{severityData[2].value}}</span>
                        </span>
                        <div v-else-if="item.prop == 'linkObject'">
                            <span v-if="(scope.row['type'] == 1 || scope.row['type'] == 2) && scope.row[item.prop]" class="account-list-option" @click="viewAlertType(scope.row['type'],scope.row[item.prop])">{{scope.row[item.prop].name}}</span>
                            <span v-if="scope.row['type'] == 3 && scope.row[item.prop]" class="account-list-option" @click="viewAlertType(scope.row['type'],scope.row[item.prop].id)">{{scope.row[item.prop].host}}</span>
                        </div>
                        <div v-else-if="item.prop == 'state'">
                            <span class="account-list-option">
                                {{scope.row['state'] == 1 ? "Pending" : ""}}
                                {{scope.row['state'] == 2 ? "Expired" : ""}}
                            </span>
                        </div>
                        <span v-else>{{scope.row[item.prop]}}</span>
                    </template>
                </el-table-column>
            </el-table>
            <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>
      <alert-config-box :parentAlertRule="viewRuleData" @reload="" ref="alertConfigBox"></alert-config-box>
      <project-box :project="viewProjectData" ref="projectBox"></project-box>
      <module-box  :module="viewModuleData" @reload="" ref="moduleBox"></module-box>
      <asset-edit-unit :edit-unit-show='viewAssetState' @refreshData="" @sendStateData="" ref="assetEditUnit"></asset-edit-unit>
    </div>

</template>
<script>
export default {
  name: "alertList",
  data() {
    return {
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total:13
      },
      tableTitle: [
        {
          label:'ID',
          prop:'id',
          show:false
        },
        {
          label: this.$t("alert.alertName"),
          prop: 'alertRule',
          show: true
        }, {
          label: this.$t("alert.list.type"),
          prop: 'type',
          show: true,
        }, {
          label: this.$t("alert.list.linkedId"),
          prop: 'linkObject',
          show: true,
        }, {
          label: this.$t("alert.severity"),
          prop: 'severity',
          show: true,
        }, {
          label: this.$t('alert.summary'),
          prop: 'summary',
          show: true,
        }, {
          label: this.$t('alert.description'),
          prop: 'description',
          show: true,
        }, {
          label: this.$t('alert.list.state'),
          prop: 'state',
          show: true,
        }, {
          label: this.$t("alert.startAt"),
          prop: 'startAt',
          show: true,
        }, {
          label: this.$t('alert.endAt'),
          prop: 'endAt',
          show: true,
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
        },{
          id: 3,
          name: this.$t('alert.list.type'),
          type: 'select',
          label: 'alertType',
          disabled: false
        },{
          id: 4,
          name: this.$t('alert.severity'),
          type: 'selectString',
          label: 'severity',
          disabled: false
        }],
      },
      searchLabel: { //搜索参数

      },
      severityData: [
        {
          key: 'medium',
          value: this.$t("alert.config.medium")
        },
        {
          key: 'high',
          value: this.$t("alert.config.high")
        },
        {
          key: 'low',
          value: this.$t("alert.config.low")
        }
      ],
      tableData: [],
      viewRuleData:null,
      viewProjectData:null,
      viewModuleData:null,
      viewAssetState:false,
    }
  },
  methods: {
    getAlertList: function() {
      this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
      this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
      this.$get('alert/message', this.searchLabel).then(response => {
        if (response.code == 200) {
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
        }
      })
    },
    jumpTo(data,id) {
      this.$store.state.assetData.moduleData = data
      this.$store.state.assetData.selectedData = id
      this.$router.push({
        path: "/" + data,
        query: {
          t: +new Date()
        }
      });
    },
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getAlertList();
    },
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getAlertList();
    },
    search: function(searchObj) {
      this.searchLabel = {};
      for (let item in searchObj) {
        if (searchObj[item]) {
          this.$set(this.searchLabel, item, searchObj[item]);
        }
      }
      this.getAlertList();
    },
    viewRule:function(id){
      this.closeViews();
      this.$get('alert/rule', {"id":id}).then(response => {
        if (response.code == 200) {
          this.viewRuleData = response.data.list[0];
          this.$refs.alertConfigBox.show(true);
        }
      })
    },
    viewAlertType:function(type,typeObj){
      console.log(typeObj)
      this.closeViews();
      switch (type) {
        case 1:
          this.viewProjectData=typeObj;
          this.$refs.projectBox.show(true);
          break;
        case 2:
          this.fillProject(typeObj);
          let tempObj=JSON.parse(typeObj.param)
          this.$set(typeObj, 'paramObj', []);
          for (let k in tempObj) {
            typeObj.paramObj.push({key: k, value: tempObj[k]});
          }
          this.viewModuleData=typeObj;

          this.$refs.moduleBox.show(true);
          break;
        case 3:
          this.viewAssetState=true;
          this.$refs.assetEditUnit.getAssetData(typeObj);
          this.$refs.assetEditUnit.tabView=true;
          break;
      }
    },
    fillProject:function(module){
      this.$get('project', {"id":module.projectId}).then(response => {
        if (response.code == 200) {
          module.project = response.data.list[0];
        }
      })
    },
    closeViews:function(){
      this.$refs.alertConfigBox.show(false,false);
      this.$refs.projectBox.show(false,false);
      this.$refs.moduleBox.show(false,false);
      this.viewAssetState=false;
    }
  },
  mounted() {
    this.getAlertList();
  }
}
</script>
