<template>
  <div :style="{'height': height + 'px'}" class="search-box__container">
    <div v-for="(data, type, index) in titleSearchListCopy" v-if="data.show" :key="index" ref="searchContentBox" class="search-content-box">
      <label class="search-title">{{data.label}}:</label>
      <el-checkbox-group v-if="data.type === 'checkBox'" ref="searchContent" v-model="selectValueOut[data.key]">
        <template v-for="(item, j) in data.children">
          <el-checkbox v-show="!data.showMore || j < data.index" :key="j" :label="item.value">{{item.key || item.name || item.label}}</el-checkbox>
        </template>
      </el-checkbox-group>
      <dropdown
        v-for="(item, j) in data.children"
        v-else-if="data.type === 'dropdownCheckBox'"
        :key="j"
        :ref="`${type}_cascader`"
        :collapse-tags="true"
        :item="item"
        @blur="casFocus"
        @change="casChange(type, data.key)"
        @focus="casFocus"
      ></dropdown>
      <span v-show="contentWidth <= data.width" class="search-more" @click="changShowMore(type)">更多 <i :class="data.showMore?'el-icon-arrow-down':'el-icon-arrow-up'"/></span>
    </div>
  </div>
</template>

<script>
import dropdown from '@/components/common/labelFilter/dropdown'
export default {
  name: 'clickSearch',
  components: {
    dropdown
  },
  props: {
    titleSearchList: {
      /*
      * project: {
          label: 'Project', // 显示的label
          key: 'projectIds', // 搜索使用的key
          type: 'checkBox', // 类型
          children: []      // 需要展示的子集
          showMore: false, // 是否需要显示更多
          index: 最大宽度的个数, // 是否需要显示更多
        },
      * */
      type: Object,
      default () {
        return {
          project: {
            label: 'Project', // 显示的label
            key: 'projectIds', // 搜索使用的key
            type: 'checkBox', // 类型
            children: [], // 需要展示的子集
            show: false,
            showMore: false,
            index: 10 // 是否需要显示更多
          }
        }
      }
    },
    selectValue: {
      type: Object
    }
  },
  computed: {
    height () {
      const paddingHeight = 30
      const checkBoxRowHeight = 31
      const labelRowHeight = 38
      let checkBoxRowCount = 0
      let labelRowCount = 0
      Object.keys(this.titleSearchListCopy).forEach(type => {
        if (this.titleSearchListCopy[type].type === 'checkBox') {
          checkBoxRowCount++
        } else if (this.titleSearchListCopy[type].type === 'dropdownCheckBox') {
          labelRowCount++
        }
      })
      return paddingHeight + checkBoxRowHeight * checkBoxRowCount + labelRowHeight * labelRowCount + 2
    }
  },
  watch: {
    titleSearchList: {
      immediate: true,
      deep: true,
      handler (n) {
        this.titleSearchListCopy = JSON.parse(JSON.stringify(n))
        this.$nextTick(() => {
          this.needMore()
        })
      }
    },
    selectValue: {
      immediate: true,
      deep: true,
      handler (n) {
        this.selectValueOut = { ...n, change: 0 }
      }
    },
    selectValueOut: {
      immediate: true,
      deep: true,
      handler (n) {
        this.$emit('reload', n)
      }
    }
  },
  data () {
    return {
      selectValueOut: {},
      contentWidth: 0, // 搜索框内部区域的宽度
      titleSearchListCopy: {}
    }
  },
  mounted () {
    window.addEventListener('resize', this.needMore)
  },
  methods: {
    casChange (type, key) {
      this.$nextTick(() => {
        const cascs = this.$refs[`${type}_cascader`]
        if (type === 'assetLabel') { // label特殊处理，组织成{“id”:[“张三”,"lw"],"id":["李四"]}
          const values = {}
          cascs.forEach(c => {
            const nodes = c.$refs.cascader.getCheckedNodes()
            nodes.forEach(n => {
              const metaId = n.data.metaId
              if (values[metaId]) {
                values[metaId].push(n.data.name)
              } else {
                values[metaId] = [n.data.name]
              }
            })
          })
          const valuesStr = JSON.stringify(values)
          this.selectValueOut[key] = valuesStr === '{}' || !valuesStr ? null : valuesStr
        } else {
          const values = new Set()
          cascs.forEach(c => {
            const nodes = c.$refs.cascader.getCheckedNodes()
            nodes.forEach(n => values.add(n.data.id))
          })
          this.selectValueOut[key] = [...values]
        }
        this.selectValueOut.change++
      })
    },
    casFocus (item, isFocus, e) {
      this.$set(item, 'isFocus', isFocus)
    },
    needMore (key) {
      // setTimeout(() => {
      this.$nextTick(() => {
        this.contentWidth = this.$refs.searchContentBox[0].offsetWidth - 210

        Object.keys(this.titleSearchListCopy).forEach(key => {
          this.titleSearchListCopy[key].width = 0
          this.titleSearchListCopy[key].showMore = false
          let index = -1
          this.titleSearchListCopy[key].children.forEach((item, i) => {
            /* (基础宽度 + 文字宽度) 总和大于文本长时 显示更多 */
            if (index === -1) {
              if (this.titleSearchListCopy[key].width < this.contentWidth) {
                this.titleSearchListCopy[key].width += this.getDomWidth(this.titleSearchListCopy[key], item, i)
              } else {
                this.titleSearchListCopy[key].showMore = true
                this.titleSearchListCopy[key].index = i - 1
                index = i
              }
            }
          })
        })
      })
    },
    computeDistance (str) {
      let width = 0
      const html = document.querySelector('.temp-dom')
      html.innerText = str
      width = html.offsetWidth
      return width
    },
    getDomWidth (parentData, item, index) {
      let width
      if (parentData.type === 'dropdownCheckBox') {
        width = this.computeDistance(`${item.name}:`)
        const marginRight = 20
        width = width + 182 + marginRight// 182是label框的宽度除去name外的部分
      } else {
        width = this.computeDistance(item.name)
        width = width > 150 ? 150 : width
        const paddingLeft = 10
        const checkBox = 14
        const marginRight = 30
        width = width + paddingLeft + checkBox + marginRight
      }
      return width
    },
    changShowMore (key) {
      this.titleSearchListCopy[key].showMore = !this.titleSearchListCopy[key].showMore
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.needMore)
  }
}
</script>

<style lang="scss" scoped>
.search-box__container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px 0 15px 17px;
  box-sizing: border-box;
  border: 1px solid #E7EAED;
  background-color: #FFFFFF;
  overflow-x: hidden;
  overflow-y: auto;
}
.search-title {
  position: absolute;
  width: 130px;
  top: 7px;
  left: 0;
  line-height: 18px;
  font-size: 14px;
  color: #666666;
  letter-spacing: 0;
  font-weight: 500;
  overflow: hidden;
}
.search-content-box {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  padding: 5px 80px 5px 130px;
  width: calc(100vw - 333px);
  box-sizing: border-box;

  /deep/ .el-checkbox__label {
    max-width: 150px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-x: hidden;
    vertical-align: text-bottom;
  }
}
.search-more {
  position: absolute;
  right: 4px;
  top: 4px;
  height: 22px;
  line-height: 22px;
  padding: 0 8px;
  font-size: 12px;
  color: #333333;
  box-sizing: border-box;
  border: 1px solid $--primary-border-color;
  border-radius: 2px;
  cursor: pointer;

  i {
    color: #999;
    font-size: 12px;
  }
}
</style>
