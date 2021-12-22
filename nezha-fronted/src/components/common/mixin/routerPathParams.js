import lodash from 'lodash'
export default {
  methods: {
  // 解析请求参数，初始化 searchLabel
    initQueryFromPath (searchKeys) {
      const q = this.$route.query
      lodash.forIn(searchKeys, (val, key) => {
        let qv = lodash.get(q, key)
        console.log(qv, q, key, val)
        if (qv && val.type == 'number') {
          qv = lodash.toNumber(qv)
        }
        setTimeout(() => {
          this.setSearchInput(val, qv)
        }, 200)
        qv && this.$set(val.target, val.propertyName, qv)
      })
    },
    // 更新path，包含请求参数
    updatePath (param, path) {
      // console.log(param)
      this.$router.replace({ path: path, query: param }).catch(err => {})
    },
    setSearchInput (val, qv) {
      let dataList = ''
      if (this.detailType !== 'view') {
        dataList = 'dataList'
      } else {
        dataList = 'detailList'
      }
      if (val.isSearchInput) {
        setTimeout(() => {
          const obj = lodash.cloneDeep(val.defaultJson)
          obj[val.jsonKey] = qv
          this.$refs[dataList].$refs.searchInput.select_list.push(obj)
          this.$refs[dataList].$refs.searchInput.sreach_num++
          // this.$refs[dataList].$refs.searchInput.searchLabelList = this.$refs[dataList].$refs.searchInput.searchLabelList.filter(item => item.label !== 'projectIds')
        })
      }
    }
  }
}
