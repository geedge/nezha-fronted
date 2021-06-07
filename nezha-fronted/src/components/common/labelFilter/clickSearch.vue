<template>
  <div v-loading="!titleSearchListCopy.ready" :style="{'height': height + 'px'}" class="search-box__container">
    <div v-for="(data, type, index) in titleSearchListCopy" v-cloak v-if="data.show" :key="index" ref="searchContentBox" class="search-content-box">
      <label class="search-title">{{data.label}}:</label>
      <el-checkbox-group v-if="data.type === 'checkBox'" ref="searchContent" v-model="selectValueOut[data.key]">
        <template v-for="(item, j) in data.children">
          <el-checkbox v-show="j < data.index || data.showMore" :key="j" :label="item.value">{{item.key || item.name || item.label}}</el-checkbox>
        </template>
      </el-checkbox-group>
      <template v-for="(item, j) in data.children" v-else-if="data.type === 'dropdownCheckBox'">
        <dropdown
          v-show="j < data.index || data.showMore"
          :key="j"
          :ref="`${type}_${item.id}_cascader`"
          :collapse-tags="true"
          :item="item"
          @blur="casFocus"
          @change="(value) => casChange(value, type, item, data.key)"
          @focus="casFocus"
        ></dropdown>
      </template>
      <span v-show="contentWidth < data.width"
            :style="{top: `${moreBtnTop(data.type)}px`}"
            class="search-more"
            @click="changShowMore(type)">
        More <i :class="data.showMore ? 'arrow-up' : ''" class="el-icon-arrow-down arrow-down"/>
      </span>
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
    moreBtnTop () {
      return function (type) {
        let top
        switch (type) {
          case 'checkBox': {
            top = 4
            break
          }
          case 'dropdownCheckBox': {
            top = 8
            break
          }
          default: break
        }
        return top
      }
    },
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
        if (n.ready) {
          this.titleSearchListCopy = JSON.parse(JSON.stringify(n))
          this.$nextTick(() => {
            this.setEachCascWidth()
            this.needMore()
          })
        }
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
      titleSearchListCopy: {},
      widthConstant: {
        checkBox: {
          boxMargin: 30,

          checkBox: 14,
          tagPadding: 10,
          tagBlankTotal: 24 // 以上2个空白占位的总和
        },
        dropdownCheckBox: {
          boxMargin: 21,
          labelPadding: 6,

          tagMaxWidth: 150, // 定义tag标签最大宽度
          // 先分解cascader输入框的结构，如下：
          tagMargin: 6,
          tagPadding: 10,
          tagBorder: 2,
          tagRemoveIcon: 11,
          tagBlank: 2,
          tagBlankTotal: 31, // 以上五个空白占位的总和
          textMaxWidth: 119, // 纯文本最大宽度，通过tag最大宽度减去total得到

          inputOriginalWidth: 60, // 输入框初始宽度
          moreNumberWidth: 42, // 选中选项时右侧的+1、+2...数字提示内容的宽度
          arrowDownWidth: 30 // 输入框右端箭头区域的宽度
        }
      }
    }
  },
  mounted () {
    window.addEventListener('resize', this.needMore)
  },
  methods: {
    /* value: 选择器返回的值 */
    casChange (value, type, item, key) {
      this.$nextTick(() => {
        // 计算change后新宽度
        const oldInputWidth = item.inputWidth
        this.setEachCascWidth(value, type, item)
        /* 为实现动态宽度而改变输入框宽度，因为cascader组件的宽度是由它决定的 */
        if (item.inputWidth !== oldInputWidth) {
          this.$refs[`${type}_${item.id}_cascader`][0].$el.querySelector('.el-input__inner').style.width = `${item.inputWidth}px`
          this.$nextTick(() => {
            this.needMore(type, item)
          })
        }

        /* 组织参数 */
        const cascs = []
        this.titleSearchListCopy[type].children.forEach(c => {
          cascs.push(this.$refs[`${type}_${c.id}_cascader`][0])
        })
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
    computeCascWidth (textWidth, labelWidth) { // label + tag + margin
      const tagWidth = textWidth > this.widthConstant.dropdownCheckBox.textMaxWidth ? this.widthConstant.dropdownCheckBox.textMaxWidth : textWidth + this.widthConstant.dropdownCheckBox.tagBlankTotal // 限制原始文字宽度不超过最大值，得到实际tag宽度
      const inputWidth = tagWidth + this.widthConstant.dropdownCheckBox.moreNumberWidth + this.widthConstant.dropdownCheckBox.arrowDownWidth
      return { tagWidth, inputWidth, width: labelWidth + inputWidth + this.widthConstant.dropdownCheckBox.boxMargin }
    },
    setEachCascWidth (value, type, item) {
      if (type) {
        if (value.length === 0) { // 回到初始宽度
          item.width = item.originalWidth
          item.inputWidth = this.widthConstant.dropdownCheckBox.inputOriginalWidth
        } else {
          const showTag = item.children.find(c => c.id === value[0][0]) // 展示的tag
          const { tagWidth, inputWidth, width } = this.computeCascWidth(this.computeDistance(showTag.name, 12), item.labelWidth)
          item.width = width
          item.inputWidth = inputWidth
        }
      } else { // 初始
        Object.keys(this.titleSearchListCopy).forEach(type => {
          if (type !== 'ready') {
            this.titleSearchListCopy[type].children.forEach(c => {
              if (this.titleSearchListCopy[type].type === 'dropdownCheckBox') {
                const labelWidth = this.computeDistance(c.name + ':') + this.widthConstant.dropdownCheckBox.labelPadding // cascader-label总宽度
                const width = labelWidth + this.widthConstant.dropdownCheckBox.inputOriginalWidth + this.widthConstant.dropdownCheckBox.boxMargin
                this.$set(c, 'width', width) // 总宽
                this.$set(c, 'originalWidth', width) // 初始总宽
                this.$set(c, 'labelWidth', labelWidth) // label区域宽
                this.$set(c, 'inputWidth', this.widthConstant.dropdownCheckBox.inputOriginalWidth) // 内容区域宽
              } else if (this.titleSearchListCopy[type].type === 'checkBox') {
                const width = this.computeDistance(c.name) + this.widthConstant.checkBox.tagBlankTotal + this.widthConstant.checkBox.boxMargin
                this.$set(c, 'width', width) // 总宽
              }
            })
          }
        })
      }
    },
    casFocus (item, isFocus, e) {
      this.$set(item, 'isFocus', isFocus)
    },
    needMore (type, item) {
      const contentWidth = this.$refs.searchContentBox[0].offsetWidth - 210
      // 窗口尺寸没改变，则只重排当前type
      if (type && contentWidth === this.contentWidth) {
        this.titleSearchListCopy[type].width = 0
        let showMore = false
        this.titleSearchListCopy[type].children.forEach((item, i) => {
          if (!showMore) {
            this.titleSearchListCopy[type].width += item.width
            if (this.titleSearchListCopy[type].width > this.contentWidth) {
              showMore = true
              this.titleSearchListCopy[type].index = i
            }
          }
        })
        if (!showMore) {
          this.titleSearchListCopy[type].index = this.titleSearchListCopy[type].children.length - 1
        }
      } else { // 全体重排
        this.contentWidth = contentWidth
        Object.keys(this.titleSearchListCopy).forEach(type => {
          if (type !== 'ready') {
            this.titleSearchListCopy[type].width = 0
            this.titleSearchListCopy[type].showMore = false
            let showMore = false
            this.titleSearchListCopy[type].children.forEach((item, i) => {
              if (!showMore) {
                this.titleSearchListCopy[type].width += item.width
                if (this.titleSearchListCopy[type].width > this.contentWidth) {
                  showMore = true
                  this.titleSearchListCopy[type].index = i
                }
              }
            })
            if (!showMore) {
              this.titleSearchListCopy[type].index = this.titleSearchListCopy[type].children.length
            }
          }
        })
      }
    },
    computeDistance (str, fontSize) {
      let width = 0
      const c = fontSize ? '.temp-dom--' + fontSize : '.temp-dom'
      const html = document.querySelector(c)
      html.innerText = str
      width = html.offsetWidth
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

<style lang="scss">
.arrow-down {
  transform: rotate(0);
  transition: all linear .2s;
}
.arrow-down.arrow-up {
  transform: rotate(180deg);
}
.nz-label-search {
  .el-input__inner {
    width: 60px;
  }
}
.search-box__container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px 0 15px 17px;
  box-sizing: border-box;
  border: 1px solid $--right-box-border-color;
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
.search-content-box--copy {
  position: fixed;
  visibility: hidden;
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
