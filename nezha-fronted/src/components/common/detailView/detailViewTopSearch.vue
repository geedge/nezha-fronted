<template>
  <div style="line-height: 32px;">
    <div class="search-detail-box" :class="[selectValue[item.key].length?'select-dropdown':'',detailSearchListCopy[key].dropShow?'show-my-dropdpwn':'']" v-for="(item,key) in detailSearchListCopy" :key='key' v-show="item.children.length">
      <span v-if="item.type === 'checkBox'">
            <el-dropdown
              :placement="'bottom-start'"
              class="detail-dropdown"
              type="primary"
              :trigger="'click'"
              :hide-on-click="false"
              @visible-change="(val)=>{showDropDown(val, key)}"
            >
              <div style="padding-left: 10px;">
                <span class="search-detail-title"  v-if="!selectValue[item.key].length">{{item.label}} :</span>
                <div class="detail-top-search" v-if="selectValue[item.key].length">
                   <span v-for="(item2,index2) in selectValue[item.key]" :key="item2" class="search-value">
                  {{item.oldChildren.find(dc=>dc.id==item2).name}}<span v-if="index2+1 !== selectValue[item.key].length">,</span>
                </span>
                </div>
                <div class="detail-top-search" style="text-align: center" v-else>
                  All
                </div>
                <i class="nz-icon nz-icon-arrow-down search-value"/>
              </div>
              <el-dropdown-menu slot="dropdown" class="right-public-box-select-top right-public-box-dropdown-top detail-top-search-dropdown">
                <div style="text-align: center;"><el-input style="width: calc(100% - 40px)" size="small" v-model="searchStr" @input="(val)=>{searchStrChange(val,key)}"  suffix-icon="el-icon-search"/></div>
                 <el-checkbox-group v-model="selectValue[item.key]">
                    <el-dropdown-item v-for="(item3,index3) in item.children" :key="index3" :title="item3.name">
                      <el-checkbox :label="item3.id">{{item3.name}}</el-checkbox>
                    </el-dropdown-item>
                 </el-checkbox-group>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
      <span v-else-if="item.type === 'dropdownCheckBox'&& key !== 'assetLabel'">
            <el-dropdown
              :placement="'bottom-start'"
              class="detail-dropdown"
              type="primary"
              :trigger="'click'"
              :hide-on-click="false"
              @visible-change="searchStr = detailSearchListCopy[key].searchStr"
            >
             <div style="padding-left: 10px;">
                <span class="search-detail-title"  v-if="!selectValue[item.key].length">{{item.label}} :</span>
                <div class="detail-top-search" v-if="selectValue[item.key].length">
                   <span v-for="(item2,index2) in selectValue[item.key]" :key="item2" class="search-value">
                  {{getSearchStr(item.oldChildren,item2)}}<span v-if="index2+1 !== selectValue[item.key].length">,</span>
                </span>
                </div>
                <div class="detail-top-search" style="text-align: center" v-else>
                  All
                </div>
                <i class="nz-icon nz-icon-arrow-down search-value"/>
              </div>
              <el-dropdown-menu slot="dropdown" class="right-public-box-select-top right-public-box-dropdown-top detail-top-search-dropdown">
                <div style="text-align: center;"><el-input style="width: calc(100% - 40px)" size="small" v-model="searchStr" @input="(val)=>{searchStrChange(val,key)}"  suffix-icon="el-icon-search"/></div>
                 <el-checkbox-group v-model="selectValue[item.key]">
                    <el-dropdown-item v-for="(item3,index3) in item.children" :key="index3" >
