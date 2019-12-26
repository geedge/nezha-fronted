<style scoped>
  .panel {
    height: 100%;
  }
  .panel .el-table {
    border-radius: 5px;
  }
  .content-right-option {
    cursor: pointer;
    display: inline-block;
    margin-right: 6px;
  }
  .content-right-option .el-icon-delete {
    color: #F98D9A;
  }
  .content-right-option .el-icon-delete:hover {
    color: #D96D7A;
  }
  .content-right-option .el-icon-view {
    color: #60BEFF;
  }
  .content-right-option .el-icon-view:hover {
    color: #409EFF;
  }

  .table-list {
    margin-top: 100px;
  }

  /* begin--Panel-自定义可编辑的el-select下拉框样式*/
  .panel-dropdown-btn {
    display: inline-block;
    margin-left: 7px;
    float: right;
    color: #60BEFF;
    font-size: 13px
  }
  .panel-dropdown-btn:hover {
    color: #409EFF;
  }
  .panel-dropdown-btn-create {
    display: inline-block;
    float: left;
    font-size: 13px;
    color: #F98D9A;
    width:100%;
  }
  .panel-dropdown-btn-create:hover {
    color: #D96D7A;
  }

  .panel-dropdown-btn-delete {
    color: #F98D9A;
    font-size: 13px
  }
  .panel-dropdown-btn-delete:hover {
    color: #D96D7A;
  }
  .panel-dropdown-error-message {
    color: #F98D9A;
  }
  /* end--Panel-自定义可编辑的el-select下拉框样式*/


</style>
<template>
    <div class="panel">
        <div class="content-left">
            <div class="sidebar-title">{{$t('dashboard.title')}}</div>
            <div class="sidebar-info">
                <div class="sidebar-info-item sidebar-info-top sidebar-info-item-active">{{$t('dashboard.panel.title')}}</div>
                <div class="sidebar-info-item" @click="jumpTo('metricPreview')">{{$t('dashboard.metricPreview.title')}}</div>
            </div>
        </div>
        <div class="content-right">
            <div class="top-tools">
              <button @click="toAdd" class="nz-btn nz-btn-size-normal nz-btn-style-normal float-right">
                <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
              </button>
              <div class="top-tool-search float-right"><search-input :searchMsg="searchMsg" @search="search"></search-input></div>
              <el-select class="right-box-row-with-btn" popper-class="" v-model="showPanel.id" placeholder=""  size="small">
                <el-option  >
                  <span class="panel-dropdown-btn-create" @click.stop="toAdd" >{{$t('dashboard.panel.createPanelTitleSec')}}</span>
                </el-option>
                <el-option
                  @click.native=""
                  v-for="item in panelData"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                  <span class="panel-dropdown-label-txt" >{{item.name}}</span>
                  <span class="panel-dropdown-btn" @click.stop="toEdit(item)">
                                        <i class="el-icon-edit-outline" ></i>
                                    </span>
                  <span class="panel-dropdown-btn panel-dropdown-btn-delete" @click.stop="del(item)"><i class="el-icon-delete"></i></span>
                </el-option>
              </el-select>
            </div>
            <div class="table-list">
              <!--<div class="box-content">
                <chart-list
                  @on-edit-chart="editData"
                  @on-remove-chart="removeData" ref="chartList"></chart-list>
              </div>
              -->
            </div>
        </div>

        <transition name="right-box">
            <div class="right-box right-box-panel" v-if="rightBox.show">
                <!-- begin--顶部按钮-->
                <div class="right-box-top-btns">
                    <div class="right-box-top-btn right-box-top-btn-full" @click="esc">
                        <div class="right-box-btn-icon">
                            <i class="el-icon-close"></i>
                        </div>
                        <span>{{$t('overall.esc')}}</span>
                    </div>
                    <div class="right-box-top-btn right-box-top-btn-full" @click="save">
                        <div class="right-box-btn-icon">
                            <i class="el-icon-edit-outline"></i>
                        </div>
                        <span >{{$t('overall.save')}}</span>
                    </div>
                    <div @click="del(panel)" class="right-box-top-btn" v-if="panel.id != ''">
                        <div class="right-box-btn-icon">
                            <i class="el-icon-delete"></i>
                        </div>
                        <span>{{$t('overall.delete')}}</span>
                    </div>
                </div>
                <!-- end--顶部按钮-->

                <!-- begin--标题-->
                <div class="right-box-title">{{rightBox.title}}</div>
                <!-- end--标题-->

                <!-- begin--表单-->
                <div class="right-box-form">
                    <div class="right-box-form-row">
                        <div class="right-box-form-label">{{$t('dashboard.panel.panelForm.panelName')}}</div>
                        <div class="right-box-form-content">
                          <el-input placeholder="" maxlength="64" show-word-limit v-model="panel.name" size="small"></el-input>
                        </div>
                    </div>
                </div>
                <!-- end--表单-->

                <!-- begin--底部按钮-->
                <div class="right-box-bottom-btns">
                    <div @click="esc()" :class="{'right-box-bottom-btn-50': true}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div @click="save()"  class="right-box-bottom-btn right-box-bottom-btn-50">{{panel.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
                </div>
                <!-- end--底部按钮-->

            </div>
        </transition>
    </div>

