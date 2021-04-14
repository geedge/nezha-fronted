export default {
  props: {
    obj: Object, // 关联的实体对象
    tabs: {
      type: Array
    }
  },
  data () {
    return {
      subTableHeight: this.$tableHeight.openSubList.subList
    }
  },
  methods: {
    // 切换tab
    changeTab (tab) {
      this.$emit('changeTab', tab)
    }
  }
}
