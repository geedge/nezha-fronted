<template>
  <div :style="calcPosition(that.position,that)" class="alert-label__border alert-label" v-loading="loading" ref="alertLabels">
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
        <div class="alert-rule-value">
          <span v-if="alertRuleData.type === 1">
            {{$t('project.metrics.metrics')}}
          </span>
          <span v-else-if="alertRuleData.type === 2">
            {{$t('overall.logs')}}
          </span>
          <span v-else-if="alertRuleData.type === 3">SNMP trap</span>
          <span v-else>--</span>
        </div>
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
        // const windowWidth = window.innerWidth
        const boxHeight = this.$refs.alertLabels ? this.$refs.alertLabels.offsetHeight : 231
        const windowHeight = window.innerHeight
        if (position.top > windowHeight / 2) {
          return {
            left: `${position.left + position.width + 10}px`,
            top: `${position.top - boxHeight}px`
          }
        } else {
          return {
            left: `${position.left + position.width + 10}px`,
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