</template>
<script>
export default {
  name: "panel",
  data() {
    return {
      rightBox: { //弹出框相关
        show: false,
        title: this.$t('dashboard.panel.createPanelTitle')
      },
      showPanel:{//panel下拉列表
        id:'',
        name:''
      },
      panel: {//新增panel
        id:'',
        name: ''
      },
      pageObj: {
        pageNo: 1,
        pageSize: 9999,//此处获取所有数据，所以设置一个较大的值
        total:0
      },
      chartsData: [],//中间部分图表相关数据
      panelData: [],
      searchMsg: { //给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 1,
          name: this.$t("dashboard.panel.panelForm.panelId"),
          type: 'input',
          label: 'id',
          disabled: false
        },{
          id: 2,
          name: this.$t("dashboard.panel.panelForm.panelName"),
          type: 'input',
          label: 'name',
          disabled: false
        }],
      },
      searchLabel: {}, //搜索参数
    }
  },
  methods: {
    del: function(u) {
      this.$confirm(this.$t("tip.confirmDelete"), {
        confirmButtonText: this.$t("tip.yes"),
        cancelButtonText: this.$t("tip.no"),
        type: 'warning'
      }).then(() => {
        this.$delete("panel?ids=" + u.id).then(response => {
          if (response.code === 200) {
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
            if(this.showPanel.id===u.id){
              this.showPanel.id ='';
            }
            this.getTableData();
            this.rightBox.show = false;
          } else {
            this.$message.error(response.msg);
          }
        })
      });
    },
    toEdit: function(u) {
      this.panel = Object.assign({}, u);
      this.rightBox.title = this.$t("dashboard.panel.editPanelTitle") ;
      this.rightBox.show = true;
    },
    toAdd: function() {
      this.cleanPanel();
      this.rightBox.title = this.$t("dashboard.panel.createPanelTitle");
      this.rightBox.show = true;
    },
    save: function() {
      if (this.panel.id) {
        this.$put('panel', this.panel).then(response => {
          if (response.code === 200) {
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.getTableData();
            this.esc();
          } else {
            this.$message.error(response.msg);
          }
        });
      } else {
        this.$post('panel', this.panel).then(response => {
          if (response.code === 200) {
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            this.getTableData();
            this.esc();
          } else {
            this.$message.error(response.msg);
          }
        });
      }
    },
    esc: function() {
      this.rightBox.show = false;
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
    getTableData: function() {
      this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
      this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
      this.$get('panel', this.searchLabel).then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list;
          if( response.data.list.length>0 && this.showPanel.id===''){
            this.showPanel.id = response.data.list[0].id;
          }
          this.pageObj.total = response.data.total
        }
      })
    },
    cleanPanel: function() {
      this.panel = {
        id: '',
        name: ''
      }
    },
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getTableData();
    },
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getTableData();
    },
    search: function(searchObj) {
      console.info(searchObj);
      this.searchLabel = {};
      for (let item in searchObj) {
        if (searchObj[item]) {
          this.$set(this.searchLabel, item, searchObj[item]);
        }
      }
      this.getTableData();
    }
  },
  created() {
    this.getTableData();
  },
  mounted: function() {

  },
  watch: {

  }
}
</script>
