<template>
  <span class="nz-alert-tag" :class="['nz-alert-tag_' + type]" :style="{cursor: cursorPoint ? 'default' : 'default'}" @click="$emit('click')">
    <span class="nz-alert-tag__label"> {{label=='dc'?'datacenter':label}}</span>
    <span class="nz-alert-tag__content"><span v-if="!!regex"> ~ </span> <slot></slot></span>
  </span>
</template>

<script>
export default {
  name: 'nzAlertTag',
  props: {
    label: String, // 标题
    type: { type: String, default: 'normal' }, // normal:blue; success:green; info:gray; danger:red; warning:orange;
    cursorPoint: { type: Boolean, default: true }, // 是否鼠标悬停变手指
    regex: { type: Number, default: 0 }
  }
}
</script>