<!--                      <span :title="item3.name" class="children-title-name"> {{item3.name}}</span>-->
                      <el-checkbox :label="item3.id+'-'+item4.id" :key="index4"  v-for="(item4,index4) in item3.children" :title="item3.name+'/'+item4.name">{{item3.name+'/'+item4.name}}</el-checkbox>
                    </el-dropdown-item>
                 </el-checkbox-group>
              </el-dropdown-menu>
            </el-dropdown>
          </span>
      <span v-else-if="item.type === 'dropdownCheckBox'&& key === 'assetLabel'">
            <el-dropdown
              :placement="'bottom-start'"
              class="detail-dropdown"
              type="primary"
              :trigger="'click'"
              :hide-on-click="false"
              @visible-change="searchStr = detailSearchListCopy[key].searchStr"
            >
              <div style="padding-left: 10px;">
                <span class="search-detail-title"  v-if="!selectValue[item.key].length">{{item.label}} :</span>
                <div class="detail-top-search" v-if="selectValue[item.key].length">
                   <span v-for="(item2,index2) in selectValue[item.key]" :key="item2" class="search-value">
                  {{getSearchStr(item.oldChildren,item2,key)}}<span v-if="index2+1 !== selectValue[item.key].length">,</span>
                </span>
                </div>
                <div class="detail-top-search" style="text-align: center" v-else>
                  All
                </div>
                <i class="nz-icon nz-icon-arrow-down search-value"/>
              </div>
              <el-dropdown-menu slot="dropdown" class="right-public-box-select-top right-public-box-dropdown-top detail-top-search-dropdown">
                <div style="text-align: center;"><el-input style="width: calc(100% - 40px)" size="small" v-model="searchStr" @input="(val)=>{searchStrChange(val,key)}"  suffix-icon="el-icon-search"/></div>
                 <el-checkbox-group v-model="selectValue[item.key]">
                    <el-dropdown-item v-for="(item3,index3) in item.children" :key="index3" >
                      <span :title="item3.name" class="children-title-name"> {{item3.name}}</span>
                      <el-checkbox :label="item3.id+'-'+item4.id" :key="index4"  v-for="(item4,index4) in item3.children" :title="item4.name">{{item4.name}}</el-checkbox>
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
    selectValue: {
      type: Object
    }
  },
  computed: {
  },
  data () {
    return {
      detailSearchListCopy: {},
      searchStr: ''
    }
  },
  methods: {
    searchStrChange (val, key) {
      if (this.detailSearchListCopy[key].type === 'checkBox') {
        this.detailSearchListCopy[key].searchStr = val
        this.detailSearchListCopy[key].children = this.detailSearchListCopy[key].oldChildren.filter(children => children.name.indexOf(val) !== -1)
      } else {
        this.detailSearchListCopy[key].searchStr = val
        const arr = []
        this.detailSearchListCopy[key].oldChildren.forEach(item => {
          const children = item.children.filter(children => children.name.indexOf(val) !== -1)
          if (children && children.length) {
            arr.push({ ...item, children: children })
          }
        })
        this.detailSearchListCopy[key].children = arr
      }
    },
    getSearchStr (oldChildren, label, key) {
      const arr = label.split('-')
      const obj = oldChildren.find(item => item.id == arr[0])
      const children = obj.children.find(item => item.id == arr[1])
      if (key !== 'assetLabel') {
        return obj.name + '/' + children.name
      } else {
        return children.name
      }
    },
    showDropDown (val, key) {
      this.searchStr = this.detailSearchListCopy[key].searchStr
      this.detailSearchListCopy[key].dropShow = val
    }
  },
  watch: {
    detailSearchList: {
      immediate: true,
      deep: true,
      handler (n) {
        this.detailSearchListCopy = JSON.parse(JSON.stringify(n))
        Object.keys(this.detailSearchListCopy).forEach(key => {
          this.detailSearchListCopy[key].searchStr = ''
          this.detailSearchListCopy[key].oldChildren = JSON.parse(JSON.stringify(this.detailSearchListCopy[key].children))
        })
      }
    },
    selectValue: {
      deep: true,
      handler (n) {
        this.$emit('reload', n)
      }
    }
  }
}
</script>

<style scoped lang="scss">
  .search-detail-box{
    display: inline-block;
    margin-right: 20px;
    transition: background-color .1s ease-out;
    border-radius: 2px;
  }
  .search-detail-box:hover{
    background: #F9F9F9;
  }
  .search-detail-box.select-dropdown{
    background: #F9F9F9;
  }
  /*.search-detail-box.show-my-dropdpwn{*/
  /*  background-color: #344563;*/
  /*  color: #fff;*/
  /*  .search-detail-title{*/
  /*    color: #fff;*/
  /*  }*/
  /*  .detail-top-search{*/
  /*    color: #fff;*/
  /*  }*/
  /*  .search-value{*/
  /*    color: #fff;*/
  /*  }*/
  /*}*/
  .detail-dropdown{
    padding: 0 10px;
    height: 30px;
    line-height: 30px;
    border-radius: 2px;
  }
  .search-detail-title {
    font-size: 14px;
    color: #333333;
    letter-spacing: 0;
    line-height: 14px;
    font-weight: 600;
    margin-right: 10px;
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
    overflow: hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    max-width: 100px;
  }
</style>
<style lang="scss">
  .detail-top-search-dropdown{
    max-height: 300px;
    overflow-y: auto;
    .el-dropdown-menu__item{
      background: #fff !important;
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
      .el-checkbox:hover{
        color: #fa901c;
        background-color: #fafafa !important;
      }
      .children-title-name{
        width: calc(100% - 20px);
        height: 36px;
        padding-left: 20px;
        font-size: 12px;
        color: #909399;
        line-height: 30px;
      }
    }
    .el-dropdown-menu__item:not(.is-disabled):hover{
      color: #606266;
      background: #fff !important;
    }
  }
  .clear-all-select{
    padding: 0 20px;
    padding-left: 42px;
    color: #0052cc;
    font-size: 12px;
  }
  .clear-all-select:hover{
    text-decoration: underline;
  }
</style>
