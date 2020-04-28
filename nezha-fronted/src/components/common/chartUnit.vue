<template>
    <el-cascader filterable placeholder="" popper-class="no-style-class unit-pop-class" size="mini"
                 :options="chartUnits"
                 class="chart-unit"
                 :props="{ expandTrigger: 'click' ,emitPath:false}"
                 :show-all-levels="false"
                 v-model="unit"
                 @change="unitSelected"
    >
    </el-cascader>
</template>

<script>
  import chartDataFormat from "../charts/chartDataFormat";
  export default {
    name: "chartUnit",
    model:{
      event:'change',
      prop:'postUnit'
    },
    props:{
      postUnit:{}
    },
    data(){
      return{
        chartUnits:chartDataFormat.unitOptions(),
        visibel:false,
        unit:0,
      }
    },
    created() {
      this.unit=this.postUnit;
    },
    methods:{
      unitSelected:function(value){
        this.unit=value;
        this.$emit('change',this.unit);
      },
    }
  }
</script>

<style >
  .chart-unit{
    width: 100px;
    margin: 0 20px 0 0;
  }
  .unit-pop-class .el-cascader-panel{
    height: 200px;
    background-color: #FFF;
  }
</style>
