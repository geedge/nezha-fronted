<template>
  <div class="project">
    <div class="content-left">
      <div class="sidebar-title">{{$t('project.project.project')}}：{{currentProject.name}}</div>
      <div class="sidebar-info">
        <div
          v-for="item in moduleList"
          class="sidebar-info-item"
          :class="{'sidebar-info-item-active': item.id == currentModule.id}"
          @click="changeModule(item)"
        >
          {{item.name}}
          <div class="side-bar-menu-edit" @click.stop="toEditModule(item)"><i class="el-icon-edit-outline"></i></div>
        </div>
      </div>
    </div>

    <!--metrics-->
    <div class="content-right" v-show="tableShow == 2">
      <div class="top-tools">
        <div class="nz-btn-group float-left">
          <button @click="tableShow = 1" class="nz-btn nz-btn-size-small nz-btn-style-light float-left">
            <span>{{$t('project.endpoint.endpoint')}}</span>
          </button>
          <button @click="" class="nz-btn nz-btn-size-small nz-btn-disabled nz-btn-style-normal float-left">
            <span>{{$t('project.metrics.metrics')}}</span>
          </button>
        </div>
        <div class="top-tool-search float-right"><search-input :searchMsg="metricSearchMsg" @search="metricSearch"></search-input></div>
      </div>
      <el-table
        :data="metricsTableData"
        border
        height="calc(100% - 65px)"
        style="width: 100%;">
        <el-table-column
          :resizable="false"
          v-for="(item, index) in metricsTableTitle"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
        >
          <template slot-scope="scope" :column="item">
            <span>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-cloak :pageObj="metricPageObj" @pageNo='metricsPageNo' @pageSize='metricsPageSize' ref="metricPagination"></Pagination>
    </div>

    <!--endpoint-->
    <div class="content-right" v-show="tableShow == 1">
      <div class="top-tools">
        <div class="nz-btn-group float-left">
          <button @click="" type="button" class="nz-btn nz-btn-size-small nz-btn-disabled nz-btn-style-normal float-left">
            <span>{{$t('project.endpoint.endpoint')}}</span>
          </button>
          <button type="button" @click="tableShow = 2" class="nz-btn nz-btn-size-small nz-btn-style-light float-left">
            <span>{{$t('project.metrics.metrics')}}</span>
          </button>
        </div>
        <button @click="toCreateEndpoint" class="nz-btn nz-btn-size-normal nz-btn-style-normal float-right">
          <span>{{$t('overall.add')}}</span>
        </button>
        <div class="top-tool-search float-right"><search-input :searchMsg="endpointSearchMsg" @search="endpointSearch" ref="projectSearch"></search-input></div>
      </div>
      <el-table
        :data="endpointTableData"
        border
        height="calc(100% - 65px)"
        style="width: 100%;">
        <el-table-column
          :resizable="false"
          v-for="(item, index) in endpointTableTitle"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
        >
          <template slot-scope="scope" :column="item">
            <span  v-if="item.prop == 'asset' && scope.row[item.prop]"  @click="viewAsset(scope.row[item.prop].id)">{{scope.row[item.prop].host}}</span>
            <span v-else-if="item.prop == 'param'">
              <span v-for="p in scope.row.paramObj">{{p.key}}={{p.value}}，</span>
            </span>
            <span v-else-if="item.prop == 'lastUpdate'">{{dateFormat(scope.row.lastUpdate)}}</span>
            <span v-else-if="item.prop == 'state'">{{scope.row.state == 1 ? 'up' : ''}}{{scope.row.state == 0 ? 'down' : ''}}</span>
            <span v-else>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
        <el-table-column :resizable="false" :label="$t('overall.option')" width="100">
          <template slot-scope="scope" :column="item">
            <div class="content-right-options">
              <span @click.stop="endpointDetail(scope.row)" class="content-right-option"><i class="el-icon-view"></i></span>
              <span @click.stop="toEditEndpoint(scope.row)" class="content-right-option"><i class="el-icon-edit-outline"></i></span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-cloak :pageObj="endpointPageObj" @pageNo='endpointPageNo' @pageSize='endpointPageSize' ref="endpointPagination"></Pagination>
    </div>

    <module-box :currentProject="currentProject" :module="editModule" @reload="getModuleList" ref="moduleBox"></module-box>
    <edit-endpoint-box :currentProject="currentProject" :currentModule="currentModule" :endpoint="editEndpoint" @reload="getEndpointTableData" ref="editEndpointBox"></edit-endpoint-box>
    <add-endpoint-box :currentProject="currentProject" :currentModule="currentModule" @reload="getEndpointTableData" ref="addEndpointBox"></add-endpoint-box>
    <asset-edit-unit :edit-unit-show='viewAssetState' @refreshData="" @sendStateData="" ref="assetEditUnit"></asset-edit-unit>
  </div>
