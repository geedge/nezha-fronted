<template>
  <div v-clickoutside="{obj:endpoint,func:clickOutside}" :class="{'right-box-add-endpoint-snmp': currentModule.type && currentModule.type.toLowerCase() == 'snmp'}" class="right-box right-box-add-endpoint">
    <div class="right-box__header">
      <!-- begin--标题-->
      <div class="header__title">{{$t("config.system.basic.lnglatll.createEndpoint")}}</div>
      <!-- end--标题-->
      <div class="header__operation">
        <span v-cancel="{obj: object, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>

    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="addEndpoint" :model="endpoint" :rules="rules" label-position = "top">
          <!--project-->
          <el-form-item :label='$t("project.project.projectName")' class="select-warp" prop="projectId">
            <el-select id="add-endpoint-project" v-model="currentProject" class="right-box__select" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="id" @change="((val) => {changeProject(val)})">
              <el-option v-for="item in projectList" :id="'project-'+item.id" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <!--module-->
          <el-form-item :label='$t("project.module.module")' class="select-warp" prop="moduleId">
            <el-select id="add-endpoint-module" v-model="currentModule" :disabled="!currentProject.id" class="right-box__select" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="id" @change="((val) => {changeModule(val)})">
              <el-option v-for="item in moduleList" :id="'module-'+item.id" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
          </el-form-item>
          <!--asset和endpoint-->
          <div class="asset-and-endpoint">
            <!--asset-->
            <div class="right-box-asset-table">
              <div v-show="!currentModule.id" class="disabled-asset-table">
              </div>
              <div class="search-box">
                <search-input
                  ref="searchInput"
                  :placeholder="$t('overall.placeHolder')"
                  :searchMsg="searchMsg"
                  :show-history="false"
                  :show-search="false"
                  style="width:100%"
                  @search="search"
                ></search-input>
              </div>
              <el-table
                ref="multipleTable"
                :data="assetTableData"
                :row-class-name="setRowShow"
                class="asset-table"
                height="calc(100% - 97px)"
                style="width: 100%"
                tooltip-effect="dark"
                @selection-change="handleSelectionChangeAsset">
                <el-table-column
                  type="selection"
                  width="55">
                </el-table-column>
                <el-table-column
                  v-for="(item, index) in assetTableTitle"
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
                    <template v-if="item.prop == 'brand'">
                      <span>{{scope.row[item.prop].name}}</span>
                    </template>
                    <template v-else-if="item.prop == 'model'">
                      <span>{{scope.row[item.prop]?scope.row[item.prop].name : ''}}</span>
                    </template>
                    <template v-else-if="item.prop == 'dc'">
                      <span>{{scope.row[item.prop]?scope.row[item.prop].name : ''}}</span>
                    </template>
                    <template v-else-if="item.prop == 'cabinet'">
                      <span>{{scope.row[item.prop]?scope.row[item.prop].name : ''}}</span>
                    </template>
                    <template v-else-if="item.prop == 'type'">
                      <span>{{scope.row[item.prop]?scope.row[item.prop].name : ''}}</span>
                    </template>
                    <template v-else-if="item.prop == 'state'">
                      <span>{{scope.row[item.prop]?scope.row[item.prop].name : ''}}</span>
                    </template>
                    <span v-else>{{scope.row[item.prop] ? scope.row[item.prop] : ''}}</span>
                  </template>
                </el-table-column>
              </el-table>
              <div class="table-bottom">
                <el-pagination
                  style="padding-top:10px"
                  small
                  @size-change="handleSizeChange"
                  @current-change="handleSizeChange"
                  :current-page.sync="pageObj.pageNo"
                  :page-size="pageObj.pageSize"
                  layout="prev, slot, next"
                  :total="pages.total">
                  <template>
                    <el-input ref="jumpInput" class="jump-input" v-model.number="pages.pageNo" size="small" @change="handleCurrentChange" @keyup.enter.native="handleCurrentChange"/>
                    <span class="jump-pages">/&nbsp{{pages.pages}}</span>
                  </template>
                </el-pagination>
                <span class="add-endpoint" @click="addEndpoint" :title="$t('overall.rightShift')">
                <i class="nz-icon nz-icon-arrow-right"></i>
              </span>
              </div>
              <div v-if="selectAssetAll" class="asset-allselect">
                {{$t('project.endpoint.allselect')}}
              </div>
            </div>
            <!--endpoint-->
            <div class="right-box-endpoint-table"  :class="showError?'error' : ''">
              <div class="search-box" style="display: flex;justify-content: flex-end">
                <el-button class="top-tool-btn" type="button" @click="showRightBox">
                  <i class="nz-icon-gear nz-icon" :title="$t('overall.selectColumns')"></i>
                </el-button>
                <el-button class="top-tool-btn" type="button" @click="editAllEndpoint">
                  <i class="nz-icon-batch-edit nz-icon"></i>
                </el-button>
              </div>
              <el-table
                id="add-endpoint-asset-table"
                ref="endpointTable"
                :data="endpointTableData"
                empty-text=" "
                height="calc(100% - 95px)"
                style="width:100%;border-radius: 4px;"
                @selection-change="handleSelectionChangeEndpoint">
                <el-table-column
                  style="padding: 0 1px;"
                  type="selection"
                  width="25">
                </el-table-column>
                <el-table-column
                  v-for="(title, index) in endpointTableTitle"
                  v-if="title.show"
                  :key="index"
                  :label="title.label"
                  :min-width="title.width"
                  :resizable="true"
                  label-class-name="endpoints-box-endpoints-title"
                >
                  <template slot-scope="scope" :column="title">
                    <span v-if="title.prop == 'asset'">{{scope.row.assetName}}</span>
                    <span v-else-if="title.prop == 'name'">
                      {{scope.row.name}}
                    </span>
                    <template v-else-if="title.prop === 'configs'">
                      <el-tooltip effect="light" placement="right" popper-class="prevent-clickoutside">
                        <span class="configs-endpoint">{ ... }</span>
                        <div slot="content" class="endpointConfigsTips">
                          <!--                        <span class="copy-value-content"> <i class="nz-icon nz-icon-override" @click="copyValue(scope.row[title.prop])"></i></span>-->
                          <pre >{{JSON.stringify(scope.row[title.prop],null,2)}}</pre>
                          <!--                        <pre>{{}}</pre>-->
                        </div>
                      </el-tooltip>
                    </template>
                  </template>
                </el-table-column>
                <el-table-column fixed="right" label=""  width="56">
                  <template slot-scope="scope" style="text-align: center">
                  <span @click="editEndpointRow(scope.row, scope.$index)">
                    <i class="nz-icon-gear nz-icon" :title="$t('overall.selectColumns')"></i>
                  </span>
                  </template>
                </el-table-column>
              </el-table>
              <div class="table-bottom">
              <span class="add-endpoint" @click="removeEndpoint" style="margin-left: 10px" :title="$t('overall.leftShift')">
                <i class="nz-icon nz-icon-arrow-left"></i>
              </span>
              </div>
            </div>
            <div v-if="showError" class="el-form-item__error">{{this.$t('validate.required')}}</div>
          </div>
        </el-form>
      </div>
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
import editRigthBox from '../mixin/editRigthBox'
export default {
  name: 'addEndpointBox',
  components: {
    'edit-endpoint-box-new': editEndpointBoxNew
  },
  mixins: [editRigthBox],
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
        pageSize: 10
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
      currentModule: {},
      currentProject: { id: '' },
      tempParamObj: [],
      tempLabelModule: [],
      inputKeyErr: [],
      tempEndpoint: {},
      tempEndpoint2: {},
      assetLoading: true,
      rightBox: { show: false, title: this.$t('overall.createEndpoint'), isEdit: false },
      optionType: 'batch',
      blankEndpoint: {
        id: '',
        projectId: '',
        endpointNameTmpl: '{{module.name}}-{{asset.name}}',
        type: 'http',
        port: '',
        enabled: 1,
        configs: {
          walk: [],
          snmpCredentialsId: '',
          metrics_path: '',
          port: '',
          host: '{{asset.manageIp}}',
          scrape_interval: '',
          scrape_timeout: '',
          params: '',
          labels: '',
          paramObj: [],
          labelModule: [],
          basic_auth: {
            username: '',
            pin: ''
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
      endpointTableTitle: [
        {
          label: this.$t('overall.name'),
          prop: 'name',
          width: 150,
          show: true
        }, {
          label: this.$t('asset.asset'),
          prop: 'asset',
          width: 80,
          show: true
        }, {
          label: this.$t('overall.config'),
          prop: 'configs',
          width: 80,
          show: true
        }

      ],
      assetListAll: false,
      assetListHalf: false,
      assetTableTitle: [
        {
          label: this.$t('overall.name'),
          prop: 'name',
          show: false,
          allowed: true,
          minWidth: '200'
        },
        {
          label: this.$t('asset.sn'),
          prop: 'sn',
          show: true,
          minWidth: '200'
        },
        {
          label: this.$t('asset.manageIp'),
          prop: 'manageIp',
          show: true,
          minWidth: '200'
        }, {
          label: this.$t('asset.brand'),
          prop: 'brand',
          show: true,
          minWidth: '100'
        }, {
          label: this.$t('asset.model'),
          prop: 'model',
          show: true,
          minWidth: '100'
        }, {
          label: this.$t('overall.dc'),
          prop: 'dc',
          show: true,
          minWidth: '100'
        }, {
          label: this.$t('asset.cabinet'),
          prop: 'cabinet',
          show: true,
          minWidth: '100'
        }, {
          label: this.$t('asset.type'),
          prop: 'type',
          show: true,
          minWidth: '100'
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true,
          minWidth: '100'
        }],
      typeList: [],
      dcList: [],
      modelList: [],
      assetTableData: [],
      assetSelection: [],
      endpointSelection: [],
      selectAssetAll: 0,
      endpointTableData: [],
      seachLabel: [],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: this.$t('asset.sn'),
          type: 'input',
          label: 'sn',
          disabled: false
        },
        {
          id: 11,
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          disabled: false
        },
        {
          id: 11,
          name: this.$t('asset.manageIp'),
          type: 'input',
          label: 'manageIp',
          disabled: false
        },
        {
          id: 11,
          name: this.$t('asset.brand'),
          type: 'input',
          label: 'brand',
          disabled: false
        },
        {
          id: 11,
          name: this.$t('asset.model'),
          type: 'input',
          label: 'model',
          disabled: false
        },
        {
          id: 11,
          name: this.$t('overall.dc'),
          type: 'input',
          label: 'dc',
          disabled: false
        },
        {
          id: 11,
          name: this.$t('asset.cabinet'),
          type: 'input',
          label: 'cabinet',
          disabled: false
        },
        {
          id: 11,
          name: this.$t('asset.type'),
          type: 'input',
          label: 'type',
          disabled: false
        },
        {
          id: 11,
          name: this.$t('overall.state'),
          type: 'input',
          label: 'state',
          disabled: false
        }]
      },
      showError: false
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
          this.getModuleList(this.currentProject.id)
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
      this.currentModule = {}
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
      this.endpoint.projectId = this.currentProject.id
      this.endpoint.moduleId = this.currentModule.id
      if (this.endpointTableData.length === 0) {
        this.endpointTouch = true
        this.$refs.addEndpoint.validate()
        this.prevent_opt.save = false
        this.showError = true
        return false
      }
      // 对endpointList进行处理，避免携带过多无用数据
      const endpointList = []
      this.endpointTableData.forEach((item, index) => {
        const endpoint = {
          moduleId: item.moduleId,
          assetId: item.assetId,
          name: item.name,
          configs: JSON.stringify(item.configs)
        }
        endpointList.push(endpoint)
      })
      if (endpointList.length === 0) {
        this.showError = true
      }
      this.$refs.addEndpoint.validate((valid) => {
        if (valid && !this.showError) {
          this.$post('monitor/endpoint', endpointList).then(response => {
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
      this.showError = false
      const arr = []
      this.assetSelection.forEach(item => {
        if (this.endpointTableData.find(endpoint => endpoint.assetId === item.id)) {
          return
        }
        const obj = {
          assetId: item.id,
          assetName: item.name,
          // asset: item,
          type: this.currentModule.type,
          projectId: this.currentModule.projectId,
          configs: { ...JSON.parse(this.currentModule.configs), host: item.manageIp },
          moduleId: this.currentModule.id
        }
        obj.name = this.currentModule.endpointNameTmpl
        obj.configs = JSON.stringify(obj.configs)
        arr.push(obj)
      })
      this.$put('monitor/endpoint/render', arr).then(res => {
        if (res.code === 200) {
          res.data.list.forEach((item, index) => {
            const obj = item
            if (obj.name.length > 64) {
              const length = obj.name.length - 64
              const lastIndex = obj.name.lastIndexOf('-')
              obj.name = obj.name.substring(0, 64 - length) + obj.name.substring(lastIndex)
            }
            obj.configs = JSON.parse(obj.configs)
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
            this.endpointTableData.push({
              ...arr[index],
              ...obj
            })
          })
        }
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
      this.optionType = 'add'
      this.object = JSON.parse(JSON.stringify(u))
      this.object.walk = this.object.configs.walk ? JSON.parse(JSON.stringify(this.object.configs.walk)) : []
      this.object.configs.port && (this.object.port = this.object.configs.port)
      // if (!this.object.enabled && !isNaN(this.object.enabled)) {
      //   this.object.enabled = 1
      // }
      this.rightBox.show = true
    },
    showRightBox () {
      this.optionType = 'batch'
      this.object = { ...JSON.parse(JSON.stringify(this.blankEndpoint)), projectId: this.currentModule.projectId, moduleId: this.currentModule.id, assetName: '', type: this.currentModule.type }
      this.object.walk = this.object.configs.walk ? JSON.parse(JSON.stringify(this.object.configs.walk)) : []
      this.object.configs.port && (this.object.port = this.object.configs.port)
      // if (!this.object.enabled && !isNaN(this.object.enabled)) {
      //   this.object.enabled = 1
      // }
      this.rightBox.show = true
    },
    editAllEndpoint () {
      this.endpointTableData.forEach((item, index) => {
        if (this.endpointSelection.find(item1 => item1.assetId === item.assetId)) {
          this.endpointTableData[index] = { ...this.endpointTableData[index], ...this.blankEndpoint }
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
          if (item.assetId === endpoint.assetId) {
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
    assetTableData: {
      handler (n) {
        if (n) {
          this.$nextTick(() => {
            const domarr = document.getElementsByClassName('hide-row')
            this.selectAssetAll = domarr.length === this.pageObj.pageSize
          })
        }
      }
    },
    currentProject: {
      immediate: true,
      handler (n, o) {
      }
    },
    currentModule: {
      immediate: true,
      handler (n, o) {
        this.isEdit = true
      }
    }
  }
}
</script>
