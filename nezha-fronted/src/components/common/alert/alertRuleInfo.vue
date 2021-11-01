<template>
  <div :class="calcHeight(that.position,that)" :style="calcPosition(that.position,that)" class="alert-label__border" v-loading="loading">
    <div class="alert-rule-info" >
      <div class="alert-rule-box">
        <div class="alert-rule-title">ID</div>
        <div class="alert-rule-value">{{alertRuleData.id ? alertRuleData.id : '--'}}</div>
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.name')}}</div>
        <div class="alert-rule-value">{{alertRuleData.name ? alertRuleData.name : '--'}}</div>
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.type')}}</div>
        <div class="alert-rule-value">{{alertRuleData.type ? alertRuleData.type : '--'}}</div>
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.severity')}}</div>
        <div class="alert-rule-value"><i class="nz-icon nz-icon-circle" :style="{color:severityColor,'font-size':'12px','margin-right':'5px'}"></i>{{alertRuleData.severityId ? severityData.find(s => alertRuleData.severityId === s.id).name : '--'}}</div>
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.config.expr')}}</div>
        <div class="alert-rule-value">{{alertRuleData.expr ? (alertRuleData.expr + alertRuleData.operator + formatThreshold(alertRuleData.threshold,alertRuleData.unit)) : '--'}}</div>
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.alertNum')}}</div>
        <div class="alert-rule-value">
          <i :class="alertRuleData.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert"></i>
          <span>{{alertRuleData.alertNum ? alertRuleData.alertNum : 0}}</span>
        </div>
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.config.trbShot')}}</div>
        <div class="alert-rule-value" @click="trbShotShow"><i class="nz-icon nz-icon-guzhangshuju"></i></div>
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.state')}}</div>
        <div class="alert-rule-value" style="margin-left: 3px">
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
import chartDataFormat from '../../charts/chartDataFormat'
export default {
  name: 'alert-rule-info',
  props: {
    id: {},
    messageLoad: {},
    that: {},
    severityData: Array
  },
  data () {
    return {
      loading: true,
      alertRuleData: '',
      severityColor: ''
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
        const elHeight = 50
        if (position.top + elHeight > clientHeight) {
          return {
            left: `${position.left + position.width + 200}px`,
            top: `${position.top - elHeight - 80}px`
          }
        } else {
          return {
            left: `${position.left + position.width + 200}px`,
            top: `${position.top - 80}px`
          }
        }
      }
    },
    calcHeight () {
      return function (position) {
        const clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight
        const elHeight = 50
        if (!position) {
          if (elHeight > clientHeight) {
            return 'alert-rule-abs-Up'
          } else {
            return 'alert-rule-abs'
          }
        }
        if (position.top + elHeight > clientHeight) {
          return 'alert-rule-tip-Up'
        } else {
          return 'alert-rule-tip'
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
      this.severityData.map(item => {
        this.severityColor = item.color
      })
    }
  },
  mounted () {
    this.$get('/alert/rule/' + this.id).then((res) => {
      if (res.msg === 'success') {
        this.loading = false
        this.severityDataColor()
        this.alertRuleData = res.data
      } else {
        this.$message.error(res.msg)
      }
    })
  }
}

</script>
