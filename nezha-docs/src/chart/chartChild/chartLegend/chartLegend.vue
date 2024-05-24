<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * chart相关信息 主要是要里面的 id 以及 params
   */
  chartInfo?: {  },
 /**
   * chart数据
   */
 chartData?: Array,
  /**
   * legend 数据
   */
  legends: Array,
  /**
   * 是否全屏
   */
  isFullscreen: boolean,
  /**
   * 所有根据图表处理过后的数据
   */
  series: Array

}>(), {

})
</script>

<template>
  <div>
  </div>
</template>
