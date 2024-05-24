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
   * legend 数据
   */
  legends: [],
  /**
   * 是否全屏
   */
  isFullscreen: boolean,
  /**
   * 所有根据图表处理过后的数据
   */
  series: []

}>(), {

})
</script>

<template>
  <div>
  </div>
</template>
