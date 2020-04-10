<template>
  <span class="mib-browser">
    <div class="top-tools">
      <div class="nz-tab top-tool-main-right top-tool-main-right-to-left" style="width: 300px">
        <div class="nz-tab-item-box" @click="toFileTab" id="module-type-3">
          <div class="nz-tab-item">{{$t("config.mib.mibFiles")}}</div>
        </div>
        <div class="nz-tab-item-box" id="module-type-4">
          <div class="nz-tab-item nz-tab-item-active">{{$t("config.mib.mibBrowser")}}</div>
        </div>
      </div>
      <div class="top-tool-main-right">
        <div class="top-tool-search">
          <el-input size="mini" v-model="searchParam.host" placeholder="Host"></el-input>
        </div>
        <div class="top-tool-search margin-l-20 oid-input">
          <el-input size="mini" v-model="searchParam.oid" placeholder="OID"></el-input>
        </div>
        <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light margin-l-20">
          <el-select class="nz-input-group-left input-x-mini-24 operation" v-model="searchParam.operation">
            <el-option v-for="item in operationData" :key="item" :value="item"></el-option>
          </el-select><button
          @click="advancedShow = true" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="browser-advanced"><i class="el-icon-more"></i></button><button
          @click="search" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="browser-go">Go</button>
        </div>
      </div>
    </div>
    <div class="mib-browser-box">
      <el-row style="height: 100%;">
        <!--左半部分-->
        <el-col :span="7" class="mib-browser-left">
          <!--tree-->
          <el-scrollbar class="mib-browser-tree" ref="scrollbar">
            <el-tree
              ref="walkTree"
              node-key="objectID"
              :props="{label: 'name', children: 'subTree', disabled: disabledNode}"
              :data="walkData"
              :expand-on-click-node="false"
              check-on-click-node
              check-strictly
              @node-click="showDetail"
            >
              <div slot-scope="{node, data}" class="walk-tree-item">
                <span v-if="!data.type"><i class="el-icon-reading"></i></span>
                <span v-else>
                  <i v-if="data.type.toUpperCase() == 'IDENTIFIER'" class="el-icon-folder-opened"></i>
                  <i v-if="data.type.toUpperCase() == 'OBJECT' && data.subTree.length > 0" class="el-icon-folder-opened"></i>
                  <i v-if="data.type.toUpperCase() == 'OBJECT' && data.subTree.length == 0" class="nz-icon nz-icon-leaf"></i>
                  <i v-if="data.type.toUpperCase() == 'ENTRY'" class="nz-icon nz-icon-table-edit"></i>
                  <i v-if="data.type.toUpperCase() == 'TABLE'" class="nz-icon nz-icon-table"></i>
                </span>
                {{data.name}}
              </div>
            </el-tree>
          </el-scrollbar>
          <!--detail-->
          <div class="mib-browser-detail">
            <el-row class="mib-browser-detail-row">
              <el-col :span="5">Name</el-col>
              <el-col :span="19">{{currentWalk.name}}</el-col>
            </el-row>
            <el-row class="mib-browser-detail-row">
              <el-col :span="5">OID</el-col>
              <el-col :span="19">{{currentWalk.objectID}}</el-col>
            </el-row>
            <el-row class="mib-browser-detail-row">
              <el-col :span="5">MIB</el-col>
              <el-col :span="19">{{mibName(currentWalk.objectID)}}</el-col>
            </el-row>
            <el-row class="mib-browser-detail-row">
              <el-col :span="5">Syntax</el-col>
              <el-col :span="19">{{currentWalk.syntax}}</el-col>
            </el-row>
            <el-row class="mib-browser-detail-row">
              <el-col :span="5">Access</el-col>
              <el-col :span="19">{{currentWalk.access}}</el-col>
            </el-row>
            <el-row class="mib-browser-detail-row">
              <el-col :span="5">Status</el-col>
              <el-col :span="19">{{currentWalk.status}}</el-col>
            </el-row>
            <el-row class="mib-browser-detail-row">
              <el-col :span="5">Indexes</el-col>
              <el-col :span="19">{{currentWalk.index}}</el-col>
            </el-row>
            <el-row class="mib-browser-detail-row">
              <el-col :span="5">Description</el-col>
              <el-col :span="19">
                <el-scrollbar style="height: 100%;">
                  <div class="mib-browser-detail-description">{{currentWalk.description}}</div>
                </el-scrollbar>
              </el-col>
            </el-row>
          </div>
        </el-col>
        <!--右半部分-->
        <el-col :span="17" class="mib-browser-right">
          <div class="mib-browser-table-title">
            <span>Result table</span>
            <span>
              <span class="mib-browser-table-op" :title="$t('overall.exportExcel')"><i class="el-icon-download"></i></span>
              <span @click="clearResult" class="mib-browser-table-op" :title="$t('overall.clear')"><i class="el-icon-close"></i></span>
            </span>
          </div>
          <div class="mib-browser-table">
            <el-row class="mib-browser-table-header">
              <el-col :span="8">Name/OID</el-col>
              <el-col :span="9">Value</el-col>
              <el-col :span="3">Type</el-col>
              <el-col :span="4">IP:Port</el-col>
            </el-row>
            <el-row class="mib-browser-table-tr" v-for="item, index in resultData" :key="index">
              <el-col :span="8">{{item.name ? item.name : item.oid}}</el-col>
              <el-col :span="9">{{item.value}}</el-col>
              <el-col :span="3">{{item.type}}</el-col>
              <el-col :span="4">{{item.ip + (item.port ? ":" + item.port : "")}}</el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
    </div>
  </span>
