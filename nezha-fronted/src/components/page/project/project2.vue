<template>
  <div class="project">
    <div class="content-left">
      <div class="sidebar-title">{{currentProject.name}}</div>
      <div class="sidebar-info">
      </div>
    </div>

    <div class="content-right">
      <div class="top-tools">
        <el-button-group>
          <el-button @click="" class="top-tool-btn top-tool top-tool-btn-active" size="mini">
            <span class="top-tool-btn-txt">{{$t('project.endpoint.endpoint')}}</span>
          </el-button>
          <el-button @click="" class="top-tool-btn top-tool" size="mini">
            <span class="top-tool-btn-txt">{{$t('project.metrics.metrics')}}</span>
          </el-button>
        </el-button-group>
        <el-button @click.stop="toAdd" class="top-tool-btn top-tool-btn-active top-tool margin-l-10 top-tool-right" size="mini">
          <span><i class="el-icon-plus"></i></span>
          <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
        </el-button>
        <div class="top-tool-search top-tool top-tool-right"></div>
      </div>
      <el-table
        :data="endpointTableData"
        border
        height="calc(100% - 65px)"
        style="width: 100%;">
        <el-table-column
          v-for="(item, index) in endpointTableTitle"
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
              <span @click.stop="detail(scope.row)" class="content-right-option"><i class="el-icon-view"></i></span>
              <span @click.stop="toEdit(scope.row)" class="content-right-option"><i class="el-icon-edit-outline"></i></span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :pageObj="endpointPageObj" @pageNo='endpointPageNo' @pageSize='endpointPageSize' ref="Pagination"></Pagination>
    </div>

    <module-box :currentProject="currentProject" :module="editModule" @reload="" ref="moduleBox"></module-box>
  </div>
</template>

<script>
import projectBox from '../../common/rightBox/projectBox';
export default {
  name: "project2",
  data() {
    return {
      endpoint: {id: '', host: '', port: '', param: '', path: '', asset: {}, project: {}, module: {}, moduleId: '', assetId: ''},
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
      moduleList: [],
      currentProject: {id: '', name: '', remark: ''}, //endpoint弹框、module列表用来回显project
      editModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //编辑的module
      currentModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []}, //endpoint弹框用来回显module

    }
  },
  methods: {
    getEndPointTableData() {
      this.$get('endpoint', this.endpointPageObj).then(response => {
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            try {
              var tempObj = JSON.parse(response.data.list[i].param);
            } catch (err) {
              console.info(response.data.list[i]);
              console.info(err);
            }
            response.data.list[i].paramObj = [];
            for (let k in tempObj) {
              response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
            }
          }
          this.endpointTableData = response.data.list;
          this.endpointPageObj.total = response.data.total;
        }
      });
    },
    endpointPageNo(val) {
      this.endpointPageObj.pageNo = val;
      this.getEndPointTableData();
    },
    endpointPageSize(val) {
      this.endpointPageObj.pageSize = val;
      this.getEndPointTableData();
    },
  },
  created() {
    this.getEndPointTableData();
  }
}
</script>

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
  .el-input-group__append {
    cursor: pointer;
  }

  /* end--覆盖分页组件样式*/
</style>
