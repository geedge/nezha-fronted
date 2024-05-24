<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * chart相关信息 主要是要里面的 id 以及 params
   */
  chartInfo?: {  },
 /**
   * chart数据
   */
 chartData?:  [],
  /**
   *  chart相应配置
   */
  chartOption?: {  },
  /**
   *  但是否显示全部数据
   */
  showAllData?: Boolean,
  /**
   *  dashboard 相关变量
   */
  globalVariables?: [],

}>(), {

})
</script>

<template>
  <div>
  </div>
</template>
