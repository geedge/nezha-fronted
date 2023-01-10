<template>
  <div v-clickoutside:[isStable]="{obj: editChart, func:clickOutside}" :class="boxClass" class="right-box right-box-chart">
    <transition v-if="from !== 'chartTemp'" name="right-box">
<!--      <panel-box v-if="!showPanel.type" ref="panelBox2" :panel="panel" @reload="panelReload"></panel-box>-->
    </transition>

    <div class="right-box__header">
      <div class="header__title" v-if="from !== 'chartTemp'">{{editChart.id ? $t("dashboard.panel.editChartTitle") : $t("overall.createChart")}}</div>
      <div class="header__title" v-if="from === 'chartTemp'">{{editChart.id ? $t("dashboard.panel.editChartTempTitle") : $t("dashboard.panel.createChartTempTitle")}}</div>
      <div class="header__operation">
        <span v-cancel:[isStable]="{obj: editChart, func: clickOutside}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>

    <!-- begin--表单-->
    <div class="right-box-form-box right-box__container chart-right-box">
      <el-form ref="chartForm" :model="editChart" :rules="rules" label-position= "top" label-width="120px">
        <el-form-item :label='$t("overall.name")' prop="name">
          <div style="display:flex;align-items:center">
            <el-input style="flex:1;margin-right:10px" maxlength="64" show-word-limit size="small" v-model="editChart.name" id="chart-box-title"></el-input>
            <!-- 显示头部 -->
            <div class="choose-header-btn" v-if="editChart.param&&editChart.param.showHeader!==0" @click="switchHeader(0)" :title="$t('overall.visible')">
              <i class="nz-icon nz-icon-mimakejian"></i>
            </div>
            <!-- 隐藏头部 -->
            <div class="choose-header-btn" v-else @click="switchHeader(1)" :title="$t('overall.invisible')">
              <i class="nz-icon nz-icon-mimabukejian"></i>
            </div>
          </div>
        </el-form-item>

        <div class="form-items--half-width-group">
        <!--panel-->
        <el-form-item
          class="form-item--half-width"
          v-if="showPanel.type !== fromRoute.project && showPanel.type !== fromRoute.asset && showPanel.type !== fromRoute.endpoint && showPanel.type !== fromRoute.model && from!=='chartTemp' && from!=='dashboardTemp'"
          :label="$t('overall.dashboard')"
          prop="panelName"
        >
          <select-panel ref="selectPanel" :disabled="showPanel.type === 'dashboard'" :filter-panel="filterPanel" :chart-box="true" :panel-lock="true" :panelData="panelData" :placement="'bottom-start'" @selectPanel="selectPanel">
            <template v-slot:header>
              <div class="panel-select-header">
                <el-input id="chart-box-panelname" v-model="filterPanel" :placeholder="$t('overall.search')" clearable size="small" style="width: 596px"></el-input>
              </div>
            </template>
            <template v-slot:trigger>
              <el-input placeholder="" readonly="readonly" size="small" v-model="editChart.panelName" :disabled="showPanel.type==='dashboard'"></el-input>
            </template>
          </select-panel>
        </el-form-item>
          <!--   varType   -->
          <el-form-item :label="$t('dashboard.panel.chartForm.varType')" class="form-item--half-width" v-if="from === 'chartTemp'">
            <el-select id="chart-box-varType" v-model="editChart.varType" :disabled="!!editChart.id" class="right-box__select" popper-class="right-box-select-top prevent-clickoutside" clearable placeholder="" size="small" value-key="chartType">
              <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in varTypeArr">
                <span class="panel-dropdown-label-txt" >{{item.name}}</span>
              </el-option>
            </el-select>
          </el-form-item>
        <!--group-->
        <el-form-item :label="$t('dashboard.panel.chartForm.group')" class="form-item--half-width" prop="group">
          <el-select id="chart-box-group" v-model="editChart.groupId" :disabled="editChart.type==='group'" clearable placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="chartType">
            <el-option v-for="item in groupArr" :key="item.id" :label="item.name" :value="item.id">
              <span class="panel-dropdown-label-txt" >{{item.name}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        </div>
        <!--remark-->
        <el-form-item :label="$t('overall.remark')">
          <el-input  maxlength="256" show-word-limit v-model="editChart.remark" size="small" :rows="2" type="textarea"/>
        </el-form-item>
        <!--remark-->
        <el-form-item :label="$t('overall.link')" v-if="editChart.param">
          <el-input  maxlength="256" show-word-limit v-model="editChart.param.link" size="small" :rows="2" type="textarea"/>
        </el-form-item>

        <!--title-->
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.dataConfig')}}</span>
        </div>
        <el-tabs v-model="editChart.datasource" @tab-click="datasourceChange" type="card">
          <el-tab-pane :label="$t('overall.metrics')" name="metrics">
            <chart-config :variables="variables" ref="childrenFrommetrics" :type="'metrics'" v-if="editChart.datasource == 'metrics'" :params.sync="editChart" @change="editChartChange"/>
          </el-tab-pane>
          <el-tab-pane :label="$t('overall.logs')" name="logs">
            <chart-config :variables="variables" ref="childrenFromlogs" :type="'log'" v-if="editChart.datasource == 'logs'" :params.sync="editChart" @change="editChartChange"/>
          </el-tab-pane>
          <el-tab-pane :label="$t('overall.system')" name="system">
            <system-chart-config :variables="variables" ref="childrenFromsystem" v-if="editChart.datasource == 'system'" :params.sync="editChart" @change="editChartChange"/>
          </el-tab-pane>
          <el-tab-pane :label="$t('overall.misc')" name="misc">
            <other-chart-config :variables="variables" ref="childrenFrommisc" v-if="editChart.datasource == 'misc'" :params.sync="editChart" @change="editChartChange"/>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>
    <!--底部按钮-->
    <div class="right-box__footer">
      <button id="chart-box-esc" v-cancel:[isStable]="{obj:editChart,func:esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button v-if="showPanel.type && showPanel.type == 'model'" id="chart-box-Sync" v-has="'main_edit'" class="footer__btn">
        <span>{{$t('overall.SyncSave')}}</span>
      </button>
      <button v-else-if="from!=='chartTemp'" id="chart-box-preview" class="footer__btn" @click="preview(true)">
        <span>{{$t('overall.preview')}}</span>
      </button>
      <button id="chart-box-save" v-has="'main_add'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
   <!-- 预览 -->
    <el-dialog
      v-if="previewShow"
      :visible.sync="previewShow"
      :show-close="false"
      class="nz-dialog chart-fullscreen"
      destroy-on-close
      fullscreen
      :modal-append-to-body="false"
    >
      <panel-chart
        v-if="prevChart"
        style="height: 100%;width: 100%"
        :ref="'chart-fullscreen-previewShow'"
        :chart-info="prevChart"
        :from="from"
        :filter="{}"
        :is-fullscreen="true"
        :time-range="timeRange"
        @showFullscreen="preview"
      ></panel-chart>
    </el-dialog>
  </div>
</template>

<script>
import { fromRoute } from '@/components/common/js/constants'
import editRigthBox from '@/components/common/mixin/editRigthBox'
import { resetZIndex, getUUID } from '@/components/common/js/common'
import selectPanel from '@/components/common/popBox/selectPanel'
import chartConfig from '@/components/common/rightBox/chart/chartConfig'
import otherChartConfig from '@/components/common/rightBox/chart/otherChartConfig'
import systemChartConfig from '@/components/common/rightBox/chart/systemChartConfig'
import panelChart from '@/components/chart/panelChart'
import lodash from 'lodash'
import bus from '@/libs/bus'

const rz = {
  methods: {
    rz (e) {
      resetZIndex(e)
    }
  }
}
export default {
  name: 'chartRightBox',
  props: {
    boxClass: String,
    panelData: Array,
    showPanel: Object,
    chart: Object,
    from: { type: String },
    fromEndpoint: {
      type: Boolean,
      default: false
    }
  },
  mixins: [rz, editRigthBox],
  components: {
    selectPanel,
    chartConfig,
    systemChartConfig,
    otherChartConfig,
    panelChart
  },
  computed: {
    chartLastPosition () {
      return this.$store.getters.getChartLastPosition
    },
    variables () {
      return this.$store.state.panel.variablesArr
    }
  },
  data () {
    return {
      fromRoute,
      previewShow: false,
      editChart: {
        name: '',
        remark: '',
        link: ''
      },
      panel: {
        id: '',
        name: ''
      },
      timeRange: [],
      prevChart: '',
      filterPanel: '',
      groupArr: [],
      varTypeArr: [
        { name: this.$t('asset.asset'), id: 1 },
        { name: this.$t('asset.endpoint'), id: 2 }
      ],
      panelName: '',
      rules: {
        name: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }],
        panelName: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }]
      }
    }
  },
  methods: {

    switchHeader (value) {
      // 1为显示 0为隐藏
      this.$set(this.editChart.param, 'showHeader', value)
    },

    clickOutside () {
      this.esc(false)
    },

    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    // 保存endpoint
    save () {
      const self = this
      let resetFlag = false // 页面是否需要重排
      const arr = [this.$refs.chartForm.validate()]
      arr.push(this.$refs['childrenFrom' + this.editChart.datasource].$refs.chartForm.validate())
      Promise.all(arr).then(res => {
        this.editChart.panelId = this.panelId
        const params = JSON.parse(JSON.stringify(this.editChart))
        if (params.param.valueMapping) {
          params.param.valueMapping.forEach(item => {
            delete item.uid
          })
        }
        if (params.type === 'group') {
          params.height = 1
        }
        if (!params.groupId) {
          params.groupId = 0
        }
        if (params.type !== 'gauge') {
          delete params.param.min
          delete params.param.max
        }
        if (!params.x && !params.y && this.from === 'endpointQuery') { // endpointQuery 新增 放在最后
          params.x = 0
          params.y = 999
        }
        if (this.from === 'explore') { // explore 新增 放在最后
          params.x = 0
          params.y = 999
        }
        if (!params.x && !params.y && this.from === 'chartTemp') { // chartTemp 新增 在第一位
          params.x = 0
          params.y = 0
        }
        if (isNaN(params.y) && isNaN(params.y) && params.groupId) { // group 内的坐标需要单独计算
          params.x = 0
          params.y = 999
        }
        if (isNaN(params.y) && isNaN(params.y)) {
          params.x = this.chartLastPosition.x + params.span > 12 ? 0 : this.chartLastPosition.x
          params.y = this.chartLastPosition.y + 12
        }
        if (params.x + params.span > 12) {
          params.x = 0
          params.y += 1
          resetFlag = true
        }
        delete params.panel
        if (params.type === 'table') {
          delete params.param.tags
        }
        if (params.datasource === 'system' && params.param.datasource[0].filter) {
          params.param.datasource[0].filter = params.param.datasource[0].filter.filter(item => item.value)
        }
        if (params.id) { // 修改
          this.$put('visual/panel/chart', params).then(response => {
            if (response.code === 200) {
              this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
              if (resetFlag) {
                bus.$emit('creat-chart-success', {
                  ...params,
                  cb: function () {
                    self.$emit('on-create-success', { id: this.panelId, name: this.panelName })
                    self.esc(true)
                  }
                })
              } else {
                self.$emit('on-create-success', { id: this.panelId, name: this.panelName })
                self.esc(true)
              }
            } else {
              this.$message.error(response.msg)
            }
          })
        } else { // 新增
          this.$post('visual/panel/chart', params).then(response => {
            if (response.code === 200) {
              this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
              if (resetFlag) {
                bus.$emit('creat-chart-success', {
                  ...params,
                  cb: function () {
                    self.$emit('on-create-success', { id: this.panelId, name: this.panelName })
                    self.esc(true)
                  }
                })
              } else {
                self.$emit('on-create-success', { id: this.panelId, name: this.panelName })
                self.esc(true)
              }
            } else {
              this.$message.error(response.msg)
            }
          })
        }
      }).catch(res => {
        this.$refs['childrenFrom' + this.editChart.datasource].showError()
        // console.info(res)
      })
    },
    selectPanel (panel) {
      this.panelName = panel.name
      this.editChart.panelName = panel.name
      this.panelId = panel.id
      this.editChart.groupId = ''
      this.$get('visual/panel/chart?panelId=' + this.panelId + '&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.groupArr = []
          response.data.list.forEach((item, index) => {
            if (item.type === 'group') {
              this.groupArr.push({ id: item.id, name: item.name })
            }
          })
        }
      })
    },
    panelReload (panelName) { // 刷新panel下拉框
      if (panelName) {
        this.panelName = panelName
      }
      this.$emit('reloadOnlyPanel')
    },
    getGroupList () {
      this.$get('visual/panel/chart?panelId=' + this.panelId + '&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.groupArr = []
          response.data.list.forEach((item, index) => {
            if (item.type === 'group') {
              this.groupArr.push({ id: item.id, name: item.name })
            }
          })
        }
      })
    },
    datasourceChange () {
      if (this.editChart.datasource == 'metrics') {
        this.editChart = {
          ...this.editChart,
          span: 4,
          height: 4,
          unit: 2,
          type: 'line',
          min: 0,
          max: 100,
          elements: [{ expression: '', legend: '', type: 'expert', id: '', name: 'A', state: 1 }],
          param: {
            stack: 0,
            nullType: 'null',
            legend: { placement: 'bottom', values: [] },
            enable: {
              thresholds: false,
              legend: true,
              valueMapping: false,
              visibility: false
            },
            thresholds: [{ value: undefined, color: '#eeeeeeff' }],
            showHeader: this.editChart.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            }
          }
        }
      }
      if (this.editChart.datasource == 'logs') {
        this.editChart = {
          ...this.editChart,
          span: 4,
          height: 4,
          unit: 2,
          type: 'log',
          elements: [{ expression: '', legend: '', type: 'expert', id: '', name: 'A', state: 1 }],
          param: {
            enable: {
              thresholds: false,
              legend: true,
              valueMapping: false,
              visibility: false
            },
            limit: 100,
            showHeader: this.editChart.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            }
          }
        }
      }
      if (this.editChart.datasource == 'system') {
        this.editChart = {
          ...this.editChart,
          span: 4,
          height: 4,
          unit: 2,
          type: 'stat',
          param: {
            refer: 0,
            nullType: 'null',
            statistics: 'last',
            text: 'value',
            min: 0,
            max: 100,
            enable: {
              thresholds: false,
              legend: true,
              valueMapping: false,
              visibility: false
            },
            datasource: [{
              name: 'System',
              type: 'asset',
              systemGroup: '',
              systemSelect: '',
              group: '',
              select: '',
              limit: 100,
              sort: 'desc',
              legend: ''
            }
            ],
            valueMapping: [],
            showHeader: this.editChart.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            }
          }
        }
        delete this.editChart.elements
      }
      if (this.editChart.datasource == 'misc') {
        this.editChart = {
          ...this.editChart,
          span: 4,
          height: 4,
          type: 'url',
          param: {
            enable: {
              thresholds: false,
              legend: true,
              valueMapping: false,
              visibility: false
            },
            url: '',
            showHeader: this.editChart.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            }
          }
        }
        delete this.editChart.elements
      }
    },
    editChartChange (newEditChart) {
      this.editChart = {
        ...JSON.parse(JSON.stringify(newEditChart)),
        name: this.editChart.name,
        remark: this.editChart.remark,
        groupId: this.editChart.groupId,
        panelName: this.editChart.panelName,
        varType: this.editChart.varType
      }
    },
    preview (show) {
      if (show) {
        this.prevChart = ''
        setTimeout(() => {
          const start = new Date().setHours(new Date().getHours() - 1)
          const end = new Date()
          this.timeRange = [bus.computeTimezoneTime(start), bus.computeTimezoneTime(end)]
          this.prevChart = {
            ...lodash.cloneDeep(this.editChart),
            loaded: true
          }
          this.prevChart.param.showHeader = true
        }, 200)
      }
      this.previewShow = show
    }
  },
  created () {
  },
  mounted () {
    this.getGroupList()
  },
  watch: {
    showPanel: {
      immediate: true,
      deep: true,
      handler () {
        if (this.showPanel && (this.showPanel.id || this.from === 'chartTemp')) {
          this.panelId = this.showPanel.id
          this.panelName = this.showPanel.name
          this.editChart.panelName = this.showPanel.name
        }
      }
    },
    chart: {
      deep: true,
      immediate: true,
      handler (n) {
        const obj = JSON.parse(JSON.stringify(n))
        if (obj.param && !obj.param.valueMapping) {
          obj.param.valueMapping = []
        }
        if (obj.param && !obj.param.thresholds) {
          obj.param.thresholds = []
        }
        if (obj.groupId === -1) {
          obj.groupId = ''
        }
        if (obj.param) {
          if (!obj.param.min) {
            obj.param.min = 0
          }
          if (!obj.param.max) {
            obj.param.max = 100
          }
          if (!obj.param.text && obj.param.display) {
            obj.param.text = obj.param.display
          }
          if (!obj.param.link) {
            this.$set(obj.param, 'link', '')
          }
          if (!obj.param.enable) {
            obj.param.enable = {
              thresholds: false,
              legend: false,
              valueMapping: false,
              visibility: false
            }
          }
          if (!obj.param.visibility) {
            obj.param.visibility = {
              varName: '',
              operator: '',
              varValue: '',
              result: ''
            }
          }
          if (obj.type === 'group' && !obj.param.repeat) {
            obj.param.repeat = {
              variable: ''
            }
          }
          // this.editChart.varType = 1
          if (obj.param.enable.legend && !obj.param.legend) {
            obj.param.legend = { placement: 'bottom', values: [], show: true }
          }
          if (obj.param.datasource && !obj.param.datasource[0].legend) {
            obj.param.datasource[0].legend = ''
          }
          if (obj.param.valueMapping) {
            obj.param.valueMapping.forEach(item => {
              item.uid = getUUID()
              if (!item.show) {
                item.show = false
              }
              if (item.text && !item.display) {
                item.display = item.text
              } else if (!item.display) {
                item.display = '{{A.$value}}'
              }
              if (item.columns && !item.column) {
                item.column = item.columns
              }
            })
          }
        }
        this.editChart = obj
        if (this.stableTime) {
          clearTimeout(this.stableTime)
          this.stableTime = null
        }
      }
    },
    'editChart.type': {
      handler (n) {
        if (n === 'group') {
          this.editChart.groupId = ''
        } else {
          this.editChart.param.enable.visibility = false
          this.editChart.param.visibility.varName = ''
          this.editChart.param.visibility.operator = ''
          this.editChart.param.visibility.varValue = ''
          this.editChart.param.visibility.result = ''
        }
      }
    },
    editChart: {
      deep: true,
      handler () {

      }
    }
  }
}
</script>
