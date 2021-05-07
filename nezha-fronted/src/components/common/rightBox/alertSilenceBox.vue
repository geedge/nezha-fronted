<template>
  <div class="right-box right-box-alert-config" v-clickoutside="{obj:editAlertSilence,func:clickOutside}">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editAlertSilence.id ? $t("alert.silence.edit") + " ID：" + editAlertSilence.id : $t("alert.silence.create")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editAlertSilence, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box right-box__container">
      <el-form class="right-box-form right-box-form-left" :model="editAlertSilence" label-position="top"
               label-width="120px" :rules="rules" ref="alertSilenceForm">
        <el-form-item :label='$t("alert.silence.name")' prop="name" class="range-name">
          <el-input
            :placeholder="''"
            size="small"
            v-model="editAlertSilence.name">
          </el-input>
        </el-form-item>
        <el-form-item :label='$t("alert.silence.time")' prop="time" class="range-time">
          <div>
            <el-radio-group v-model="rangeTime" size="small" @change="rangeTimeChange">
              <el-radio-button label="1">1 hour</el-radio-button>
              <el-radio-button label="2">2 hour</el-radio-button>
              <el-radio-button label="6">6hour</el-radio-button>
              <el-radio-button label="12">12 hour</el-radio-button>
              <el-radio-button label="24">1 day</el-radio-button>
              <el-radio-button label="48">2 day</el-radio-button>
              <el-radio-button label="168">1 week</el-radio-button>
            </el-radio-group>
          </div>
          <div class="datepicker">
            <div class="datepicker-box">
              <span class="datepicker-title">start time</span>
              <my-date-picker prefix-icon=" " class=" " size="mini" ref="calendar"
                              format="yyyy/MM/dd HH:mm:ss" @change="(val)=>{dateChange(val,'startAt')}" v-model="editAlertSilence.startAt"
                              type="datetime"
                              :clearable="false"
                              popper-class="panel-time-picker-popper"
                              :placeholder="$t('dashboard.panel.startTime')"
                              align="right"
              >
              </my-date-picker>
            </div>
            <div class="datepicker-box">
              <span class="datepicker-title">end time</span>
              <my-date-picker prefix-icon=" " class=" " size="mini" ref="calendar"
                              format="yyyy/MM/dd HH:mm:ss" @change="(val)=>{dateChange(val,'endAt')}" v-model="editAlertSilence.endAt"
                              type="datetime"
                              :clearable="false"
                              popper-class="panel-time-picker-popper"
                              :placeholder="$t('dashboard.panel.startTime')"
                              align="right"
              >
              </my-date-picker>
            </div>
            <!--( :range-separator="")-->
          </div>
        </el-form-item>

        <el-form-item :label='$t("alert.silence.matchers")' prop="matchers" class="matchers">
          <div v-for="(item, index) in editAlertSilence.matchers" :key="index" class="param-box-row">
            <el-form-item class="param-box-row-key" :rules="[{ required: true, message: $t('validate.required'), trigger: 'change' },]" :prop="'matchers.' + index + '.name'">
              <el-input placeholder="key" size="mini" v-model="item.name"></el-input>
            </el-form-item>
            <span class="param-box-row-eq">=</span>
            <el-form-item class="param-box-row-value" :prop="'matchers.' + index + '.value'" :rules="[{ required: true, message: $t('validate.required'), trigger: 'change' },]" >
              <el-input placeholder="value" size="mini" v-model="item.value"  class="silence-matchers-value"></el-input>
              <el-checkbox class="silence-matchers-regex" v-model="item.regex" :true-label="1" :false-label="0" >Regex</el-checkbox>
            </el-form-item>
            <span class="param-box-row-symbol" :id="'moduel-remove-label-'+index" @click="removematchers(index)"><i class="nz-icon nz-icon-shanchu1" style="color:#666;"></i></span>
          </div>
          <div style="text-align: center;" class="">
               <span id="module-add-label" type="button" @click="addmatchers" class="right-box-form-add module-add-label right-box-form-minus-box module-add-label" style="">
              <span><i style="font-size: 16px;" class="nz-icon nz-icon-create-square"></i></span>
            </span>
          </div>
        </el-form-item>

        <el-form-item :label='$t("alert.silence.reason")' prop="reason" class="range-time">
          <el-input
            type="textarea"
            :placeholder="$t('alert.description')"
            v-model="editAlertSilence.reason"
            maxlength="512"
            show-word-limit>

          </el-input>
        </el-form-item>

      </el-form>

    </div>
    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box-bottom-btns right-box__footer">
      <button v-cancel="{obj:editAlertSilence,func:esc}" id="alert-box-esc"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="alert-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import bus from '../../../libs/bus'
