<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * 绑定的时间数组
   */
  model?: Array<any>,
  /**
   * 刷新函数
   */
  refreshDataFunc?: Function,
  /**
   * 是否显示刷新
   */
  useRefresh?: boolean
  /**
   * 是否显示chart单位
   */
  useChartUnit?: boolean
  /**
   * 是否显示时间选择则
   */
  showTimePicker?: boolean
  /**
   * 是否显示时间同比
   */
  showMultiple?: boolean,
  /**
   * 默认显示时间
   */
  defaultPick?: Number,
  /**
   * 是否可以设置为空
   */
  showEmpty?: boolean,
  /**
   * 唯一id
   */
  id?: String,
  /**
   * 标识 用于区分是底弹窗 还是主页面
   */
  sign?: [Number, String],
  /**
   * 是否显示锁定
   */
  showLocked?: boolean,

}>(), {

})
</script>

<template>
  <div>
  </div>
</template>
