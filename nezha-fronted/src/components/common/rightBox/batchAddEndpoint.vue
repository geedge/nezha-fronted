<template>
  <div class="right-box right-box-modify-endpoint" v-clickoutside="{obj:endpoint,func:clickOutside}">
    <div class="right-box__header">
      <!-- begin--标题-->
      <div class="header__title">{{$t("overall.batchAddEndpoint")}}</div>
      <!-- end--标题-->
      <div class="header__operation">
        <span v-cancel="{obj: endpoint, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>

    <!-- begin--表单-->
    <div class="right-box-form-box right-box__container" style="overflow: hidden;padding-left: 20px;margin-top: 0">
      <div class="container__form">
        <el-form class="right-box-form" label-position = "top" ref="addEndpoint" :model="endpoint" :rules="rules">
          <el-form-item :label="$t('project.module.module')" prop="ChartTemplate">
            <v-selectpage
              :data="moduleList"
              :tb-columns="ChartSearchShowFields"
              :params="{
                varType: 2, panelId: 0,
                returnChildren:0,groupId:0,
              }"
              :multiple="true"
              :language="language"
              title="ChartSearch"
              key-field="id"
              show-field="name"
              v-model="moduleIds"
              class="form-control"
              :result-format="resultFormat"
            ></v-selectpage>
          </el-form-item>
          <el-form-item :label="$t('asset.asset')" prop="ChartTemplate">
            <v-selectpage
              :data="assetDataList"
              :tb-columns="ChartSearchShowFields"
              :params="{
                varType: 2, panelId: 0,
                returnChildren:0,groupId:0,
              }"
              :multiple="true"
              :language="language"
              title="ChartSearch"
              key-field="id"
              show-field="name"
              v-model="assetIds"
              class="form-control"
              :result-format="resultFormat"
            ></v-selectpage>
          </el-form-item>
        </el-form>
        <el-table
          :data="tableData"
          :height="400"
          v-if="tableData.length"
          style="width:calc(100% - 55px)"
          border>
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
                {{scope.row.asset?scope.row.asset.name : '' }}
              </template>
              <template v-else-if="item.prop === 'project'">
                {{scope.row.project?scope.row.project.name : '' }}
              </template>
              <template v-else-if="item.prop === 'module'">
                {{scope.row.module?scope.row.module.name : '' }}
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
          <el-table-column
            :resizable="false"
            :width="80"
            fixed="right">
            <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
            <div slot-scope="scope" class="table-operation-items">
              <button class="table-operation-item" v-has="'model_edit'" @click="del(scope.row, scope.$index)"><i class="nz-icon nz-icon-minus"></i></button>
              <button class="table-operation-item"  @click="edit(scope.row, scope.$index)"><i class="nz-icon nz-icon-edit"></i></button>
            </div>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:endpoint,func:esc}" id="ep-esc" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="generate" id="ep-generate" class="footer__btn footer__btn--light">
        <span>{{$t('overall.generate')}}</span>
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
  name: 'batchAddEndpointBox',
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
      moduleIds: '',
      assetIds: '',
      assetDataList: [],
      moduleList: [],
      language: localStorage.getItem('nz-language'),
      ChartSearchShowFields: [ // ChartSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        { title: this.$t('config.model.titleName'), data: 'name' },
        { title: this.$t('overall.remark'), data: 'remark' }
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
      rightBox: { show: false, title: this.$t('project.endpoint.createEndpoint'), isEdit: false },
      optionType: 'add',
      tableData: [],
      endpointTableTitle: [ // 原始table列
        {
          label: this.$t('project.endpoint.name'),
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
          label: this.$t('project.endpoint.asset'),
          prop: 'asset',
          show: true
        },
        {
          label: this.$t('project.endpoint.configs'),
          prop: 'configs',
          show: true
        }
      ]
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
      if (!this.assetIds || !this.moduleIds) {
        this.$message.error('Please select module or asset')
      }
      const res = {
        code: 200,
        msg: 'success',
        data: {
          list: [{
            name: 'module+asset',
            module: {
              id: 2,
              name: 'aaa'
            },
            project: {
              id: 5,
              name: 'aaa'
            },
            asset: {
              id: 1,
              name: 'aaa'
            },
            chartIds: '688355',
            configs: [
              { type: 'metrics', config: { protocol: 'HTTP', scrape_interval: 30, scrape_timeout: 10, host: '192.168.40.1', port: 9090, metrics_path: '/metric', params: { module: ['cpu', 'memory'] }, basic_auth: { username: 'zhangsan', password: 'lisi' }, bearer_token: 'yiduanwenzi', labels: { datacenter: 'bj', module: 'mysql' } }, enable: 1 },
              {
                type: 'logs',
                config: [
                  {
                    type: 'file',
                    fileName: '/var/logs/mysqld.log',
                    labels: { datacenter: 'bj', module: 'mysql' },
                    pipeline: [
                      { type: 'regex', expression: 'ad?!*', source: '' },
                      { type: 'json', expressions: [{ abc: 'abc', level: 'config' }], source: '' },
                      { type: 'template', template: 'ad?!*', source: '' },
                      { type: 'timestamp', format: 'RFC822Z', source: '' },
                      { type: 'labels', labels: [{ abc: 'abc', level: 'config' }] },
                      { type: 'output', source: 'content' }
                    ]
                  },
                  { type: 'syslog', listenAddress: '0.0.0.0:9100', appName: 'sapp' },
                  { type: 'journal', unit: 'nzagent.service' }
                ],
                enable: 1
              }]
          }
          ]
        }
      }
      this.tableData = res.data.list
      // this.$post('/monitor/endpoint/render', { moduleIds: this.moduleIds, assetIds: this.assetIds }).then(res => {
      //   console.log(res)
      //   this.tableData = res.data.list
      // })
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
    },
    del () {

    },
    edit (row) {
      this.object = row
      // this.object.configs = JSON.parse(this.object.configs)
      this.object.projectId = this.object.project.id
      this.object.moduleId = this.object.module.id
      this.object.assetName = this.object.asset.name
      this.object.configs.walk = this.object.configs.walk ? JSON.parse(JSON.stringify(this.object.configs.walk)) : []
      this.object.port = this.object.configs.port ? JSON.parse(JSON.stringify(this.object.configs.port)) : ''
      this.object.paramObj = []
      this.object.labelModule = []
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
      if (!this.object.chartIds) {
        this.object.chartIds = ''
      } else {
        // this.object.chartIds = this.object.chartIds.split(',')
      }
      this.rightBox.show = true
      this.rightBox.show = true
    }
  },
  created () {
    this.getModuleList()
    this.getAssetList()
  },
  watch: {
  }
}
</script>
