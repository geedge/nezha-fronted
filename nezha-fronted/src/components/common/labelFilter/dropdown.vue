<template>
  <div
    :class="{'is-focus': item.isFocus, 'is-hover': isHover}"
    class="nz-label-search"
  >
    <div class="nz-label-search__label">
      <span>{{item.name}}: </span>
    </div>
    <el-cascader
      v-if="item.isInit"
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
    >
      <template slot-scope="{ node, data }">
        <span>{{ data.name }}</span>
        <span class="search-content-num">({{data.num || 0 }})</span>
      </template>
    </el-cascader>
    <div v-else style="padding: 0 5px 0 32px" @click="initCascader(item)" class="nz-dropdown-icon">
      <i class="el-input__icon el-icon-arrow-down"/>
    </div>
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
        this.cascaderData = []
        if (n && this.type !== 'fields' && this.type !== 'state') {
          n.forEach(item => {
            if (this.item.children.find(children => children.id == item)) {
              this.cascaderData.push([item])
              setTimeout(() => {
                this.$emit('resize', [item])
              })
            }
          })
        } else if (n && (this.type === 'fields' || this.type === 'state')) {
          const obj = JSON.parse(n)
          if (obj[this.item.id]) {
            obj[this.item.id].forEach(item => {
              this.cascaderData.push([item])
              setTimeout(() => {
                this.$emit('resize', [item])
              })
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
    },
    initCascader (item) {
      item.isInit = true
      this.$nextTick(() => {
        this.$refs.cascader.dropDownVisible = true
      })
    }
  },
  computed: {
    isHover () {
      if (this.ready) {
        // return this.$refs.cascader.inputHover
        return false
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
