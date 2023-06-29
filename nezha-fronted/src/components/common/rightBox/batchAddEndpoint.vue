<template>
  <div class="right-box right-box-modify-endpoint" v-clickoutside="{obj:batchEndpoint,func:clickOutside}">
    <div class="right-box__header">
      <!-- begin--标题-->
      <div class="header__title">{{$t("overall.batchAddEndpoint")}}</div>
      <!-- end--标题-->
      <div class="header__operation">
        <span v-cancel="{obj: endpoint, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>

    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form label-position="top" ref="addEndpoint" :model="endpoint" :rules="rules">
          <el-form-item :label="$t('project.module.module')" prop="ChartTemplate">
            <v-selectpage
              :data="moduleList"
              :tb-columns="ChartSearchShowFields"
              :params="{
                varType: 2, dashboardId: 0,
                returnChildren:0,groupId:0,
              }"
              :multiple="true"
              :language="language"
              title="ChartSearch"
              key-field="id"
              show-field="name"
              :width="640"
              v-model="batchEndpoint.moduleIds"
              class="form-control"
              :result-format="resultFormat"
            ></v-selectpage>
          </el-form-item>
          <el-form-item :label="$t('asset.asset')" prop="ChartTemplate">
            <v-selectpage
              :data="assetDataList"
              :tb-columns="columns"
              :params="{
                varType: 2, dashboardId: 0,
                returnChildren:0,groupId:0,
              }"
              :multiple="true"
              :language="language"
              title="ChartSearch"
              key-field="id"
              show-field="name"
              :width="640"
              v-model="batchEndpoint.assetIds"
              class="form-control"
              :result-format="resultFormat"
            ></v-selectpage>
          </el-form-item>
        </el-form>

        <div class="right-box-sub-title">{{ $t("overall.config") }}</div>
        <div class="right-box-line"></div>

        <el-table
          :data="batchEndpoint.tableData"
          :height="'100%'"
        >
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
                {{scope.row.asset?scope.row.asset.name : '' }}
              </template>
              <template v-else-if="item.prop === 'project'">
                {{scope.row.project?scope.row.project.name : '' }}
              </template>
              <template v-else-if="item.prop === 'module'">
                {{scope.row.module?scope.row.module.name : '' }}
              </template>
              <template v-else-if="item.prop == 'configs'">
