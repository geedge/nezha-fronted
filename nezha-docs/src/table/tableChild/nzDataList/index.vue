<script lang="ts" setup>
const props = withDefaults(defineProps<{
  /**
   * 当前展示类型
   */
  detailType?: string,
  /**
   * 表格标题
   */
  tableTitle?: Array<any>,
  /**
   * 编辑后的表格标题
   */
  customTableTitle?: Array<any>,
  /**
   * 当前使用的插槽
   */
  layout?: Array<any>,
  /**
   * 搜索框使用的相关参数
   */
  searchMsg?: Array<any>,
  /**
   * 当前底弹窗加header的高度
   */
  nzTableHeightOffset?: number,
  /**
   * 是否隐藏删除
   */
  hideDelete?: boolean,
  /**
   * 搜索框位置
   */
  searchRight?: boolean

}>(), {

})
</script>

<template>
  <div>
    <!-- 这里是默认插槽，可以插入自定义内容 -->
    <slot name="top-tool-left">{ 213123 }</slot>
    <slot name="top-tool-right">{{ 213123 }}</slot>
    <slot name="search">{{ 213123 }}</slot>
    <slot name="pagination">{{ 213123 }}</slot>
    <slot name="default">{{ 213123 }}</slot>
  </div>
</template>
