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

/* start--param*/
.param-btn {
  float: right;
  height: 27px;
  margin-top: -3px;
}
.param-btn-active {
  background-color: #656565;
  color: white;
  border: 1px solid #656565;
}
.param-btn-active:hover, .param-btn-active:focus {
  background-color: #656565;
  color: white;
}
.param-btn-clear {
  background-color: #D4D4D4;
  border: 1px solid #D4D4D4;
  color: white;
}
.param-btn-clear:hover, .param-btn-clear:focus {
  background-color: #D4D4D4;
  color: white;
}

.param-box {
  height: 303px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  padding: 0 10px;
}
.param-box-row {
  padding: 7px 0 0 0;
  position: relative;
}
.param-box-row:last-of-type {
  padding-bottom: 7px;
}
.param-box-row-key, .param-box-row-value {
  display: inline-block;
  width: 41.5%;
}
.param-box-row-eq {
  display: inline-block;
  width: 22px;
  text-align: center;
  height: 32px;
  line-height: 32px;
  color: #c4c7cF;
}
.param-box-row-symbol {
  font-size: 12px;
  color: #c4c7cF;
  border: 1px solid #c4c7cF;
  text-align: center;
  height: 12px;
  width: 14px;
  display: inline-block;
  position: absolute;
  top: 17px;
  right: 25px;
  cursor: pointer;
}
.param-box-row-symbol>i {
  position: absolute;
  top: 1px;
  right: 1px;
}
/* end--param*/