</template>

<script>
  export default {
    name: "mibBrowser",
    props: {
      showTab: String,
    },
    data() {
      return {
        searchParam: {
          host: '',
          port: 161,
          oid: '',
          operation: 'get'
        },
        operationData: ['get', 'walk', 'getnext', 'set'],
        advancedShow: false,

        walkData: [],
        currentWalk: {name: '', objectID: '', syntax: '', access: '', status: '', index: '', description: ''},
        resultData: []
      }
    },
    computed: {
      mibName() {
        return (value) => {
          return value ? this.getMibName(value) : "";
        }
      }
    },
    methods: {
      toFileTab() {
        this.$emit("toFileTab");
      },
      showDetail(data, node) {
        this.currentWalk = data;
      },
      disabledNode(data) {
        if (data.objectID) {
          return false;
        }
        return true;
      },
      getMibName(oid) {
        let node = this.$refs.walkTree.getNode(oid);
        let mibName = getMibName(node);
        function getMibName(n) {
          if (n.parent && n.parent.parent) {
            return getMibName(n.parent);
          } else if (n.parent) {
            return n.data.name;
          } else {
            return "";
          }
        }
        if (mibName) {
          return mibName;
        } else {
          return "";
        }
      },
      getWalkData() {
        this.$get('mib/tree', {pageSize: -1, pageNo: 1}).then(response => {
          if (response.code === 200) {
            let obj = JSON.parse(response.data);
            this.walkData = [];
            for (let item in obj) {
              this.walkData.push({name: item, subTree: obj[item]});
            }
          }
        });
      },
      search() {
        this.$get('mib/browser').then(response => {
          if (response.code === 200) {
            this.resultData = response.data.list;
          }
        });
      },
      clearResult() {
        this.resultData = [];
      }
    },
    mounted() {
      this.getWalkData();
    }
  }
</script>

<style lang="scss">
.mib-browser {
  .top-tool-search .el-input__inner {
    height: 25px;
    line-height: 25px;
  }
  .operation {
    width: 90px;
  }
  .oid-input.top-tool-search {
    width: 500px;
  }

  .mib-browser-box {
    border: 1px solid #D8D8D8;
    border-radius: 4px;
    height: calc(100% - 55px);
    width: 100%;
  }

  .mib-browser-left {
    border-right: 2px solid #D8D8D8;
    height: 100%;
  }
  .mib-browser-tree {
    height: calc(66% - 1px);
    background-color: white;
    border-radius: 4px 0 0 0;
    border-bottom: 2px solid #dcdcdc;
    font-size: 14px;
  }
  .mib-browser-detail {
    height: 34%;
  }
  .mib-browser-detail-row {
    line-height: 25px;
    background-color: white;
    border-bottom: 1px solid #D8D8D8;
    font-size: 14px;
  }
  .mib-browser-detail-row .el-col:first-of-type {
    color: #666;
  }
  .mib-browser-detail-row:not(:last-of-type) {
    border-bottom: 1px solid #D8D8D8;
    height: 25px;
  }
  .mib-browser-detail-row:last-of-type {
    height: calc(100% - 175px);
  }
  .mib-browser-detail-row:last-of-type .el-col {
    height: 100%;
  }
  .mib-browser-detail-row .el-col {
    padding: 0 5px
  }
  .mib-browser-detail-row .el-col:first-of-type {
    border-right: 1px solid #D8D8D8;
  }
  .mib-browser-detail-row:last-of-type .el-col:last-of-type {
    padding-right: 0;
  }
  .mib-browser-detail-description {
    padding: 0 14px 0 0;
  }
  .mib-browser-table-title {
    height: 32px;
    line-height: 32px;
    font-size: 16px;
    border-bottom: 1px solid #D8D8D8;
    padding: 0 5px 0 8px;
    display: flex;
    justify-content: space-between;
  }
  .mib-browser-table-op {
    display: inline-block;
    margin: 0 5px;
    cursor: pointer;
  }
  .mib-browser-table-header .el-col {
    color: #666;
    height: 28px;
    line-height: 28px;
    text-align: center;
    border-bottom: 1px solid #D8D8D8;
  }
  .mib-browser-table-header .el-col:not(:last-of-type), .mib-browser-table-tr .el-col:not(:last-of-type) {
    border-right: 1px solid #D8D8D8;
  }
  .mib-browser-table-tr .el-col {
    border-bottom: 1px solid #D8D8D8;
    height: 26px;
    line-height: 26px;
    padding: 0 4px;
    font-size: 14px;
    background-color: white;
  }
}
</style>
