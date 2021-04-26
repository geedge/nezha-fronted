<template>
  <div class="right-box right-box-add-endpoint" v-clickoutside="{obj:endpoint,func:clickOutside}">
    <div class="right-box__header">
      <!-- begin--标题-->
      <div class="right-box-title">{{$t("overall.batchEndpoint")}}</div>
      <!-- end--标题-->
      <div class="header__operation">
        <span v-cancel="{obj: endpoint, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>

    <!-- begin--表单-->
    <div class="right-box-form-box right-box__container" style="overflow: hidden">
      <el-form class="right-box-form right-box-form-left" label-position = "top" ref="addEndpoint" :model="endpoint" :rules="rules">
        <!--asset和endpoint-->
        <div class="asset-and-endpoint">
          <!--endpoint-->
          <div class="right-box-endpoint-table">
            <div class="search-box" style="display: flex;justify-content: space-between">
              <span>Config</span>
              <span>
                <el-button @click="showRightBox" class="top-tool-btn" type="button">
                <i class="nz-icon-gear nz-icon"></i>
              </el-button>
              <el-button @click="editAllEndpoint" class="top-tool-btn" type="button">
                <i class="nz-icon-batch-edit nz-icon"></i>
              </el-button>
              </span>
            </div>
            <el-table
              :data="endpointTableData"
              ref="endpointTable"
              style="width:100%;border-radius: 4px;"
              height="calc(100% - 45px)"
              id="add-endpoint-asset-table"
              @selection-change="handleSelectionChangeEndpoint"
              empty-text=" ">
              <el-table-column
                type="selection"
                width="25"
                style="padding: 0 1px;">
              </el-table-column>
              <el-table-column
                v-for="(item, index) in endpointTableTitle"
                v-if="item.show"
                :key="`col-${index}`"
                :fixed="item.fixed"
                :label="item.label"
                :min-width="`${item.minWidth}`"
                :prop="item.prop"
                :resizable="true"
                :sort-orders="['ascending', 'descending']"
                :width="`${item.width}`"
                class="data-column"
              >
                <template slot="header">
                  <span>{{item.label}}</span>
                  <div class="col-resize-area"></div>
                </template>
                <template slot-scope="scope" :column="item">
                  <template v-if="item.prop === 'name'">
                    {{scope.row[item.prop]}}
                  </template>
                  <template v-else-if="item.prop === 'asset'">
                    <span >
                      <i class="nz-icon nz-icon-asset" :class="scope.row[item.prop]>0?'colorEF7458':'colorEF7458'"/>
                      {{scope.row.assetName}}
                    </span>
                  </template>
                  <template v-else-if="item.prop === 'host'">
                    {{scope.row.configs?scope.row.configs.host : '' }}
                  </template>
                  <template v-else-if="item.prop === 'port'">
                    {{scope.row.configs?scope.row.configs.port : '' }}
                  </template>
                  <template v-else-if="item.prop == 'configs'">
                    <el-tooltip placement="left" effect="light" :popper-class="'endpointConfigsTips'">
                      <span class="configs-endpoint">{ ... }</span>
                      <div class="endpointConfigsTips" slot="content">
                        <pre >{{JSON.stringify(scope.row[item.prop],null,2)}}</pre>
                      </div>
                    </el-tooltip>
                  </template>
                  <template v-else>1</template>
                </template>
              </el-table-column>
              <el-table-column label="" width="56"  fixed="right">
                <template slot-scope="scope" style="text-align: center">
                  <span @click="editEndpointRow(scope.row, scope.$index)">
                    <i class="nz-icon-gear nz-icon"></i>
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-form>
    </div>

    <!--底部按钮-->
    <div class="right-box-bottom-btns right-box__footer">
      <button v-cancel="{obj:endpoint,func:esc}" id="ep-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="ep-add">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
    <!--    edit endpoint-->
    <transition name="right-box">
      <edit-endpoint-box-new v-if="rightBox.show" :module="object" @close="closeRightBox" :disabled="true" :type="'add'" :optionType="optionType"></edit-endpoint-box-new>
    </transition>
  </div>
