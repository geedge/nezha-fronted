<template>
  <div v-clickoutside="{obj:editChart, func:clickOutside}" :class="boxClass" class="right-box right-box-chart">
    <transition v-if="from !== 'chartTemp'" name="right-box">
      <panel-box v-if="!showPanel.type" ref="panelBox2" :panel="panel" @reload="panelReload"></panel-box>
    </transition>

    <div class="right-box__header">
      <div class="header__title" v-if="from !== 'chartTemp'">{{editChart.id ? $t("dashboard.panel.editChartTitle") : $t("dashboard.panel.createChartTitle")}}</div>
      <div class="header__title" v-if="from === 'chartTemp'">{{editChart.id ? $t("dashboard.panel.editChartTempTitle") : $t("dashboard.panel.createChartTempTitle")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editChart, func: clickOutside}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>

    <!-- begin--表单-->
    <div class="right-box-form-box right-box__container" style="overflow: hidden">
      <el-form ref="chartForm" :model="editChart" :rules="rules" label-position= "top" label-width="120px">
        <el-form-item :label='$t("dashboard.panel.chartForm.name")' prop="title">
          <el-input maxlength="64" show-word-limit size="small" v-model="editChart.name" id="chart-box-title"></el-input>
        </el-form-item>

        <div class="form-items--half-width-group">
        <!--panel-->
        <el-form-item
          class="form-item--half-width"
          v-if="showPanel.type !== fromRoute.project && showPanel.type !== fromRoute.asset && showPanel.type !== fromRoute.endpoint && showPanel.type !== fromRoute.model && from!=='chartTemp'"
          :label="$t('dashboard.panel.title')"
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
          <el-input  maxlength="256" show-word-limit v-model="editChart.remark" :autosize="{ minRows: 1, maxRows: 6}" type="textarea"/>
        </el-form-item>

        <!--title-->
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.dataConfig')}}</span>
        </div>
        <el-tabs v-model="editChart.datasource" @tab-click="datasourceChange">
          <el-tab-pane label="Metrics" name="1">
            <metrics-chart-config v-if="editChart.datasource == 1" :params.sync="editChart"/>
          </el-tab-pane>
          <el-tab-pane label="Logs" name="2">
            <logs-chart-config  v-if="editChart.datasource == 2" :params.sync="editChart"/>
          </el-tab-pane>
          <el-tab-pane label="System" name="3">
            <system-chart-config  v-if="editChart.datasource == 3" :params.sync="editChart"/>
          </el-tab-pane>
          <el-tab-pane label="Other" name="4">
            <other-chart-config  v-if="editChart.datasource == 4" :params.sync="editChart"/>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>
    <!--底部按钮-->
    <div class="right-box__footer">
      <button id="chart-box-esc" v-cancel="{obj:editChart,func:esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button v-if="showPanel.type && showPanel.type == 'model'" id="chart-box-Sync" v-has="'panel_chart_edit'" class="footer__btn">
        <span>{{$t('overall.SyncSave')}}</span>
      </button>
      <button v-else-if="from!=='chartTemp'" id="chart-box-preview" class="footer__btn">
        <span>{{$t('overall.preview')}}</span>
      </button>
      <button id="chart-box-save" v-has="'panel_chart_add'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { fromRoute } from '@/components/common/js/constants'
import editRigthBox from '@/components/common/mixin/editRigthBox'
import { resetZIndex } from '@/components/common/js/common'
import chartPreview from '@/components/charts/chartPreview'
import alertChartParam from '@/components/page/dashboard/alertChartParam'
import promqlInput from '@/components/page/dashboard/explore/promqlInput'
import richTextEditor from '@/components/charts/richTextEditor'
import selectPanel from '@/components/common/popBox/selectPanel'
import nezhaColor from '@/components/common/nezhaColor'
import diagram from '@/components/common/ChartDiagram/diagram'
import metricsChartConfig from '@/components/common/rightBox/chart/metricsChartConfig'
import logsChartConfig from '@/components/common/rightBox/chart/logsChartConfig'
import otherChartConfig from '@/components/common/rightBox/chart/otherChartConfig'
import systemChartConfig from '@/components/common/rightBox/chart/systemChartConfig'
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
    System,
    'chart-preview': chartPreview,
    'alert-chart-param': alertChartParam,
    'promql-input': promqlInput,
    'rich-text-editor': richTextEditor,
    selectPanel,
    nezhaColor,
    diagram,
    metricsChartConfig,
    logsChartConfig,
    systemChartConfig,
    otherChartConfig
  },
  data () {
    return {
      fromRoute,
      editChart: {
        name: '',
        remark: ''
      },
      panel: {
        id: '',
        name: ''
      },
      filterPanel: '',
      groupArr: [],
      panelName: '',
      rules: {
      }
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
    selectPanel (panel) {
      this.panelName = panel.name
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
    datasourceChange (val, e) {
      console.log(val, e, this.editChart.datasource)
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
        if (this.showPanel.id || this.from === 'chartTemp') {
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
        this.editChart = JSON.parse(JSON.stringify(n))
        if (this.editChart.groupId === -1) {
          this.editChart.groupId = ''
        }
      }
    }
  }
}
</script>
