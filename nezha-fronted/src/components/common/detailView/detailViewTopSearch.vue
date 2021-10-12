<template>
  <div style="line-height: 32px;">
    <div style="display: inline-block;margin-right: 20px" v-for="(item,index) in detailSearchListCopy" :key='index'>
      <span class="search-title">{{item.label}}:</span>
      <span>
            <el-dropdown
              type="primary"
              :trigger="'click'"
              :hide-on-click="false"
            >
              <div>
                <div class="detail-top-search">
                   <span v-for="(item2,index2) in searchDetailObj[item.key]" :key="item2" class="search-value">
                  {{item.children.find(dc=>dc.id==item2).name}}<span v-if="index2+1 !== searchDetailObj[item.key].length">,</span>
                </span>
                </div>
                <i class="nz-icon nz-icon-arrow-down search-value"/>
              </div>
              <el-dropdown-menu slot="dropdown" class="detail-top-search-dropdown">
                <span @click="searchDetailObj[item.key] = []" class="clear-all-select">{{$t('overall.clearAllSelect')}}</span>
                 <el-checkbox-group v-model="searchDetailObj[item.key]">
                    <el-dropdown-item v-for="(item3,index3) in item.children" :key="index3" :title="item3.name">
                      <el-checkbox :label="item3.id">{{item3.name}}</el-checkbox>
                    </el-dropdown-item>
                 </el-checkbox-group>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'detailViewTopSearch',
  props: {
    detailSearchList: {
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
    searchDetailObj: {
      type: Object
    }
  },
  data () {
    return {
      detailSearchListCopy: {}
    }
  },
  watch: {
    detailSearchList: {
      immediate: true,
      deep: true,
      handler (n) {
        console.log(n)
        this.detailSearchListCopy = JSON.parse(JSON.stringify(n))
      }
    },
    searchDetailObj: {
      deep: true,
      handler (n) {
        console.log(n, 123123123)
        this.$emit('reload', n)
      }
    }
  }
}
</script>

<style scoped>
  .search-title {
    font-size: 14px;
    color: #333333;
    letter-spacing: 0;
    line-height: 14px;
    font-weight: 600;
  }
  .search-value{
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    line-height: 14px;
    font-weight: 400;
  }
  .detail-top-search {
    display: inline-block;
    vertical-align: bottom;
    max-width: 100px;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    margin-left: 5px;
  }
</style>
<style lang="scss">
  .detail-top-search-dropdown{
    max-height: 300px;
    overflow-y: auto;
    .el-dropdown-menu__item{
      padding: 0;
      max-width: 200px;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
      .el-checkbox{
        width: calc(100% - 20px);
        height: 36px;
        padding: 0 0 0 20px;
        display: flex;
        align-items: center;
        .el-checkbox__label{
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
  .clear-all-select{
    padding-left: 42px;
    padding: 0 20px;
    color: #0052cc;
    font-size: 12px;
  }
  .clear-all-select:hover{
    text-decoration: underline;
  }
</style>
