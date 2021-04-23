<template>
  <div class="search-box__container">
    <div v-for="(data, type, index) in titleSearchListCopy" v-if="data.show" :key="index" class="search-content-box">
      <label class="search-title">{{data.label}}:</label>
      <el-checkbox-group v-if="data.type === 'checkBox'" ref="searchContent" v-model="selectValueOut[data.key]">
        <template v-for="(item, j) in data.children">
          <el-checkbox v-if="j < 20" v-show="!data.showMore || j < data.index" :key="j" :label="item.value">{{item.key || item.name || item.label}}</el-checkbox>
        </template>
      </el-checkbox-group>
      <div v-for="(item, j) in data.children" v-else-if="data.type === 'dropdownCheckBox'" :key="j" class="nz-label-search">
        <el-cascader
          :ref="`${type}_cascader`"
          :options="item.children"
          :placeholder="item.name"
          :props="{ multiple: true, label: 'name', value: 'id' }"
          popper-class="click-search-dropdown"
          size="mini"
          @change="casChange(type, data.key)"
        ></el-cascader>
      </div>
      <span v-show="contentWidth <= data.width" class="search-more" @click="changShowMore(index)">更多 <i :class="data.showMore?'el-icon-arrow-down':'el-icon-arrow-up'"/></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'clickSearch',
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
  computed: { },
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
        this.selectValueOut = { ...n }
      }
    },
    selectValueOut: {
      immediate: true,
      deep: true,
      handler (n) {
        this.$emit('reload', this.selectValueOut)
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
      const cascs = this.$refs[`${type}_cascader`]
      if (type === 'assetLabel') { // label特殊处理，组织成{“id”:[“张三”,"lw"],"id":["李四"]}
        const values = {}
        cascs.forEach(c => {
          const nodes = c.getCheckedNodes()
          nodes.forEach(n => {
            const metaId = n.data.metaId
            if (values[`${metaId}`]) {
              values[`${metaId}`].push(n.data.name)
            } else {
              values[`${metaId}`] = [n.data.name]
            }
          })
        })
        this.selectValueOut[key] = JSON.stringify(values)
      } else {
        const values = new Set()
        cascs.forEach(c => {
          const nodes = c.getCheckedNodes()
          nodes.forEach(n => values.add(n.data.id))
        })
        this.selectValueOut[key] = [...values]
      }
    },
    needMore (key) {
      /* setTimeout(() => {
        this.contentWidth = this.$refs.searchContent[0].$el.offsetWidth

        Object.keys(this.titleSearchListCopy).forEach(key => {
          this.titleSearchListCopy[key].width = 0
          this.titleSearchListCopy[key].showMore = false
          this.titleSearchListCopy[key].children.forEach((item, i) => {
            /!* (基础宽度 + 文字宽度) 总和 》 文本长时 显示更多 *!/
            this.titleSearchListCopy[key].width += 60 + item.name.length * 12
            if (this.titleSearchListCopy[key].width > this.contentWidth && !this.titleSearchListCopy[key].showMore) {
              this.titleSearchListCopy[key].showMore = true
              this.titleSearchListCopy[key].index = i - 1
            }
          })
        }, 100)
      }) */
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
  border: 1px solid #E7EAED;
  background-color: #FFFFFF;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 15px 0 15px 17px;
}
.search-title {
  position: absolute;
  width: 130px;
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
  padding-left: 130px;
  padding-right: 80px;
  width: calc(100vw - 333px);
  box-sizing: border-box;
}
.search-more {
  position: absolute;
  right: 0;
  top: 50%;
  height: 22px;
  line-height: 22px;
  padding: 0 8px;
  transform: translateY(-50%);
  font-size: 12px;
  color: #333333;
  box-sizing: border-box;
  border: 1px solid $--primary-border-color;
  border-radius: 2px;

  i {
    color: #999;
    font-size: 12px;
  }
}
</style>
