<template>
  <div v-clickoutside="{obj:endpoint,func:clickOutside}" class="right-box right-box-batch-modify-endpoint">
    <div class="right-box__header">
      <!-- begin--标题-->
      <div class="header__title">{{$t("overall.batchEndpoint")}}</div>
      <!-- end--标题-->
      <div class="header__operation">
        <span v-cancel="{obj: endpoint, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
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
                <el-button @click="showRightBox" class="top-tool-btn" type="button" :title="$t('overall.selectColumns')">
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
                :key="`col-${index}-${item.prop}`"
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
                  <span @click="editEndpointRow(scope.row, scope.$index)" :title="$t('overall.selectColumns')">
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
    <div class="right-box__footer">
      <button v-cancel="{obj:endpoint,func:esc}" id="ep-esc" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" class="footer__btn" id="ep-add">
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
  name: 'batchModifyEndpointBox',
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
      rightBox: { show: false, title: this.$t('overall.createEndpoint'), isEdit: false },
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
          label: this.$t('overall.name'),
          prop: 'name',
          show: true
        },
        {
          label: this.$t('asset.asset'),
          prop: 'asset',
          show: true
        },
        {
          label: this.$t('asset.host'),
          prop: 'host',
          show: true
        },
        {
          label: this.$t('asset.port'),
          prop: 'port',
          show: true
        },
        {
          label: this.$t('overall.config'),
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
        this.endpointTableData = JSON.parse(JSON.stringify(n))
        this.endpointTableData.forEach(item => {
          item.configs = JSON.parse(item.configs)
          item.projectId = item.project.id
          item.moduleId = item.module.id
          item.assetId = item.asset.id
          item.assetName = item.asset.name
          item.type = item.module.type
        })
      }
    }
  }
}
</script>
