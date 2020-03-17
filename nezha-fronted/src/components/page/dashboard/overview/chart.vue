<template>
  <div class="chart-room">
    <loading  :ref="localLoading"></loading>

    <div class="chart-header"></div>

    <div class="chart-body" ref="chartBody" id="chartBody"></div>

    <div class="chart-foot">
      <el-scrollbar>
        <div class="chart-legend"></div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
  import echarts from 'echarts';
  import chartDataFormat from "../../../charts/chartDataFormat";
  import loading from "../../../common/loading";
  import chartConfig from './chartConfig'
  export default {
    name: "chart",
    props:[],
    data(){
      return {
        option:chartConfig.getCommonOption
      }
    },
    created() {
    },
    methods:{

    },
    watch:{

    }
  }
</script>

<style scoped>

</style>
