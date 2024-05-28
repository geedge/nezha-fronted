<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * 当前所有已输入的表达式列表
   */
  expressionList?: Array<any>,
  /**
   * 表示是当前输入的第几个
   */
  index?: Array<any>,
  /**
   * 状态 查询时是否使用
   */
  state?: number,
  /**
   * 当前显示的样式 主要两种 右侧弹窗 以及 explore的位置
   */
  styleType?: number,
  /**
   * 历史信息查询条件
   */
  historyParam?: {},
  /**
   * 是否显示删除
   */
  showRemove?: boolean,
  /**
   * 是否必填
   */
  required?: boolean,
  /**
   * 类型 metric 或者 log 为空时视为metric
   */
  type?: string,

}>(), {

})
</script>

<template>
  <div>
  </div>
</template>
