<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * chart相关信息 主要是要里面的 id 以及 params
   */
  chartInfo?: {  },
 /**
   * chart数据
   */
 chartData?: {  },
  /**
   *  需要自定义echarts的option时传入，非必须；传入该值时仍需传对应格式的chartData
   */
  customChartOption?: {  },
  /**
   *  是否全屏
   */
  isFullscreen?: boolean,
  /**
   *  是否显示loading
   */
  loading?: boolean,
  /**
   *  是否锁定
   */
  panelLock?: boolean,
  /**
   *  是否报错
   */
  isError?: boolean,
  /**
   *  相对时间
   */
  multipleTime?: {},
  /**
   *  相差时间
   */
  minusTime?: {},
  /**
   *  但是否显示全部数据
   */
  showAllData?: {},
  /**
   *  dashboard 相关变量
   */
  globalVariables?: {},

}>(), {

})
</script>

<template>
  <div>
  </div>
</template>
