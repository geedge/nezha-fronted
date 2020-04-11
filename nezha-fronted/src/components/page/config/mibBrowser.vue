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
          </el-select><el-popover trigger="click" placement="bottom">
            <div class="mib-browser-ad-search">
              <el-row class="mib-browser-ad-search-item">
                <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t("project.endpoint.port")}}</div></el-col>
                <el-col :span="17">
                  <el-input class="input-x-mini-24" v-model="searchParam.port"></el-input>
                </el-col>
              </el-row>
              <el-row class="mib-browser-ad-search-item">
                <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t('project.module.community')}}</div></el-col>
                <el-col :span="17">
                  <el-input class="input-x-mini-24" v-model="searchParam.community"></el-input>
                </el-col>
              </el-row>
              <el-row class="mib-browser-ad-search-item">
                <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t('project.module.version')}}</div></el-col>
                <el-col :span="17">
                  <el-radio-group v-model.number="searchParam.version">
                    <el-radio-button :label="2"></el-radio-button>
                    <el-radio-button :label="3"></el-radio-button>
                  </el-radio-group>
                </el-col>
              </el-row>
              <!--SNMP V3 setting-->
              <template v-if="searchParam.version == 3">
                <el-row class="mib-browser-ad-search-item">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('login.username')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-input class="input-x-mini-24" v-model.trim="searchParam.auth.username"></el-input>
                  </el-col>
                </el-row>

                <el-row class="mib-browser-ad-search-item">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('project.module.securityLevel')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-radio-group v-model="searchParam.auth.securityLevel" size="small" @change="updateScrollbar">
                      <el-radio-button label="noAuthNoPriv"></el-radio-button>
                      <el-radio-button label="authNoPriv"></el-radio-button>
                      <el-radio-button label="authPriv"></el-radio-button>
                    </el-radio-group>
                  </el-col>
                </el-row>

                <el-row class="mib-browser-ad-search-item" v-if="searchParam.auth.securityLevel == 'authNoPriv' || searchParam.auth.securityLevel == 'authPriv'">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('login.password')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-input class="input-x-mini-24" v-model.trim="searchParam.auth.password"></el-input>
                  </el-col>
                </el-row>

                <el-row class="mib-browser-ad-search-item" v-if="searchParam.auth.securityLevel == 'authNoPriv' || searchParam.auth.securityLevel == 'authPriv'">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('project.module.authProtocol')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-radio-group v-model="searchParam.auth.authProtocol">
                      <el-radio-button label="MD5"></el-radio-button>
                      <el-radio-button label="SHA"></el-radio-button>
                    </el-radio-group>
                  </el-col>
                </el-row>

                <el-row class="mib-browser-ad-search-item" v-if="searchParam.auth.securityLevel == 'authPriv'">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('project.module.privProtocol')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-radio-group v-model="searchParam.auth.privProtocol">
                      <el-radio-button label="DES"></el-radio-button>
                      <el-radio-button label="AES"></el-radio-button>
                    </el-radio-group>
                  </el-col>
                </el-row>

                <el-row class="mib-browser-ad-search-item" v-if="searchParam.auth.securityLevel == 'authPriv'">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('project.module.privPassword')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-input class="input-x-mini-24" v-model.trim="searchParam.auth.privPassword"></el-input>
                  </el-col>
                </el-row>
              </template>

            </div>
            <button slot="reference" @click="advancedShow = true" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="browser-advanced">
              <i class="el-icon-more"></i>
            </button>
          </el-popover><button
            @click="search" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="browser-go">Go
          </button>
        </div>
      </div>
    </div>
    <div class="mib-browser-box">
      <!--左半部分-->
      <div class="mib-browser-left">
        <div class="mib-browser-tree-title">
          <span>SNMP MIBs</span>
          <span class="mib-browser-table-op"><i class="nz-icon nz-icon-funnel"></i></span>
        </div>
        <!--tree-->
        <el-scrollbar class="mib-browser-tree" ref="treeScrollbar">
          <el-tree
            ref="walkTree"
            highlight-current
            node-key="objectID"
            :props="{label: 'name', children: 'subTree'}"
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
        <!--拖拽区-->
        <div class="tree-detail-resize" @mousedown="treeDetailResize"></div>
        <!--detail-->
        <el-scrollbar class="mib-browser-detail" ref="detailScrollbar">
          <div class="mib-browser-detail-row">
            <div>Name</div>
            <div>{{currentWalk.name}}</div>
          </div>
          <div class="mib-browser-detail-row">
            <div>OID</div>
            <div>{{currentWalk.objectID}}</div>
          </div>
          <div class="mib-browser-detail-row">
            <div>MIB</div>
            <div>{{mibName(currentWalk.objectID)}}</div>
          </div>
          <div class="mib-browser-detail-row">
            <div>Syntax</div>
            <div>{{currentWalk.syntax}}</div>
          </div>
          <div class="mib-browser-detail-row">
            <div>Access</div>
            <div>{{currentWalk.access}}</div>
          </div>
          <div class="mib-browser-detail-row">
            <div>Status</div>
            <div>{{currentWalk.status}}</div>
          </div>
          <div class="mib-browser-detail-row">
            <div>Indexes</div>
            <div>{{currentWalk.index && currentWalk.index.length > 0 ? currentWalk.index : ""}}</div>
          </div>
          <div class="mib-browser-detail-row">
            <div>Description</div>
            <div>{{currentWalk.description}}</div>
          </div>
        </el-scrollbar>
      </div>
      <!--拖拽区-->
      <div style="width: 1px; border: 1px solid #d8d8d8; background-color: #fcfcfc; cursor: ew-resize; height: 100%;border-top: none;border-bottom: none;"></div>
      <!--右半部分-->
      <div class="mib-browser-right">
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
      </div>
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
          operation: 'get',
          version: 2,
          community: 'public',
          auth: {
            username: '',
            password: '',
            securityLevel: '',
            authProtocol: '',
            privProtocol: '',
            privPassword: ''
          }
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
        this.searchParam.oid = data.objectID;
        this.$nextTick(() => {
          this.$refs.detailScrollbar.update();
        });
      },

      /*根据oid获取对应的根mib名称*/
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

      /*获取tree的数据*/
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

      /*清空result table*/
      clearResult() {
        this.resultData = [];
      },

      /*左侧上下拖动*/
      treeDetailResize() {

      }
    },
    mounted() {
      this.getWalkData();
    }
  }
