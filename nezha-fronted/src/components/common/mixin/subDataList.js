export default {
  props: {
    obj: Object, // 关联的实体对象
    tabs: {
      type: Array
    },
    targetTab: String,
    from: String
  },
  data () {
    return {
      subTableHeight: this.$tableHeight.openSubList.subList,
      isSubList: true
    }
  },
  methods: {
    // 切换tab
    changeTab (tab) {
      this.$emit('changeTab', tab)
    }
  }
}
