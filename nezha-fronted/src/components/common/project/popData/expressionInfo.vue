<template>
  <div class="expressionInfo">
    <div v-if="expressionInfoData.length===0">No Data</div>
    <div v-if="expressionInfoData.length>0">
      <el-row v-for="(item,index) in expressionInfoData" :key="index">
        {{item.legend.alias}}
        {{item.showValue}}
      </el-row>
    </div>
  </div>
</template>

<script>
  import chartDataFormat from "@/components/charts/chartDataFormat";
  export default {
    name:"expressionInfo",
    props:{
      chartData:{

      }
    },
    watch:{
      chartData(){
        this.expressionInfoData=[];
      }
    },
    data(){
      return{
        expressionInfoData:[]
      }
    },
    mounted(){
      console.log(this.chartData);
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

    },
    beforeDestroy(){

    }
  }
</script>

<style scoped>

</style>