// import selectAlertSilence from '../alert/selectAlertSilence'
export default {
  name: 'alertSilenceBox',
  components: {
    // selectAlertSilence
  },

  props: {
    alertSilence: Object
  },
  watch: {
    alertSilence: {
      deep: true,
      immediate: true,
      handler (n, o) {
        const obj = JSON.parse(JSON.stringify(n))
        if (obj.ruleId == -1) {
          obj.ruleId = null
        }
        if (obj.linkId == -1) {
          obj.linkId = null
        }
        this.editAlertSilence = Object.assign(this.editAlertSilence, obj)
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
        reason: '',
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
          { required: true, message: this.$t('validate.required'), trigger: 'change' },
        ],
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
      ;
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
        if (valid) {
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
        this.editAlertSilence.startAt = bus.timeFormate(new Date(val), 'yyyy-MM-dd hh:mm:ss')
        this.startAtTamp = new Date(val).getTime()
      } else if (type === 'endAt') {
        this.editAlertSilence.endAt = bus.timeFormate(new Date(val), 'yyyy-MM-dd hh:mm:ss')
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
      const arr = [bus.timeFormate(bus.getOffsetTimezoneData(), 'yyyy-MM-dd hh:mm:ss'), bus.timeFormate(bus.getOffsetTimezoneData(val * 1), 'yyyy-MM-dd hh:mm:ss')]
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
    }
  }
}
</script>

<style scoped lang="scss">
  .range-time {
    /deep/ .el-radio-button--small .el-radio-button__inner, /deep/ .el-radio-group {
      width: 100%
    }

    /deep/ .el-radio-button {
      width: 14.2%
    }

    /deep/ .el-date-editor.el-range-editor.el-input__inner.el-date-editor--datetimerange.el-range-editor--mini {
      width: 100%;
    }

    .datepicker {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      .datepicker-box{
        width: 48%;
        flex: 1;
        position: relative;
        /deep/ .el-date-editor.el-input, /deep/ .el-date-editor.el-input__inner{
          width: 100%;
        }
        /deep/ .el-input__inner{
          text-align: center;
        }
        .datepicker-title{
          position: absolute;
          left: 15px;
          z-index: 1;
        }
      }
    }
  }
  .matchers{
    /deep/ .el-input__prefix{
      left: 0;
    }
    /deep/ .el-form-item__error{
      left: 126px;
      padding-top: 10px;
    }
    .matchers-type{
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      .matchers-type-title{
        width: 125px;
        background:#E7EAED;
        font-family: ArialMT;
        font-size: 14px;
        color: #333333;
        letter-spacing: 0;
        font-weight: 400;
        text-align: center;
      }
      /deep/ .matchers-type-title.el-select--small .el-input__inner{
        background:#E7EAED;
        font-family: ArialMT;
        font-size: 14px;
        color: #333333;
        letter-spacing: 0;
        font-weight: 400;
        text-align: center;
        border: none;
      }
      .matchers-type-content{
        flex: 1;
      }
    }
  }
  /deep/ .silence-matchers-value{
    width: calc(100% - 100px);
  }
  .silence-matchers-regex{
    margin-left: 10px;
  }
  /deep/ .param-box-row-key{
    width: 36%;
  }
  /deep/ .param-box-row-value{
    width: 50%;
  }
  .module-add-label{
    display: inline-block;
    width: 300px;
    height: 18px;
    background: #FFFCF9;
    border: 1px solid #FFE0BD;
    border-radius: 2px;
    text-align: center;
    line-height: 18px;
    margin-right: 80px;
  }
</style>
