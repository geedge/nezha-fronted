<template>
  <div class="expression-info">
    <div class="expression-info-title">{{filterTime[1]}}</div>
    <div class="expression-info-content" v-if="expressionInfoData.length===0">No Data</div>
    <div class="expression-info-content" v-if="expressionInfoData.length>0">
      <el-row v-for="(item,index) in expressionInfoData" :key="index" v-if="index<20">
        <el-col class="info-title" :span="18">{{item.legend.alias}}</el-col>
        <el-col class="info-content" :span="6" :style="{background:computeData(item).fill,color:computeData(item).text}">{{item.showValue}}</el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  export default {
    name:"expressionInfo",
    props:{
      chartData:{

      },
      filterTime:{},
    },
    watch:{
      chartData(){
        this.expressionInfoData=[];
        if(this.chartData.res.length>0){
          this.chartData.res.forEach((item,index)=>{
            if(item.status==='success'){
              this.expressionInfoData=this.expressionInfoData.concat(item.data.result);
            }
          });
          console.log(this.expressionInfoData);
        }
      }
    },
    data(){
      return{
        expressionInfoData:[]
      }
    },
    mounted(){
      if(this.chartData.res.length>0){
        this.chartData.res.forEach((item,index)=>{
          if(item.status==='success'){
            this.expressionInfoData=this.expressionInfoData.concat(item.data.result);
          }
        });
        console.log(this.expressionInfoData);
      }
    },
    methods:{
      computeData(item){
        if(item.level){
          return this.chartData.valueMapping.find((item2)=>item.level===item2.level).color
        } else {
          return {
            fill:'#ffffff',
            text:'#000000',
          }
        }
      }
    },
    beforeDestroy(){

    }
  }
</script>

<style lang="scss" scoped>
  .expression-info{
    padding: 5px;
    height: 100%;
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    .expression-info-title{
      font-size: 14px;
      color: #333333;
      letter-spacing: 0;
      font-weight: 600;
      line-height: 40px;
      height: 40px;
      border-bottom: 1px  dashed #DCE1E7;
    }
    .expression-info-content{
      height: calc(100% - 60px);
      overflow-y: auto;
      padding:5px;
    }
    .info-title{
      overflow: hidden;
      padding-right: 10px;
      text-overflow: ellipsis;
      line-height: 20px;
      font-weight: 500;
      word-break:keep-all; /* 不换行 */
      white-space:nowrap; /* 不换行 */
    }
    .info-content{
      text-align: center;
    }
  }
</style>
