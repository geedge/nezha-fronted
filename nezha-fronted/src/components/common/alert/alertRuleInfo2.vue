<template>
  <div :style="calcPosition(that.position,that)" class="alert-label__border alert-label alert-rule-info-two" v-my-loading="loading" ref="alertLabels">
    <div class="alert-label-header-title3">
      <div class="alert-label-header-circle" :style="`background: ${alertColor}`">
        <i  class="nz-icon nz-icon-Alertrule"></i>
      </div>
      <div class="alert-label-header-name">
        {{alertRuleData && alertRuleData.name ? alertRuleData.name : '--'}}
      </div>
    </div>
    <div class="alert-label-nfo" >
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">{{alertRuleData.id ? alertRuleData.id : '--'}}</div>
      </div>
      <div class="alert-label-box name-labe">
         <div class="document-copy-block" style="display:flex">
          <div class="alert-label-title">{{$t('overall.name')}}</div>
          <div class="alert-label-value document-copy-text">{{alertRuleData.name ? alertRuleData.name : '--'}}</div>
          <i v-if="alertRuleData && alertRuleData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(alertRuleData.name)" :title="$t('overall.copyText')"></i>
         </div>
      </div>
<!--      <div class="alert-label-box">-->
<!--        <div class="alert-label-title">{{$t('overall.name')}}</div>-->
<!--        <div class="alert-label-value">{{alertRuleData.name ? alertRuleData.name : '&#45;&#45;'}}</div>-->
<!--      </div>-->
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.type')}}</div>
        <div class="alert-label-value">
          <span v-if="alertRuleData.type === 1">
            {{$t('overall.metric')}}
          </span>
          <span v-else-if="alertRuleData.type === 2">
            {{$t('overall.logs')}}
          </span>
          <span v-else-if="alertRuleData.type === 3">SNMP trap</span>
          <span v-else>--</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('alert.severity')}}</div>
        <div class="alert-label-value">
          <div
            v-for="priority in alertRuleData.condition"
            :key="priority.id"
            class="search-item-value text-ellipsis"
            :style="{background:priority.color}"
            style="display: inline-block;text-align: center;padding: 2px 5px; border-radius: 2px;margin-right: 5px;width: 80px"
            :title="priority.name + (position.operator || '>') + (priority.value || '-')"
          >
            {{priority.name}} {{position.operator || '>'}} {{priority.value || '-'}}
          </div>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('alert.config.expr')}}</div>
        <div class="alert-label-value">{{alertRuleData.expr ? (alertRuleData.expr + alertRuleData.operator + formatThreshold(alertRuleData.threshold,alertRuleData.unit)) : '--'}}</div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('alert.alertNum')}}</div>
        <div class="alert-label-value" v-if="alertRuleData">
          <i :class="alertRuleData.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover('',true, $event)" @mouseleave="tooltipHover('',false, $event)"></i>
          <div v-if="alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: position.left + 'px',top:position.top + 'px'}">
            <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('overall.active')}})</div>
            <div class="severity-info" style='justify-content: space-between'>
              <div class="severity-name">{{$t('overall.result.total')}}</div>
              <div class="severity-value">{{alertRuleData.alertNum}}</div>
            </div>
          </div>
          <alertDaysInfo
            v-show="!trendLoading"
            :alertDaysData="alertDaysData"
          />
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('alert.config.trbShot')}}</div>
        <div class="alert-label-value" @click="trbShotShow"><i class="nz-icon nz-icon-guzhangshuju"></i></div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.state')}}</div>
        <div class="alert-label-value" style="margin-left: 3px">
          <div v-if="alertRuleData.state === 1">
            <i class="active-icon green-bg inline-block"></i>
            {{ $t('overall.enabled') }}
          </div>
          <div v-else-if="alertRuleData.state === 0">
            <i class="active-icon gray-bg inline-block"></i>
            {{ $t('overall.disabled') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import chartDataFormat from '../../chart/chartDataFormat'
import trendMixins from '@/components/common/alert/trendMixins'
export default {
  name: 'alert-rule-info',
  mixins: [trendMixins],
  props: {
    id: {},
    messageLoad: {},
    detailList: Boolean,
    that: {},
    severityData: Array
  },
  data () {
    return {
      loading: true,
      alertRuleData: '',
      severityColor: '',
      severityDataWeight: this.$store.getters.severityDataWeight,
      alertColor: '#23bf9a'
    }
  },
  components: {

  },
  computed: {
    calcPosition () {
      return function (position) {
        if (!position) {
          return {
            left: '0px',
            top: '0px'
          }
        }
        const clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
        // const windowWidth = window.innerWidth
        const boxHeight = this.$refs.alertLabels ? this.$refs.alertLabels.offsetHeight : 231
        const windowHeight = window.innerHeight
        const leftOffSetView = this.detailList ? -80 : 10
        if (position.top > windowHeight / 2) {
          return {
            left: `${position.left + position.width + leftOffSetView}px`,
            top: `${position.top - boxHeight}px`
          }
        } else {
          return {
            left: `${position.left + position.width + leftOffSetView}px`,
            top: `${position.top}px`
          }
        }
      }
    }
  },
  methods: {
    formatThreshold (value, unit) {
      const unitMethod = chartDataFormat.getUnit(unit)
      if (unitMethod && value) {
        return unitMethod.compute(value, null, 2)
      } else {
        return value
      }
    },
    trbShotShow () {
      this.$emit('showText')
    },
    severityDataColor () {
      this.severityData.forEach(item => {
        if (this.alertRuleData.severityId === item.id) {
          this.severityColor = item.color
        }
      })
    },
    returnColor (obj) {
      let color = ''
      if (!obj) {
        color = '#23bf9a'
        return color
      } else {
        this.severityDataWeight.forEach(severity => {
          const num = obj.find(alert => alert.priority === severity.name)
          if (num && !color && num.num > 0) {
            color = severity.color
          }
        })
        if (!color) {
          color = '#23bf9a'
        }
        return color
      }
    }
  },
  mounted () {
    this.$get('/alert/rule/' + this.id).then((res) => {
      if (res.msg === 'success') {
        this.loading = false
        res.data.condition = JSON.parse(res.data.condition)
        res.data.condition = this.severityData.map(item => {
          item = {
            ...item,
            value: '',
            operator: '>'
          }
          res.data.condition.forEach(subItem => {
            if (item.id === subItem.id) {
              item = {
                ...item,
                operator: subItem.operator,
                value: subItem.value
              }
            }
          })
          return item
        })
        this.alertRuleData = res.data
        this.severityDataColor()
        this.alertColor = this.returnColor(res.data.alert)
        const weekDays = this.getWeeksTime()
        if (this.trendTimer) {
          clearTimeout(this.trendTimer)
          this.trendTimer = null
        }
        this.trendTimer = setTimeout(() => {
          this.trendLoading = true
          const params = {
            type: 'total',
            dimension: 'priority',
            step: 'd'
          }
          params['rule' + 'Id'] = this.id
          this.$get('/stat/alertMessage/trend', params).then((res) => {
            if (!res.data) {
              return
            }
            const alertDaysData = res.data.result ? res.data.result[0].values : []
            const newWeekDays = JSON.parse(JSON.stringify(weekDays))
            alertDaysData.forEach(item => {
              item.values.forEach(time => {
                const findItem = newWeekDays.find(days => days.time == time[0])
                if (findItem) {
                  findItem[item.metric.priority] = time[1]
                }
              })
            })
            setTimeout(() => {
              this.alertDaysData = newWeekDays
              this.trendLoading = false
            })
          })
        })
      } else {
        this.$message.error(res.msg)
      }
    })
  }
}

</script>
