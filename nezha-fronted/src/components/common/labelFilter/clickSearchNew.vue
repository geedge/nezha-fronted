<template>
  <div :style="{'min-height': height + 'px',height:getHeight + 'px'}" class="search-box__container">
    <div v-for="(data, type, index) in titleSearchListCopy" :key="index"  v-if="!(data.hide)" ref="searchContentBox" :class="{'search-content-box-height': data.length == 0}" class="search-content-box">
      <div class="search-title">{{data.label}}:</div>
      <el-skeleton v-if="data.type === 'checkBox'" :class="skeletonClass(data)" :loading="!data.show" :rows="1" class="search-items" :ref="`search-items${type}`" :style="{height: data.height}">
        <template>
          <el-checkbox-group v-if="data.type === 'checkBox'" ref="searchContent" v-model="selectValue[data.key]" @change="selectValue.change === 0 && selectValue.change++">
            <template v-for="(item, j) in data.children">
              <el-checkbox :key="j" :label="item.value" :title="item.key || item.name || item.label">{{item.key || item.name || item.label}} <span class="search-content-num">({{item.num || 0}})</span></el-checkbox>
            </template>
          </el-checkbox-group>
        </template>
        <span
              v-show="data.needMore"
              :style="{top: `${moreBtnTop(data.type)}px`}"
              class="search-more"
              @click="changShowMore(type)">
              {{$t('overall.more')}}<i :class="data.showMore ? 'arrow-up' : ''" class="el-icon-arrow-down arrow-down"/>
        </span>
      </el-skeleton>
      <el-skeleton v-if="data.type === 'dropdownCheckBox'" :loading="!data.show" :rows="1" class="search-items" :ref="`search-items${type}`" :style="{height: data.height}">
        <template>
          <dropdown
            v-for="(item, j) in data.children"
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
        <span
              v-show="data.needMore"
              :style="{top: `${moreBtnTop(data.type)}px`}"
              class="search-more"
              @click="changShowMore(type)">
              {{$t('overall.more')}}<i :class="data.showMore ? 'arrow-up' : ''" class="el-icon-arrow-down arrow-down"/>
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
            label: this.$t('overall.project'), // 显示的label
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
            top = 8
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
        if (data.showMore) {
          className += 'more'
        }
        return className
      }
    },
    height () {
      const paddingHeight = 0
      const checkBoxRowHeight = 40
      const labelRowHeight = 40
      let checkBoxRowCount = 0
      let labelRowCount = 0
      Object.keys(this.titleSearchListCopy).forEach(type => {
        if (this.titleSearchListCopy[type].hide) {
          return
        }
        if (this.titleSearchListCopy[type].type === 'checkBox') {
          checkBoxRowCount++
        } else if (this.titleSearchListCopy[type].type === 'dropdownCheckBox') {
          labelRowCount++
        }
      })
      return paddingHeight + checkBoxRowHeight * checkBoxRowCount + labelRowHeight * labelRowCount + checkBoxRowCount + labelRowCount + 2
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
        this.titleSearchListCopy = n
        this.needMore()
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
  },
  methods: {
    /* value: 选择器返回的值 */
    casChange (value, type, item, key) {
      this.$nextTick(() => {
        // 计算change后新宽度
        const oldInputWidth = item.inputWidth
        this.setEachCascWidth(value, type, item)
        /* 为实现动态宽度而改变输入框宽度，因为cascader组件的宽度是由它决定的 */
        if (item.inputWidth !== oldInputWidth && this.$refs[`${type}_${item.id}_cascader`][0].$el.querySelector('.el-input__inner')) {
          this.$refs[`${type}_${item.id}_cascader`][0].$el.querySelector('.el-input__inner').style.width = `${item.inputWidth}px`
        } else if (!value.length && this.$refs[`${type}_${item.id}_cascader`][0].$el.querySelector('.el-input__inner')) {
          this.$refs[`${type}_${item.id}_cascader`][0].$el.querySelector('.el-input__inner').style.width = ''
        }

        /* 组织参数 */
        const cascs = []
        this.titleSearchListCopy[type].children.forEach(c => {
          cascs.push(this.$refs[`${type}_${c.id}_cascader`][0])
        })
        if (type === 'assetLabel' || type === 'state') { // label特殊处理，组织成{“id”:[“张三”,"lw"],"id":["李四"]}
          const values = {}
          cascs.forEach(c => {
            const nodes = c.$refs.cascader ? c.$refs.cascader.getCheckedNodes() : []
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
            const nodes = c.$refs.cascader ? c.$refs.cascader.getCheckedNodes() : []
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
          const { tagWidth, inputWidth, width } = this.computeCascWidth(this.computeDistance(showTag.name, 16), item.labelWidth)
          item.width = width
          item.inputWidth = inputWidth
        }
      }
      if (item.inputWidth !== oldInputWidth && this.$refs[`${type}_${item.id}_cascader`][0].$el.querySelector('.el-input__inner')) {
        this.$nextTick(() => {
          this.$refs[`${type}_${item.id}_cascader`][0].$el.querySelector('.el-input__inner').style.width = `${item.inputWidth}px`
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
          const { tagWidth, inputWidth, width } = this.computeCascWidth(this.computeDistance(showTag.name, 16), item.labelWidth)
          item.width = width
          item.inputWidth = inputWidth
        }
      }
    },
    casFocus (item, isFocus, e) {
      this.$set(item, 'isFocus', isFocus)
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
      this.titleSearchListCopy[type].showMore = !this.titleSearchListCopy[type].showMore
      if (this.titleSearchListCopy[type].showMore) {
        this.titleSearchListCopy[type].height = 'auto'
      } else {
        this.titleSearchListCopy[type].height = '40px'
      }
    },
    needMore () {
      this.$nextTick(() => {
        Object.keys(this.titleSearchListCopy).forEach(type => {
          if (this.$refs[`search-items${type}`]) {
            if (this.$refs[`search-items${type}`][0].$el.offsetHeight > 40 && !this.titleSearchListCopy[type].showMore) {
              this.titleSearchListCopy[type].needMore = true
              this.titleSearchListCopy[type].height = '40px'
            }
          }
        })
      })
    }
  },
  destroyed () {
  }
}
</script>
