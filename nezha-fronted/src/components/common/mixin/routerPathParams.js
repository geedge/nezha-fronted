import lodash from 'lodash'
export default {
  methods: {
  // 解析请求参数，初始化 searchLabel
    initQueryFromPath (searchKeys) {
      const q = this.$route.query
      lodash.forIn(searchKeys, (val, key) => {
        let qv = lodash.get(q, key)
        if (qv && val.type == 'number') {
          qv = lodash.toNumber(qv)
        }
        qv && this.$set(val.target, val.propertyName, qv)
      })
    },
    // 更新path，包含请求参数
    updatePath (param, path) {
      console.log(param)
      this.$router.replace({ path: path, query: param }).catch(err => {})
    }
  }
}
