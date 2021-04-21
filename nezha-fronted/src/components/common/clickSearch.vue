<template>
  <div class="search-box" :style="{'height':height+ 'px'}">
    <div v-for="(searchKey,index) in titleSearchList" :key="index" v-if="searchKey.show" class="search-content">
      <label class="search-title">{{searchKey.label}}:</label>
      <el-checkbox-group v-model="selectValueOut[searchKey.key]" v-if="searchKey.type === 'checkBox'">
        <el-checkbox v-for="(item, j) in searchKey.children" :label="item.value" :key="j">{{item.key || item.name || item.label}}</el-checkbox>
      </el-checkbox-group>
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
            show: false
          }
        }
      }
    },
    selectValue: {
      type: Object
    },
    height:{
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
        console.log(n)
      }
    },
    selectValue: {
      immediate: true,
      deep: true,
      handler (n) {
        console.log(n)
        this.selectValueOut = { ...n }
        // this.$emit('reload', this.selectValue)
      }
    },
    selectValueOut: {
      immediate: true,
      deep: true,
      handler (n) {
        console.log(n)
        this.$emit('reload', this.selectValueOut)
      }
    }
  },
  data () {
    return {
      selectValueOut: {}
    }
  },
  mounted () {

  },
  methods: {

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
  .search-content{
    display: flex;
    width: 100%;
    flex: 1;
    padding-top: 19px;
    padding-left: 20px;
  }
</style>
