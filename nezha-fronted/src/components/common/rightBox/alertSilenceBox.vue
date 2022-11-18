<template>
  <div class="right-box right-box-alert-silence" v-clickoutside="{obj:editAlertSilence,func:clickOutside}">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editAlertSilence.id ? $t("alert.silence.edit") : $t("overall.createAlertSilence")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editAlertSilence, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="alertSilenceForm" :model="editAlertSilence"
                 :rules="rules" label-position="top" label-width="120px">
          <el-form-item :label='$t("overall.name")' class="range-name" prop="name">
            <el-input
              v-model="editAlertSilence.name" :placeholder="''"
              maxlength="64"
              show-word-limit
              size="small">
            </el-input>
          </el-form-item>
          <el-form-item :label='$t("overall.time")' class="range-time" prop="time">
            <div>
              <el-radio-group v-model="rangeTime" size="small" @change="rangeTimeChange">
                <el-radio-button label="1">{{ $t("overall.oneHour") }}</el-radio-button>
                <el-radio-button label="2">{{ $t("overall.twoHour") }}</el-radio-button>
                <el-radio-button label="6">{{ $t("overall.sixHour") }}</el-radio-button>
                <el-radio-button label="12">{{ $t("overall.twelveHour") }}</el-radio-button>
                <el-radio-button label="24">{{ $t("overall.oneDay") }}</el-radio-button>
                <el-radio-button label="48">{{ $t("overall.twoDay") }}</el-radio-button>
                <el-radio-button label="168">{{ $t("overall.week") }}</el-radio-button>
              </el-radio-group>
            </div>
            <div class="datepicker">
              <div class="datepicker-box">
                <span class="datepicker-title">{{ $t("overall.startTime") }}</span>
                <my-date-picker ref="calendar" v-model="editAlertSilence.startAt" :clearable="false" :placeholder="$t('overall.startTime')"
                                align="right" class=" "
                                :format="timeFormatStrToDatePickFormat(timeFormatMain)"
                                popper-class="panel-time-picker-popper right-box-select-top"
                                prefix-icon=" "
                                size="mini"
                                type="datetime"
                                @change="(val)=>{dateChange(val,'startAt')}"
                >
                </my-date-picker>
              </div>
              <div class="datepicker-box">
                <span class="datepicker-title">{{ $t("overall.endTime") }}</span>
                <my-date-picker ref="calendar" v-model="editAlertSilence.endAt" :clearable="false" :placeholder="$t('overall.startTime')"
                                align="right" class=" "
                                :format="timeFormatStrToDatePickFormat(timeFormatMain)"
                                popper-class="panel-time-picker-popper right-box-select-top"
                                prefix-icon=" "
                                size="mini"
                                type="datetime"
                                @change="(val)=>{dateChange(val,'endAt')}"
                >
                </my-date-picker>
              </div>
              <!--( :range-separator="")-->
            </div>
          </el-form-item>

          <el-form-item :label='$t("alert.silence.matchers")' class="matchers" prop="matchers">
            <div v-for="(item, index) in editAlertSilence.matchers" :key="index" class="param-box-row">
              <el-form-item :prop="'matchers.' + index + '.name'" :rules="[{ required: true, message: $t('validate.required'), trigger: 'change' },]" class="param-box-row-key">
                <el-autocomplete
                  v-model="item.name"
                  :fetch-suggestions="querySearch"
                  class="inline-input silence-matchers-key"
                  popper-class="right-box-select-top right-public-box-dropdown-top"
                  placeholder="key"
                  size="mini"
                  @select="handleSelect"
                ></el-autocomplete>
              </el-form-item>
              <span class="param-box-row-eq">=</span>
              <el-form-item :prop="'matchers.' + index + '.value'" :rules="[{ required: true, message: $t('validate.required'), trigger: 'change' },]" class="param-box-row-value" >
                <el-input v-model="item.value" class="silence-matchers-value" placeholder="value"  size="mini"></el-input>
                <el-checkbox v-model="item.regex" :false-label="0" :true-label="1" class="silence-matchers-regex" >Regex</el-checkbox>
              </el-form-item>
              <span :id="'moduel-remove-label-'+index" class="param-box-row-symbol" style="padding-left: 0px;" @click="removematchers(index)" :title="$t('overall.delete')"><i class="nz-icon nz-icon-shanchu1"></i></span>
            </div>
            <div class="" style="text-align: center;">
               <span id="module-add-label" type="button" @click="addmatchers" class="right-box-form-add module-add-label right-box-form-minus-box module-add-label" style=""  :title="$t('tip.add')">
              <span><i style="font-size: 16px;" class="nz-icon nz-icon-create-square"></i></span>
            </span>
            </div>
          </el-form-item>

          <el-form-item :label='$t("overall.remark")' class="range-time" prop="remark">
            <el-input
              v-model="editAlertSilence.remark"
              maxlength="256"
              size="small" :rows="2"
              show-word-limit
              type="textarea">

            </el-input>
          </el-form-item>

        </el-form>
      </div>

    </div>
    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editAlertSilence,func:esc}" id="alert-box-esc"
              class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save"
              class="footer__btn" id="alert-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import { sameLabels } from '@/components/common/js/constants'
