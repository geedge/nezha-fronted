import lodash from 'lodash'
export default {
  methods: {
  // 解析请求参数，初始化 searchLabel
    initQueryFromPath (searchKeys, cb) {
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
      if (q.body) {
        this.searchLabel.body = JSON.parse(q.body)
        if (cb) {
          cb()
        }
      }
      // if (q.bottomBox && JSON.parse(q.bottomBox)) {
      //   this.$nextTick(() => {
      //     this.detailType = q.detailType
      //     const detailType = this.detailType === 'list' ? 'dataList' : 'detailList'
      //     this.$refs[detailType].bottomBox.showSubList = JSON.parse(q.bottomBox)
      //     this.$refs[detailType].bottomBox.targetTab = q.targetTab
      //     this.$refs[detailType].bottomBox.object = JSON.parse(q.selectObj)
      //   })
      // } else if (this.detailType === 'view' && q.detailType && q.selectObj) {
      //   this.detailType = q.detailType
      //   this.detailViewRightObj = JSON.parse(q.selectObj)
      //   this.$store.commit('setGlobalSearchId', this.detailViewRightObj.id)
      // }
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
          if (this.detailType) {
            params.detailType = this.detailType
          }
          if (this.detailType === 'list' && this.$refs[detailType]) {
            params.bottomBox = this.$refs[detailType].bottomBox.showSubList
            params.targetTab = this.$refs[detailType].bottomBox.targetTab
          } else {
            params.bottomBox = false
            params.targetTab = this.$route.query.targetTab
          }
          if (!params.targetTab) delete params.targetTab
          if (!params.bottomBox) delete params.bottomBox
          if (this.detailType === 'list' && this.$refs[detailType]) {
            const obj = {
              id: this.$refs[detailType].bottomBox.object.id,
              name: this.$refs[detailType].bottomBox.object.name,
              childrenNum: this.$refs[detailType].bottomBox.object.childrenNum || '',
              clientState: this.$refs[detailType].bottomBox.object.clientState || '',
              protocol: this.$refs[detailType].bottomBox.object.protocol || '',
              uuid: this.$refs[detailType].bottomBox.object.uuid || '',
              startTime: this.$refs[detailType].bottomBox.object.startTime || '',
              model: {
                tsgAppliance: this.$refs[detailType].bottomBox.object.model ? this.$refs[detailType].bottomBox.object.model.tsgAppliance : ''
              }
            }
            if (this.$refs[detailType].bottomBox.object.configs) {
              // 判断是JSON字符串还是对象
              if (typeof (this.$refs[detailType].bottomBox.object.configs) == 'string') {
                obj.configs = JSON.parse(this.$refs[detailType].bottomBox.object.configs).map(item => { return { type: item.type, enable: item.enable } })
              } else {
                obj.configs = this.$refs[detailType].bottomBox.object.configs.map(item => { return { type: item.type, enable: item.enable } })
              }
            }
            this.removeEmpty(obj)
            if (JSON.stringify(obj) != '{}') {
              params.selectObj = JSON.stringify(obj)
            }
          } else if (this.$refs[detailType] && this.$refs[detailType].detailViewRightObj) {
            this.$nextTick(() => {
              const obj = {
                id: this.$refs[detailType].detailViewRightObj.id,
                name: this.$refs[detailType].detailViewRightObj.name,
                childrenNum: this.$refs[detailType].detailViewRightObj.childrenNum || '',
                clientState: this.$refs[detailType].detailViewRightObj.clientState || '',
                protocol: this.$refs[detailType].detailViewRightObj.protocol || '',
                uuid: this.$refs[detailType].detailViewRightObj.uuid || '',
                startTime: this.$refs[detailType].detailViewRightObj.startTime || '',
                model: {
                  tsgAppliance: this.$refs[detailType].detailViewRightObj.model ? this.$refs[detailType].detailViewRightObj.model.tsgAppliance : ''
                }
              }
              if (this.$refs[detailType].detailViewRightObj.configs) {
                // 判断是JSON字符串还是对象
                if (typeof (this.$refs[detailType].detailViewRightObj.configs) == 'string') {
                  obj.configs = JSON.parse(this.$refs[detailType].detailViewRightObj.configs).map(item => { return { type: item.type, enable: item.enable } })
                } else {
                  obj.configs = this.$refs[detailType].detailViewRightObj.configs.map(item => { return { type: item.type, enable: item.enable } })
                }
              }
              this.removeEmpty(obj)
              if (JSON.stringify(obj) != '{}') {
                params.selectObj = JSON.stringify(obj)
              }
            })
          }
          this.$router.replace({ path: path, query: params }).catch(err => {})
        } else if (from === 'nzDatalist' && this.bottomBox) {
          params.bottomBox = this.bottomBox.showSubList
          params.targetTab = this.bottomBox.targetTab
          if (!params.targetTab) delete params.targetTab
          if (!params.bottomBox) delete params.bottomBox
          if (this.bottomBox.showSubList) { // 关闭bottomBox打开还是关闭
            const obj = {
              id: this.bottomBox.object.id,
              name: this.bottomBox.object.name,
              childrenNum: this.bottomBox.object.childrenNum || '',
              clientState: this.bottomBox.object.clientState || '',
              protocol: this.bottomBox.object.protocol || '',
              uuid: this.bottomBox.object.uuid || '',
              startTime: this.bottomBox.object.startTime || '',
              model: {
                tsgAppliance: this.bottomBox.object.model ? this.bottomBox.object.model.tsgAppliance : ''
              }
            }
            if (this.bottomBox.object.configs) {
              // 判断是JSON字符串还是对象
              if (typeof (this.bottomBox.object.configs) == 'string') {
                obj.configs = JSON.parse(this.bottomBox.object.configs).map(item => { return { type: item.type, enable: item.enable } })
              } else {
                obj.configs = this.bottomBox.object.configs.map(item => { return { type: item.type, enable: item.enable } })
              }
            }
            this.removeEmpty(obj)
            if (JSON.stringify(obj) != '{}') {
              params.selectObj = JSON.stringify(obj)
            }
          } else {
            delete params.selectObj
            delete params.targetTab
          }
          this.$router.replace({ path: path, query: params }).catch(err => {})
        } else if (from === 'nzDetailList' && this.detailViewRightObj) {
          params.targetTab = this.$route.query.targetTab
          const obj = {
            id: this.detailViewRightObj.id,
            name: this.detailViewRightObj.name,
            childrenNum: this.detailViewRightObj.childrenNum || '',
            clientState: this.detailViewRightObj.clientState || '',
            protocol: this.detailViewRightObj.protocol || '',
            uuid: this.detailViewRightObj.uuid || '',
            startTime: this.detailViewRightObj.startTime || '',
            model: {
              tsgAppliance: this.detailViewRightObj.model ? this.detailViewRightObj.model.tsgAppliance : ''
            }
          }
          if (this.detailViewRightObj.configs) {
            // 判断是JSON字符串还是对象
            if (typeof (this.detailViewRightObj.configs) == 'string') {
              obj.configs = JSON.parse(this.detailViewRightObj.configs).map(item => { return { type: item.type, enable: item.enable } })
            } else {
              obj.configs = this.detailViewRightObj.configs.map(item => { return { type: item.type, enable: item.enable } })
            }
          }
          this.removeEmpty(obj)
          if (JSON.stringify(obj) != '{}') {
            params.selectObj = JSON.stringify(obj)
          }
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
    },
    // 清除空数据
    removeEmpty (obj) {
      if (!obj) {
        return
      }
      Object.keys(obj).forEach(key => {
      // 属性为对象
        if (Object.prototype.toString.call(obj[key]) === '[object Object]' && (JSON.stringify(obj[key]) != '{}')) {
          this.removeEmpty(obj[key])
        }
        // 属性值为空
        if (!obj[key]) {
          delete obj[key]
        }
        // 属性为空对象
        if ((Array.isArray(obj[key]) && !obj[key].length) || (JSON.stringify(obj[key]) == '{}')) {
          delete obj[key]
        }
      })
    },
    initTimeType (value) {
      switch (value) {
        case '5m' :
          this.defaultPick = 1
          break
        case '15m' :
          this.defaultPick = 2
          break
        case '30m' :
          this.defaultPick = 3
          break
        case '1h' :
          this.defaultPick = 4
          break
        case '3h' :
          this.defaultPick = 5
          break
        case '6h' :
          this.defaultPick = 6
          break
        case '12h' :
          this.defaultPick = 7
          break
        case '1d' :
          this.defaultPick = 8
          break
        case '24h' :
          this.defaultPick = 8
          break
        case '2d' :
          this.defaultPick = 9
          break
        case '7d' :
          this.defaultPick = 10
          break
        case '30d' :
          this.defaultPick = 11
          break
        case 'all' :
          this.defaultPick = 12
          break
        case '0t' :
          this.defaultPick = 13
          break
        case '1t' :
          this.defaultPick = 14
          break
        case '2t' :
          this.defaultPick = 15
          break
        case '7t' :
          this.defaultPick = 16
          break
        case '0w' :
          this.defaultPick = 17
          break
        case '1w' :
          this.defaultPick = 18
          break
        case '0m' :
          this.defaultPick = 19
          break
        case '1m' :
          this.defaultPick = 20
          break
        default:
          this.defaultPick = 0
      }
    }
  }
}