</template>

<script>
import editEndpointBoxNew from './editEndpointBoxNew'
export default {
  name: 'endpointBox',
  props: {
    currentProject: Object,
    currentModule: Object,
    selectEndpointList: Array
  },
  components: {
    'edit-endpoint-box-new': editEndpointBoxNew
  },
  data () {
    return {
      rules: {
        projectId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        moduleId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      pageObj: {
        pageNo: 1,
        pageSize: 2
      },
      pages: {
        total: 0,
        pages: 0,
        pageNo: 1
      },
      object: {},
      vendorAndModelOptionData: [],
      paramBorderColor: '#dcdfe6',
      endpointTouch: false,
      endpoint: { projectId: '', moduleId: '', endpointList: [] },
      currentModuleCopy: {},
      currentProjectCopy: { id: '' },
      tempParamObj: [],
      tempLabelModule: [],
      inputKeyErr: [],
      tempEndpoint: {},
      tempEndpoint2: {},
      assetLoading: true,
      rightBox: { show: false, title: this.$t('project.endpoint.createEndpoint'), isEdit: false },
      blankEndpoint: {
        id: '',
        projectId: '',
        endpointNameTmpl: '{{module.name}}-{{asset.name}}',
        type: 'http',
        port: 9100,
        configs: {
          walk: [],
          snmpCredentialsId: '',
          metrics_path: '',
          port: 9100,
          host: '{{asset.manageIp}}',
          scrape_interval: '',
          scrape_timeout: '',
          params: '',
          labels: '',
          paramObj: [],
          labelModule: [],
          basic_auth: {
            username: '',
            password: ''
          },
          bearer_token: ''
        },
        walk: [],
        labelModule: [{
          key: '',
          value: ''
        }],
        paramObj: [{
          key: '',
          value: []
        }]
      },
      editParamBox: { show: false, top: 0, left: 0, type: 0 }, // param编辑弹框
      editLabelsBox: { show: false, top: 0, left: 0, type: 0 }, // param编辑弹框
      moduleParamShow: false, // module默认参数param悬浮窗
      assetSearch: { host: '', sn: '', text: '', label: 'Host', typeIds: '', modelId: '', idcId: '', dropdownShow: false }, // 侧滑框中asset的搜索相关
      selectedAssets: [], // 侧滑框中选中的asset
      projectList: [],
      moduleList: [],
      assetList: [],
      endpointList: [],
      endpointTableTitle: [ // 原始table列
        {
          label: this.$t('project.endpoint.name'),
          prop: 'name',
          show: true
        },
        {
          label: this.$t('project.endpoint.asset'),
          prop: 'asset',
          show: true
        },
        {
          label: this.$t('project.endpoint.host'),
          prop: 'host',
          show: true
        },
        {
          label: this.$t('project.endpoint.port'),
          prop: 'port',
          show: true
        },
        {
          label: this.$t('project.endpoint.configs'),
          prop: 'configs',
          show: true
        }
      ],
      typeList: [],
      dcList: [],
      modelList: [],
      assetTableData: [],
      assetSelection: [],
      endpointSelection: [],
      endpointTableData: [],
      optionType: 'batch'
    }
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },

    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },

    /* 获取project列表 */
    getProjectList () {
      this.$get('monitor/project', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          this.projectList = response.data.list
          this.getModuleList(this.currentProjectCopy.id)
        }
      })
    },
    // 获取endpoint弹框中module下拉框数据
    getModuleList (projectId) {
      this.$get('monitor/module', { projectIds: projectId, pageSize: -1 }).then(response => {
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            try {
              const param = response.data.list[i].param || '{}'
              const tempObj = JSON.parse(param)
              const labels = response.data.list[i].labels || '{}'
              const tempObj1 = JSON.parse(labels)
              response.data.list[i].paramObj = []
              response.data.list[i].labelsModule = []
              for (const k in tempObj) {
                response.data.list[i].paramObj.push({ key: k, value: tempObj[k] })
              }
              for (const k in tempObj1) {
                response.data.list[i].labelsModule.push({ key: k, value: tempObj1[k] })
              }
            } catch (err) {
              // console.info(response.data.list[i], err);
            }
          }
          this.moduleList = response.data.list
        }
      })
    },

    changeProject (project) {
      this.currentModuleCopy = {}
      this.endpoint.moduleId = ''
      this.endpoint.projectId = project.id
      this.editParamBox.show = false
      this.editLabelsBox.show = false
      this.tempParamObj = []
      this.endpointTableData = []
      this.getAssetList()
      this.getModuleList(project.id)
    },

    changeModule (module) {
      this.endpoint.moduleId = module.id
      this.editParamBox.show = false
      this.editLabelsBox.show = false
      this.tempParamObj = []
      this.endpointTableData = []
    },
    handleSizeChange (val) {
      this.getAssetList()
    },
    handleCurrentChange () {
      this.$refs.jumpInput.blur()
      if (this.pages.pageNo > this.pages.pages) {
        this.pages.pageNo = this.pageObj.pageNo
        return
      }
      this.pageObj.pageNo = this.pages.pageNo
      this.getAssetList()
    },
    search (seachLabel) {
      this.seachLabel = { ...seachLabel }
      this.getAssetList()
    },
    // 获取endpoint弹框中的asset子弹框里asset列表数据
    getAssetList () {
      this.assetLoading = true
      const params = {
        ...this.pageObj,
        ...this.seachLabel
      }
      this.$get('asset/asset', params).then(response => {
        if (response.code === 200) {
          this.assetTableData = response.data.list
          this.pages.pages = response.data.pages
          this.pages.total = response.data.total
          this.pages.pageNo = response.data.pageNo
        }
      }).finally(() => {
        setTimeout(() => {
          this.assetLoading = false
        }, 200)
      })
    },
    handleSelectionChangeAsset (val) {
      this.assetSelection = val
    },
    handleSelectionChangeEndpoint (val) {
      this.endpointSelection = val
    },
    // 保存endpoint
    save () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      // 对endpointList进行处理，避免携带过多无用数据
      const endpointList = []
      this.endpointTableData.forEach((item, index) => {
        const endpoint = {
          moduleId: item.moduleId,
          assetId: item.assetId,
          name: item.name,
          configs: JSON.stringify(item.configs),
          id: item.id
        }
        endpointList.push(endpoint)
      })
      this.$refs.addEndpoint.validate((valid) => {
        if (valid) {
          this.$put('monitor/endpoint', endpointList).then(response => {
            this.prevent_opt.save = false
            if (response.code === 200) {
              this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
              this.esc(true)
            } else {
              this.$message.error(response.msg)
            }
          })
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },

    // 删除endpoint
    del () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('endpoint?ids=' + this.endpoint.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    addEndpoint () {
      this.assetSelection.forEach(item => {
        if (this.endpointTableData.find(endpoint => endpoint.assetId === item.id)) {
          return
        }
        const obj = {
          assetId: item.id,
          assetName: item.name,
          asset: item,
          type: this.currentModuleCopy.type,
          projectId: this.currentModuleCopy.projectId,
          configs: { ...JSON.parse(this.currentModuleCopy.configs), host: item.manageIp },
          moduleId: this.currentModuleCopy.id
        }
        obj.labelModule = []
        if (obj.configs.labels !== '{}' && obj.configs.labels) {
          Object.keys(obj.configs.labels).forEach(key => {
            obj.labelModule.push({ key, value: obj.configs.labels[key] })
          })
        } else {
          obj.labelModule.push({ key: '', value: '' })
        }
        obj.paramObj = []
        if (obj.configs.params !== '{}' && obj.configs.params) {
          Object.keys(obj.configs.params).forEach(key => {
            obj.paramObj.push({ key, value: obj.configs.params[key] })
          })
        } else {
          obj.paramObj.push({ key: '', value: [] })
        }
        this.endpointTableData.push(obj)
      })
      this.assetTableData = [...this.assetTableData]
      this.$refs.multipleTable.clearSelection()
    },
    removeEndpoint () {
      if (this.endpointSelection.length === 0) {
        return
      }
      this.endpointTableData = this.endpointTableData.filter(item => !this.endpointSelection.find(item1 => item1.assetId === item.assetId))
      this.assetTableData = [...this.assetTableData]
    },
    setRowShow ({ row }) {
      if (this.endpointTableData.find(endpoint => endpoint.assetId === row.id)) {
        return 'hide-row'
      }
      return ''
    },
    editEndpointRow (u) {
      this.optionType = 'edit'
      this.object = JSON.parse(JSON.stringify(u))
      // this.object.configs = JSON.parse(this.object.configs)
      this.object.walk = this.object.configs.walk ? JSON.parse(JSON.stringify(this.object.configs.walk)) : []
      this.object.port = this.object.configs.port ? JSON.parse(JSON.stringify(this.object.configs.port)) : 9100
      this.object.paramObj = []
      this.object.labelModule = []
      if (JSON.stringify(this.object.configs.labels) !== '{}' && this.object.configs.labels) {
        Object.keys(this.object.configs.labels).forEach(key => {
          this.object.labelModule.push({ key, value: this.object.configs.labels[key] })
        })
      } else {
        this.object.labelModule.push({ key: '', value: '' })
      }
      if (JSON.stringify(this.object.configs.params) !== '{}' && this.object.configs.params) {
        Object.keys(this.object.configs.params).forEach(key => {
          this.object.paramObj.push({ key, value: this.object.configs.params[key] })
        })
      } else {
        this.object.paramObj.push({ key: '', value: [] })
      }
      this.rightBox.show = true
    },
    showRightBox () {
      this.optionType = 'batch'
      this.object = { ...JSON.parse(JSON.stringify(this.blankEndpoint)), projectId: '', moduleId: '', assetName: '', type: '' }
      this.object.walk = this.object.configs.walk ? JSON.parse(JSON.stringify(this.object.configs.walk)) : []
      this.object.port = this.object.configs.port ? JSON.parse(JSON.stringify(this.object.configs.port)) : 9100
      this.rightBox.show = true
    },
    editAllEndpoint () {
      this.endpointTableData.forEach((item, index) => {
        if (this.endpointSelection.find(item1 => item1.assetId === item.assetId)) {
          this.endpointTableData[index] = { ...this.endpointTableData[index], configs: this.blankEndpoint.configs }
        }
      })
      this.endpointTableData = [...this.endpointTableData]
    },
    closeRightBox (isEdit, endpoint, isAll) {
      this.rightBox.show = false
      if (!isEdit) { return }
      if (isAll) {
        Object.keys(this.blankEndpoint).forEach(key => {
          this.blankEndpoint[key] = endpoint[key]
        })
      } else {
        this.endpointTableData.forEach((item, index) => {
          if (item.id === endpoint.id) {
            this.endpointTableData[index] = { ...endpoint }
          }
        })
        this.endpointTableData = [...this.endpointTableData]
      }
    }
  },
  created () {
    this.getProjectList()
    this.getAssetList()
  },
  watch: {
    endpointList (n, o) {
      this.endpoint.endpointList = n
      if (n.length > 0) {
        this.paramBorderColor = '#dcdfe6'
      } else {
        this.paramBorderColor = '#F56C6C'
      }
    },
    currentProject: {
      immediate: true,
      handler (n, o) {
        if (n) {
          this.currentProjectCopy = Object.assign({}, n)
          this.endpoint.projectId = n.id
          this.getModuleList(n.id)
        }
      }
    },
    currentModule: {
      immediate: true,
      handler (n, o) {
        if (n) {
          this.endpoint.moduleId = n.id
          this.currentModuleCopy = JSON.parse(JSON.stringify(n))
        }
      }
    },
    selectEndpointList: {
      immediate: true,
      handler (n) {
        console.log(n)
        this.endpointTableData = JSON.parse(JSON.stringify(n))
        this.endpointTableData.forEach(item => {
          item.configs = JSON.parse(item.configs)
          item.projectId = item.project.id
          item.moduleId = item.module.id
          item.assetId = item.asset.id
          item.assetName = item.asset.name
          item.type = item.module.type
        })
        console.log(this.endpointTableData)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .nz-icon.nz-icon-shanchu1 {
    font-size: 14px;
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
    height: 200px;
    overflow: auto;
    border: none;
  }
  .param-box-row {
    padding: 7px 10px 0 10px;
    position: relative;
  }
  .param-box-row:last-of-type {
    padding-bottom: 7px;
  }
  .param-box-row-key, .param-box-row-value {
    display: inline-block;
    width: 50px;
  }
  .param-box-row-eq {
    display: inline-block;
    width: 14px;
    text-align: center;
    height: 22px;
    line-height: 22px;
    color: #c4c7cF;
  }
  /* end--param*/

  /* begin--小盒子*/
  .right-child-boxes {
    height: calc(100% - 120px);
    position: relative;
  }
  .endpoint-to-right-symbol {
    position: absolute;
    top: calc(50% - 28px);
    left: 274px;
    cursor: pointer;
    font-size: 18px;
  }
  .right-child-box {
    height: 100%;
  }
  .assets-box {
    float: left;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    width: 320px;
  }
  .endpoints-box {
    margin: 0 0 0 340px;
    width: 445px;
  }
  .endpoints-box.endpoints-box-snmp {
    width: 380px;
  }
  .right-child-box .el-input-group {
    width: 187px;
    float: right;
    margin: 7px 5px 0 0;
  }
  .right-child-box .module-info .el-input {
    display: inline-block;
  }

  .right-child-box .module-info {
    display: inline-block;
    height: 22px;
    vertical-align: middle;
    position: absolute;
    top: 5px;
  }
  .right-child-box-title {
    padding: 9px 0 0 9px;
    display: inline-block;
  }
  .endpoints-box-module-info {
    background: #eeeeee;
    width: 100%;
    height: 33px;
    position: relative;
  }
  .endpoints-box-module-info .title {
    line-height: 33px;
    color: #5e5e5e;
    padding-left: 5px;
    display: inline-block;
  }
  .module-info-port {
    width: 53px;
    right: 309px;
  }
  .module-info-port-snmp {
    right: 142px;
  }
  .module-info-param {
    width: 89px;
    right: 116px;
  }
  .module-info-labels {
    width: 89px;
    right: 216px;
  }
  .module-info-labels-snmp {
    right: 50px;
  }
  .module-info-path {
    width: 70px;
    right: 42px;
  }
  .endpoint-info-param {
    width: 80px;
  }
  .right-child-box .module-info-cover {
    right: 4px;
    padding: 0px 6px;
    margin-right: 5px;
  }
  .endpoints-box-endpoints {
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    height: calc(100% - 39px);
    margin-top: 6px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  }
  .endpoint-param-pop{
    max-height: 200px;
    overflow: auto;
  }
  /* end--小盒子*/

  /* begin--子弹框*/
  .right-sub-box {
    width: 170px;
    height: 225px;
    position: fixed;
    z-index: 2;
    padding: 0;
  }
  /* begin--搜索框*/
  .endpoint-asset-search {
    position: relative;
    margin: 0;
    z-index: 11;
  }
  .endpoint-asset-search button {
    height: 24px !important;
  }
  .endpoint-asset-search-dropdown {
    position: absolute;
    top: 25px;
    background-color: #444;
    border-radius: 2px;
    width: 58px;
    left: 0;
  }
  .endpoint-asset-search-dropdown-item {
    text-align: center;
    line-height: 22px;
    height: 22px;
    cursor: default;
    color: white;
    font-size: 12px;
  }
  .endpoint-asset-label-txt {
    display: inline-block;
    min-width: 19px;
    text-align: center;
  }
  .endpoint-asset-search-dropdown-item:first-of-type {
    border-radius: 4px 4px 0 0;
  }
  .endpoint-asset-search-dropdown-item:last-of-type {
    border-radius: 0 0 4px 4px;
  }
  .endpoint-asset-search-dropdown-item:hover {
    background-color: #222;
    color: #ff9900;
  }
  .endpoint-asset-search-input {
    display: inline-block;
    width: 100px;
    vertical-align: top;
  }
  .checkbox-mc{
    position: absolute;
    top: 0;
    left: 0;
    width: 14px;
    height: 14px;
    z-index:1;
  }
  /* end--搜索框*/

  /* begin--table*/
  .endpoint-sub-table {
    padding-top: 13px;
    height: calc(100% - 83px);
    width: 320px;
  }
  .line-100 {
    margin-bottom: 3px;
    width: 320px;
  }
  .endpoint-sub-table-head {
    line-height: 28px;
    height: 30px;
    width: 600px;
  }
  .endpoint-sub-table-row, .endpoint-sub-table-row-disabled {
    line-height: 28px;
    height: 30px;
    color: #656565;
    position: relative;
    width: 600px;
  }
  .endpoint-sub-table-row:hover {
    background-color: #dadada;
    cursor: default;
  }
  .endpoint-sub-table-row-active {
    background-color: #dadada;
  }
  .endpoint-sub-table-row-selected {
    background-color: #656565;
    color: white;
  }
  .endpoint-sub-table-col {
    display: inline-block;
    padding-left: 10px;
    width: 100px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .endpoint-sub-table-paginate-all {
    position: absolute;
    left: 10px;
    bottom: 17px;
    color: #5a5a5a;
  }
  .endpoint-sub-table-body {
    font-size: 15px;
    position: relative;
    height: calc(100% - 37px);
  }
  .endpoint-sub-table-body-dialog {
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    position: absolute;
    z-index: 10;
    top: 0;
  }
  .endpoints-clear-btn {
    margin: 6px 0 0 7px;
  }
  .asset-and-endpoint{
    width: 100%;
    display: flex;
    height: 480px;
  }
  .right-box-asset-table{
    width: 37.5%;
    margin-right: 2%;
    background: #FFFFFF;
    border: 1px solid #E7EAED;
    border-radius: 2px;
    position: relative;
  }
  .disabled-asset-table{
    position: absolute;
    width: calc(100% - 2px);
    height: calc(100% - 2px);
    z-index: 2;
    background: #999999;
    left: 1px;
    top: 1px;
    opacity: 0.1;
  }
  .asset-allselect{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
  }
  .right-box-endpoint-table{

    width: 100%;
    background: #FFFFFF;
    border: 1px solid #E7EAED;
    border-radius: 2px;
  }
  /* end--table*/

  /* end--子弹框*/
  .search-box{
    width: calc(100% - 10px);
    padding: 10px 5px;
    border-bottom: 1px solid #E7EAED;
    display: flex;
  }
  /deep/ .new-search .search-input-all{
    width: auto;
    flex: 1;
  }
  .jump-input{
    width: 38px;
    height: 24px;
  }
  .jump-pages{
    font-size: 14px;
    color: #333333;
    text-align: left;
    line-height: 24px !important;
    height: 24px !important;
    font-weight: 400;
    margin-left: 5px;
    min-width: auto !important;
  }
  /deep/ .jump-input .el-input__inner{
    padding: 0 5px;
    height: 24px;
    line-height: 24px;
  }
  .table-bottom{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  /deep/ .el-pagination .btn-next, /deep/ .el-pagination .btn-prev{
    margin-top: 3px;
  }
  .add-endpoint{
    display: inline-block;
    background: #F9F9F9;
    border: 1px solid $--primary-border-color;
    border-radius: 2px;
    width: 28px;
    height: 28px;
    margin: 7px 7px 0 0;
    text-align: center;
    line-height: 28px;
  }
  .top-tool-btn{
    height: 32px;
    width: 32px;
    border: 1px solid $--primary-border-color;
    outline: none;
    border-radius: 2px;
    background-color: #F9F9F9;
    -webkit-transition: background-color linear .1s;
    transition: background-color linear .1s;
    padding: 0;
  }
  .top-tool-btn:hover{
    background-color: #fff;
  }
  .top-tool-btn:focus{
    background-color: #fff;
    border-color: #FBCEA4;
  }
  .top-tool-btn:focus .nz-icon{
    color: #FBCEA4;
  }
  .endpoint-table-btn{

  }
</style>
<style lang="scss">
  .el-table__row.hide-row{
    display: none !important;
  }
  .right-box-add-endpoint {
    .right-box-form>.el-form-item {
      margin-left: 0;
    }
    .right-box-form-left.right-box-form .el-form-item .el-form-item__label {
      width: 100px;
    }
    .asset-table /deep/ .el-table td ,.asset-table /deep/ .el-table th{
      padding: 3px 0 !important;
    }
  }

  .endpoint-asset-search .el-autocomplete>.el-input {
    position: absolute;
  }
  .endpoint-asset-search .el-select {
    width: 100px;
  }
  .endpoint-asset-search .el-cascader .el-input {
    position: absolute;
    height: 24px;
    line-height: 24px;

    input {
      height: 24px;
      line-height: 24px;
    }
  }
  .endpoints-box-endpoints-title {
    color: black;
    font-weight: 400;
  }

  .right-box-endpoint-table .cell {
    padding: 0 2px 0 10px;
  }
  .endpoints-box-endpoints .el-table .el-table__row td{
    padding: 5px 0;
  }
  .module-info-param.el-input.is-disabled .el-input__inner, .endpoint-info-param.el-input.is-disabled .el-input__inner,
  .endpoint-info-param.el-input.is-disabled .el-input__inner, .endpoint-info-param.el-input.is-disabled .el-input__inner {
    cursor: pointer;
    background-color: white;
    border-color: #DCDFE6;
    color: #606266;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  }
  .module-info-param.el-input.is-disabled .el-input__inner:hover, .endpoint-info-param.el-input.is-disabled .el-input__inner:hover,
  .endpoint-info-param.el-input.is-disabled .el-input__inner:hover, .endpoint-info-param.el-input.is-disabled .el-input__inner:hover {
    border-color: #c0c4cc;
  }

  .endpoints-box-endpoints .el-form-item {
    margin-bottom: 0;
  }
  .endpoints-box-endpoints .el-form-item.is-error {
    margin-bottom: 22px;
  }
  .input-error .el-input__inner,.input-error .el-input__inner:hover,.input-error .el-input__inner:focus,
  .input-error .input__inner,.input-error .input__inner:hover,.input-error .input__inner:focus {
    border-color: #F56C6C !important;
  }

  .asset-tip {
    display: table;

    .tip-row {
      display: table-row;

      .tip-cell {
        display: table-cell;
        padding: 2px 4px;
      }
    }
  }
  .endpointConfigsTips{
     height: 200px;
     overflow-y: auto;
     overflow-x: hidden;
   }
  .copy-value-content{
    position: absolute;
    right: 1px;
    top: 4px;
  }
</style>