// import selectAlertSilence from '../alert/selectAlertSilence'
import editRigthBox from '../mixin/editRigthBox'
export default {
  name: 'alertSilenceBox',
  components: {
    // selectAlertSilence
  },
  mixins: [editRigthBox],
  props: {
    alertSilence: Object
  },
  watch: {
    alertSilence: {
      deep: true,
      immediate: true,
      handler (n, o) {
        this.isEdit = true
        const obj = JSON.parse(JSON.stringify(n))
        if (obj.ruleId == -1) {
          obj.ruleId = null
        }
        if (obj.linkId == -1) {
          obj.linkId = null
        }
        this.editAlertSilence = Object.assign(this.editAlertSilence, obj)
        this.editAlertSilence.startAt = new Date(this.editAlertSilence.startAt)
        this.editAlertSilence.endAt = new Date(this.editAlertSilence.endAt)
        this.startAtTamp = new Date(this.editAlertSilence.startAt).getTime()
        this.endAtTamp = new Date(this.editAlertSilence.endAt).getTime()
        this.editAlertSilence.time = this.startAtTamp
        this.rangeTimeCallback()
      }
    }
  },
  data () {
    const validate = (rule, value, callback) => {
      if (!this.editAlertSilence.startAt) {
        callback(new Error(this.$t('alert.silence.selectTime')))
      } else if (!this.editAlertSilence.endAt) {
        callback(new Error(this.$t('alert.silence.selectTime')))
      } else {
        callback()
      }
    }
    return {
      editAlertSilence: {
        id: '',
        startAt: '',
        endAt: '',
        ruleId: '',
        type: '',
        linkId: '',
        remark: '',
        time: [],
        matchers: [
          { name: '', value: '', regex: 0 }
        ],
        name: ''
      },
      rules: {
        time: [
          // { required: true, message: this.$t('alert.silence.selectTime'), trigger: 'change' },
          { required: true, trigger: 'change' },
          { validator: validate, trigger: 'change' }
        ],
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      rangeTime: '',
      ruleList: [],
      filterSilence: '',
      silenceData: [],
      typeContentLoading: false,
      typeList: [
        { type: 'datacenter', name: 'Datacenter' },
        { type: 'project', name: 'Project' },
        { type: 'module', name: 'Module' },
        { type: 'endpoint', name: 'Endpoint' },
        { type: 'asset', name: 'Asset' }
      ],
      datacenterData: null,
      assetData: null,
      projectData: null,
      moduleData: null,
      endpointData: null,
      startAtTamp: '',
      endAtTamp: ''
    }
  },
  mounted () {
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      if (this.prevent_opt.save) {
        return
      }
      this.prevent_opt.save = true
      this.$refs.alertSilenceForm.validate((valid) => {
        if (this.endAtTamp < this.startAtTamp) {
          this.prevent_opt.save = false
          this.$message({
            message: this.$t('alert.silence.timeError'),
            type: 'error'
          })
          return
        }
        const params = { ...this.editAlertSilence, matchers: JSON.stringify(this.editAlertSilence.matchers) }
        params.startAt = bus.formateTimeToTime(params.startAt)
        params.endAt = bus.formateTimeToTime(params.endAt)
        if (valid) {
          params.startAt = bus.timeFormate(new Date(this.timezoneToUtcTime(params.startAt)), 'YYYY-MM-DD HH:mm:ss')
          params.endAt = bus.timeFormate(new Date(this.timezoneToUtcTime(params.endAt)), 'YYYY-MM-DD HH:mm:ss')
          if (this.editAlertSilence.id) {
            this.$put('/alert/silence', params).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post('alert/silence', params).then(response => {
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
    del () {
      if (this.prevent_opt.save) {
        return
      }
      ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/alert/silence?ids=' + this.editAlertSilence.id).then(response => {
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
    dateChange (val, type) {
      if (type === 'startAt') {
        this.editAlertSilence.startAt = new Date(val).getTime()
        this.startAtTamp = new Date(val).getTime()
      } else if (type === 'endAt') {
        this.editAlertSilence.endAt = new Date(val).getTime()
        this.endAtTamp = new Date(val).getTime()
      }
      this.$forceUpdate()
      this.rangeTimeCallback()
    },
    rangeTimeCallback () {
      if (this.editAlertSilence.time) {
        const num = new Date(this.editAlertSilence.endAt).getTime() - new Date(this.editAlertSilence.startAt).getTime()
        this.rangeTime = num / (60 * 60 * 1000)// 以小时为单位
      } else {
        this.rangeTime = null
      }
    },
    rangeTimeChange (val) {
      const arr = [
        bus.getOffsetTimezoneData(),
        bus.getOffsetTimezoneData(val * 1)
      ]
      this.$set(this.editAlertSilence, 'startAt', arr[0])
      this.$set(this.editAlertSilence, 'endAt', arr[1])
      this.startAtTamp = new Date(this.editAlertSilence.startAt).getTime()
      this.endAtTamp = new Date(this.editAlertSilence.endAt).getTime()
      this.$forceUpdate()
    },
    clearValue () {
      this.editAlertSilence.name = ''
      this.editAlertSilence.linkId = ''
    },
    // 新增label
    addmatchers () {
      this.editAlertSilence.matchers.push({ name: '', value: '', regex: 0 })
    },
    // 移除单个Label
    removematchers (index) {
      if (this.editAlertSilence.matchers.length === 1) {
        this.editAlertSilence.matchers = [{ name: '', value: '', regex: 0 }]
      }
      this.editAlertSilence.matchers.splice(index, 1)
    },
    querySearch (queryString, cb) {
      const labels = sameLabels.map(item => {
        return {
          name: item,
          value: item
        }
      })
      const results = queryString ? labels.filter(this.createFilter(queryString)) : labels
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      return (label) => {
        return (label.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    handleSelect (item) {
    }
  }
}
</script>
