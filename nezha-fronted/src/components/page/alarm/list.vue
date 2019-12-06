<style scoped>
  .account {
    height: 100%;
  }
  .content-left {
    float: left;
    width: 370px;
    height: 100%;
  }
  .sidebar-title {
    padding-left: 30px;
    padding-top: 20px;
  }

  .sidebar-info {
    margin-top: 20px;
    border: 1px solid #acacac;
    border-radius: 8px;
    height: calc(90vh - 55px);
    width: calc(100% - 30px);
  }

  .sidebar-info-header {
    background: #acacac;
    text-align: center;
    line-height: 50px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    height: 60px;
    width: 100%;
  }

  .sidebar-info-footer {
    padding-top: 15px;
    padding-left: 15px;
  }
  .account-list {
    height: calc(100% - 131px);
    margin-left: 370px;
    padding: 0 15px 0 0;
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
  .account-list-search {
    float: right;
    width: 220px;
    margin: 15px 0;
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
        <div class="sidebar-title">
          <div>Config</div>
          <div class="sidebar-info">
            <div class="sidebar-info-footer" v-if="sidebarState">
            </div>
          </div>
        </div>
      </div>
        <div class="account-list">
            <el-input
              class="account-list-search"
              type="text"
              :placeholder="$t('overall.search')"
              size="small"
            ></el-input>
            <el-table
                  :data="tableData"
                  border
                  height="calc(100% - 65px)"
                  style="width: 100%;">
                <el-table-column
                  v-for="(item, index) in tableTitle"
                  v-if="item.show"
                  :width="item.width"
                  :key="`col-${index}`"
                  :label="item.label"
                >
                    <template slot-scope="scope" :column="item">
                        <div v-if="item.prop == 'type'" class="account-list-options">
                            <span v-if="scope.row[item.prop] == 1" class="account-list-option">Project Alarm</span>
                            <span v-if="scope.row[item.prop] == 2" class="account-list-option">Module Alarm</span>
                            <span v-if="scope.row[item.prop] == 3" class="account-list-option">Device Alarm</span>
                        </div>
                        <div v-else-if="item.prop == 'linkObject'">
                            <span v-if="scope.row['type'] == 1 || scope.row['type'] == 2" class="account-list-option">{{scope.row[item.prop].name}}</span>
                            <span v-if="scope.row['type'] == 3" class="account-list-option">{{scope.row[item.prop].host}}</span>
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

    </div>

</template>
<script>
export default {
  name: "alarmList",
  data() {
    return {
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total:13
      },
      tableTitle: [
        {
          label: this.$t("alarm.alarmName"),
          prop: 'alertName',
          show: true
        }, {
          label: this.$t("alarm.startAt"),
          prop: 'startAt',
          show: true,
        }, {
          label: this.$t("alarm.list.type"),
          prop: 'type',
          show: true,
        }, {
          label: this.$t("alarm.list.linkedId"),
          prop: 'linkObject',
          show: true,
        }, {
          label: this.$t("alarm.severity"),
          prop: 'severity',
          show: true,
        }, {
          label: this.$t('alarm.summary'),
          prop: 'summary',
          show: true,
        }, {
          label: this.$t('alarm.description'),
          prop: 'description',
          show: true,
        }, {
          label: this.$t('alarm.list.state'),
          prop: 'state',
          show: true,
        }, {
          label: this.$t('alarm.endAt'),
          prop: 'endAt',
          show: true,
        }
      ],
      tableData: []
    }
  },
  methods: {
    getAlarmList: function() {
      this.$get('alert/message', this.pageObj).then(response => {
        if (response.code == 200) {
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
        }
      })
    }
  },
  mounted() {
    this.getAlarmList();
  }
}
</script>
