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
          <el-autocomplete
            v-model="searchParam.host"
            :fetch-suggestions="assetSuggestion"
            placeholder="Host"
            size="mini"
            value-key="host"
            style="width: 100%;"
          >
            <template slot-scope="{ item }">
              <div>{{ item.host }}</div>
            </template>
          </el-autocomplete>
        </div>
        <div class="top-tool-search margin-l-20 oid-input">
          <el-input size="mini" v-model="searchParam.oid" placeholder="OID"></el-input>
        </div>
        <div class="nz-btn-group nz-btn-group-size-normal nz-btn-group-light margin-l-20 mib-browser-btn-group">
          <div class="el-popover mib-browser-ad-tip" v-show="searchParam.version != 2 || searchParam.port != 161 || searchParam.community != 'public'"><i class="el-icon-more"></i></div>
          <el-select class="nz-input-group-left input-x-mini-24 operation" v-model="searchParam.operation">
            <el-option v-for="item in operationData" :key="item" :value="item"></el-option>
          </el-select><el-popover trigger="click" placement="bottom" @show="popShow" @hide="popHide">
            <div class="mib-browser-ad-search">
              <el-row class="mib-browser-ad-search-item">
                <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t("project.endpoint.port")}}</div></el-col>
                <el-col :span="17">
                  <el-input class="input-x-mini-24" v-model="searchParamPop.port"></el-input>
                </el-col>
              </el-row>
              <el-row class="mib-browser-ad-search-item">
                <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t('project.module.community')}}</div></el-col>
                <el-col :span="17">
                  <el-input class="input-x-mini-24" v-model="searchParamPop.community"></el-input>
                </el-col>
              </el-row>
              <el-row class="mib-browser-ad-search-item">
                <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t('project.module.version')}}</div></el-col>
                <el-col :span="17">
                  <el-radio-group v-model.number="searchParamPop.version">
                    <el-radio-button :label="2"></el-radio-button>
                    <el-radio-button :label="3"></el-radio-button>
                  </el-radio-group>
                </el-col>
              </el-row>
              <!--SNMP V3 setting-->
              <template v-if="searchParamPop.version == 3">
                <el-row class="mib-browser-ad-search-item">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('login.username')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-input class="input-x-mini-24" v-model.trim="searchParamPop.auth.username"></el-input>
                  </el-col>
                </el-row>

                <el-row class="mib-browser-ad-search-item">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('project.module.securityLevel')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-radio-group v-model="searchParamPop.auth.securityLevel" size="small">
                      <el-radio-button label="noAuthNoPriv"></el-radio-button>
                      <el-radio-button label="authNoPriv"></el-radio-button>
                      <el-radio-button label="authPriv"></el-radio-button>
                    </el-radio-group>
                  </el-col>
                </el-row>

                <el-row class="mib-browser-ad-search-item" v-if="searchParamPop.auth.securityLevel == 'authNoPriv' || searchParamPop.auth.securityLevel == 'authPriv'">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('login.password')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-input class="input-x-mini-24" v-model.trim="searchParamPop.auth.password"></el-input>
                  </el-col>
                </el-row>

                <el-row class="mib-browser-ad-search-item" v-if="searchParamPop.auth.securityLevel == 'authNoPriv' || searchParamPop.auth.securityLevel == 'authPriv'">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('project.module.authProtocol')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-radio-group v-model="searchParamPop.auth.authProtocol">
                      <el-radio-button label="MD5"></el-radio-button>
                      <el-radio-button label="SHA"></el-radio-button>
                    </el-radio-group>
                  </el-col>
                </el-row>

                <el-row class="mib-browser-ad-search-item" v-if="searchParamPop.auth.securityLevel == 'authPriv'">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('project.module.privProtocol')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-radio-group v-model="searchParamPop.auth.privProtocol">
                      <el-radio-button label="DES"></el-radio-button>
                      <el-radio-button label="AES"></el-radio-button>
                    </el-radio-group>
                  </el-col>
                </el-row>

                <el-row class="mib-browser-ad-search-item" v-if="searchParamPop.auth.securityLevel == 'authPriv'">
                  <el-col :span="6">
                    <div class="mib-browser-ad-search-label">{{$t('project.module.privPassword')}}</div>
                  </el-col>
                  <el-col :span="17">
                    <el-input class="input-x-mini-24" v-model.trim="searchParamPop.auth.privPassword"></el-input>
                  </el-col>
                </el-row>
              </template>
            </div>
            <button slot="reference" @click="advancedShow = true" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="browser-advanced">
              <i class="el-icon-more"></i>
            </button>
          </el-popover><button :class="{'nz-btn-disabled': loading}"
            @click="search(false)" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="browser-go">Go
          </button>
        </div>
      </div>
    </div>
    <div class="mib-browser-box">
      <!--左半部分-->
      <div class="mib-browser-left">
        <div class="mib-browser-tree-title">
          <span>SNMP MIBs</span>
          <el-dropdown trigger="click" v-scrollBar:el-dropdown :hide-on-click="false" @command="selectModel">
            <span class="mib-browser-table-op">{{$t("config.model.model") + " "}}<i class="nz-icon nz-icon-funnel"></i></span>
            <el-dropdown-menu slot="dropdown" class="mib-browser-model-dropdown">
              <el-dropdown-item :class="{'mib-browser-model-dropdown-item-active': walkParam.models.indexOf(item.id) > -1}" :command="item" v-for="item, index in modelData" :key="index">{{item.name}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
      <div class="left-right-resize" @mousedown="leftRightResize"></div>
      <!--右半部分-->
      <div class="mib-browser-right">
        <div class="mib-browser-table-title">
          <span>Result table</span>
          <span>
            <span @click="exportXlsx" class="mib-browser-table-op" :class="{'mib-browser-table-op-light': resultData.length == 0}" :title="$t('overall.exportExcel')"><i class="el-icon-download"></i></span>
            <span @click="clearResult" class="mib-browser-table-op" :title="$t('overall.clear')"><i class="el-icon-close"></i></span>
          </span>
        </div>
        <el-table :data="resultData" border class="mib-browser-table nz-table" v-scrollBar:el-table height="calc(100% - 31px)" style="width: 100%;" v-loading="loading">
          <el-table-column label="Name/OID">
            <div slot-scope="scope" class="too-long-split" @click="searchParam.oid = scope.row.oid">{{scope.row.name ? scope.row.name : scope.row.oid}}</div>
          </el-table-column>
          <el-table-column label="Value">
            <div slot-scope="scope" @click="searchParam.oid = scope.row.oid">{{scope.row.value}}</div>
          </el-table-column>
          <el-table-column label="Type">
            <div slot-scope="scope" @click="searchParam.oid = scope.row.oid">{{scope.row.type}}</div>
          </el-table-column>
          <el-table-column label="IP:Port">
            <div slot-scope="scope" @click="searchParam.oid = scope.row.oid">{{scope.row.ip + (scope.row.port ? ":" + scope.row.port : "")}}</div>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog title="SNMP set" :visible.sync="snmpSetFormVisible" class="nz-dialog" width="500px">
      <div class="snmp-set-form">
        <span>*</span>
        <el-input size="mini" v-model="searchParam.oid" placeholder="OID"></el-input>
        <span>*</span>
        <el-select size="mini" v-model="searchParam.type" placeholder="type">
          <el-option v-for="item, index in typeData" :key="index" :value="item"></el-option>
        </el-select>
        <span>*</span>
        <el-input size="mini" v-model="searchParam.value" placeholder="value"></el-input>
      </div>
      <div slot="footer" class="footer">
        <div class="el-message-box__btns">
          <button @click="snmpSetFormVisible = false" class="el-button el-button--default el-button--small">{{$t("overall.cancel")}}</button>
          <button @click="search(true)" class="el-button el-button--default el-button--small">{{$t("overall.ok")}}</button>
        </div>
      </div>
    </el-dialog>
  </span>
</template>

<script>
  import fileSaver from 'file-saver';
  import xlsx from 'xlsx';

  export default {
    name: "mibBrowser",
    props: {
      showTab: String,
    },
    data() {
      return {
        loading: false,
        snmpSetFormVisible: false, //snmp set表单
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
          },
          type: '',
          value: ''
        },
        searchParamPop: {
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

        walkParam: {models: []},
        walkData: [],
        currentWalk: {name: '', objectID: '', syntax: '', access: '', status: '', index: '', description: ''},
        resultData: [],
        modelData: [],
        assetData: [],

        typeData: ["OctetString", "Integer", "OID", "Gauge", "Counter32", "IpAddress", "TimeTicks", "Counter64", "UnsignedInteger", "BITS", "Float", "DateAndTime"],
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
        return mibName ? mibName : "";
      },

      /*获取tree的数据*/
      getWalkData() {
        this.$get('mib/tree', {models: this.walkParam.models.join(",")}).then(response => {
          if (response.code === 200) {
            let obj = JSON.parse(response.data);
            this.walkData = [];
            for (let item in obj) {
              this.walkData.push({name: item, subTree: obj[item]});
            }
          }
        });
      },
      getModelData() {
        this.$get('model', {pageSize: -1, pageNo: 1}).then(response => {
          if (response.code === 200) {
            this.modelData = response.data.list;
          }
        });
      },
      selectModel(model) {
        let index = this.walkParam.models.indexOf(model.id);
        if (index == -1) {
          this.walkParam.models.push(parseInt(model.id));
        } else {
          this.walkParam.models.splice(index, 1);
        }
        this.getWalkData();
      },
      search(set) {
        if (this.loading) {
          return;
        }
        if (!set) {
          if (this.searchParam.operation == 'set') {
            this.snmpSetFormVisible = true;
            return;
          }
        }
        if (this.snmpSetFormVisible) {
          if (!this.searchParam.oid || !this.searchParam.type || !this.searchParam.value) {
            this.$message.error(this.$t("validate.required"));
            return;
          }
          this.snmpSetFormVisible = false;
        }
        this.loading = true;
        this.$post('mib/browser', this.searchParam).then(response => {
          this.loading = false;
          if (response.code === 200) {
            this.resultData = response.data.list.concat(this.resultData);
            if (this.searchParam.operation == 'set') {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.success")});
            }
          } else {
            this.$message.error(response.msg);
          }
        });
      },

      popShow() {
        this.searchParamPop.host = this.searchParam.host;
        this.searchParamPop.oid = this.searchParam.oid;
        this.searchParamPop.operation = this.searchParam.operation;
      },
      popHide() {
        this.searchParam = JSON.parse(JSON.stringify(this.searchParamPop));
      },
      /*清空result table*/
      clearResult() {
        this.resultData = [];
      },
      assetSuggestion(queryString, callback) {
        let data = [];
        if (!queryString) {
          data = this.assetData;
        } else {
          for (let i = 0; i < this.assetData.length; i++) {
            if (this.assetData[i].host.indexOf(queryString) != -1) {
              data.push(this.assetData[i]);
            }
          }
        }
        callback(data);
      },
      getAssetData() {
        this.$get('asset', {pageSize: -1, pageNo: 1}).then(response => {
          if (response.code === 200) {
            this.assetData = response.data.list;
          }
        });
      },
      /*左侧上下拖动*/
      treeDetailResize(e) {
        let treeDom = document.querySelector(".mib-browser-tree"); //tree
        let detailDom = document.querySelector(".mib-browser-detail"); //detail
        //得到点击时dom的初始高度：
        let leftTotalHeight = document.querySelector(".mib-browser-left").offsetHeight;
        let treeInitialHeight = treeDom.offsetHeight;
        let detailInitialHeight = detailDom.offsetHeight;
        //点击时鼠标的Y轴位置
        let mouseInitialY = e.clientY;

        document.onmousemove = (e) => {
          e.preventDefault();
          //得到鼠标拖动的距离
          let mouseMoveY = Math.abs(e.clientY - mouseInitialY);

          //往上方拖动：
          if (e.clientY < mouseInitialY) {
            treeDom.style.height = treeInitialHeight-mouseMoveY-5+'px';
            detailDom.style.height = detailInitialHeight+mouseMoveY+'px';
          }
          //往下方拖动：
          if (e.clientY > mouseInitialY) {
            treeDom.style.height = treeInitialHeight+mouseMoveY-5+'px';
            detailDom.style.height = detailInitialHeight-mouseMoveY+'px';
          }

          // 主、副列表最小高度限制为55px
          if(parseInt(treeDom.style.height) >= leftTotalHeight-95){
            treeDom.style.height = leftTotalHeight-95+'px';
          }
          if(parseInt(treeDom.style.height) <= 55){
            treeDom.style.height = 55+'px';
          }
          if(parseInt(detailDom.style.height) >= leftTotalHeight-95){
            detailDom.style.height = leftTotalHeight-95+'px';
          }
          if(parseInt(detailDom.style.height) <= 55){
            detailDom.style.height = 55+'px';
          }
        };
        document.onmouseup = () => {
          this.$refs.treeScrollbar.update();
          document.onmousemove = null;
        }
      },
      /*中间左右拖动*/
      leftRightResize(e) {
        let leftDom = document.querySelector(".mib-browser-left"); //tree
        let rightDom = document.querySelector(".mib-browser-right"); //detail
        //得到点击时dom的初始宽度：
        let totalWidth = document.querySelector(".mib-browser-box").offsetWidth;
        let leftInitialWidth = leftDom.offsetWidth;
        let rightInitialWidth = rightDom.offsetWidth;
        //点击时鼠标的Y轴位置
        let mouseInitialX = e.clientX;

        document.onmousemove = (e) => {
          e.preventDefault();
          //得到鼠标拖动的距离
          let mouseMoveX = Math.abs(e.clientX - mouseInitialX);

          //往上方拖动：
          if (e.clientX < mouseInitialX) {
            leftDom.style.width = leftInitialWidth-mouseMoveX+'px';
            rightDom.style.width = rightInitialWidth+mouseMoveX+'px';
          }
          //往下方拖动：
          if (e.clientX > mouseInitialX) {
            leftDom.style.width = leftInitialWidth+mouseMoveX+'px';
            rightDom.style.width = rightInitialWidth-mouseMoveX+'px';
          }

          // 主、副列表最小宽度限制
          if(parseInt(leftDom.style.width) >= totalWidth-400){
            leftDom.style.width = totalWidth-400+'px';
          }
          if(parseInt(leftDom.style.width) <= 200){
            leftDom.style.width = 200+'px';
          }
          if(parseInt(rightDom.style.width) >= totalWidth-200){
            rightDom.style.width = totalWidth-200+'px';
          }
          if(parseInt(rightDom.style.width) <= 400){
            rightDom.style.width = 400+'px';
          }
        };
        document.onmouseup = () => {
          document.onmousemove = null;
        }
      },
      exportXlsx() {
        if (this.resultData.length == 0) {
          return;
        }
        let box = xlsx.utils.table_to_book(document.querySelector('.mib-browser-table'));
        let out = xlsx.write(box, {
          bookType: 'xlsx',
          bookSST: true,
          type: 'array'
        })
        try {
          fileSaver.saveAs(
            new Blob([out], {
              type: 'application/octet-stream'
            }),
            "result_" + this.searchParam.host + ".xlsx"
          )
        } catch (e) {}
        return out
      },
    },
    mounted() {
      this.getWalkData();
      this.getModelData();
      this.getAssetData();
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
.mib-browser-model-dropdown {
  height: 300px;
}
.mib-browser-model-dropdown-item-active {
  color: $global-text-color-active;
  font-weight: bold;
  background-color: #FAFAFA;
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
  .mib-browser-btn-group {
    position: relative;
  }
  .mib-browser-ad-tip {
    position: absolute;
    transform: translate(-100%, -100%);
    top: 3px;
    left: 114px;
    width: 20px;
    min-width: 0;
    font-size: 12px;
    text-align: center;
    padding: 0;
    color: #999;
    height: 13px;
  }
  .mib-browser-ad-tip::after {
    content: '';
    display: block;
    width:0;
    height:0;
    overflow: hidden;
    font-size: 0;
    line-height: 0;
    border: 4px;
    border-style: solid dashed dashed dashed;
    border-color: #fff transparent transparent transparent;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translate(-6px, 6px);
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
    height: calc(69% - 40px);
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
    height: 2px;
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
    width: calc(75% - 20px);
    min-height: 100%;
    padding-right: 12px;
  }
  /*第一列宽25%*/
  .mib-browser-detail-row>div:first-of-type {
    color: #666;
    width: 25%;
    word-break: break-all;
  }
  /*第一列宽75%*/
  .mib-browser-detail-row>div:last-of-type {
    width: 75%;
    border-left: 1px solid #D8D8D8;
    word-break: break-all;
  }
  .mib-browser-detail-row:not(:last-of-type) {
    border-bottom: 1px solid #D8D8D8;
    height: 25px;
  }
  .mib-browser-detail-row:last-of-type {
    min-height: calc(100% - 182px);
  }
  .mib-browser-detail-row>div {
    padding-left: 5px;
  }
  .mib-browser-detail-description {
    padding: 0 14px 0 0;
  }
  .mib-browser-right {
    width: calc(72% - 4px);
    height: 100%;
  }
  .left-right-resize {
    width: 2px;
    border: 1px solid #d8d8d8;
    background-color: #fcfcfc;
    cursor: ew-resize;
    height: 100%;
    border-top: none;
    border-bottom: none;
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
  .mib-browser-table-op.mib-browser-table-op-light {
    color: #ccc;
    cursor: default;
  }
  .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
    background-color: #F5F7FA;
    font-weight: bold;
    color: #ee9d3f;
  }
}

.mib-browser-table.nz-table.el-table th .cell {
  height: 28px;
  line-height: 28px;
}
.mib-browser-table.nz-table.el-table td .cell {
  height: 28px;
  min-height: 28px;
  line-height: 28px;
}
.snmp-set-form {
  padding: 0 15px;
}
.snmp-set-form>div {
  margin-top: 15px;
  width: calc(100% - 11px);
}
.snmp-set-form>span {
  color: #F56C6C;
}
.mib-browser .el-dialog .el-dialog__footer {
   margin-top: 0;
 }
.mib-browser .el-button:focus, .mib-browser .el-button:hover {
  color: unset;
  border-color: unset;
  background-color: unset;
}
</style>
