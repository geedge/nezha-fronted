<template>
  <div
    :class="{'is-focus': item.isFocus, 'is-hover': isHover}"
    class="nz-label-search"
  >
    <div class="nz-label-search__label"><span>{{item.name}}:</span></div>
    <el-cascader
      ref="cascader"
      v-bind="$attrs"
      :collapse-tags="collapseTags"
      :options="item.children"
      :props="{ multiple: true, label: 'name', value: 'id' }"
      placeholder=""
      popper-class="click-search-dropdown"
      size="mini"
      @blur="$emit('blur', item, false, $event)"
      @change="$emit('change')"
      @focus="$emit('focus', item, true, $event)"
    ></el-cascader>
  </div>
</template>

<script>
export default {
  name: 'dropdown',
  props: {
    item: Object,
    size: String,
    collapseTags: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    casHover (item, isHover, e) {
      return this.$set(item, 'isHover', isHover)
    }
  },
  computed: {
    isHover () {
      if (this.ready) {
        return this.$refs.cascader.inputHover
      } else {
        return false
      }
    }
  },
  data () {
    return {
      ready: false
    }
  },
  mounted () {
    setTimeout(() => { this.ready = true }, 1000)
  }
}
</script>

<style scoped>

</style>