</script>

<style lang="scss">
.mib-browser-ad-search-item {
  margin-bottom: 10px;
}
.mib-browser-ad-search .el-radio-group .el-radio-button__inner {
  height: 24px;
  line-height: 0;
}
.mib-browser-ad-search-label {
  line-height: 24px;
}
.mib-browser-ad-search {
  width: 400px;
}
.mib-browser {
  .top-tool-search .el-input__inner {
    height: 25px;
    line-height: 25px;
  }
  .operation {
    width: 90px;
  }
  #browser-advanced {
    border-radius: 0;
    border-right: 1px solid rgba(162,162,162,0.50);
  }
  .oid-input.top-tool-search {
    width: 500px;
  }

  .mib-browser-box {
    border: 1px solid #D8D8D8;
    border-radius: 4px;
    height: calc(100% - 55px);
    width: 100%;
    display: flex;
  }

  .mib-browser-left {
    height: 100%;
    width: 28%;
  }
  .mib-browser-tree {
    height: calc(69% - 39px);
    background-color: white;
    border-radius: 4px 0 0 0;
    font-size: 14px;
    padding-bottom: 5px;
    width: 100%;
  }
  .mib-browser-detail {
    height: 31%;
    width: 100%;
  }
  .mib-browser-detail .el-scrollbar__wrap .el-scrollbar__view, .mib-browser-detail .el-scrollbar__wrap {
    height: 100%;
  }
  .tree-detail-resize {
    height: 1px;
    width: 100%;
    background-color: #fcfcfc;
    cursor: ns-resize;
    border: 1px solid #d8d8d8;
    border-left: none;
    border-right: none;
  }
  .mib-browser-detail-row {
    line-height: 25px;
    background-color: white;
    border-bottom: 1px solid #D8D8D8;
    font-size: 14px;
    display: flex;
  }
  .mib-browser-detail-row:last-of-type {
    border-bottom: none;
    position: relative;
  }
  .mib-browser-detail-row:last-of-type div:last-of-type {
    position: absolute;
    left: calc(25% + 2px);
    width: calc(75% - 8px);
    min-height: 100%;
  }
  /*第一列宽25%*/
  .mib-browser-detail-row>div:first-of-type {
    color: #666;
    width: 25%;
  }
  /*第一列宽75%*/
  .mib-browser-detail-row>div:last-of-type {
    width: 75%;
    border-left: 1px solid #D8D8D8;
  }
  .mib-browser-detail-row:not(:last-of-type) {
    border-bottom: 1px solid #D8D8D8;
    height: 25px;
  }
  .mib-browser-detail-row:last-of-type {
    min-height: calc(100% - 182px);
  }
/*  .mib-browser-detail-row:last-of-type>div {
    height: 100%;
  }*/
  .mib-browser-detail-row>div {
    padding-left: 5px;
  }
  .mib-browser-detail-description {
    padding: 0 14px 0 0;
  }
  .mib-browser-right {
    width: calc(72% - 3px);
  }
  .mib-browser-table-title, .mib-browser-tree-title {
    height: 30px;
    line-height: 30px;
    color: #333;
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
  .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
    background-color: #F5F7FA;
    font-weight: bold;
    color: #ee9d3f;
  }
}
</style>