</template>

<script>
  export default {
    name: "project2",
    data() {
      return {
        tableShow: 1, // 1.endpoint; 2.metrics
        editEndpoint: {id: '', host: '', port: '', param: '', path: '', asset: {}, project: {}, module: {}, moduleId: '', assetId: '', paramObj: []},
        endpointTableTitle: [
          {
            label: this.$t("project.endpoint.endpointId"),
            prop: 'id',
            show: true,
            width: 110
          },{
            label: this.$t("project.endpoint.host"),
            prop: 'host',
            show: true,
          },{
            label: this.$t("project.endpoint.port"),
            prop: 'port',
            show: true,
          },{
            label: this.$t("project.endpoint.param"),
            prop: 'param',
            show: true,
          },{
            label: this.$t("project.endpoint.path"),
            prop: 'path',
            show: true,
          },{
            label: this.$t("alert.list.state"),
            prop: 'state',
            show: true,
          },{
            label: this.$t("project.endpoint.lastUpdate"),
            prop: 'lastUpdate',
            show: true,
          },{
            label: this.$t("project.endpoint.asset"),
            prop: 'asset',
            show: true,
          }
        ],
        endpointTableData: [],
        endpointPageObj: {
          pageNo: 1,
          pageSize: 20,
          total:0
        },
        metricsTableTitle: [
          {
            label: this.$t("project.metrics.name"),
            prop: 'metric',
            show: true,
          },
          {
            label: this.$t("project.metrics.type"),
            prop: 'type',
            show: true,
          },
          {
            label: this.$t("project.metrics.description"),
            prop: 'help',
            show: true,
          },
        ],
        metricsTableData: [],
        metricPageObj: {
          pageNo: 1,
          pageSize: 20,
          total: 0
        },
        moduleList: [],
        projectList: [],
        currentProject: {id: '', name: '', remark: ''}, //endpoint弹框、module列表用来回显project
        editModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //编辑的module
        currentModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //endpoint弹框用来回显module
        endpointSearchLabel: {moduleId: ''}, //endpoint搜索参数
        metricSearchLabel: {moduleId: ''}, //metrics搜索参数
        endpointSearchMsg: { //给搜索框子组件传递的信息
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
        metricSearchMsg: { //给搜索框子组件传递的信息
          zheze_none: true,
          searchLabelList: [{
            id: 12,
            name: 'Metric',
            type: 'input',
            label: 'metric',
            disabled: false
          }],
        },
        viewAssetState:false,
      }
    },
    methods: {
      getEndpointTableData() {
        this.endpointSearchLabel.moduleId = this.currentModule.id;
        this.$set(this.endpointSearchLabel, 'pageNo', this.endpointPageObj.pageNo);
        this.$set(this.endpointSearchLabel, 'pageSize', this.endpointPageObj.pageSize);
        this.$get('endpoint', this.endpointSearchLabel).then(response => {
          if (response.code === 200) {
            for (let i = 0; i < response.data.list.length; i++) {
              try {
                let tempObj = JSON.parse(response.data.list[i].param);
                response.data.list[i].paramObj = [];
                for (let k in tempObj) {
                  response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
                }
              } catch (err) {
                console.info(response.data.list[i], err);
              }
            }
            this.endpointTableData = response.data.list;
            this.endpointPageObj.total = response.data.total;
          }
        });
      },
      getMetricsTableData() {
        this.metricSearchLabel.moduleId = this.currentModule.id;
        this.$set(this.metricSearchLabel, 'pageNo', this.metricPageObj.pageNo);
        this.$set(this.metricSearchLabel, 'pageSize', this.metricPageObj.pageSize);
        this.$get('metric', this.metricSearchLabel).then(response => {
          if (response.code === 200) {
            this.metricsTableData = response.data.list;
            this.metricPageObj.total = response.data.total;
          }
        });
      },
      endpointPageNo(val) {
        this.endpointPageObj.pageNo = val;
        this.getEndpointTableData();
      },
      endpointPageSize(val) {
        this.endpointPageObj.pageSize = val;
        this.getEndpointTableData();
      },
      metricsPageNo(val) {
        this.metricPageObj.pageNo = val;
        this.getMetricsTableData();
      },
      metricsPageSize(val) {
        this.metricPageObj.pageSize = val;
        this.getMetricsTableData();
      },

      // 获取左侧module列表数据
      getModuleList() {
        //若currentProject不存在（如页面刷新了），默认取project列表的第一个
        if (this.currentProject && this.currentProject.id) {
          this.$get('module', {projectId: this.currentProject.id, pageSize: 999, pageNo: 1}).then(response => {
            if (response.code === 200) {
              this.moduleList = response.data.list;
              for (let i = 0; i < this.moduleList.length; i++) {
                try {
                  let tempObj = JSON.parse(this.moduleList[i].param);
                  this.$set(this.moduleList[i], 'paramObj', []);
                  for (let k in tempObj) {
                    this.moduleList[i].paramObj.push({key: k, value: tempObj[k]});
                  }
                } catch (err) {
                  console.info(response.data.list[i], err);
                }
              }
              if (this.moduleList.length > 0) {
                this.currentModule = this.moduleList[0];
              } else {
                this.currentModule = {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []};
              }
            }
          });
        } else {
          if (this.projectList && this.projectList.length > 0) {
            this.$store.commit('setProject', this.projectList[0]);
          } else {
            this.$get('project', {pageSize: 999, pageNo: 1}).then(response => {
              if (response.code == 200) {
                this.projectList = response.data.list;
                if (this.projectList.length > 0) {
                  this.getModuleList();
                } else {
                  return;
                }
              }
            });
          }
        }
      },

      //左侧module列表选中切换
      changeModule(module) {
        this.currentModule = module;
        this.endpointSearchLabel = {moduleId: ''};
        this.metricSearchLabel = {moduleId: ''};
        this.$refs.projectSearch.clearSearch();
      },

      //弹出endpoint编辑页
      toEditEndpoint(endpoint) {
        this.rightBoxHandler(3);
        this.$refs.editEndpointBox.toEdit(true);
        this.editEndpoint = JSON.parse(JSON.stringify(endpoint));
        if (!this.editEndpoint.paramObj) {
          this.$set(this.editEndpoint, 'paramObj', []);
        }
      },

      toCreateEndpoint() {
        this.$refs.addEndpointBox.show(true);
        this.$refs.addEndpointBox.clearEndpoints();
      },

      //查看endpoint详情
      endpointDetail(endpoint) {
        this.editEndpoint = JSON.parse(JSON.stringify(endpoint));
        if (!this.editEndpoint.paramObj) {
          this.$set(this.editEndpoint, 'paramObj', []);
        }
        this.rightBoxHandler(3);
        this.$refs.editEndpointBox.toEdit(false);
      },

      //弹出module编辑页
      toEditModule(module) {
        this.currentModule = JSON.parse(JSON.stringify(module));
        if (!this.currentModule.paramObj) {
          this.$set(this.currentModule, 'paramObj', []);
        }
        this.editModule = JSON.parse(JSON.stringify(module));
        if (!this.editModule.paramObj) {
          this.$set(this.editModule, 'paramObj', []);
        }
        this.rightBoxHandler(2);
      },

      //搜索
      endpointSearch: function(searchObj) {
        this.endpointSearchLabel = {};
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.endpointSearchLabel, item, searchObj[item]);
          }
        }
        this.getEndpointTableData();
      },
      //搜索
      metricSearch: function(searchObj) {
        this.metricSearchLabel = {};
        for (let item in searchObj) {
          if (searchObj[item]) {
            this.$set(this.metricSearchLabel, item, searchObj[item]);
          }
        }
        this.getMetricsTableData();
      },

      //控制弹框状态 type  1:project; 2:module; 3:editEndponit; 4:addEndpoint;
      rightBoxHandler(type) {
        if (type == 1) {
          this.$refs.projectBox.show(true);

          if (this.$refs.moduleBox) {
            this.$refs.moduleBox.show(false);
          }
          if (this.$refs.editEndpointBox) {
            this.$refs.editEndpointBox.show(false);
          }
          //this.$refs.addEndpointBox.show(false);
        } else if (type == 2) {
          this.$refs.moduleBox.show(true,true);

          if (this.$refs.projectBox) {
            this.$refs.projectBox.show(false);
          }
          if (this.$refs.editEndpointBox) {
            this.$refs.editEndpointBox.show(false);
          }
          //this.$refs.addEndpointBox.show(false);
        } else if (type == 3) {
          this.$refs.editEndpointBox.show(true);
          if (this.$refs.projectBox) {
            this.$refs.projectBox.show(false);
          }
          if (this.$refs.moduleBox) {
            this.$refs.moduleBox.show(false);
          }
          //this.$refs.addEndpointBox.show(false);
        } else if (type == 4) {
        }
      },

      dateFormat(time) {
        if (!time) {
          return;
        }
        let date = new Date(time * 1000);
        let year = date.getFullYear();
        let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        let minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        let seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
      },
      viewAsset:function(id){
        this.viewAssetState=true;
        this.$refs.assetEditUnit.getAssetData(id);
        this.$refs.assetEditUnit.tabView=true;
      }
    },
    created() {
      this.currentProject = this.$store.state.currentProject;
      this.getModuleList();
      this.getMetricsTableData();
    },
    mounted() {
      setTimeout(()=>{
        this.getEndpointTableData();
      }, 200);
    },
    computed: {
      currentProjectChange() {
        return this.$store.state.currentProject;
      },
      moduleListReloadWatch() {
        return this.$store.state.moduleListChange;
      },
    },
    watch: {
      currentProjectChange(n, o) {
        this.currentProject = Object.assign({}, n);
      },
      currentProject(n, o) {
        this.getModuleList();
      },
      currentModule(n, o) {
        this.metricPageObj.pageNo = 1;
        this.endpointPageObj.pageNo = 1;
        if (n && n.id) {
          this.getEndpointTableData();
          this.getMetricsTableData();
        } else {
          this.endpointTableData = [];
          this.metricsTableData = [];
        }
      },
      moduleListReloadWatch(n, o) {
        this.getModuleList(this.currentProject.id);
      }
    }
  }
