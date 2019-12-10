<style scoped>
.project {
  height: 100%;
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
.right-box-project {
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
</style>
<template>
  <div class="project">
    <div class="content-left">
      <div class="sidebar-title">Config</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top sidebar-info-item-active">Account List</div>
        <div class="sidebar-info-item">Prometheus Server</div>
      </div>
    </div>
    <div class="content-right">
      <div class="top-tools">
        <el-button-group>
          <el-button @click="" class="top-tool-btn top-tool top-tool-btn-active" size="mini">
            <span class="top-tool-btn-txt">{{$t('project.endpoint.endpoint')}}</span>
          </el-button>
          <el-button @click="" class="top-tool-btn top-tool" size="mini">
            <span class="top-tool-btn-txt">{{$t('project.metrics')}}</span>
          </el-button>
        </el-button-group>
        <el-button @click="toAdd" class="top-tool-btn top-tool-btn-active top-tool margin-l-10 top-tool-right" size="mini">
          <span><i class="el-icon-plus"></i></span>
          <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
        </el-button>
        <el-input
          class="top-tool-search top-tool top-tool-right"
          type="text"
          :placeholder="$t('overall.search')"
          size="mini"
        ></el-input>
      </div>
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
            <!--<span v-if="item.prop == 'asset'">{{scope.row[item.prop].name}}</span>
            <span v-else>{{scope.row[item.prop]}}</span>-->
            <span>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('overall.option')" width="100">
          <template slot-scope="scope" :column="item">
            <div class="content-right-options">
              <span @click="detail(scope.row)" class="content-right-option"><i class="el-icon-view"></i></span>
              <span @click="toEdit(scope.row)" class="content-right-option"><i class="el-icon-edit-outline"></i></span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
    </div>

    <!-- begin--右弹框-->
    <transition name="right-box">
      <div class="right-box right-box-project" v-if="rightBox.show">
        <!-- begin--顶部按钮-->
        <div class="right-box-top-btns">
          <div class="right-box-top-btn right-box-top-btn-full" @click="esc()">
            <div class="right-box-btn-icon">
              <i class="el-icon-close"></i>
            </div>
            <span>{{$t('overall.esc')}}</span>
          </div>
          <div class="right-box-top-btn right-box-top-btn-full" @click="saveOrToEdit">
            <div class="right-box-btn-icon">
              <i class="el-icon-edit-outline"></i>
            </div>
            <span v-if="rightBox.isEdit">{{$t('overall.save')}}</span>
            <span v-else>{{$t('overall.edit')}}</span>
          </div>
          <div class="right-box-top-btn" v-if="rightBox.isEdit && endpoint.id != ''">
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
            <div class="right-box-form-label">IDC</div>
            <div class="right-box-form-content">aaa
            </div>
          </div>
          <div class="right-box-form-row">
            <div class="right-box-form-label">Host</div>
            <div class="right-box-form-content">
              <el-input
                type="text"
                v-if="rightBox.isEdit"
                placeholder=""
                v-model="endpoint.host"
                size="small"
              ></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.host}}</div>
            </div>
          </div>
        </div>
        <!-- end--表单-->

        <!-- begin--底部按钮-->
        <div class="right-box-bottom-btns">
          <div @click="esc()" :class="{'right-box-bottom-btn-50': rightBox.isEdit}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div @click="save()" v-if="rightBox.isEdit" class="right-box-bottom-btn right-box-bottom-btn-50">{{endpoint.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
        </div>
        <!-- end--底部按钮-->

      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "project",
  data() {
    return {
      rightBox: { //弹出框相关
        show: false,
        isEdit: false, //false查看，true编辑
        title: ''
      },
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total:0
      },
      endpoint: {
        id: '',
        host: '',
        port: '',
        param: '',
        path: '',
        asset: {id: '', name: '', host: ''},
        project: {id: '', name: ''},
        module: {id: '', name: ''}
      },
      tableTitle: [
        {
          label: this.$t("project.endpoint.endpointId"),
          prop: 'id',
          show: true,
          width: 110
        },
        {
          label: this.$t("project.endpoint.host"),
          prop: 'host',
          show: true,
        },
        {
          label: this.$t("project.endpoint.port"),
          prop: 'port',
          show: true,
        },
        {
          label: this.$t("project.endpoint.param"),
          prop: 'param',
          show: true,
        },
        {
          label: this.$t("project.endpoint.path"),
          prop: 'path',
          show: true,
        },
        {
          label: this.$t("project.endpoint.asset"),
          prop: 'asset',
          show: true,
        }
      ],
      tableData: []
    }
  },
  methods: {
    getTableData: function() {
      this.$get('endpoint', this.pageObj).then(response => {
        if (response.code === 200) {
          this.tableData = response.data.list;
          this.pageObj.total = response.data.total
        }
      })
    },
    toEdit: function(u) {
      this.endpoint = Object.assign({}, u);
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("project.endpoint.editEndpoint") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    del: function(u) {
    },
    toAdd: function() {
      this.cleanEndpoint();
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("project.endpoint.createEndpoint");
      this.rightBox.show = true;
    },
    detail: function(u) {
      this.alertRule = Object.assign({}, u);
      this.rightBox.isEdit = false;
      this.rightBox.title = this.$t("project.endpoint.endpoint") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    saveOrToEdit: function() {
      if (!this.rightBox.isEdit) {
        this.rightBox.isEdit = true;
        this.rightBox.title = this.$t("project.endpoint.editEndpoint") + "  ID：" + this.alertRule.id;
      }
    },
    save: function() {

    },
    esc: function() {
      this.rightBox.show = false;
    },
    cleanEndpoint: function() {
      this.endpoint = {
        id: '',
        host: '',
        port: '',
        param: '',
        path: '',
        asset: {id: '', name: '', host: ''},
        project: {id: '', name: ''},
        module: {id: '', name: ''}
      }
    },
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getTableData();
    },
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getTableData();
    }
  },
  mounted: function() {
    this.getTableData();
  }
}
</script>
