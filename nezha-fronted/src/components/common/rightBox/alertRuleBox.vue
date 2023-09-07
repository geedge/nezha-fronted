<template>
  <div v-clickoutside="{obj: editAlertRule, func: clickOutside}" class="right-box right-box-alert-rule" ref="rightBox">
    <div class="right-box__header">
      <!-- begin--标题-->
      <div class="header__title">{{alertRule.id ? $t("alert.config.editAlertConfig") : $t("overall.createAlertRule")}}</div>
      <!-- end--标题-->
      <div class="header__operation">
        <span v-cancel="{obj: editAlertRule, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>

    <!-- begin--表单-->
    <div class="right-box__container alert-box-threshold">
      <div class="container__form">
        <el-form ref="alertRuleForm" :model="editAlertRule" :rules="rules" label-position = "top" label-width="120px">
          <!--name-->
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input id="alert-box-input-name" ref="alertName" v-model="editAlertRule.name" maxlength="64" placeholder="" show-word-limit size="small"></el-input>
          </el-form-item>
          <!--type-->
          <el-form-item :label="$t('overall.type')" prop="type">
            <el-select
              v-model="editAlertRule.type"
              class="right-box__select"
              popper-class="right-box-select-top prevent-clickoutside"
              size="small"
              :disabled="showTypeSelect"
              @change="selectAlertRuleMetric">
              <el-option
                v-for="item in searchMetrics"
                :key="editAlertRule.type+ '-' + item.value"
                :label="item.label"
                :value="item.value"></el-option>
            </el-select>
          </el-form-item>

          <div class="alert-rule-split-title">{{$t('alert.config.condition')}}</div>
          <!--expr-->
          <el-form-item  v-if="showSnmpTrap" :label='$t("config.exprTemp.expression")' prop="expr">
              <div v-if="showMetrics" key="metric">
                <el-row style="line-height: 32px;">
                  <promql-input
                    v-if="showMetrics"
                    :from-father-data="true"
                    :metricOptionsParent="metricOptions"
                    id="alert-box-input-promql-metrics"
                    ref="promql"
                    :expression-list.sync="expressions"
                    :index="0"
                    :plugins="['metric-selector','metric-input']"
                    :required="true"
                    type="metric"
                    :styleType="3"
                    @change="metricChange"
                  ></promql-input>
                </el-row>
              </div>
              <div v-else key="log">
                <el-row style="line-height: 32px;">
                  <promql-input
                    v-if="!showMetrics"
                    id="alert-box-input-promql-logs"
                    ref="promql"
                    :expression-list.sync="expressions"
                    :index="0"
                    :plugins="['metric-selector','metric-input']"
                    :required="true"
                    type="log"
                    :styleType="3"
                    @change="metricChange"
                  ></promql-input>
                </el-row>
              </div>
            </el-form-item>
          <el-form-item label="OID" prop="expr" v-if="!showSnmpTrap" key="OID">
            <el-input id="alert-box-input-oid" v-model="editAlertRule.expr" size="small" type="text"></el-input>
          </el-form-item>
          <!--threshold-->
          <div class="threshold-list">
              <el-form-item
                :label="$t('alert.config.threshold')"
                key="threshold"
                class="threshold-list-content"
                prop="condition"
                :rules="[
                { required: true, message: $t('validate.required'), trigger: 'blur'},
                { validator: conditionValidator, trigger: 'change'},
            ]">
                <el-form-item v-for="(item,index) of editAlertRule.condition" :key="'threshold-list' + index" :prop="'condition.' + index + '.value'"
                  :rules="[
                    { validator: thresholdValidator, trigger: 'blur' , item:item},
                    { validator: showError, trigger: 'blur' , item:item},
                  ]"
                >
                  <div class="threshold-item">
                    <div class="threshold-item-left" :style="{background:item.color}" >{{item.name}}</div>
                    <div class="threshold-item-center">
                      <span>{{$t('alert.config.when')}} Result</span>
                      <el-select :disabled="!showSnmpTrap" :value="item.operator" @change="operatorChange(item,index,$event)" class="hide-icon" popper-class="prevent-clickoutside" size="small">
                        <el-option v-for="subItem in filterOperators" :id="'operator-'+subItem.key" :key="'Result' + subItem.value" :label="subItem.label" :value="subItem.value"></el-option>
                      </el-select>
                    </div>
                    <el-input v-model="item.value" @change="thresholdBlur" :placeholder="item.operator==='=~'?$t('alert.config.enterRegular'):$t('alert.config.enterThreshold')" size="small" type="text" style="flex:1"/>
                  </div>
                </el-form-item>
              </el-form-item>
              <el-form-item class="hide-error" prop="timeout" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" style="margin-bottom:0;">
                  <div class="threshold-item">
                    <div class="threshold-item-left" style="margin-right:24px">{{$t('alert.config.normal')}}</div>
                    <el-input-number
                      size="small"
                      placeholder="N"
                      :min="15"
                      v-model="editAlertRule.timeout"
                      :controls="false"
                      style="width:80px"
                    />
                    <div class="threshold-item-msg" style="margin-left:8px">
                      <span v-if="showSnmpTrap">{{$t('alert.config.detectionNormal')}}</span>
                      <span v-else>{{$t('alert.config.secondNormal')}}</span>
                    </div>
                  </div>
                </el-form-item>
          </div>
          <!--inr-->
          <el-form-item v-if="showSnmpTrap" :label="$t('alert.config.inr')" prop="inr"  class="half-form-item">

            <el-input-number
              :min="15"
              :max="86400"
              id="alert-box-input-inr"
              :controls="false"
              v-model="editAlertRule.inr"
              :placeholder="$t('alert.config.inrPlaceholder')"
              size="small"
              type="text"
              :disabled="!showSnmpTrap"
              class="append_unit"
              :data-unit="$t('overall.seconds')"
            >
            </el-input-number>

          </el-form-item>
          <!--last-->
          <el-form-item v-if="showSnmpTrap" :label="$t('alert.config.for')" prop="last"  class="half-form-item alert-box-duration" :rules=" [
            { required: showSnmpTrap, message: this.$t('validate.required'), trigger: 'change' },
            ]"
          >
            <el-input id="alert-box-input-last" :controls="false" v-model.number="editAlertRule.last" placeholder="" size="small" :disabled="!showSnmpTrap" type="text">
              <template slot="append">{{$t('overall.seconds')}}</template>
            </el-input>
          </el-form-item>
          <!--unit-->
          <el-form-item v-if="showSnmpTrap" :label="$t('dashboard.dashboard.chartForm.unit')" class="half-form-item" prop="unit" :rules="[{ required: this.editAlertRule.type !== 3, message: this.$t('validate.required'), trigger: 'blur' }]">
            <el-cascader id="alert-box-input-unit" v-model="editAlertRule.unit" :options="unitOptions" :props="{ expandTrigger: 'click',emitPath:false }" :show-all-levels="false" filterable
              placeholder=""
              popper-class="no-style-class dc-dropdown  unit-popper-class"
              size="small"
              :disabled="!showSnmpTrap"
              style="width: 100%"
            >
            </el-cascader>
          </el-form-item>

          <!-- notification -->
          <div class="alert-rule-split-title">{{ $t('alert.config.notificationConfig') }}</div>
          <!--summary-->
          <el-form-item :label="$t('alert.summary')" prop="summary">
            <el-input id="alert-box-input-summary" v-model="editAlertRule.summary" maxlength="512" placeholder="" rows="2" show-word-limit size="small" type="textarea"></el-input>
          </el-form-item>
          <!--description-->
          <el-form-item :label="$t('overall.remark')" prop="description">
            <el-input id="alert-box-input-description" v-model="editAlertRule.description" maxlength="256" placeholder="" rows="2" show-word-limit size="small" type="textarea"></el-input>
          </el-form-item>
          <!--notifyActive-->
          <el-form-item :label="$t('alert.config.notifyActive')" prop="notifyActive" class="half-form-item">
            <el-select
              id="alert-box-input-notifyActive"
              v-model="editAlertRule.notifyActive"
              class="right-box__select half-form-item"
              placeholder=""
              :popper-append-to-body="false"
              popper-class="prevent-clickoutside right-box-select-top"
              size="small"
              @change="receiverAndNotifyValidate"
            >
              <el-option
                :label="$t('overall.enabled')"
                :value="1">
              </el-option>
              <el-option
                :label="$t('overall.disabled')"
                :value="0">
              </el-option>
            </el-select>
          </el-form-item>
          <!--notifyExpired-->
          <el-form-item :label="$t('alert.config.notifyExpired')" prop="notifyExpired" class="half-form-item">
            <el-select
              id="alert-box-input-notifyExpired"
              v-model="editAlertRule.notifyExpired"
              class="right-box__select half-form-item"
              placeholder=""
              :popper-append-to-body="false"
              popper-class="prevent-clickoutside right-box-select-top"
              size="small"
              @change="receiverAndNotifyValidate"
            >
              <el-option
                :label="$t('overall.enabled')"
                :value="1">
              </el-option>
              <el-option
                :label="$t('overall.disabled')"
                :value="0">
              </el-option>
            </el-select>
          </el-form-item>
          <!--receiver-->
          <el-form-item :label="$t('alert.receiver')" prop="receiver" :rules="[{ required: editAlertRule.notifyExpired || editAlertRule.notifyActive, message: this.$t('validate.required'), trigger: 'blur' }]">
            <el-select
              id="alert-box-input-receiver"
              v-model.trim="editAlertRule.receiverShow"
              class="right-box__select"
              filterable
              multiple
              placeholder=""
              popper-class="prevent-clickoutside right-box-select-top"
              size="small"
              value-key="userId"
              @change="receiverShowChange"
            >
              <el-option
                style="width: 620px"
                v-for="(item, index) in userData"
                :key="'receiver' + index + item.id"
                :label="item.name"
                :value="item.id">
                <span class="user-name" :title="item.name">{{item.name}}</span><span class="user-username" :title="item.username">@{{item.username}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <!--notify-->
          <el-form-item :label="$t('alert.notify')" :rules="[{ required: editAlertRule.notifyExpired || editAlertRule.notifyActive, message: this.$t('validate.required'), trigger: 'change' }]" class="notify-box" prop="method" >
            <el-select id="alert-box-input-notify" v-model="editAlertRule.method" class="right-box__select" multiple placeholder="" :popper-append-to-body="false" popper-class="right-box-select-top prevent-clickoutside" size="small">
              <el-option v-for="item in notifyData" :id="'alert-severity-'+item.value" :key="'notify' + item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>

          <!-- effective -->
          <div class="alert-rule-split-title">{{ $t('alert.config.effectiveConfig') }}</div>
          <!--state-->
          <el-form-item :label="$t('overall.state')" prop="state" class="half-form-item">
            <el-select
              id="alert-box-input-state"
              v-model="editAlertRule.state"
              class="right-box__select half-form-item"
              placeholder=""
              :popper-append-to-body="false"
              popper-class="prevent-clickoutside right-box-select-top"
              size="small"
            >
              <el-option
                :label="$t('overall.enabled')"
                :value="1">
              </el-option>
              <el-option
                :label="$t('overall.disabled')"
                :value="0">
              </el-option>
            </el-select>
          </el-form-item>
          <!--schedEnable-->
          <el-form-item :label="$t('alert.config.schedEnable')" prop="schedEnable" class="half-form-item">
            <el-select
              id="alert-box-input-schedEnable"
              v-model="editAlertRule.schedEnable"
              class="right-box__select half-form-item"
              placeholder=""
              :popper-append-to-body="false"
              popper-class="prevent-clickoutside right-box-select-top"
              size="small"
            >
              <el-option
                :label="$t('overall.enabled')"
                :value="1">
              </el-option>
              <el-option
                :label="$t('overall.disabled')"
                :value="0">
              </el-option>
            </el-select>
          </el-form-item>
          <!--schedDays-->
          <el-form-item :label="$t('alert.config.schedDays')" prop="schedDays" :rules="[{ required: editAlertRule.schedEnable, message: this.$t('validate.required'), trigger: 'blur' }]">
            <el-select
              id="alert-box-input-schedDays"
              style="width: 100%"
              v-model="editAlertRule.schedDays"
              class="right-box__select half-form-item"
              placeholder=""
              multiple
              @change="$refs.alertRuleForm.validateField('schedDays')"
              popper-class="prevent-clickoutside right-box-select-top"
              size="small"
            >
              <el-option
                v-for="item in weekList"
                :key="'schedDays' + item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-top: -5px;">
            <el-time-picker
              style="width: calc(50% - 5px);display: inline-block"
              :value-format="'HH:mm'"
              :format="'HH:mm'"
              v-model="editAlertRule.schedStime"
              size="small"
              popper-class="right-box-select-top"
              :clearable = 'false'
              :picker-options="{
              }">
            </el-time-picker>
            <el-time-picker
              style="width: calc(50% - 5px);display: inline-block"
              :value-format="'HH:mm'"
              :format="'HH:mm'"
              size="small"
              popper-class="right-box-select-top"
              :clearable = 'false'
              v-model="editAlertRule.schedEtime"
              :picker-options="{
                minTime: editAlertRule.schedStime
              }">
            </el-time-picker>
          </el-form-item>

          <!--Data link-->
          <div class="chart-config">
            <div class="alert-rule-split-title">{{$t('dashboard.dashboard.chartForm.dataLink')}}</div>
            <draggable
              v-model="editAlertRule.param.dataLink"
              @start="start"
              @end="onEnd"
              :scroll-sensitivity="150"
              :options="{
              dragClass:'drag-dataLink-class',
              fallbackClass:'fallback-class',
              forceFallback:true,
              ghostClass:'chart-ghost',
              chosenClass:'choose-class',
              scroll:true,
              filter: '.drag-disabled',
              animation: 150,
              handle: '.drag-sort'
            }">
              <div v-for="(item,index) in editAlertRule.param.dataLink" :key="index" :class="item.error? 'is-item-box-error' : ''">
                <div class="chart-title chart-title-config">
                  <span class="chart-title-content">
                    <i class="nz-icon nz-icon-arrow-down" :class="item.show?'':'is-active'" @click="showDataLink(index)"></i>
                    <span v-show="!item.show" class="title-content-left">
                      <span>
                        {{item.title}}
                      </span>
                    </span>
                  </span>
                  <span>
                    <span @click="addDataLink()" :title="$t('tip.add')">
                      <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
                    </span>
                    <span style="margin-right: 5px" :title="$t('overall.duplicate')">
                      <i @click="copyDataLink(index)" class="nz-icon nz-icon-override"></i>
                    </span>
                    <span style="margin-right: 5px" class="nz-icon-minus-medium" :title="$t('overall.delete')">
                      <i @click="removeDataLink(index)" class="nz-icon nz-icon-minus"></i>
                    </span>
                    <span style="margin-right: 5px;fontSize:17px;cursor: grab;" class="drag-sort" :title="$t('dashboard.dashboard.chartForm.sort')">
                      <i class="nz-icon nz-icon-sort" style="cursor: grab;"></i>
                    </span>
                  </span>
                </div>
                <transition-group appear tag="div" name="el-zoom-in-top">
                  <el-row class="thresholds-item" v-show="item.show" :key="1">
                    <div>
                      <div class='mapping-display'>{{$t("dashboard.dashboard.chartForm.title")}}</div>
                    </div>
                    <!-- Title -->
                    <el-form-item :prop="'param.dataLink.' + index + '.title'" class="thresholds-from-item">
                      <el-input size="small" v-model="item.title"></el-input>
                    </el-form-item>
                    <div>
                      <div class='mapping-display'>{{$t('dashboard.dashboard.chartForm.openIn')}}</div>
                    </div>
                    <!-- Open in -->
                    <el-form-item :prop="'param.dataLink.' + index + '.openIn'" class="thresholds-from-item">
                      <el-select
                        v-model="item.openIn"
                        size="small"
                      >
                        <el-option value="newTab" :label="$t('dashboard.dashboard.chartForm.newTab')"></el-option>
                        <el-option value="currentTab" :label="$t('dashboard.dashboard.chartForm.currentTab')"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-row>
                  <el-row class="thresholds-item" v-show="item.show" :key="2">
                    <div>
                      <div class='mapping-display'>{{$t('dashboard.dashboard.chartForm.dataLinkUrl')}}</div>
                    </div>
                    <!-- url -->
                    <el-form-item :prop="'param.dataLink.' + index + '.url'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" class="thresholds-from-item">
                      <el-input v-model="item.url" size="small"  @change="hideError('dataLink',index)"/>
                    </el-form-item>
                  </el-row>
                </transition-group>
              </div>
            </draggable>
            <div @click="addDataLink" class="thresholds-add">
              {{$t('overall.addDataLink')}}
            </div>
          </div>

          <div class="alert-rule-split-title">{{ $t('overall.more') }}</div>
