<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * 是否显示强制删除
   */
  forceDeleteShow?: boolean,
  /**
   * 需要删除的数组
   */
  deleteObjs?: Array,
  /**
   * 删除接口
   */
  api?: string,
  /**
   * 唯一id
   */
  id?: string,
  /**
   * 删除按钮的样式 是按钮 还是文字
   */
  type?: string,
  /**
   * 删除的标题
   */
  deleteTitle?: string,
  /**
   * 是否需要强制删除
   */
  single?: boolean,
}>(), {

})
</script>

<template>
  <div>
  </div>
</template>
