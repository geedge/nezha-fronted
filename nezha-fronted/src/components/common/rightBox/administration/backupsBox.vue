<template>
  <div v-clickoutside="{ obj: editBackup, func: esc }" class="right-box">
    <div class="right-box__header">
      <div class="header__title">{{ editBackup.name }}</div>
      <div class="header__operation">
        <span v-cancel="{ obj: editBackup, func: esc }"
          ><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i
        ></span>
      </div>
    </div>
    <div class="right-box__container right-box-container__left">
      <div class="container__form">
        <el-form
          :model="editBackup"
          :rules="rules"
          label-position="top"
          label-width="120px"
          ref="backupsForm"
        >
          <el-form-item
            :label="$t('alert.config.schedEnable')"
            prop="type"
            class="form-tabs"
          >
            <el-tabs
              v-model="editBackup.type"
              @tab-click="datasourceChange"
              type="card"
              class="backups-info-tab"
            >
              <el-tab-pane :label="$t('backup.only')" name="1"> </el-tab-pane>
              <el-tab-pane :label="$t('backup.Daily')" name="2"> </el-tab-pane>
              <el-tab-pane :label="$t('backup.Weekly')" name="3"> </el-tab-pane>
              <el-tab-pane :label="$t('backup.Monthly')" name="4">
              </el-tab-pane>
            </el-tabs>
          </el-form-item>
          <el-form-item
            :label="$t('overall.startTime')"
            prop="stime"
            v-if="whoshow"
            class="start_at"
          >
            <my-date-picker
              v-model="editBackup.stime"
              class="my-datetime-picker"
              type="datetime"
              prefix-icon="el-icon-date"
              :format="timeFormatStrToDatePickFormat(dateFormatStr)"
              :placeholder="$t('el.datepicker.selectDate')"
            >
            </my-date-picker>
          </el-form-item>
          <el-form-item
            :label="$t('backup.RepeatEvery')"
            prop="repeat"
            v-if="whoshow === 2 || whoshow === 3 ? true : false"
          >
            <el-input
              v-if="whoshow === 3 ? true : false"
              size="small"
              v-model="editBackup.repeat"
              id="chart-box-title"
              @change="inputchange"
            >
              <template slot="append">{{ $t("el.datepicker.week") }}</template>
            </el-input>
            <el-input
              v-if="whoshow === 2 ? true : false"
              size="small"
              v-model="editBackup.repeat"
              id="chart-box-title"
              @change="inputchange"
            >
              <template slot="append">{{ $t("backup.day") }}</template>
            </el-input>
          </el-form-item>
          <el-form-item
            :label="$t('backup.DayOfMonth')"
            prop="checkDays"
            v-if="whoshow === 4 ? true : false"
            class="check-month_box"
            id="DayOfMonth"
          >
            <el-checkbox-group
              v-model="editBackup.checkDays"
              @change="changeCheck"
            >
              <el-checkbox-button
                v-for="(item, day) in month"
                :label="day"
                :key="item"
                >{{ item }}</el-checkbox-button
              >
            </el-checkbox-group>
          </el-form-item>
          <el-form-item
            :label="$t('backup.WeekOn')"
            prop="checkDay"
            v-if="whoshow === 3 ? true : false"
            class="check_box"
            id="week-on"
          >
            <el-checkbox-group
              v-model="editBackup.checkDay"
              @change="changeCheck"
            >
              <el-checkbox-button
                v-for="(day, index) in week"
                :label="index"
                :key="index"
                >{{ week[index] }}</el-checkbox-button
              >
            </el-checkbox-group>
          </el-form-item>
          <el-form-item
            :label="$t('backup.backupRetention')"
            prop="retention"
          >
            <el-input
              maxlength="64"
              size="small"
              v-model="editBackup.retention"
              id="chart-box-title"
              @change="inputchange"
            ></el-input>
          </el-form-item>

          <el-form-item
            :label="$t('overall.enabled')"
            prop="status"
            class="form-item__switch"
          >
            <el-switch
              class="switch"
              v-model="editBackup.status"
              @change="statusChange"
            >
            </el-switch>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button
        id="asset-edit-cancel"
        v-cancel="{ obj: editBackup, func: esc }"
        class="footer__btn footer__btn--light"
      >
        <span>{{ $t("overall.cancel") }}</span>
      </button>
      <button
        id="asset-edit-save"
        :class="{ 'footer__btn--disabled': prevent_opt.save }"
        :disabled="prevent_opt.save"
        class="footer__btn"
        @click="save"
      >
        <span>{{ $t("overall.save") }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import { put } from '@/http'
import { arrLength, datePicker } from '@/components/common/js/validate'
import moment from 'moment-timezone'

export default {
  name: 'backupsBox',
  props: {
    obj: {
      type: Object
    }
  },
  data () {
    return {
      editBackup: {
        status: '',
        checkDays: [],
        checkDay: [],
        timepicker: '',
        retention: '',
        state: '',
        schedule: {
          repeat: '',
          stime: '',
          type: '',
          nums: []
        }
      },
      whoshow: '',
      activeName: '',
      dateFormatStr: localStorage.getItem('nz-default-dateFormat')
        ? localStorage.getItem('nz-default-dateFormat')
        : 'YYYY-MM-DD HH:ss:mm',
      rules: {
        type: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          }
        ],
        stime: [{
          required: true,
          message: this.$t('validate.required')
          // trigger: 'change'
        },
        { validator: datePicker, trigger: 'blur' }],
        checkDays: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          },
          { validator: arrLength, trigger: 'blur' }
        ],
        retention: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: ['blur', 'change']
          }
        ],
        status: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          }
        ],
        repeat: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'blur'
          }
        ],
        checkDay: [
          {
            required: true,
            message: this.$t('validate.required'),
            trigger: 'change'
          },
          { validator: arrLength, trigger: 'blur' }
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
      ]
    }
  },

  components: {},

  computed: {},

  created () {
    const dateFormatStr = localStorage.getItem('nz-default-dateFormat')
    this.dateFormatStr = 'YYYY-MM-DD HH:mm:ss'
    // if (dateFormatStr) {
    //   this.dateFormatStr = dateFormatStr.split(' ')[0]
    // } else {
    //   this.dateFormatStr = 'YYYY-MM-DD'
    // }
  },

  beforeMount () {},

  mounted () {},

  methods: {
    changeCheck (item) {
      if (this.editBackup.type == 3) {
        const nums = []
        this.editBackup.nums = []
        for (const i in this.editBackup.checkDay) {
          nums.push(Number(this.editBackup.checkDay[i]) + 1)
        }
        this.editBackup.nums = nums
      } else if (this.editBackup.type == 4) {
        const nums = []
        this.editBackup.nums = []
        this.editBackup.checkDays.forEach((e, i) => {
          if (e === 31) {
            nums.push(-1)
          } else {
            nums.push(Number(this.editBackup.checkDays[i]) + 1)
          }
        })
        this.editBackup.nums = nums
      }
      this.$forceUpdate()
    },
    statusChange (item) {
      this.$forceUpdate()
      if (item == true) {
        this.editBackup.state = 1
      } else {
        this.editBackup.state = 0
      }
    },
    save () {
      this.$refs.backupsForm.validate((valid) => {
        if (valid) {
          // this.editBackup.stime = bus
          //   .timeFormate(this.editBackup.datepicker[0])
          //   .split(' ')[0]
          // this.editBackup.stime = this.editBackup.datepicker.join(' ')
          // this.editBackup.stime = this.editBackup.schedule.datepicker
          // let offset = localStorage.getItem('nz-sys-timezone')
          // offset = moment.tz(offset).format('Z')
          // this.editBackup.stime = new Date(this.editBackup.stime).getTime()
          // offset = Number.parseInt(offset)
          // this.editBackup.stime -= offset * 60 * 60 * 1000
          put('/sys/backup', {
            state: Number(this.editBackup.state),
            schedule: {
              type: Number(this.editBackup.type),
              stime: this.timezoneToUtcTimeStr(this.editBackup.stime, 'YYYY-MM-DD HH:mm:ss') || '',
              repeat: Number(this.editBackup.repeat),
              nums: this.editBackup.nums
            },
            retention: Number(this.editBackup.retention)
          }).then((res) => {
            if (res.code === 200) {
              this.esc(true)
            }
          })
        }
      })
    },
    inputchange (n) {
      this.$forceUpdate()
    },
    datasourceChange (tab) {
      switch (tab.name) {
        case '2':
          this.whoshow = 2
          break
        case '1':
          this.whoshow = 1
          break
        case '3':
          this.whoshow = 3
          break
        case '4':
          this.whoshow = 4
          break
      }
      this.$forceUpdate()
    },
    clickOutside () {
      this.esc(false)
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    }
  },

  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.editBackup = JSON.parse(JSON.stringify(n))
        this.editBackup.checkDay = []
        this.editBackup.checkDays = []
        this.editBackup.type = this.editBackup.type + ''
        // const stime1 = this.utcTimeToTimezoneStr(this.editBackup.stime)
        // const stime = this.utcTimeToTimezone(this.editBackup.stime)
        // const time = stime1.split(' ')
        // time[0] = stime
        // this.$set(this.editBackup, 'datepicker', time)
        if (this.editBackup.state == 1) {
          this.editBackup.status = true
          this.$emit('statechange', true)
        } else {
          this.editBackup.status = false
          this.$emit('statechange', false)
        }
        switch (this.editBackup.type) {
          case '1':
            this.activeName = '1'
            this.whoshow = 1
            break
          case '2':
            this.activeName = '2'
            this.whoshow = 2
            break
          case '3':
            this.activeName = '3'
            this.whoshow = 3
            break
          case '4':
            this.activeName = '4'
            this.whoshow = 4
            break
        }
        const checkdays = []

        this.checkDay = []
        if (this.editBackup.type == 3) {
          this.editBackup.nums.forEach((e) => {
            if (e == -1) {
              checkdays.push(6)
            } else {
              checkdays.push(e - 1)
            }
          })
          this.$set(this.editBackup, 'checkDay', checkdays)
        } else if (this.editBackup.type == 4) {
          this.editBackup.nums.forEach((e) => {
            if (e == -1) {
              checkdays.push(31)
            } else {
              checkdays.push(e - 1)
            }
          })
          this.$set(this.editBackup, 'checkDays', checkdays)
        }
        this.$forceUpdate()
      }
    },
    'editBackup.status': {
      deep: true,
      handler (n) {
        if (n) {
          this.editBackup.state = 1
          this.editBackup.status = n
          this.$emit('statechange', true)
        } else {
          this.editBackup.state = 0
          this.editBackup.status = n
          this.$emit('statechange', false)
        }
      }
    },
    'editBackup.stime': {
      deep: true,
      handler (n) {
        this.editBackup.stime = bus
          .timeFormate(new Date(n), 'YYYY-MM-DD HH:mm:ss')
      }
    }
  }
}
</script>
<style lang='' scoped>
</style>