</script>

<style scoped  lang="scss">
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
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    padding: 0 10px;
  }
  .param-box-endpoint {
    height: 325px;
  }
  .param-box-module {
    height: 227px;
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
    width: 380px;
    height: 520px;
    position: absolute;
    top: 380px;
    right: 100px;
    z-index: 2;
    padding: 0 10px;
  }
  .right-sub-box .el-input-group {
    width: 227px;
    float: right;
    margin: 7px 0 0 0;
  }
  /* begin--搜索框*/
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
    text-align: center;
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
  /* end--搜索框*/
  /* begin--table*/
  .endpoint-sub-table {
    margin-top: 25px;
  }
  .line-100 {
    margin-bottom: 3px;
  }
  .endpoint-sub-table-head {
    line-height: 28px;
    height: 30px;
  }
  .endpoint-sub-table-row {
    line-height: 28px;
    height: 30px;
    color: #656565;
  }
  .endpoint-sub-table-row-active {
    background-color: #dadada;
  }
  .endpoint-sub-table-col {
    display: inline-block;
    width: 45%;
    padding-left: 10px;
  }
  .endpoint-sub-table-paginate-all {
    position: absolute;
    left: 10px;
    bottom: 17px;
    color: #5a5a5a;
  }
  .endpoint-sub-table-body {
    font-size: 15px;
  }
  /* end--table*/

  /* end--子弹框*/
