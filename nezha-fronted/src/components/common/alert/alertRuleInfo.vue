<template>
  <div :class="calcHeight(that.position,that)" :style="calcPosition(that.position,that)" class="alert-label__border" v-loading="loading">
    <div class="alert-rule-info" >
      <div class="alert-rule-box">
        <div class="alert-rule-title">ID</div>
        <div class="alert-rule-value">{{alertRuleData.id ? alertRuleData.id : ''}}</div>
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.name')}}</div>
        <div class="alert-rule-value">{{alertRuleData.name ? alertRuleData.name : ''}}</div>
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.type')}}</div>
        <div class="alert-rule-value">{{alertRuleData.type ? alertRuleData.type : ''}}</div>
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.severity')}}</div>
        <div class="alert-rule-value"><i class="nz-icon nz-icon-circle" :style="{color:severityColor,'font-size':'12px','margin-right':'5px'}"></i>{{alertRuleData.severityId ? severityData.find(s => alertRuleData.severityId === s.id).name : ''}}</div>
        <!--        <div class="alert-rule-value severity">
                  <span v-if="alertRuleData && alertRuleData.severity === 'P1'" class="P1">
                    {{$CONSTANTS.alertMessage.severityData.find(s => {return s.value === 'P1'}).label}}
                  </span>
                  <span v-if="alertRuleData && alertRuleData.severity === 'P2'" class="P2">
                    {{$CONSTANTS.alertMessage.severityData.find(s => {return s.value === 'P2'}).label}}
                  </span>
                  <span v-if="alertRuleData && alertRuleData.severity === 'P3'" class="P3">
                    {{$CONSTANTS.alertMessage.severityData.find(s => {return s.value === 'P3'}).label}}
                  </span>
                </div>-->
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.config.threshold')}}</div>
        <div class="alert-rule-value">{{alertRuleData.threshold ? alertRuleData.threshold : ''}}</div>
      </div>
      <div class="alert-rule-box">
        <div class="alert-rule-title">{{$t('alert.config.expr')}}</div>
        <div class="alert-rule-value">{{alertRuleData.expr ? (alertRuleData.expr + alertRuleData.operator + formatThreshold(alertRuleData.threshold,alertRuleData.unit)) : ''}}</div>
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
        <div class="alert-rule-value" @click="trbShotShow"><i class="nz-icon nz-icon-guzhangshuju" style="color: #fa901c"></i></div>
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
        console.log(item.color)
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

<style scoped>
  .alert-rule-tip {
    position: fixed;
    background-color: white;
    z-index: 3000;
    padding: 10px;
    border-radius: 4px;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .alert-rule-tip::after {
    content: '';
    display: block;
    width:0;
    height:0;
    overflow: hidden;
    font-size: 0;
    line-height: 0;
    border: 5px;
    border-style: dashed solid dashed dashed;
    border-color: transparent #fff transparent transparent;
    position: absolute;
    top: 100px;
    left: 0;
    transform: translate(-100%, -50%);
  }
  .alert-rule-abs {
    background-color: white;
    z-index: 3000;
    padding: 10px;
    border-radius: 4px;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .alert-rule-tip-Up {
    position: fixed;
    background-color: white;
    z-index: 3000;
    padding: 10px;
    border-radius: 4px;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .alert-rule-tip-Up::after {
    content: '';
    display: block;
    width:0;
    height:0;
    overflow: hidden;
    font-size: 0;
    line-height: 0;
    border: 5px;
    border-style: dashed solid dashed dashed;
    border-color: transparent #fff transparent transparent;
    position: absolute;
    bottom: 95px;
    left: 0;
    transform: translate(-100%, -50%);
  }
  .alert-rule-abs-Up {
    background-color: white;
    z-index: 3000;
    padding: 10px;
    border-radius: 4px;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .alert-rule-info{
    border-bottom: none;
    font-size: 13px;
    line-height: 26px;
  }
  .alert-rule-box{
    display: flex;
    flex-direction: row;
  }
  .alert-rule-title{
    text-align: left;
    width: 110px;
    color: #666;
    padding: 0 3px 0 13px;
  }
  .alert-rule-value{
    text-align: left;
    color: #1a1a1a;
    padding: 0 3px 0 13px;
    word-wrap: break-word;
    white-space: normal;
    overflow: hidden;
  }
  .severity .P1{
    background: #F5846A;
    border-radius: 2px;
    font-size: 12px;
    color: #FFFFFF;
    padding: 2px 6px;
  }
  .severity .P2{
    background: #F7A54A;
    border-radius: 2px;
    font-size: 12px;
    color: #FFFFFF;
    padding: 2px 6px;
  }
  .severity .P3{
    background: #F1C13D;
    border-radius: 2px;
    font-size: 12px;
    color: #FFFFFF;
    padding: 2px 6px;
  }
  .alert-label__border {
    background: #FFFFFF;
    border: 1px solid #E7EAED;
    box-shadow: 0 6px 16px 0 rgba(0,0,0,0.08);
    border-radius: 3px 3px 3px 3px 0 0;
  }
/*  .alert-rule-info::after {
    content: '';
    display: block;
    width:0;
    height:0;
    overflow: hidden;
    font-size: 0;
    line-height: 0;
    border: 5px;
    border-style: dashed solid dashed dashed;
    border-color: transparent #fff transparent transparent;
    position: absolute;
    top: calc(50% - 6px);
    left: 0;
    transform: translate(-100%, -100%);
  }
  .alert-rule-info{
    border: 1px solid #ebeef5;
    border-bottom: none;
    font-size: 13px;
    line-height: 26px;
  }*/
/*  .alert-rule-info{
    border: 1px solid #ebeef5;
    border-bottom: none;
    font-size: 13px;
    line-height: 26px;
    display: flex;
    background-color: white;
    padding: 10px;
    transform: translateY(-50%);
    overflow-wrap: break-word;
    border-radius: 4px;
    box-shadow: -1px 1px 9px -1px rgba(205,205,205,0.77);
  }
  .alert-rule-box{
    display: flex;
    border-bottom: 1px solid #ebeef5;
  }
  .alert-rule-title{
    text-align: left;
    width: 80px;
    border-right: 1px solid #ebeef5;
    color: #666;
    padding: 0 3px 0 13px;
  }
  .alert-rule-value{
    text-align: left;
    color: #1a1a1a;
    padding: 0 3px 0 13px;
  }*/
</style>
