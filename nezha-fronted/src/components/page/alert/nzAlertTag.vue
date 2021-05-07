<template>
  <span class="nz-alert-tag" :class="['nz-alert-tag_' + type]" :style="{cursor: cursorPoint ? 'pointer' : 'default'}" @click="$emit('click')">
   <span class="nz-alert-tag__label"> {{label}}</span>
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
  },
  methods: {
  },
  computed: {
  }
}
</script>

<style scoped lang="scss">
.nz-alert-tag {
  border: 1px solid;
  height: 20px;
  font-size: 12px;
  line-height: 20px;
  border-radius: 4px;
  display: inline-block;
  box-sizing: content-box;
}
.nz-alert-tag__label {
  border-radius: 3px 0 0 3px;
  padding: 0 4px;
  min-width: 36px;
  max-width: 100px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  word-break: break-all;
  display: inline-block;
  height: 21px;
  box-sizing: content-box;
  margin-left: -1px;
}
.nz-alert-tag__content {
  border-radius: 0 3px 3px 0;
  padding: 0 4px;
  min-width: 36px;
  max-width: 115px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  word-break: break-all;
  display: inline-block;
}
.nz-alert-tag_normal {
  border-color: #409eff;
  .nz-alert-tag__label {
    border-right: 1px solid #409eff;
    background-color: #409eff;
    color: white;
  }
}
.nz-alert-tag_success {
  border-color: #50d050;
  .nz-alert-tag__label {
    border-right: 1px solid #50d050;
    background-color: #50d050;
    color: white;
  }
}
.nz-alert-tag_info {
  border-color: #909399;
  .nz-alert-tag__label {
    border-right: 1px solid #909399;
    background-color: #909399;
    color: white;
  }
}
.nz-alert-tag_danger {
  border-color: #d64f40;
  .nz-alert-tag__label {
    border-right: 1px solid #d64f40;
    background-color: #d64f40;
    color: white;
  }
}
.nz-alert-tag_warning {
  border-color: #e6a23c;
  .nz-alert-tag__label {
    border-right: 1px solid #e6a23c;
    background-color: #e6a23c;
    color: white;
  }
}
</style>
