<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * 是否全屏
   */
  isFullScreen: boolean,
  /**
   *  resize时，用v-show="subResizeShow"控制页面内容是否显示
   */
  subResizeShow: boolean,
  /**
   *  关联的实体对象
   */
  obj: Object,
  /**
   *  来自哪个页面
   */
  from: String,
  /**
   *  动态页签列表
   */
  tabList: Array<any>,
  /**
   *  展示哪个页签
   */
  targetTab: String,
  /**
   *  pickTime历史记录的唯一标识
   */
  sign: [Number, String]
}>(), {

})
</script>

<template>
  <div>
  </div>
</template>
