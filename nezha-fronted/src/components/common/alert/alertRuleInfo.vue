<template>
  <div class="alert-rule-info" v-loading="loading">
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
        <span v-if="alertRuleData && alertRuleData.severity === 'high'"><i class="el-icon-arrow-up"></i>&nbsp;{{severityData[1].value}}</span>
        <span style="padding-left: 18px;" v-if="alertRuleData && alertRuleData.severity === 'medium'">{{severityData[0].value}}</span>
        <span v-if="alertRuleData && alertRuleData.severity === 'low'"><i class="el-icon-arrow-down"></i>&nbsp;{{severityData[2].value}}</span>
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
      severityData:{
        type:Array
      },
      messageLoad:{},
    },
    watch:{
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
    },
    data() {
		  return {
		    loading:true,
        alertRuleData:''
      }
    },
    components:{

    },

    methods:{
      formatThreshold(value,unit) {
        let unitMethod = chartDataFormat.getUnit(unit);
        if (unitMethod&&value) {
          return unitMethod.compute(value, null, 2);
        } else {
          return value
        }
      },
    },
    mounted(){

    },
	}

</script>

<style scoped>
  .alert-rule-info{
    border: 1px solid #ebeef5;
    border-bottom: none;
    font-size: 13px;
    line-height: 26px;
  }
  .alert-rule-box{
    display: flex;
    justify-content:space-between;
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
    width: 180px;
    color: #1a1a1a;
    padding: 0 3px 0 13px;
  }
</style>
