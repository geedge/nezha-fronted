<template>
  <div :style="{'min-height': height + 'px',height:getHeight + 'px'}" class="search-box__container">
    <div v-for="(data, type, index) in titleSearchListCopy" v-if="data.children&&data.children.length" v-cloak :key="index" ref="searchContentBox" :class="{'search-content-box-height': data.length == 0}" class="search-content-box">
      <div class="search-title">{{data.label}}:</div>
      <el-skeleton v-if="data.type === 'checkBox'" :class="skeletonClass(data)" :loading="!data.show" :rows="1" class="search-items">
        <template>
          <el-checkbox-group v-if="data.type === 'checkBox'" ref="searchContent" v-model="selectValue[data.key]" @change="selectValue.change === 0 && selectValue.change++">
            <template v-for="(item, j) in data.children">
              <el-checkbox v-show="j < data.index || data.showMore" :key="j" :label="item.value">{{item.key || item.name || item.label}}</el-checkbox>
            </template>
          </el-checkbox-group>
        </template>
        <span v-show="contentWidth < data.width"
              :style="{top: `${moreBtnTop(data.type)}px`}"
              class="search-more"
              @click="changShowMore(type)">
          More <i :class="data.showMore ? 'arrow-up' : ''" class="el-icon-arrow-down arrow-down"/>
        </span>
      </el-skeleton>
      <el-skeleton v-else-if="data.type === 'dropdownCheckBox'" :loading="!data.show" :rows="1" class="search-items">
        <template>
          <dropdown
            v-for="(item, j) in data.children"
            v-show="j < data.index || data.showMore"
            :key="j"
            :selectValue="selectValue[data.key]"
            :type="data.key"
            :ref="`${type}_${item.id}_cascader`"
            :collapse-tags="true"
            :item="item"
            @resize="(value) => resize(value, type, item, data.key)"
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
      </el-skeleton>
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
    skeletonClass () {
      return function (data) {
        let className = ''
        if (data.type === 'checkBox') {
          className = 'search-items--checkbox'
        } else if (data.type === 'dropdownCheckBox') {
          className = 'search-items--dropdown'
        }
        return className
      }
    },
    height () {
      const paddingHeight = 30
      const checkBoxRowHeight = 32
      const labelRowHeight = 39
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
    },
    getHeight () {
      if (this.changeMoreNum) {
        let height = 2
        this.$refs.searchContentBox.forEach(item => {
          height += item.offsetHeight
        })
        return height
      } else {
        return 0
      }
    }
  },
  watch: {
    titleSearchList: {
      immediate: true,
      deep: true,
      handler (n) {
        this.titleSearchListCopy = JSON.parse(JSON.stringify(n))
        this.$nextTick(() => {
          this.setEachCascWidth()
          this.needMore()
        })
      }
    },
    selectValue: {
      deep: true,
      handler (n) {
        this.$emit('reload', n)
      }
    }
  },
  data () {
    return {
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
      },
      changeMoreNum: 0
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
            this.needMore(type, item, true)
          })
        }

        /* 组织参数 */
        const cascs = []
        this.titleSearchListCopy[type].children.forEach(c => {
          cascs.push(this.$refs[`${type}_${c.id}_cascader`][0])
        })
        if (type === 'assetLabel' || type === 'state') { // label特殊处理，组织成{“id”:[“张三”,"lw"],"id":["李四"]}
          const values = {}
          cascs.forEach(c => {
            const nodes = c.$refs.cascader.getCheckedNodes()
            nodes.forEach(n => {
              const metaId = n.data.metaId
              if (type === 'assetLabel') {
                if (values[metaId]) {
                  values[metaId].push(n.data.name)
                } else {
                  values[metaId] = [n.data.name]
                }
              } else {
                if (values[metaId]) {
                  values[metaId].push(n.data.id)
                } else {
                  values[metaId] = [n.data.id]
                }
              }
            })
          })
          const valuesStr = JSON.stringify(values)
          this.selectValue[key] = valuesStr === '{}' || !valuesStr ? null : valuesStr
        } else {
          const values = new Set()
          cascs.forEach(c => {
            const nodes = c.$refs.cascader.getCheckedNodes()
            nodes.forEach(n => values.add(n.data.id))
          })
          this.selectValue[key] = [...values]
        }
        if (!this.selectValue.change) {
          this.selectValue.change = 1
        } else {
          this.selectValue.change++
        }
      })
    },
    computeCascWidth (textWidth, labelWidth) { // label + tag + margin
      const tagWidth = textWidth > this.widthConstant.dropdownCheckBox.textMaxWidth ? this.widthConstant.dropdownCheckBox.textMaxWidth : textWidth + this.widthConstant.dropdownCheckBox.tagBlankTotal // 限制原始文字宽度不超过最大值，得到实际tag宽度
      const inputWidth = tagWidth + this.widthConstant.dropdownCheckBox.moreNumberWidth + this.widthConstant.dropdownCheckBox.arrowDownWidth
      return { tagWidth, inputWidth, width: labelWidth + inputWidth + this.widthConstant.dropdownCheckBox.boxMargin }
    },
    resize (value, type, item) {
      const oldInputWidth = item.inputWidth
      if (type) {
        if (value.length === 0) { // 回到初始宽度
          item.width = item.originalWidth
          item.inputWidth = this.widthConstant.dropdownCheckBox.inputOriginalWidth
        } else {
          const showTag = item.children.find(c => c.id == value[0]) // 展示的tag
          const { tagWidth, inputWidth, width } = this.computeCascWidth(this.computeDistance(showTag.name, 12), item.labelWidth)
          item.width = width
          item.inputWidth = inputWidth
        }
      }
      if (item.inputWidth !== oldInputWidth) {
        this.$nextTick(() => {
          this.$refs[`${type}_${item.id}_cascader`][0].$el.querySelector('.el-input__inner').style.width = `${item.inputWidth}px`
          this.needMore(type, item, true)
        })
      }
    },
    setEachCascWidth (value, type, item) {
      if (type) {
        if (value.length === 0) { // 回到初始宽度
          item.width = item.originalWidth
          item.inputWidth = this.widthConstant.dropdownCheckBox.inputOriginalWidth
        } else {
          const showTag = item.children.find(c => c.id == value[0]) // 展示的tag
          const { tagWidth, inputWidth, width } = this.computeCascWidth(this.computeDistance(showTag.name, 12), item.labelWidth)
          item.width = width
          item.inputWidth = inputWidth
        }
      } else { // 初始
        Object.keys(this.titleSearchListCopy).forEach(type => {
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
        })
      }
    },
    casFocus (item, isFocus, e) {
      this.$set(item, 'isFocus', isFocus)
    },
    needMore (type, item, expand) {
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
              expand && (this.titleSearchListCopy[type].showMore = true)
            }
          }
        })
        if (!showMore) {
          this.titleSearchListCopy[type].index = this.titleSearchListCopy[type].children.length
        }
      } else { // 全体重排
        this.contentWidth = contentWidth
        Object.keys(this.titleSearchListCopy).forEach(type => {
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
    changShowMore (type) {
      // this.changeMoreNum = 0
      this.titleSearchListCopy[type].showMore = !this.titleSearchListCopy[type].showMore
      // this.$nextTick(() => {
      //   this.changeMoreNum++
      // })
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
  line-height: 40px;
  margin: 6px 0;
  .el-input__inner {
    width: 60px;
  }
}
.search-box__container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /*padding: 15px 0 15px 17px;*/
  box-sizing: border-box;
  border: 1px solid $--right-box-border-color;
  background-color: #FFFFFF;
  overflow-x: hidden;
  overflow-y: auto;
}
.search-title {
  width: 130px;
  font-size: 14px;
  color: #666666;
  letter-spacing: 0;
  font-weight: 600;
  overflow: hidden;
  height: 100%;
  line-height: 40px;
  padding-left: 20px;
  box-sizing: border-box;
  background: #F9F9F9;
}
.search-content-box--copy {
  position: fixed;
  visibility: hidden;
}
.search-content-box-height.search-content-box {
  min-height: 31px;
}
.search-content-box,.search-content-box-height {
  border-bottom: 1px solid $--primary-border-color;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  padding: 0px 80px 0px 0px;
  box-sizing: border-box;
  /*line-height: 40px;*/

  /deep/ .el-checkbox__label {
    max-width: 150px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-x: hidden;
    vertical-align: text-bottom;
  }
}
.search-content-box:last-of-type{
  border-bottom: none;
}
.search-items {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  box-sizing: border-box;
  margin-left: 15px;
  &.search-items--checkbox .el-skeleton {
    height: 21px;
  }
  &.search-items--dropdown .el-skeleton {
    height: 28px;
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
