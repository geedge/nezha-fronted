<template>
  <div class="alert-rule-info" :style="calcPosition(that.position)" v-loading="loading">
    <div class="alert-rule-box">
      <div class="alert-rule-title">ID</div>
      <div class="alert-rule-value">{{alertRuleData?alertRuleData.id:''}}</div>
    </div>
    <!--<div class="alert-rule-box">-->
      <!--<div class="alert-rule-title">ID</div>-->
      <!--<div class="alert-rule-value">{{alertRuleData.id}}</div>-->
    <!--</div>-->
    <div class="alert-rule-box">
      <div class="alert-rule-title">Expression</div>
      <div class="alert-rule-value">{{alertRuleData?(alertRuleData.expr + alertRuleData.operator + formatThreshold(alertRuleData.threshold,alertRuleData.unit)):''}}</div>
    </div>
    <div class="alert-rule-box">
      <div class="alert-rule-title">Level</div>
      <div class="alert-rule-value">
        <span v-if="alertRuleData && alertRuleData.severity === 'high'"><i class="nz-icon nz-icon-arrow-up"></i>&nbsp;{{$CONSTANTS.alertMessage.severityData.find(s => {return s.value == 'high'}).label}}</span>
        <span style="padding-left: 18px;" v-if="alertRuleData && alertRuleData.severity === 'medium'">{{$CONSTANTS.alertMessage.severityData.find(s => {return s.value == 'medium'}).label}}</span>
        <span v-if="alertRuleData && alertRuleData.severity === 'low'"><i class="nz-icon nz-icon-arrow-down"></i>&nbsp;{{$CONSTANTS.alertMessage.severityData.find(s => {return s.value == 'low'}).label}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  import chartDataFormat from '../../charts/chartDataFormat'
	export default {
		name:"alert-rule-info",
    props:{
		  id:{},
      messageLoad:{},
      that: {}
    },
    /*watch:{
      messageLoad:{
        handler:function(){
          this.$get('/alert/rule?id='+this.id).then((res)=>{
            if(res.msg==='success'){
              this.loading=false;
              this.alertRuleData=res.data.list[0];
            } else{
              this.$message.error(res.msg);
            }
          })
        },
        deep:true
      }
    },*/
    data() {
		  return {
		    loading:true,
        alertRuleData:''
      }
    },
    components:{

    },
    computed: {
      calcPosition() {
        return function(position) {
          return {
            left: `${position.left + position.width + 20}px`,
            top: `${position.top + 20}px`,
          }
        }
      }
    },
    methods:{
      formatThreshold(value,unit) {
        let unitMethod = chartDataFormat.getUnit(unit);
        if (unitMethod&&value) {
          return unitMethod.compute(value, null, 2);
        } else {
          return value;
        }
      },
    },
    mounted(){
      this.$get('/alert/rule?id='+this.id).then((res)=>{
        if(res.msg === 'success') {
          this.loading = false;
          this.alertRuleData=res.data.list[0];
        } else{
          this.$message.error(res.msg);
        }
      });
    },
	}

</script>

<style scoped>
  .alert-rule-info::after {
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
    position: fixed;
    background-color: white;
    z-index: 3000;
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
  }
</style>
