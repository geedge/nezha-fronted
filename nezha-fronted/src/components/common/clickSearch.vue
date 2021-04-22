<template>
  <div class="search-box" :style="{'height':height+ 'px'}">
    <div v-for="(searchKey,index) in titleSearchListCopy" :key="index" v-if="searchKey.show" class="search-content-box">
      <label class="search-title">{{searchKey.label}}:</label>
      <el-checkbox-group v-model="selectValueOut[searchKey.key]" v-if="searchKey.type === 'checkBox'" ref="searchContent" class="search-content">
        <el-checkbox v-for="(item, j) in searchKey.children" :label="item.value" :key="j" v-show="!searchKey.showMore || j < searchKey.index">{{item.key || item.name || item.label}}</el-checkbox>
      </el-checkbox-group>
      <span class="search-more" @click="changShowMore(index)" v-show="contentWidth <= searchKey.width">更多 <i class="nz-icon" :class="searchKey.showMore?'nz-icon-arrow-down':'nz-icon-arrow-up'"/></span>
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
    },
    height: {
      type: Number,
      default: 116
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
        // this.$emit('reload', this.selectValue)
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
    needMore (key) {
      setTimeout(() => {
        this.contentWidth = this.$refs.searchContent[0].$el.offsetWidth

        Object.keys(this.titleSearchListCopy).forEach(key => {
          this.titleSearchListCopy[key].width = 0
          this.titleSearchListCopy[key].showMore = false
          this.titleSearchListCopy[key].children.forEach((item, i) => {
            /* (基础宽度 + 文字宽度) 总和 》 文本长时 显示更多 */
            this.titleSearchListCopy[key].width += 60 + item.name.length * 12
            if (this.titleSearchListCopy[key].width > this.contentWidth && !this.titleSearchListCopy[key].showMore) {
              this.titleSearchListCopy[key].showMore = true
              this.titleSearchListCopy[key].index = i - 1
            }
          })
        }, 100)
      })
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

<style scoped>
.search-box{
  background: #FFFFFF;
  border: 1px solid #E7EAED;
  margin: 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: 20px;
  padding-bottom: 0;
}
  .search-title{
    ont-family: Roboto-Medium;
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    line-height: 14px;
    font-weight: 500;
    width: 130px;
    overflow: hidden;
  }
  .search-content-box{
    display: flex;
    width: 100%;
    flex: 1;
    padding-left: 20px;
    position: relative;
  }
  /deep/ .el-checkbox-group{
    flex: 1;
  }
  /deep/ .el-checkbox{
    margin-bottom: 10px;
  }
  .search-content{
    padding-right: 30px;
  }
  .search-more{
    position: absolute;
    right: 30px;
    top: 0;
    font-size: 12px;
    color: #333333;
    letter-spacing: 0;
    line-height: 16px;
    font-weight: 400;
    border: 1px solid #DEDEDE;
    border-radius: 2px;
    padding: 3px 5px;
  }
</style>
