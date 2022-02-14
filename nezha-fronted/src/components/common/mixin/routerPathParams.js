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
        if (qv && val.type == 'array') {
          qv = qv.split(',')
        }
        if (qv && val.type == 'jsonParse') {
          qv = JSON.parse(qv)
        }
        setTimeout(() => {
          this.setSearchInput(val, qv)
          if (qv && val.type2 == 'array') {
            const arr = qv.split(',').map(item => Number(item))
            qv && this.$set(val.target2, val.propertyName, arr)
          }
          if (qv && val.type2 == 'json') {
            qv && this.$set(val.target2, val.propertyName, qv)
          }
        }, 200)
        qv && this.$set(val.target, val.propertyName, qv)
      })
    },
    // 更新path，包含请求参数
    updatePath (param, path) {
      const params = lodash.cloneDeep(param)
      Object.keys(params).forEach(key => {
        if (!params[key]) {
          delete params[key]
        }
      })
      this.$router.replace({ path: path, query: params }).catch(err => {})
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
          if (obj[val.jsonKey]) {
            this.$refs[dataList].$refs.searchInput.select_list.push(obj)
            this.$refs[dataList].$refs.searchInput.sreach_num++
          }
          // this.$refs[dataList].$refs.searchInput.searchLabelList = this.$refs[dataList].$refs.searchInput.searchLabelList.filter(item => item.label !== 'projectIds')
        }, 500)
      }
    },
    switchChange (formName) {
      const $temp = this
      $temp.$refs[formName].clearValidate()
      setTimeout(() => {
        $temp.$refs[formName].validate()
      }, 100)
    }
  }
}
