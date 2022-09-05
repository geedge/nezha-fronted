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
      if (q.bottomBox && JSON.parse(q.bottomBox)) {
        this.$nextTick(() => {
          this.detailType = q.detailType
          const detailType = this.detailType === 'list' ? 'dataList' : 'detailList'
          this.$refs[detailType].bottomBox.showSubList = JSON.parse(q.bottomBox)
          this.$refs[detailType].bottomBox.targetTab = q.targetTab
          this.$refs[detailType].bottomBox.object = JSON.parse(q.selectObj)
        })
      } else if (this.detailType === 'view') {
        this.detailType = q.detailType
        this.detailViewRightObj = JSON.parse(q.selectObj)
        this.$store.commit('setGlobalSearchId', this.detailViewRightObj.id)
      }
    },
    // 更新path，包含请求参数
    updatePath (param, path, from) {
      const params = lodash.cloneDeep(param)
      Object.keys(params).forEach(key => {
        if (!params[key]) {
          delete params[key]
        }
      })
      if (!from) {
        const detailType = this.detailType === 'list' ? 'dataList' : 'detailList'
        localStorage.setItem('detail-view-' + this.tableId, this.detailType)
        params.detailType = this.detailType
        params.bottomBox = this.$refs[detailType].bottomBox.showSubList
        if (this.detailType === 'list') {
          params.targetTab = this.$refs[detailType].bottomBox.targetTab
        } else {
          params.targetTab = this.$route.query.targetTab
        }
        if (this.detailType === 'list') {
          params.selectObj = JSON.stringify({
            id: this.$refs[detailType].bottomBox.object.id,
            name: this.$refs[detailType].bottomBox.object.name,
            config: this.$refs[detailType].bottomBox.object.config || '',
            childrenNum: this.$refs[detailType].bottomBox.object.childrenNum || ''
          })
        } else {
          this.$nextTick(() => {
            params.selectObj = JSON.stringify({
              id: this.$refs[detailType].detailViewRightObj.id,
              name: this.$refs[detailType].detailViewRightObj.name,
              config: this.$refs[detailType].detailViewRightObj.config || '',
              childrenNum: this.$refs[detailType].detailViewRightObj.childrenNum || ''
            })
          })
        }
        this.$router.replace({ path: path, query: params }).catch(err => {})
      } else if (from === 'nzDatalist') {
        params.bottomBox = this.bottomBox.showSubList
        params.targetTab = this.bottomBox.targetTab
        params.selectObj = JSON.stringify({
          id: this.bottomBox.object.id,
          name: this.bottomBox.object.name,
          config: this.bottomBox.object.config || '',
          childrenNum: this.bottomBox.object.childrenNum || ''
        })
        this.$router.replace({ path: path, query: params }).catch(err => {})
      } else if (from === 'nzDetailList') {
        params.targetTab = this.$route.query.targetTab
        params.selectObj = JSON.stringify({
          id: this.detailViewRightObj.id,
          name: this.detailViewRightObj.name,
          config: this.detailViewRightObj.config || '',
          childrenNum: this.detailViewRightObj.childrenNum || ''
        })
        this.$router.replace({ path: path, query: params }).catch(err => {})
      } else if (from === 'bottomBox') {
        params.targetTab = this.targetTab
        this.$router.replace({ path: path, query: params }).catch(err => {})
      }
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
