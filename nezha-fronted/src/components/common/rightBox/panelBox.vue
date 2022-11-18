<template>
  <div v-clickoutside="{obj:editPanel,func:clickOutside}" class="right-box right-box-panel">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editPanel.id ? ($t("dashboard.panel.editPanelTitle")) : $t("dashboard.panel.createPanelTitle")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editPanel, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="form" :model="editPanel" :rules="rules" label-position = "top" label-width="120px" size="small">
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input id="dc-box-input-name" v-model="editPanel.name" maxlength="64" placeholder="" show-word-limit size="small" :disabled="isBottom"></el-input>
          </el-form-item>
          <!--remark-->
           <el-form-item :label='$t("overall.remark")' class="range-time" prop="remark">
            <el-input
              v-model="editPanel.remark"
              maxlength="256"
              size="small" :rows="2"
              show-word-limit
              type="textarea">
            </el-input>
          </el-form-item>

          <!-- chartShare -->
          <el-form-item :label="$t('dashboard.panel.chartTooltip')" class="item-receivers" prop="chartShare">
            <el-select v-model="editPanel.param.chartShare" clearable  placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="chartType">
              <el-option value="none" label="Default">
              <span class="panel-dropdown-label-txt" >{{$t('config.assetLabel.default')}}</span>
              </el-option>
            <el-option value="crosshair" label="Share crosshair">
              <span class="panel-dropdown-label-txt" >{{$t('dashboard.panel.crosshair')}}</span>
              </el-option>
              <el-option value="tooltip" label="Share tooltip">
              <span class="panel-dropdown-label-txt" >{{$t('dashboard.panel.shareTooltip')}}</span>
              </el-option>
            </el-select>
            <div class="item-receivers-text">{{$t('dashboard.panel.chartTooltipText')}}</div>
          </el-form-item>

          <!-- variable -->
          <div
            class="variable-box"
          >
            <div class="form__sub-title" style="margin-bottom:0px">
              <span>{{$t('dashboard.panel.variables')}}</span>
            </div>
            <draggable
              v-model="editPanel.param.variables"
              :scroll-sensitivity="150"
              :options="{
                dragClass:'drag-columns-class',
                fallbackClass:'fallback-class',
                forceFallback:true,
                ghostClass:'chart-ghost',
                chosenClass:'choose-class',
                scroll:true,
                filter: '.drag-disabled',
                animation: 150,
                handle: '.drag-sort'
              }">
              <el-row
                v-for="(item,index) of editPanel.param.variables"
                :key="item.uid"
                style="margin-top: 10px"
              >
                <div class="variable-title">
                  <span class="variable-title-left">
                    <i class="nz-icon nz-icon-arrow-down" :class="item.collapse?'is-active':''" @click.stop="dropVariable(index,item)"></i>
                    <span v-show="item.collapse">{{item.name}}</span>
                  </span>
                  <span style="display:flex;align-items:center">
                    <span @click="showVariable(index,item)" class="nz-icon-minus-medium" style="margin-right: 6px;padding-left: 10px">
                      <i v-if="item.show" class="nz-icon nz-icon-mimakejian" :title="$t('overall.visible')"></i>
                      <i v-else class="nz-icon nz-icon-mimabukejian" :title="$t('overall.invisible')"></i>
                    </span>
                    <span @click="addVariable()" style="margin-right: 6px" :title="$t('tip.add')">
                      <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
                    </span>
                    <span @click="copyVariable(item)" style="margin-right: 6px" :title="$t('overall.duplicate')">
                      <i  class="nz-icon nz-icon-override"></i>
                    </span>
                    <span @click="removeVariable(index)" class="nz-icon-minus-medium" style="margin-right: 6px" :title="$t('overall.delete')">
                      <i  class="nz-icon nz-icon-minus"></i>
                    </span>
                    <span style="margin-right: 5px;fontSize:17px;cursor: grab;" class="drag-sort" :title="$t('dashboard.panel.chartForm.sort')">
                      <i class="nz-icon nz-icon-sort" style="cursor: grab;"></i>
                    </span>
                  </span>
                </div>
                <transition name="el-zoom-in-top">
                  <div class="form-items--half-width-group" v-if="!item.collapse" style="margin-top: 16px">
                    <!-- Name -->
                    <el-form-item class="form-item--half-width" :label='$t("overall.name")' :prop="'param.variables.' + index + '.name'"
                      :rules="[
                      { required: true, message: $t('validate.required'), trigger: 'blur'},
                      { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: $t('dashboard.panel.matchRegex'), trigger: 'blur'},
                      { validator: variableValidator,trigger: 'blur'},
                      ]"
                    >
                      <el-input v-model="item.name" :placeholder="$t('overall.placeHolder')" size="small"/>
                    </el-form-item>
                    <!-- Type -->
                    <el-form-item class="form-item--half-width" :label='$t("overall.type")' :prop="'param.variables.' + index + '.type'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}">
                      <el-select
                        v-model="item.type"
                        :placeholder="$t('overall.placeHolder')"
                        size="small"
                        @change="variableTypeChange(index)"
                        >
                        <el-option label="Query" value="query"></el-option>
                        <el-option label="Custom" value="custom"></el-option>
                      </el-select>
                    </el-form-item>
                    <!-- Query expression -->
                    <el-form-item class="query-expression" v-if="item.type==='query'" :prop="'param.variables.' + index + '.expression'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" key="expression" style="width: 100%;" >
                      <div slot="label">
                        <span>{{$t('dashboard.panel.queryExpression')}}</span>
                        <el-popover placement="top" trigger="hover" popper-class="prevent-clickoutside">
                          <table class="query-variable-table" width="640" cellspacing="5">
                            <thead>
                              <th>{{$t('overall.name')}}</th>
                              <th>{{$t('overall.remark')}}</th>
                            </thead>
                            <tbody>
                              <tr v-for="item in queryVariableList" :key="item.name">
                                <td width="200">{{item.name}}</td>
                                <td>{{item.description}}</td>
                              </tr>
                            </tbody>
                          </table>
                          <span slot="reference">
                            <i class="nz-icon nz-icon-info-normal" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                          </span>
                        </el-popover>
                      </div>
                      <el-input v-model="item.expression" placeholder="labels_names()" size="small"/>
                    </el-form-item>
                    <!-- Regex -->
                    <el-form-item v-if="item.type==='query'" :label="$t('dashboard.panel.regex')" :prop="'param.variables.' + index + '.regex'" key="regex" style="width: 100%;" >
                      <el-input v-model="item.regex" placeholder="/.*-(?<text>.*)-(?<value>.*)-.*/" size="small"/>
                    </el-form-item>
                    <!-- Custom values -->
                    <el-form-item v-if="item.type==='custom'" :label="$t('dashboard.panel.customValues')" :prop="'param.variables.' + index + '.customOptions'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" key="customOptions" style="width: 100%;" >
                      <el-input v-model="item.customOptions" placeholder="1,10,myKey:myValue" size="small"/>
                    </el-form-item>
                    <!-- Multi-value -->
                    <el-form-item class="form-item--half-width" :prop="'param.variables.' + index + '.multi'" style="margin-bottom: 0px">
                      <div slot="label">
                        <span>{{$t('dashboard.panel.multi')}}</span>
                        <el-popover placement="top" trigger="hover" popper-class="prevent-clickoutside multiTip">
                          <span>{{$t('dashboard.panel.multiTip')}}</span>
                          <span slot="reference">
                            <i class="nz-icon nz-icon-info-normal" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                          </span>
                        </el-popover>
                      </div>
                      <el-select
                        v-model="item.multi"
                        size="small"
                        >
                        <el-option :label="$t('overall.enabled')" :value="true"></el-option>
                        <el-option :label="$t('overall.disabled')" :value="false"></el-option>
                      </el-select>
                    </el-form-item>
                    <!-- All option -->
                    <el-form-item class="form-item--half-width" :prop="'param.variables.' + index + '.allOption'" style="margin-bottom: 0px">
                      <div slot="label">
                        <span>{{$t('dashboard.panel.allOption')}}</span>
                        <el-popover placement="top" trigger="hover" popper-class="prevent-clickoutside allOptionTip">
                          <span>{{$t('dashboard.panel.allOptionTip')}}</span>
                          <span slot="reference">
                            <i class="nz-icon nz-icon-info-normal" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                          </span>
                        </el-popover>
                      </div>
                      <el-select
                        v-model="item.allOption"
                        size="small"
                        >
                        <el-option :label="$t('overall.enabled')" :value="true"></el-option>
                        <el-option :label="$t('overall.disabled')" :value="false"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                </transition>
              </el-row>
            </draggable>
            <div @click="addVariable()" class="add-variable">{{$t('dashboard.panel.addVariable')}}</div>
          </div>

          <!--   Report  -->
          <div>
            <el-form-item class="item-report">
              <div class="form__sub-title">
                <span>{{$t('dashboard.panel.report')}}</span>
                <el-switch v-model="editPanel.param.report.enable" size="small"></el-switch>
              </div>
            </el-form-item>
            <div v-if="editPanel.param.report.enable">
              <transition name="el-zoom-in-top" >
                <div class="form-items--half-width-group">
                  <el-form-item
                    :label="$t('overall.startTime')"
                    class="form-item--half-width"
                    prop="param.report.schedule.stime"
                  >
                  <my-date-picker align="right" class=" "
                              v-model="editPanel.param.report.schedule.stime"
                              :format="timeFormatStrToDatePickFormat(dateFormatStr)"
                              popper-class="panel-time-picker-popper right-box-select-top"
                              prefix-icon=" "
                              @change="changeData(true)"
                              size="mini"
                              type="datetime">
                      </my-date-picker>
                    </el-form-item>
                  <el-form-item
                  :label="$t('overall.endTime')"
                  class="form-item--half-width"
                  prop="param.report.schedule.etime"
                  >
                     <my-date-picker align="right" class=" "
                            v-model="editPanel.param.report.schedule.etime"
                            :format="timeFormatStrToDatePickFormat(dateFormatStr)"
                            popper-class="panel-time-picker-popper right-box-select-top"
                            prefix-icon=" "
                            @change="changeData(false)"
                            size="mini"
                            type="datetime">
                         </my-date-picker>
                    </el-form-item>
                  <el-form-item :label='$t("dashboard.panel.period")' class="range-time" prop="param.report.range.unit">
                    <el-radio-group v-model="editPanel.param.report.range.unit" size="small">
                      <el-radio-button label="day">{{ $t("dashboard.panel.prevDay") }}</el-radio-button>
                      <el-radio-button label="week">{{ $t("dashboard.panel.prevWeek") }}</el-radio-button>
                      <el-radio-button label="month">{{ $t("dashboard.panel.prevMonth") }}</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item
                    :label="$t('backup.schedule')"
                    prop="param.report.schedule.type"
                    class="form-tabs">
                    <el-tabs
                      v-model="editPanel.param.report.schedule.type"
                      type="card"
                      @tab-click="datasourceChange"
                      class="backups-info-tab"
                    >
                      <el-tab-pane :label="$t('backup.Daily')" name="2"></el-tab-pane>
                      <el-tab-pane :label="$t('backup.Weekly')" name="3"></el-tab-pane>
                      <el-tab-pane :label="$t('backup.Monthly')" name="4"></el-tab-pane>
                    </el-tabs>
                  </el-form-item>
                  <el-form-item
                    v-if="isShow === 2 || isShow === 3 ? true :false"
                    :label="$t('backup.RepeatEvery')"
                    prop="param.report.schedule.repeat"
                    class="form-day-week">
                    <el-input
                      size="small"
                      v-model="editPanel.param.report.schedule.repeat"
                      id="chart-box-title"
                      v-if="isShow === 3 ? true :false">
                      <template slot="append">{{ $t("el.datepicker.week") }}</template>
                    </el-input>
                    <el-input
                      size="small"
                      v-model="editPanel.param.report.schedule.repeat"
                      id="chart-box-title"
                      v-if="isShow === 2 ? true :false" key="2">
                      <template slot="append">{{ $t("backup.day") }}</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item v-if="isShow === 3 ? true : false"
                  :rules="isShow === 3 ? [
                    { required: true, message: $t('validate.required'), trigger: 'change'}] :[{ required: false}]"
                  :label='$t("backup.WeekOn")' class="range-time" prop="param.report.schedule.nums" key="3">
                    <el-checkbox-group
                      v-model="editPanel.param.report.schedule.nums">
                      <el-checkbox-button
                        v-for="(item,index) in week"
                        :label="index + 1"
                        :key="index"
                        >{{item}}</el-checkbox-button>
                    </el-checkbox-group>
                  </el-form-item>
                  <el-form-item
                    v-if="isShow === 4 ? true : false"
                   :rules="isShow === 4 ? [
                    { required: true, message: $t('validate.required'), trigger: 'change'}] :[{ required: false}]"
                    :label="$t('backup.DayOfMonth')"
                    prop="param.report.schedule.nums"
                    class="check-month_box"
                    id="day-of-month" key="4"
                  >
                    <el-checkbox-group v-model="editPanel.param.report.schedule.nums">
                      <el-checkbox-button
                      v-for="(item, index) in month"
                      :label="index === 31 ? -1 : index + 1"
                      :key="item"
                      >{{ item }}</el-checkbox-button>
                    </el-checkbox-group>
                  </el-form-item>
                  <el-form-item :label="$t('dashboard.panel.receivers')" class="item-receivers" prop="param.report.receivers">
                    <el-select
                    class="right-box__select"
                    v-model="editPanel.param.report.receivers" clearable multiple placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="chartType">
                      <el-option
                      style="width: 620px"
                      v-for="item in userData" :key="item.id"
                      :label="item.name" :value="item.id">
                      <span class="user-name" :title="item.name">{{item.name}}</span>
                      <span class="user-username" :title="item.username">@{{item.username}}</span>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </transition>
            </div>
          </div>
        </el-form>
      </div>
    </div>
    <!--底部按钮-->
    <div class="right-box__footer">
      <button id="dc-box-esc" v-cancel="{obj:editPanel, func:esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="dc-box-save" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>

  </div>
