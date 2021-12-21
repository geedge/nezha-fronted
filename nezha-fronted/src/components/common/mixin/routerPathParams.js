import lodash from 'lodash'
export default {
  methods: {
  // 解析请求参数，初始化 searchLabel
    initQueryFromPath () {
      const q = this.$route.query
      const searchKeys = {
      // key: path 键
      // value: vue set 参数
        pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
        pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
        orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
        id: { target: this.searchLabel, propertyName: 'id', type: 'number' },
        severityIds: { target: this.searchLabel, propertyName: 'severityIds', type: 'string' },
        type: { target: this.searchLabel, propertyName: 'type', type: 'number' },
        name: { target: this.searchLabel, propertyName: 'name', type: 'string' }
      }
      lodash.forIn(searchKeys, (val, key) => {
        let qv = lodash.get(q, key)
        if (qv && val.type == 'number') {
          qv = lodash.toNumber(qv)
        }
        qv && this.$set(val.target, val.propertyName, qv)
      })
    },
    // 更新path，包含请求参数
    updatePath (param) {
      this.$router.replace({ path: this.fromRoute.alertRule, query: param }).catch(err => {})
    }
  }
}