/* begin--子弹框*/
.right-sub-box {
  width: 330px;
  height: calc(50%);
  position: absolute;
  top: 380px;
  right: 100px;
  z-index: 2;
}
.right-sub-box .el-input-group {
  width: 60%;
  float: right;
  margin: 7px 0 0 0;
}
.endpoint-asset-prepend {
  border-radius: 4px 0 0 4px;
}
.endpoint-asset-label {
  line-height: 26px;
  height: 26px;
}
.endpoint-asset-dropdown {
  position: absolute;
  top: 27px;
  background-color: #656565;
  border-radius: 4px;
  width: 52px;
  left: 0;
}
.endpoint-asset-dropdown-item {
  text-align: center;
  line-height: 22px;
  height: 22px;
  cursor: default;
}
.endpoint-asset-label-txt {
  display: inline-block;
  width: 19px;
}
.endpoint-asset-dropdown-item:first-of-type {
  border-radius: 4px 4px 0 0;
}
.endpoint-asset-dropdown-item:last-of-type {
  border-radius: 0 0 4px 4px;
}
.endpoint-asset-dropdown-item:hover {
  background-color: #3a8ee6;
}
/* end--子弹框*/
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
        :data="endPointTableData"
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
            <span v-if="item.prop == 'asset'">{{scope.row[item.prop].host}}</span>
            <span v-else>{{scope.row[item.prop]}}</span>
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
      <div class="right-box right-box-endpoint" v-if="rightBox.show">
        <!-- begin--顶部按钮-->
        <div class="right-box-top-btns">
          <div class="right-box-top-btn right-box-top-btn-full" @click="esc">
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
          <!--project-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.project.project")}}</div>
            <div class="right-box-form-content">
              <el-select @change="((val) => {getModuleData(val.id)})" value-key="id" popper-class="config-dropdown" v-model="endpoint.project" placeholder="" v-if="rightBox.isEdit" size="small">
                <el-option v-for="item in projectData" :key="item.id" :label="item.name" :value="item"></el-option>
              </el-select>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.project.name}}</div>
            </div>
          </div>
          <!--module-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.module.module")}}</div>
            <div class="right-box-form-content">
              <el-select @change="((val) => {changeModule(val.id)})" value-key="id" popper-class="config-dropdown" v-model="selectedModule" placeholder="" v-if="rightBox.isEdit" size="small">
                <el-option v-for="item in moduleData" :key="item.id" :label="item.name" :value="item"></el-option>
              </el-select>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.module.name}}</div>
            </div>
          </div>
          <!--host-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.endpoint.host")}}</div>
            <div class="right-box-form-content">
              <el-input
                class="right-box-row-with-btn"
                v-if="rightBox.isEdit"
                placeholder=""
                v-model="endpoint.host"
                size="small"
              ></el-input>
              <div @click="showSubShow" class="right-box-row-btn right-box-row-btn-active" v-if="rightBox.isEdit">
                <span class="el-icon-more"></span>
              </div>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.host}}</div>
            </div>
          </div>
          <!--port-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.endpoint.port")}}</div>
            <div class="right-box-form-content">
              <el-input
                v-if="rightBox.isEdit"
                placeholder=""
                v-model="endpoint.port"
                size="small"
              ></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.port}}</div>
            </div>
          </div>
          <!--path-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.endpoint.path")}}</div>
            <div class="right-box-form-content">
              <el-input
                v-if="rightBox.isEdit"
                placeholder=""
                v-model="endpoint.path"
                size="small"
              ></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.path}}</div>
            </div>
          </div>
          <!--param-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">
              {{$t("project.endpoint.param")}}
              <el-button class="param-btn param-btn-active margin-l-10" size="mini" @click="addParam"><i class="el-icon-plus"></i>{{$t('overall.add')}}</el-button>
              <el-button class="param-btn param-btn-clear" size="mini" @click="clearAllParam">{{$t('overall.clearAll')}}</el-button>
            </div>
            <div class="right-box-form-content">
              <div class="param-box">
                <div class="param-box-row" v-for="(item, index) in paramObj">
                  <el-input placeholder="key" class="param-box-row-key" size="mini" v-model="item.key"></el-input>
                  <span class="param-box-row-eq">=</span>
                  <el-input placeholder="value" class="param-box-row-value" size="mini" v-model="item.value"></el-input>
                  <span class="param-box-row-symbol" @click="removeParam(index)"><i class="el-icon-minus"></i></span>
                </div>
              </div>
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

    <!-- begin--子弹框-->
    <transition name="right-sub-box">
      <div class="right-sub-box" v-if="rightSubBox.show">
        <!-- begin--标题-->
        <div class="right-box-title">{{rightSubBox.title}}</div>
        <!-- end--标题-->

        <!-- begin--搜索框-->
        <el-input placeholder="" v-model="assetSearch.text">
          <template slot="prepend">
            <div class="endpoint-asset-prepend">
              <div class="endpoint-asset-label">
                <span class="endpoint-asset-label-txt">{{assetSearch.label}}</span>
                <span @click="assetSearch.dropdownShow = !assetSearch.dropdownShow">
                  <i v-if="assetSearch.dropdownShow" class="el-icon-arrow-up"></i>
                  <i v-if="!assetSearch.dropdownShow" class="el-icon-arrow-down"></i>
                </span>
              </div>
              <div class="endpoint-asset-dropdown" v-if="assetSearch.dropdownShow">
                <div @click="dropdownSelect('IP')" class="endpoint-asset-dropdown-item">IP</div>
                <div @click="dropdownSelect('SN')" class="endpoint-asset-dropdown-item">SN</div>
              </div>
            </div>
          </template>
          <template slot="append"><i class="el-icon-search"></i></template>
        </el-input>
        <!-- end--搜索框-->
      </div>
    </transition>
    <!-- end--子弹框-->
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
      rightSubBox: { //弹出框相关
        show: false,
        title: this.$t("overall.asset")
      },
      assetSearch: {
        ip: '',
        sn: '',
        text: '',
        label: 'IP',
        dropdownShow: false
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
        module: {id: '', name: '', param: '', paramObj: {}}
      },
      selectedModule: {
        id: '',
        name: ''
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
      endPointTableData: [],
      projectData: [],
      moduleData: [],
      paramObj: []
    }
  },
  methods: {
    showSubShow: function() {
      this.rightSubBox.show = !this.rightSubBox.show;
    },
    getEndPointTableData: function() {
      this.$get('endpoint', this.pageObj).then(response => {
        if (response.code === 200) {
          for (var i = 0; i < response.data.list.length; i++) {
            try {
              var tempObj = JSON.parse(response.data.list[i].param);
            } catch (err) {

            }
            response.data.list[i].paramObj = [];
            for (let k in tempObj) {
              response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
            }
          }
          this.endPointTableData = response.data.list;
          this.pageObj.total = response.data.total;
        }
      });
    },
    getProjectData: function() {
      this.$get('project').then(response => {
        if (response.code === 200) {
          this.projectData = response.data.list;
        }
      });
    },
    getModuleData: function(projectId) {
      // module选择改变时，记录旧module的id值(endpoint.moduleId)和对应的endpoint的param(endpoint.和对应的endpoint.param)，
      // 然后改变，改变后param用module的值，如果改回旧module，则恢复endpoint的param
      this.selectedModule = {id: '', name: ''};
      this.$get('module', {projectId: projectId}).then(response => {
        if (response.code === 200) {
          for (var i = 0; i < response.data.list.length; i++) {
            var tempObj = JSON.parse(response.data.list[i].param);
            response.data.list[i].paramObj = [];
            for (let k in tempObj) {
              response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
            }
          }
          this.moduleData = response.data.list;
        }
      });
    },
    changeModule: function(moduleId) {
      if (moduleId == this.endpoint.moduleId) {
        this.paramObj = JSON.parse(JSON.stringify(this.endpoint.paramObj));
      } else {
        this.paramObj = JSON.parse(JSON.stringify(this.selectedModule.paramObj));
      }
    },
    toEdit: function(u) {
      this.getModuleData(u.project.id);
      this.selectedModule = Object.assign({}, u.module);
      this.endpoint = Object.assign({}, u);
      //this.paramObj = this.endpoint.paramObj;
      this.paramObj = JSON.parse(JSON.stringify(this.endpoint.paramObj));
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("project.endpoint.editEndpoint") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    del: function(u) {
    },
    toAdd: function() {
      this.cleanEndpoint();
      this.paramObj = [];
      this.moduleData = [];
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("project.endpoint.createEndpoint");
      this.rightBox.show = true;
    },
    detail: function(u) {
      this.endpoint = Object.assign({}, u);
      this.rightBox.isEdit = false;
      this.rightBox.title = this.$t("project.endpoint.endpoint") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    saveOrToEdit: function() {
      if (!this.rightBox.isEdit) {
        this.rightBox.isEdit = true;
        this.rightBox.title = this.$t("project.endpoint.editEndpoint") + "  ID：" + this.endpoint.id;
      }
    },
    save: function() {

    },
    clearAllParam: function() {
      this.paramObj = [];
    },
    addParam: function() {
      this.paramObj.push({key: '', value: ''});
    },
    removeParam: function(index) {
      this.paramObj.splice(index, 1);
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
      this.getEndPointTableData();
    },
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getEndPointTableData();
    },

    dropdownSelect: function(label) {
      this.assetSearch.label = label;
      this.assetSearch.dropdownShow = false;
    }
  },
  mounted: function() {
    this.getEndPointTableData();
    this.getProjectData();
  }
}
</script>