</style>
<style>
  /* begin--覆盖分页组件样式*/
  .right-sub-box .el-pagination.is-background .btn-next, .right-sub-box .el-pagination.is-background .btn-prev, .right-sub-box .el-pagination.is-background .el-pager li {
    margin: 0 3px;
    min-width: 25px;
  }
  .right-sub-box .el-pagination button, .right-sub-box .el-pagination span:not([class*=suffix]) {
    margin: 0 3px;
    height: 25px;
    line-height: 25px;
  }
  .right-sub-box .el-pager li {
    height: 25px;
    line-height: 25px;
  }
  .right-sub-box .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #656565;
    border: 1px solid #656565;
  }
  .right-sub-box .el-pagination.is-background .btn-next, .right-sub-box .el-pagination.is-background .btn-prev, .right-sub-box .el-pagination.is-background .el-pager li {
    background-color: white;
  }
  .right-sub-box .el-pagination button, .right-sub-box .el-pager li {
    border: 1px solid #DADADA;
  }
  .right-sub-box .el-pager li.active+li {
    border: 1px solid #DADADA;
  }
  .right-sub-box .el-pagination.is-background .el-pager li:not(.disabled):hover {
    color: black;
  }
  .right-sub-box .el-pagination.is-background .el-pager li.active:hover {
    color: white;
  }
  .endpoint-sub-table-paginate .el-pagination {
    position: absolute;
    right: 10px;
    bottom: 13px;
  }
  .el-input-group__append>i {
    cursor: pointer;
  }

  /* end--覆盖分页组件样式*/
</style>
