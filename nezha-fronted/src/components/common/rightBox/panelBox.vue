<template>
  <div v-clickoutside="{obj:editPanel,func:clickOutside}" class="right-box right-box-panel">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editPanel.id ? ($t("dashboard.panel.editPanelTitle")) : $t("dashboard.panel.createPanelTitle")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editPanel, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>
    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="form" :model="editPanel" :rules="rules" label-position = "top" label-width="120px" size="small">
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input id="dc-box-input-name" v-model="editPanel.name" maxlength="64" placeholder="" show-word-limit size="small"></el-input>
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
                  :label="$t('backup.start')"
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
                  :label="$t('dashboard.panel.endAt')"
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
              <template slot="append">{{ $t("backup.week") }}</template>
            </el-input>
            <el-input
              size="small"
              v-model="editPanel.param.report.schedule.repeat"
              id="chart-box-title"
              v-if="isShow === 2 ? true :false">
              <template slot="append">{{ $t("backup.day") }}</template>
            </el-input>
                </el-form-item>
         <el-form-item v-if="isShow === 3 ? true : false" :label='$t("backup.WeekOn")' class="range-time" prop="nums">
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
            v-show="isShow === 4 ? true : false"
            :label="$t('backup.DayOfMonth')"
            prop="nums"
            class="check-month_box"
            id="day-of-month"
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
             <el-select v-model="editPanel.param.report.receivers" clearable multiple placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="chartType">
               <el-option v-for="item in userData" :key="item.id" :label="item.name" :value="item.id">
               <span class="panel-dropdown-label-txt" >{{item.name}}</span>
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
export default {
  name: 'panelBox',
  props: {
    obj: {
      type: Object
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
          { validator: arrLength }
        ]
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
        : 'YYYY-MM-DD HH:ss:mm'
    }
  },
  created () {
    this.dateFormatStr = 'YYYY-MM-DD HH:mm:ss'
    if (this.editPanel.id) {
      this.isShow = Number(this.editPanel.param.report.schedule.type)
    }
  },
  mounted () {
    this.getUserData()
  },
  methods: {
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
      const params = {
        id: this.editPanel.id ? this.editPanel.id : '',
        name: this.editPanel.name,
        type: 'dashboard',
        pid: 0,
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
          chartShare: this.editPanel.param.chartShare
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
