<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * dashboard Id 唯一
   */
  dashboardId?: string,
  /**
   * 底部弹窗的相关信息
   */
  chartDetailInfo?: Object,
  /**
   * 时间范围
   */
  timeRange?: Array,
  /**
   * 是否是组
   */
  isGroup? : boolean,
  /**
   * 组相关信息 包括 位置 宽高等
   */
  groupInfo?: Object,
  /**
   * 父页面位置
   */
  from?: string,
  /**
   * 所有组件相关信息
   */
  dataList?: Array,
  /**
   * 是否是快照文件
   */
  isExportHtml?:  boolean,
  /**
   * 快照文件相关数据
   */
  dataJson?:  {},
  /**
   * 用于判断 dashboard变量是否加载完成
   */
  variablesInit?:  boolean,
  /**
   *
   */
  showTool?: boolean
}>(), {
  dashboardId: '',
  chartDetailInfo: {},
  timeRange: ['start', 'end', 'type dashboard.vue/timeData'],
  isGroup: false,
  groupInfo: {},
  from: '',
  dataList: [],
  isExportHtml: false,
  dataJson: {},
  variablesInit: true,
  showTool: true,
})
</script>

<template>
  <div>

  </div>
</template>