<!--          &lt;!&ndash;panel&ndash;&gt;-->
<!--          <el-form-item-->
<!--            class="form-item&#45;&#45;half-width"-->
<!--            :label="$t('overall.associateDashboard')"-->
<!--            prop="dashboard"-->
<!--          >-->
<!--            <select-panel @setPanelName="setPanelName" ref="selectPanel" :disabled="false" :filter-panel="filterPanel" :chart-box="true" :panel-lock="true" :show-panel="showPanel" :panelData="panelData" :placement="'bottom-start'" @selectPanel="selectPanel">-->
<!--              <template v-slot:header>-->
<!--                <div class="panel-select-header">-->
<!--                  <el-input id="chart-box-panelname" v-model="filterPanel" :placeholder="$t('overall.search')" clearable size="small" style="width: 596px"></el-input>-->
<!--                </div>-->
<!--              </template>-->
<!--              <template v-slot:trigger>-->
<!--&lt;!&ndash;                <el-input placeholder="" size="small" clearable v-model="panelName" :disabled="false"></el-input>&ndash;&gt;-->
<!--                <div class="alert-rule-box-dashboard">-->
<!--                  <div class="text-ellipsis alert-rule-box-dashboard-name" :title="panelName">{{panelName}}</div>-->
<!--                  <i class="nz-icon nz-icon-guanbi2" @click.stop="clearDashboard()"/>-->
<!--                </div>-->
<!--              </template>-->
<!--            </select-panel>-->
<!--          </el-form-item>-->
          <el-form-item :label="$t('alert.config.trbShot')" prop="trbShot">
            <rich-text-editor ref="richTextEditor" :edit-data="editAlertRule.trbShot" @after-init="afterInitRich"></rich-text-editor>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box__footer">
      <button id="alert-box-esc" v-cancel="{obj:editAlertRule,func:esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="alert-box-save" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import chartDataFormat from '../../chart/chartDataFormat'
