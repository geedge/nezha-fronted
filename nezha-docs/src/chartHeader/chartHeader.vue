<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * chart相关信息 如id 位置等
   */
  chartInfo?: string,
  /**
   * 是否报错
   */
  isError?: boolean,
  /**
   * chart相关数据 若报错 取 item.error
   */
  chartData?: {  },
  /**
   * 是否显示全部数据
   */
  showAllData?: boolean,
  /**
   * 全部数据的长度
   */
  allDataLength?: number,
  /**
   * 是否为快照
   */
  isExportHtml?: boolean,
  /**
   * 是否为预览
   */
  isPreview?: boolean,
}>(), {

})
</script>

<template>
  <div>
  </div>
</template>