</template>

<script>
import editRigthBox from '../mixin/editRigthBox'
import bus from '@/libs/bus'
import { arrLength, datePicker } from '@/components/common/js/validate'
import draggable from 'vuedraggable'
import { getUUID } from '@/components/common/js/common'
export default {
  name: 'panelBox',
  components: {
    draggable
  },
  props: {
    obj: {
      type: Object
    },
    isBottom: {
      type: Boolean,
      default: false
    },
    panelType: {
      type: String,
      default: 'dashboard'
    }
  },
  mixins: [editRigthBox],
  data () {
    return {
      url: 'visual/panel',
      editPanel: {},
      isShow: 0,
      userData: [],
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        'param.report.range.unit': [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        'param.report.schedule.type': [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        'param.report.schedule.repeat': [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        'param.report.schedule.stime': [{
          required: true,
          message: this.$t('validate.required')
        }, { validator: datePicker, trigger: 'blur' }],
        'param.report.receivers': [
          { required: true, message: this.$t('validate.required'), trigger: 'change' },
          { validator: arrLength, trigger: 'blur' }
        ]
        // 'param.report.schedule.nums': [
        //   { required: true, message: this.$t('validate.required'), trigger: 'blur' },
        //   { validator: arrLength, trigger: 'blur' }
        // ]
      },
      week: [
        this.$t('week.Mon'),
        this.$t('week.Tue'),
        this.$t('week.Wed'),
        this.$t('week.Thu'),
        this.$t('week.Fri'),
        this.$t('week.Sat'),
        this.$t('week.Sun')
      ],
      month: [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31,
        'Last'
      ],
      dateFormatStr: localStorage.getItem('nz-default-dateFormat')
        ? localStorage.getItem('nz-default-dateFormat')
        : 'YYYY-MM-DD HH:ss:mm',
      queryVariableList: [
        { name: 'label_names()', description: this.$t('dashboard.panel.label_names()') },
        { name: 'label_values(label)', description: this.$t('dashboard.panel.label_values(label)') },
        { name: 'label_values(metric, label)', description: this.$t('dashboard.panel.label_values(metric, label)') },
        { name: 'metrics(metric)', description: this.$t('dashboard.panel.metrics(metric)') },
        { name: 'query_result(query)', description: this.$t('dashboard.panel.query_result(query)') }
      ]
    }
  },
  created () {
    this.dateFormatStr = 'YYYY-MM-DD HH:mm:ss'
    this.isShow = Number(this.editPanel.param.report.schedule.type)
    // if (this.editPanel.id) {
    //   this.isShow = Number(this.editPanel.param.report.schedule.type)
    // }
  },
  mounted () {
    this.getUserData()
  },
  methods: {
    // 变量类型改变 清空数据
    variableTypeChange (index) {
      this.$set(this.editPanel.param.variables[index], 'customOptions', '')
      this.$set(this.editPanel.param.variables[index], 'expression', '')
      this.$set(this.editPanel.param.variables[index], 'regex', '')
    },
    // 变量名校验 防止重复
    variableValidator (rule, value, callback) {
      const nameArr = this.editPanel.param.variables.map(item => item.name)
      const findIndex = nameArr.indexOf(value)
      const lastIndex = nameArr.lastIndexOf(value)
      setTimeout(() => {
        if (findIndex !== lastIndex) {
          callback(new Error(this.$t('error.nameDuplicate')))
        } else {
          callback()
        }
      }, 100)
    },
    // 展开 折叠变量
    dropVariable (index, item) {
      this.$set(this.editPanel.param.variables[index], 'collapse', !item.collapse)
    },
    // 显示 隐藏变量
    showVariable (index, item) {
      this.$set(this.editPanel.param.variables[index], 'show', !item.show)
    },
    // 添加变量
    addVariable () {
      const temp = {
        show: true,
        type: 'query',
        multi: false,
        allOption: false,
        collapse: false,
        uid: getUUID()
      }
      this.editPanel.param.variables.push(temp)
    },
    // 复制变量
    copyVariable (item) {
      const temp = JSON.parse(JSON.stringify(item))
      temp.name = temp.name ? temp.name + '_copy' : ''
      temp.collapse = false
      temp.uid = getUUID()
      this.editPanel.param.variables.push(temp)
    },
    // 删除变量
    removeVariable (index) {
      this.editPanel.param.variables.splice(index, 1)
      this.$refs.form.clearValidate()
    },
    getUserData () {
      return new Promise(resolve => {
        this.$get('sys/user', { pageSize: -1, pageNo: 1 }).then(response => {
          if (response.code === 200) {
            this.userData = response.data.list
          }
          resolve()
        })
      })
    },
    datasourceChange (tab) {
      this.isShow = Number(tab.name)
      if (this.editPanel.param.report.schedule.nums) {
        this.editPanel.param.report.schedule.nums = []
        this.editPanel.param.report.schedule.repeat = 1
      }
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    clickOutside () {
      this.esc(false)
    },

    /* 保存 */
    save () {
      // 保存时把无用属性删除 再传入后台
      const variables = this.editPanel.param.variables.map((item) => {
        const temp = JSON.parse(JSON.stringify(item))
        delete temp.collapse
        delete temp.uid
        return temp
      })
      const params = {
        ...this.editPanel,
        id: this.editPanel.id ? this.editPanel.id : '',
        name: this.editPanel.name,
        type: this.panelType,
        remark: this.editPanel.remark,
        param: {
          report: {
            enable: this.editPanel.param.report.enable,
            range: {
              type: 'previous',
              interval: 1,
              unit: this.editPanel.param.report.range.unit
            },
            schedule: {
              type: Number(this.editPanel.param.report.schedule.type),
              repeat: this.editPanel.param.report.schedule.repeat ? this.editPanel.param.report.schedule.repeat : 1,
              nums: this.editPanel.param.report.schedule.nums,
              stime: this.editPanel.param.report.schedule.stime !== '' ? this.timezoneToUtcTimeStr(this.editPanel.param.report.schedule.stime, 'YYYY-MM-DD HH:mm:ss') : this.editPanel.param.report.schedule.stime,
              etime: this.editPanel.param.report.schedule.etime !== '' ? this.timezoneToUtcTimeStr(this.editPanel.param.report.schedule.etime, 'YYYY-MM-DD HH:mm:ss') : this.editPanel.param.report.schedule.etime
            },
            receivers: this.editPanel.param.report.receivers
          },
          chartShare: this.editPanel.param.chartShare,
          variables
        }
      }
      const editParam = JSON.parse(JSON.stringify(params))
      if (this.prevent_opt.save) {
        return
      }
      this.prevent_opt.save = true
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.editPanel.id) {
            this.$put(this.url, editParam).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post(this.url, editParam).then(response => {
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
          this.prevent_opt.save = false
          return false
        }
      })
    },
    /* 删除 */
    del () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete(`${this.url}?ids=${this.editPanel.id}`).then(response => {
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
    changeData (flag) {
      if (flag) {
        if (this.editPanel.param.report.schedule.etime) {
          if (this.editPanel.param.report.schedule.stime > this.editPanel.param.report.schedule.etime) {
            this.editPanel.param.report.schedule.stime = ''
            this.$message.error(this.$t('alert.silence.timeError'))
          }
        }
      } else {
        if (this.editPanel.param.report.schedule.stime) {
          if (this.editPanel.param.report.schedule.stime > this.editPanel.param.report.schedule.etime) {
            this.editPanel.param.report.schedule.etime = ''
            this.$message.error(this.$t('alert.silence.timeError'))
          }
        }
      }
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.isEdit = true
        this.editPanel = JSON.parse(JSON.stringify(n))
        // 若没有数据 默认设置为空数组
        if (!this.editPanel.param.variables || !this.editPanel.param.variables.length) {
          const temp = []
          this.$set(this.editPanel.param, 'variables', temp)
        } else {
          this.editPanel.param.variables.forEach(item => {
            item.uid = getUUID()
          })
        }
      }
    },
    'editPanel.param.report.schedule.stime': {
      deep: true,
      handler (n) {
        const startTime = this.$loadsh.get(this.editPanel, 'param.report.schedule.stime', '')
        if (startTime !== '') {
          this.editPanel.param.report.schedule.stime = bus
            .timeFormate(new Date(n), 'YYYY-MM-DD HH:mm:ss')
        }
      }
    },
    'editPanel.param.report.schedule.etime': {
      deep: true,
      handler (n) {
        const endTime = this.$loadsh.get(this.editPanel, 'param.report.schedule.etime', '')
        if (endTime !== '') {
          this.editPanel.param.report.schedule.etime = bus
            .timeFormate(new Date(n), 'YYYY-MM-DD HH:mm:ss')
        }
      }
    }
  }
}
</script>