import promqlInput from '../../page/dashboard/explore/promqlInput'
import { noSpecialChar, nzNumber } from '../js/validate'
import editRigthBox from '../mixin/editRigthBox'
import richTextEditor from '@/components/chart/richTextEditor'
import promqlInputMixin from '@/components/common/mixin/promqlInput'
import selectPanel from '@/components/common/popBox/selectPanel'
import draggable from 'vuedraggable'
export default {
  name: 'alertRuleBox',
  props: {
    alertRule: Object
  },
  components: {
    'promql-input': promqlInput,
    richTextEditor,
    draggable,
    selectPanel
  },
  mixins: [editRigthBox, promqlInputMixin],
  computed: {
    filterOperators () {
      if (this.editAlertRule.type != 3) {
        return this.operators.filter(item => item.value !== '=~')
      } else {
        return this.operators.filter(item => item.value == '=~')
      }
    }
  },
  data () {
    const nzOid = (rule, value, callback) => {
      if (this.editAlertRule.type === 3) {
        const Oid = /^(\d{1,9}\.){0,}[\d]+$/
        if (Oid.test(value)) {
          callback()
        } else {
          callback(new Error(this.$t('overall.oid')))
        }
      } else {
        callback()
      }
    }
    const nzInr = (rule, value, callback) => {
      if (!this.showSnmpTrap || (!value && isNaN(value))) {
        callback()
      }
      if (value < 15) {
        callback(new Error(this.$t('alert.config.inrError')))
      } else if (value > 86400) {
        callback(new Error(this.$t('alert.config.inrErrorMax')))
      } else {
        callback()
      }
    }
    return {
      promqlCount: 1,
      promqlKeys: [0],
      expressions: [''],
      legends: [''],
      searchMetrics: [
        {
          value: 1,
          label: this.$t('overall.metric')
        },
        {
          value: 2,
          label: this.$t('overall.logs')
        },
        {
          value: 3,
          label: 'SNMP trap'
        }
      ],
      showMetrics: true,
      showSnmpTrap: false,
      showTypeSelect: false,
      editAlertRule: {},
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: noSpecialChar, trigger: 'change' }
        ],
        expr: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: nzOid, trigger: 'blur' }
        ],
        severityId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        summary: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        operator: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        inr: [
          { validator: nzInr, trigger: 'blur' }
        ]
      },
      operators: [
        {
          label: '==',
          value: '=='
        },
        {
          label: '!=',
          value: '!='
        },
        {
          label: '>',
          value: '>'
        },
        {
          label: '<',
          value: '<'
        },
        {
          label: '>=',
          value: '>='
        },
        {
          label: '<=',
          value: '<='
        },
        {
          label: '=~',
          value: '=~'
        }
      ],
      unitOptions: chartDataFormat.unitOptions(),

      userData: [],
      notifyData: [],
      MetricsType: 1,
      weekList: [
        {
          value: 1,
          label: this.$t('week.Sun')
        }, {
          value: 2,
          label: this.$t('week.Mon')
        }, {
          value: 3,
          label: this.$t('week.Tue')
        }, {
          value: 4,
          label: this.$t('week.Wed')
        }, {
          value: 5,
          label: this.$t('week.Thu')
        }, {
          value: 6,
          label: this.$t('week.Fri')
        }, {
          value: 7,
          label: this.$t('week.Sat')
        }
      ],
      panelData: [],
      filterPanel: '',
      panelName: '',
      showPanel: { // panel下拉列表
        id: '',
        name: ''
      }
    }
  },
  methods: {
    nzNumber: nzNumber,
    thresholdValidator (rule, value, callback) {
      if (rule.item.operator === '=~' || !value) {
        callback()
      } else if (isNaN(Number(value))) {
        callback(new Error(this.$t('validate.number')))
      } else {
        callback()
      }
    },
    thresholdBlur () {
      this.$refs.alertRuleForm.validateField('condition')
    },
    conditionValidator (rule, value, callback) {
      let flag = true
      if (value.length) {
        value.forEach(item => {
          if (item.value) {
            flag = false
          }
        })
      }
      if (flag) {
        this.conditionValidatorError = true
        this.editAlertRule.condition.forEach((item, index) => {
          this.$refs.alertRuleForm.validateField('condition.' + index + '.value') // 移除from表单的 condition 验证
        })
        callback(new Error())
      } else {
        this.conditionValidatorError = false
        this.editAlertRule.condition.forEach((item, index) => {
          this.$refs.alertRuleForm.validateField('condition.' + index + '.value') // 移除from表单的 condition 验证
        })
        callback()
      }
    },
    showError (rule, value, callback) {
      if (this.conditionValidatorError) {
        callback(new Error(this.$t('alert.config.thresholdOnly')))
      } else {
        callback()
      }
    },
    clickOutside () {
      this.esc(false)
    },
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      if (this.editAlertRule.type !== 3) {
        this.editAlertRule.expr = this.expressions[0]
      }

      const param = this.$lodash.cloneDeep(this.editAlertRule.param)
      param.dataLink.forEach(item => {
        delete item.error
      })

      // 处理condition 删除掉不需要的属性
      const condition = this.editAlertRule.condition.map(item => {
        return {
          id: item.id,
          weight: item.weight,
          operator: item.operator,
          value: item.value
        }
      }).filter(item => item.value)
      const params = {
        ...this.editAlertRule,
        method: this.editAlertRule.method.join(','),
        type: this.editAlertRule.type,
        condition,
        param
      }
      if (this.editAlertRule.trbShot && this.editAlertRule.trbShot == '<div  class="editor-core ql-container ql-snow"><div class="ql-editor"><p><br></p></div></div>') {
        this.editAlertRule.trbShot = ''
      }
      this.$refs.alertRuleForm.validate((valid) => {
        if (valid) {
          params.receiver = this.editAlertRule.receiverShow.join(',')
          params.schedDays = this.editAlertRule.schedDays.join(',')
          params.trbShot = this.$refs.richTextEditor.getContent()
          params.condition = JSON.stringify(params.condition)
          if (this.editAlertRule.id) {
            this.$put('alert/rule', params).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post('alert/rule', params).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          }
        } else {
          this.datalinkError()
          this.prevent_opt.save = false
          return false
        }
      })
    },
    del () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('alert/rule?ids=' + this.editAlertRule.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    getUserList () {
      this.$get('sys/user', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.userData = response.data.list
        }
      })
    },
    metricChange (val) {
      this.editAlertRule.expr = val
    },
    getNotifyData () {
      this.$get('alert/notify/method', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.notifyData = response.data.list
        }
      })
    },
    getDashboard () {
      this.$get('visual/dashboard?pageNo=1&pageSize=-1').then(response => {
        if (response.code === 200) {
          this.panelData = response.data.list
          setTimeout(() => {
            this.showPanel = {
              id: this.editAlertRule.dashboardId,
              name: ''
            }
          }, 100)
        }
      })
    },
    selectPanel (dashboard) {
      this.panelName = dashboard.name
      this.editAlertRule.panelName = dashboard.name
      this.editAlertRule.dashboardId = dashboard.id
    },
    receiverShowChange (val) {
      this.editAlertRule.receiver = [...this.editAlertRule.receiverShow].join(',')
      this.$refs.alertRuleForm.validateField('receiver')
    },
    validateNotify (rule, value, callback) {
      if (this.editAlertRule.receiverShow.length && value.length === 0) {
        callback(new Error(this.$t('validate.required')))
      } else {
        callback()
      }
    },
    receiverAndNotifyValidate () {
      if (!this.editAlertRule.notifyExpired && !this.editAlertRule.notifyActive) {
        this.$refs.alertRuleForm.clearValidate('receiver')
        this.$refs.alertRuleForm.clearValidate('method')
      }
    },
    selectAlertRuleMetric (val) {
      if (val === 1) {
        this.showSnmpTrap = false // showSnmpTrap 为 true 时显示 expr,threshold,unit
        this.showMetrics = true
        this.expressions = ['']
        this.$refs.alertRuleForm.clearValidate('expr') // 移除from表单的 expr 验证
        this.$nextTick(() => {
          this.showSnmpTrap = true
        })
        // type为1时 不能输入正则
        this.editAlertRule.condition.forEach((item, index) => {
          item.operator = '>'
          item.value = ''
          this.$refs.alertRuleForm.clearValidate('condition.' + index + '.value') // 移除from表单的 condition 验证
        })
        this.$refs.alertRuleForm.clearValidate('condition') // 移除from表单的 condition 验证
      } else if (val === 2) {
        this.showMetrics = false
        this.expressions = ['']
        // showMetrics 为 false 时,展示 Logs label
        this.showSnmpTrap = false // showSnmpTrap 为 true 时显示 expr,threshold,unit
        this.$nextTick(() => {
          this.showSnmpTrap = true
        })
        this.$refs.alertRuleForm.clearValidate('expr') // 移除from表单的 expr 验证
        // type为2时 不能输入正则
        this.editAlertRule.condition.forEach((item, index) => {
          item.operator = '>'
          item.value = ''
          this.$refs.alertRuleForm.clearValidate('condition.' + index + '.value') // 移除from表单的 condition 验证
        })
        this.$refs.alertRuleForm.clearValidate('condition') // 移除from表单的 condition 验证
      } else if (val === 3) {
        this.showSnmpTrap = false // showSnmpTrap 为 false 时,展示 OID
        this.showMetrics = false
        if (!this.editAlertRule.last) {
          this.editAlertRule.last = 60
        }
        // type为3时 只能输入正则
        this.editAlertRule.condition.forEach((item, index) => {
          item.operator = '=~'
          item.value = ''
          this.$refs.alertRuleForm.clearValidate('condition.' + index + '.value') // 移除from表单的 condition 验证
        })
        this.$refs.alertRuleForm.clearValidate('condition') // 移除from表单的 condition 验证
      }
    },
    afterInitRich () {
      this.$refs.alertName.focus()
    },
    // 比较符号变化
    operatorChange (item, index, value) {
      if (item.operator === '=~' || value === '=~') {
        item.value = ''
        this.$refs.alertRuleForm.clearValidate('condition.' + index + '.value') // 移除from表单的 condition 其中一个的验证
      }
      this.$refs.alertRuleForm.clearValidate('condition') // 移除from表单的 condition 验证
      item.operator = value
    },
    clearDashboard () {
      this.panelName = ''
      this.editAlertRule.dashboardId = ''
      this.showPanel = {
        id: '',
        name: ''
      }
    },
    setPanelName (node) {
      if (node) {
        this.panelName = node.data.name
      }
    },
    addDataLink () {
      this.editAlertRule.param.dataLink.push({
        show: true,
        title: '',
        url: '',
        openIn: 'newTab'
      })
    },
    copyDataLink (index) {
      this.editAlertRule.param.dataLink.push({ ...this.editAlertRule.param.dataLink[index] })
    },
    removeDataLink (index) {
      this.editAlertRule.param.dataLink.splice(index, 1)
    },
    showDataLink (index) {
      this.editAlertRule.param.dataLink[index].show = !this.editAlertRule.param.dataLink[index].show
    },
    datalinkError () {
      this.$refs.alertRuleForm.validate((blooen, object) => {
        Object.keys(object).forEach(item => {
          const keyArr = item.split('.')
          console.log(keyArr)
          if (keyArr.length >= 4) {
            this.editAlertRule[keyArr[0]][keyArr[1]][keyArr[2]].error = true
          }
        })
        if (!blooen) {
          this.$forceUpdate()
        }
      })
    },
    hideError (key, index) {
      if (!this.editAlertRule.param[key] || !this.editAlertRule.param[key].length) {
        return
      }
      this.editAlertRule.param[key][index].error = false
      this.$forceUpdate()
    },
    start () {
      document.body.classList.add('isDrag')
    },
    onEnd () {
      document.body.classList.remove('isDrag')
    }
  },
  mounted () {
    this.getUserList()
    this.getNotifyData()
    // this.getDashboard()
  },
  watch: {
    alertRule: {
      deep: true,
      immediate: true,
      handler (n, o) {
        this.isEdit = true
        const obj = this.$lodash.cloneDeep(n)
        if (!obj.dashboardId) {
          obj.dashboardId = ''
        }
        if (!obj.param) {
          obj.param = {
            dataLink: []
          }
        }
        this.editAlertRule = this.$lodash.cloneDeep(obj)
        this.showPanel.id = this.editAlertRule.dashboardId
        // 获取缓存中的告警等级列表
        const severityData = JSON.parse(localStorage.getItem('nz-severityDataWeight'))
        // 给condition赋值
        if (this.editAlertRule.condition && this.editAlertRule.condition.length) {
          this.editAlertRule.condition = JSON.parse(this.editAlertRule.condition)
          this.$set(this.editAlertRule, 'condition', severityData.map(item => {
            item = {
              ...item,
              value: '',
              operator: '>'
            }
            this.editAlertRule.condition.forEach(subItem => {
              if (item.id === subItem.id) {
                item = {
                  ...item,
                  operator: subItem.operator,
                  value: subItem.value
                }
              }
            })
            return item
          }))
        } else {
          this.$set(this.editAlertRule, 'condition', severityData.map(item => {
            return {
              ...item,
              value: '',
              operator: '>'
            }
          }))
        }

        if (this.editAlertRule.id || this.editAlertRule.name) {
          this.expressions = [this.editAlertRule.expr]
          this.showTypeSelect = !!this.editAlertRule.id // 当 edit 时禁用 type下拉框
          if (n.type === 1) {
            this.editAlertRule.type = 1
            setTimeout(() => {
              this.showSnmpTrap = true
            }, 150)
          } else if (n.type === 2) {
            setTimeout(() => {
              this.showSnmpTrap = true
            }, 150)
            this.showMetrics = false // showMetrics 为 false 时,展示 Logs label
            this.editAlertRule.type = 2
          } else if (n.type === 3) {
            this.showSnmpTrap = false // showSnmpTrap 为 false 时,展示 OID
            this.editAlertRule.inr = ''
            this.editAlertRule.type = 3
            return
          }
          this.$nextTick(() => {
            this.expressions.forEach((ex, index) => {
              if (ex) {
                this.$refs.promql && this.$refs.promql.metricChange(ex)
              }
            })
          })
        } else {
          setTimeout(() => {
            this.showSnmpTrap = true
          }, 150)
        }
      }
    }
  }
}
</script>
<style>
.hide-icon .el-input__suffix {
  display: none;
}
</style>
