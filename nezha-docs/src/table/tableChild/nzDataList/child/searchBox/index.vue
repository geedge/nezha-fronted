<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * 默认搜索条件
   */
  searchMsg?: {},
  /**
   * 来自那个页面
   */
  from: string,
  /**
   * 当前搜索框位置 如表格 底弹窗 弹窗等
   */
  position: {},
  /**
   * 当前所选择的查询条件
   */
  targetTab: {}
}>(), {

})
</script>

<template>
  <div>
  </div>
</template>
