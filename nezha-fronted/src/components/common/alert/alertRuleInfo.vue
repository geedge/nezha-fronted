<template>
  <div :class="calcHeight(that.position,that)" :style="calcPosition(that.position,that)" v-loading="loading">
    <div class="alert-rule-info" >
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
        <div class="alert-rule-value severity">
          <span v-if="alertRuleData && alertRuleData.severity === 'P1'" class="P1">
            {{$CONSTANTS.alertMessage.severityData.find(s => {return s.value == 'P1'}).label}}
          </span>
          <span v-if="alertRuleData && alertRuleData.severity === 'P2'" class="P2">
            {{$CONSTANTS.alertMessage.severityData.find(s => {return s.value == 'P2'}).label}}
          </span>
          <span v-if="alertRuleData && alertRuleData.severity === 'P3'" class="P3">
            {{$CONSTANTS.alertMessage.severityData.find(s => {return s.value == 'P3'}).label}}
          </span>
        </div>
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
        let self=this;
        return function(position) {
          let clientHeight = (document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
          let elHeight=50;
          if(position.top+elHeight>clientHeight){
            return {
              left: `${position.left + position.width + 20}px`,
              top: `${position.top -elHeight- 20}px`,
            }
          }else{
            return {
              left: `${position.left + position.width + 20}px`,
              top: `${position.top - 20}px`,
            }
          }
        }
      },
      calcHeight(){
        let self=this;
        return function(position) {
          let clientHeight = (document.body.clientHeight<document.documentElement.clientHeight)?document.body.clientHeight:document.documentElement.clientHeight;
          let elHeight=50;
          if(position.top+elHeight>clientHeight){
            return 'alert-rule-tip-Up'
          }else{
            return 'alert-rule-tip'
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
    top: 20px;
    left: 0;
    transform: translate(-100%, -50%);
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
    bottom: 20px;
    left: 0;
    transform: translate(-100%, -50%);
  }
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
    width: 110px;
    border-right: 1px solid #ebeef5;
    color: #666;
    padding: 0 3px 0 13px;
  }
  .alert-rule-value{
    text-align: left;
    width: 150px;
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
