<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * chart详细信息
   */
  chartInfo?: {},
  /**
   * 时间范围
   */
  timeRange?: [],
  /**
   * 是否全屏
   */
  isFullscreen?: boolean,
  /**
   * 是否锁定
   */
  panelLock?: boolean,
  /**
   * header 是否为hover激活
   */
  showHeader?: boolean,
  /**
   * 是否为快照
   */
  isExportHtml?: boolean,
  /**
   * 快照数据
   */
  dataJson?: { },
  /**
   * 隐藏图表的悬浮文字
   */
  hiddenText?: string,
  /**
   * 是否为预览
   */
  isPreview?: string,
}>(), {

})
</script>

<template>
  <div>
  </div>
</template>