<!--                <el-tooltip placement="left" effect="light" :popper-class="'endpointConfigsTips'">-->
<!--                  <span class="configs-endpoint metrics">{ Metrics }</span>-->
<!--                  <div class="endpointConfigsTips" slot="content">-->
<!--                    <pre >{{JSON.stringify(scope.row.configs[0].config,null,2)}}</pre>-->
<!--                  </div>-->
<!--                </el-tooltip>-->
<!--                <el-tooltip placement="right" effect="light" :popper-class="'endpointConfigsTips'">-->
<!--                  <span class="configs-endpoint logs">{ Logs }</span>-->
<!--                  <div class="endpointConfigsTips" slot="content">-->
<!--                    <pre >{{JSON.stringify(scope.row.configs[1].config,null,2)}}</pre>-->
<!--                  </div>-->
<!--                </el-tooltip>-->
                <el-tooltip placement="left" effect="light" :popper-class="'endpointConfigsTips'" v-if="scope.row.configs[0].enable || scope.row.configs[1].enable">
                  <span class="configs-endpoint metrics">[{{scope.row.configs[0].enable ?  'Metrics':''}}{{scope.row.configs[0].enable&&scope.row.configs[1].enable?',':''}}{{scope.row.configs[1].enable ?  'logs' : ''}}]</span>
                  <div class="endpointConfigsTips" slot="content">
                    <pre >{{JSON.stringify(clConfigs(scope.row),null,2)}}</pre>
                  </div>
                </el-tooltip>
              </template>
              <template v-else>1</template>
            </template>
          </el-table-column>
          <el-table-column
            :resizable="false"
            :width="90"
            fixed="right">
            <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
            <div slot-scope="scope" class="table-operation-items">
              <span class="table-operation-item" v-has="'model_edit'" @click="del(scope.$index)" :title="$t('overall.delete')"><i class="nz-icon nz-icon-minus"></i></span>
              <span class="table-operation-item"  @click="edit(scope.row, scope.$index)" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></span>
            </div>
          </el-table-column>
        </el-table>
        <div v-if="showError" class="el-form-item__error">{{this.$t('validate.required')}}</div>
      </div>
    </div>

    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:endpoint,func:esc}" id="ep-esc" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="generate" id="ep-generate" class="footer__btn">
        <span>{{$t('overall.generate')}}</span>
      </button>
      <button @click="save" class="footer__btn" id="ep-add" :class="!batchEndpoint.tableData.length?'nz-btn-disabled':''" :disabled="!batchEndpoint.tableData.length">
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
import editRigthBox from '@/components/common/mixin/editRigthBox'
export default {
  name: 'batchAddEndpointBox',
  props: {
    currentProject: Object,
    currentModule: Object,
    selectEndpointList: Array
  },
  mixins: [editRigthBox],
  components: {
    'edit-endpoint-box-new': editEndpointBoxNew
  },
  computed: {
    language () { return this.$store.getters.getLanguage }
  },
  data () {
    return {
      showError: false,
      rules: {
        projectId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        moduleId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      batchEndpoint: {
        moduleIds: '',
        assetIds: '',
        tableData: []
      },
      assetDataList: [],
      moduleList: [],
      ChartSearchShowFields: [ // ChartSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        {
          title: this.$t('overall.name'),
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          },
          key: 'name'
        },
        {
          title: this.$t('project.project.projectName'),
          data: function (row) {
            if (row.project && row.project.name.length > 15) {
              return row.project.name.substring(0, 12) + '...'
            } else {
              return row.project.name
            }
          },
          deep: true,
          orjinNME: 'project'
        },
        {
          title: this.$t('overall.remark'),
          data: function (row) {
            if (row.remark && row.remark.length > 15) {
              return row.remark.substring(0, 12) + '...'
            }
            return row.remark = row.remark ? row.remark : ''
          },
          key: 'remark'
        }
      ],
      columns: [
        { title: 'ID', data: 'id' },
        {
          title: this.$t('overall.name'),
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          },
          key: 'name'
        },
        { title: this.$t('asset.manageIp'), data: 'manageIp', key: 'manageIp' },
        {
          title: this.$t('overall.type'),
          data: (row) => {
            return row.type ? row.type.name : ''
          },
          deep: true,
          orjinNME: 'type'
        },
        {
          title: this.$t('asset.model'),
          data: (row) => {
            return row.model ? row.model.name : ''
          },
          deep: true,
          orjinNME: 'model'
        },
        {
          title: this.$t('overall.dc'),
          data: (row) => {
            return row.dc ? row.dc.name : ''
          },
          deep: true,
          orjinNME: 'dc'
        }
      ],
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
      optionType: 'batchAdd',
      endpointTableTitle: [ // 原始table列
        {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true
        },
        {
          label: this.$t('overall.project'),
          prop: 'project',
          show: true
        },
        {
          label: this.$t('project.module.module'),
          prop: 'module',
          show: true
        },
        {
          label: this.$t('asset.asset'),
          prop: 'asset',
          show: true
        },
        {
          label: this.$t('overall.config'),
          prop: 'configs',
          show: true,
          width: 150
        }
      ],
      endpointIndex: ''
    }
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },

    /* 关闭弹框 */
    esc (refresh, importResult) {
      this.prevent_opt.save = false
      this.$emit('close', refresh, importResult)
    },
    // 获取endpoint弹框中module下拉框数据
    getModuleList () {
      this.$get('monitor/module', { projectIds: '', pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.moduleList = response.data.list
        }
      })
    },
    // 获取endpoint弹框中的asset子弹框里asset列表数据
    getAssetList () {
      this.assetLoading = true
      const params = {
        pageSize: -1
      }
      this.$get('asset/asset', params).then(response => {
        if (response.code === 200) {
          this.assetDataList = response.data.list
        }
      }).finally(() => {
        setTimeout(() => {
          this.assetLoading = false
        }, 200)
      })
    },
    generate () {
      if (!this.batchEndpoint.assetIds || !this.batchEndpoint.moduleIds) {
        this.$message.error('Please select module or asset')
      }
      this.$post('/monitor/endpoint/render', { moduleIds: this.batchEndpoint.moduleIds, assetIds: this.batchEndpoint.assetIds }).then(res => {
        res.data.list.forEach(item => {
          item.configs = JSON.parse(item.configs)
          item.moduleId = item.module.id
          item.assetId = item.asset.id
        })
        this.batchEndpoint.tableData = res.data.list
      })
    },
    // 保存endpoint
    save () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.showError = false
      if (!this.batchEndpoint.tableData.length) {
        this.prevent_opt.save = false
        this.showError = true
        return
      }
      // 对endpointList进行处理，避免携带过多无用数据
      this.$refs.addEndpoint.validate((valid) => {
        if (valid) {
          const paramsArr = this.batchEndpoint.tableData.map(item => {
            const obj = JSON.parse(JSON.stringify(item))
            obj.configs = JSON.stringify(obj.configs)
            return {
              ...obj
            }
          })
          this.$post('/monitor/endpoint/bulk', paramsArr).then(response => {
            this.prevent_opt.save = false
            if (response.code === 200) {
              // this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
              response.data.failDetail.forEach(item => {
                item.info = 'AssetId：' + this.batchEndpoint.tableData[item.lineNo - 1].asset.id + ' ModuleId：' + this.batchEndpoint.tableData[item.lineNo - 1].module.id + ' '
              })
              this.esc(true, response.data)
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
    resultFormat (resp) {
      if (resp && resp.data) {
        const assetData = {}
        assetData.list = resp.data.list
        assetData.totalRow = resp.data.total
        return assetData
      }
    },
    closeRightBox (isEdit, endpoint, isAll) {
      this.rightBox.show = false
      if (!isEdit) { return }
      this.batchEndpoint.tableData.forEach((item, index) => {
        if (index === this.endpointIndex) {
          this.batchEndpoint.tableData[index] = { ...endpoint }
        }
      })
      this.batchEndpoint.tableData = [...this.batchEndpoint.tableData]
    },
    del (index) {
      this.batchEndpoint.tableData.splice(index, 1)
    },
    edit (row, endpointIndex) {
      this.endpointIndex = endpointIndex
      this.object = row
      // this.object.configs = JSON.parse(this.object.configs)
      this.object.projectId = this.object.project.id
      this.object.moduleId = this.object.module.id
      this.object.assetName = this.object.asset.name
      // this.object.configs.walk = this.object.configs.walk ? JSON.parse(JSON.stringify(this.object.configs.walk)) : []
      // this.object.port = this.object.configs.port ? JSON.parse(JSON.stringify(this.object.configs.port)) : ''
      this.object.paramObj = []
      this.object.labelModule = []
      if (!this.object.configs[0].config.relabel_config) {
        this.object.configs[0].config.relabel_config = []
      }
      this.object.configs[0].config.relabel_config && this.object.configs[0].config.relabel_config.forEach(item => {
        item.showAllRelabelOption = false
        item.tags = ''
      })
      this.object.configs[1].config.forEach(item => {
        item.labelModule = []
        if (JSON.stringify(item.labels) !== '{}' && item.labels) {
          Object.keys(item.labels).forEach(key => {
            item.labelModule.push({ key, value: item.labels[key] })
          })
        } else {
          item.labelModule.push({ key: '', value: '' })
        }
        item.pipeline && item.pipeline.forEach((pipeline) => {
          if (pipeline.type === 'labels') {
            const labelsArr = []
            if (JSON.stringify(pipeline.labels) !== '{}' && pipeline.labels) {
              Object.keys(pipeline.labels).forEach(key => {
                labelsArr.push({ key, value: pipeline.labels[key] })
              })
            } else {
              labelsArr.push({ key: '', value: '' })
            }
            pipeline.labels = labelsArr
          }
          if (pipeline.type === 'json') {
            const expressionsArr = []
            if (JSON.stringify(pipeline.expressions) !== '{}' && pipeline.expressions) {
              Object.keys(pipeline.expressions).forEach(key => {
                expressionsArr.push({ key, value: pipeline.expressions[key] })
              })
            } else {
              expressionsArr.push({ key: '', value: '' })
            }
            pipeline.expressions = expressionsArr
          }
        })
        if (!item.pipeline) {
          item.pipeline = []
        }
      })
      if (JSON.stringify(this.object.configs[0].config.labels) !== '{}' && this.object.configs[0].config.labels) {
        Object.keys(this.object.configs[0].config.labels).forEach(key => {
          this.object.labelModule.push({ key, value: this.object.configs[0].config.labels[key] })
        })
      } else {
        this.object.labelModule.push({ key: '', value: '' })
      }
      if (JSON.stringify(this.object.configs[0].config.params) !== '{}' && this.object.configs[0].config.params) {
        Object.keys(this.object.configs[0].config.params).forEach(key => {
          this.object.paramObj.push({ key, value: this.object.configs[0].config.params[key] })
        })
      } else {
        this.object.paramObj.push({ key: '', value: [] })
      }
      // if (!this.object.chartIds && this.object.module.chartIds) {
      //   this.object.chartIds = this.object.module.chartIds
      // } else {
      //   this.object.chartIds = ''
      // }
      this.rightBox.show = true
    },
    clConfigs (item) {
      const str = []
      if (item.configs[0].enable) {
        str.push(item.configs[0])
      }
      if (item.configs[1].enable) {
        str.push(item.configs[1])
      }
      return str
    }
  },
  created () {
    this.isEdit = true
    this.getModuleList()
    this.getAssetList()
  },
  watch: {
    'batchEndpoint.tableData': {
      deep: true,
      handler (n) {
        this.showError = false
      }
    }
  }
}
</script>
