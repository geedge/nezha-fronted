<template>
  <div
    :class="{'is-focus': item.isFocus, 'is-hover': isHover}"
    class="nz-label-search"
  >
    <div class="nz-label-search__label"><span>{{item.name}}:</span></div>
    <el-cascader
      ref="cascader"
      v-bind="$attrs"
      v-model="cascaderData"
      :collapse-tags="collapseTags"
      :options="item.children"
      :props="{ multiple: true, label: 'name', value: 'id', checkStrictly: true }"
      placeholder=""
      popper-class="click-search-dropdown"
      size="mini"
      @blur="$emit('blur', item, false, $event)"
      @change="change"
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
    },
    selectValue: {},
    type: {}
  },
  watch: {
    selectValue: {
      immediate: true,
      handler (n) {
        console.log(n)
        this.cascaderData = []
        if (n && this.type !== 'fields') {
          n.forEach(item => {
            if (this.item.children.find(children => children.id == item)) {
              this.cascaderData.push([item])
              this.$emit('resize', [item])
            }
          })
        } else if (n && this.type === 'fields') {
          const obj = JSON.parse(n)
          if (obj[this.item.id]) {
            obj[this.item.id].forEach(item => {
              this.cascaderData.push([item])
              this.$emit('resize', [item])
            })
          }
        }
      }
    }
  },
  methods: {
    casHover (item, isHover, e) {
      return this.$set(item, 'isHover', isHover)
    },
    change (value) {
      this.$emit('change', value)
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
      ready: false,
      cascaderData: ''
    }
  },
  mounted () {
    setTimeout(() => { this.ready = true }, 1000)
  }
}
</script>

<style lang="scss" scoped>

</style>
