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
      } else if (this.detailType === 'view' && q.detailType && q.selectObj) {
        this.detailType = q.detailType
        this.detailViewRightObj = JSON.parse(q.selectObj)
        this.$store.commit('setGlobalSearchId', this.detailViewRightObj.id)
      }
    },
    // 更新path，包含请求参数
    updatePath (param, path, from) {
      this.$nextTick(() => {
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
          if (this.detailType === 'list' && this.$refs[detailType]) {
            params.bottomBox = this.$refs[detailType].bottomBox.showSubList
            params.targetTab = this.$refs[detailType].bottomBox.targetTab
          } else {
            params.bottomBox = false
            params.targetTab = this.$route.query.targetTab
          }
          if (this.detailType === 'list' && this.$refs[detailType]) {
            params.selectObj = JSON.stringify({
              id: this.$refs[detailType].bottomBox.object.id,
              name: this.$refs[detailType].bottomBox.object.name,
              configs: this.$refs[detailType].bottomBox.object.configs ? this.$refs[detailType].bottomBox.object.configs.map(item => { return { type: item.type, enable: item.enable } }) : '',
              childrenNum: this.$refs[detailType].bottomBox.object.childrenNum || '',
              clientState: this.$refs[detailType].bottomBox.object.clientState || '',
              protocol: this.$refs[detailType].bottomBox.object.protocol || '',
              uuid: this.$refs[detailType].bottomBox.object.uuid || '',
              startTime: this.$refs[detailType].bottomBox.object.startTime || '',
              model: {
                tsgAppliance: this.$refs[detailType].bottomBox.object.model ? this.$refs[detailType].bottomBox.object.model.tsgAppliance : ''
              }
            })
          } else if (this.$refs[detailType] && this.$refs[detailType].detailViewRightObj) {
            this.$nextTick(() => {
              params.selectObj = JSON.stringify({
                id: this.$refs[detailType].detailViewRightObj.id,
                name: this.$refs[detailType].detailViewRightObj.name,
                configs: this.$refs[detailType].detailViewRightObj.configs ? this.$refs[detailType].detailViewRightObj.configs.map(item => { return { type: item.type, enable: item.enable } }) : '',
                childrenNum: this.$refs[detailType].detailViewRightObj.childrenNum || '',
                clientState: this.$refs[detailType].detailViewRightObj.clientState || '',
                protocol: this.$refs[detailType].detailViewRightObj.protocol || '',
                uuid: this.$refs[detailType].detailViewRightObj.uuid || '',
                startTime: this.$refs[detailType].detailViewRightObj.startTime || '',
                model: {
                  tsgAppliance: this.$refs[detailType].detailViewRightObj.model ? this.$refs[detailType].detailViewRightObj.model.tsgAppliance : ''
                }
              })
            })
          }
          this.$router.replace({ path: path, query: params }).catch(err => {})
        } else if (from === 'nzDatalist' && this.bottomBox) {
          params.bottomBox = this.bottomBox.showSubList
          params.targetTab = this.bottomBox.targetTab
          params.selectObj = JSON.stringify({
            id: this.bottomBox.object.id,
            name: this.bottomBox.object.name,
            configs: this.bottomBox.object.configs ? this.bottomBox.object.configs.map(item => { return { type: item.type, enable: item.enable } }) : '',
            childrenNum: this.bottomBox.object.childrenNum || '',
            clientState: this.bottomBox.object.clientState || '',
            protocol: this.bottomBox.object.protocol || '',
            uuid: this.bottomBox.object.uuid || '',
            startTime: this.bottomBox.object.startTime || '',
            model: {
              tsgAppliance: this.bottomBox.object.model ? this.bottomBox.object.model.tsgAppliance : ''
            }
          })
          this.$router.replace({ path: path, query: params }).catch(err => {})
        } else if (from === 'nzDetailList' && this.detailViewRightObj) {
          params.targetTab = this.$route.query.targetTab
          params.selectObj = JSON.stringify({
            id: this.detailViewRightObj.id,
            name: this.detailViewRightObj.name,
            configs: this.detailViewRightObj.configs ? this.detailViewRightObj.configs.map(item => { return { type: item.type, enable: item.enable } }) : '',
            childrenNum: this.detailViewRightObj.childrenNum || '',
            clientState: this.detailViewRightObj.clientState || '',
            protocol: this.detailViewRightObj.protocol || '',
            uuid: this.detailViewRightObj.uuid || '',
            startTime: this.detailViewRightObj.startTime || '',
            model: {
              tsgAppliance: this.detailViewRightObj.model ? this.detailViewRightObj.model.tsgAppliance : ''
            }
          })
          this.$router.replace({ path: path, query: params }).catch(err => {})
        } else if (from === 'bottomBox' && this.targetTab) {
          params.targetTab = this.targetTab
          this.$router.replace({ path: path, query: params }).catch(err => {})
        }
      })
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
