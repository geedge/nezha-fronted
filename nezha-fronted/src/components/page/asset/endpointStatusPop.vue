<template>
    <el-popover ref="endpointPop" v-model="popBox.show" :placement="placement" popper-class="nz-pop" width="300" @show="atShowPop">
      <div class="pop-box-title">
        <div class="pop-top-btns">
          <button type="button" @click="esc" class="nz-btn nz-btn-size-alien nz-btn-size-small nz-btn-style-light nz-btn-min-width-35" id="dc-esc">
            <span class="pop-top-btn-icon"><i class="nz-icon nz-icon-close"></i></span>
            <span class="pop-top-btn-txt">{{$t('overall.esc')}}</span>
          </button>
        </div>
        <div class="pop-title">{{popBox.title}}</div>
      </div>

      <div class="pop-body">
        <div class="pop-body_title">{{showProject?showProject.name:''}}</div>
        <div class="pop-body_content">
          <el-table
            :data="modules"
            :show-header="false"
            height="100%"
            :row-key="getRowKeys"
            :expand-row-keys="expands"
            @expand-change="expandSelect"
            @row-click="clickTabRow"
            ref="popTab"
            style="width: 100%;"
            class="pop-box-table">
            <el-table-column >
              <template slot-scope="scope" :column="item">
                <span class="link">{{scope.row.name}}</span>
              </template>
            </el-table-column>
            <el-table-column type="expand">
              <template>
                <div class="table-inner">
                  <template v-for="(item, index) in filterEndpoints()">
                    <div :key="index" class="inner-row">
                      <div class="inner-col left">ID：{{item.id}}</div>
                      <div class="inner-col right">
                        <el-popover placement="right"  width="50" trigger="hover" :content="(item.state == 1?'up':'down')+'['+(item.lastUpdate&&item.lastUpdate!=''?(new Date(item.lastUpdate).getHours()+':'+new Date(item.lastUpdate).getMinutes()):'--')+']'" >
                          <div slot="reference" style="width: 20px">
                            <div @mouseover="resetZIndex($event)" :class="{'active-icon green':item.state == 1,'active-icon red':item.state == 0}"></div>
                          </div>
                        </el-popover>
                      </div>
                    </div>
                  </template>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template slot="reference">
        <div @click.prevent="">
          <slot name="optionZone"><div class="tab-input-square link">0</div></slot>
        </div>
      </template>
    </el-popover>
</template>

<script>
import { resetZIndex } from '../../common/js/common'
export default {
  name: 'endpointStatusPop',
  props: {
    placement: { type: String, default: 'left' },
    assetId: { type: Number, required: true }
  },
  data () {
    const temp = this
    return {
      popBox: { title: this.$t('project.endpoint.endpoint'), show: false },
      endpointDatas: [],
      endpoints: [],
      modules: [],
      projects: new Map(),
      showModule: null,
      showProject: null,
      getRowKeys (row) {
        if (temp.showModule && row.id == temp.showModule.id) {
          temp.$refs.popTab.toggleRowExpansion(row, true)
          // temp.$refs.popTab.setCurrentRow(row);
        }
        return row.id
      },
      expands: []
    }
  },
  created () {

  },
  methods: {
    getEndpointDatas: function () {
      this.$get('/endpoint?assetId=' + this.assetId + 'pageSize=-1').then(response => {
        if (response.code === 200) {
          this.endpointDatas = response.data.list
          this.dealDatas(JSON.parse(JSON.stringify(this.endpointDatas)))
        }
      })
    },
    dealDatas: function (endpointDatas) { // 为方便组织结构，将数据分层
      const temp = this
      temp.endpoints = []
      temp.modules = []
      temp.projects.clear()
      temp.showModule = null
      temp.showProject = null
      endpointDatas.forEach((item, index) => {
        const module = JSON.parse(JSON.stringify(item.module))
        module.projectId = item.project.id
        temp.modules.push(module)
        const project = JSON.parse(JSON.stringify(item.project))
        temp.projects.set(project.id, project)
        delete item.module
        delete item.project
        temp.endpoints.push(item)
      })
      this.modules = this.duplicateRemoval(this.modules)
      this.initShow()
    },
    duplicateRemoval: function (arr) {
      const res = new Map()
      return arr.filter(a => {
        return !res.has(a.id) && res.set(a.id, 1)
      })
    },
    initShow: function () {
      if (!this.showModule) {
        this.showModule = this.modules[0]
      }
    },
    filterEndpoints: function () {
      if (this.showModule) {
        return this.endpoints.filter((item) => {
          return item.moduleId == this.showModule.id
        })
      }
    },
    expandSelect (row, expandedRows) { // 只能展开一行
      this.expands = []
      if (expandedRows.length > 0) {
        row && this.expands.push(row.id)
        this.showModule = row
        this.showProject = this.projects.get(row.projectId)
      }
    },
    esc: function () {
      this.popBox.show = false
    },
    resetZIndex,
    atShowPop: function () {
      this.getEndpointDatas()
    },
    clickTabRow: function (row, column, event) {
      this.$refs.popTab.toggleRowExpansion(row)
    }
  },
  mounted () {
  },
  watch: {
    showModule: {
      handler (n, o) {
        if (!n) {
          n = this.modules && this.modules.length > 0 ? this.modules[0] : null
        }
        this.showProject = this.projects.get(n.projectId)
      }
    }
  }

}
</script>

<style scoped>
  .pop-box-title{
    margin-left: 5px;
  }
  .pop-top-btns {
    text-align: center;
    float: right;
    padding-right: 12px;
  }
  .pop-body{
    margin:10px 10px 10px 10px;
    border: 1px solid lightgrey;
    height: 400px;
    border-radius: inherit;
  }
  .pop-title{
    margin-left: 5px;
  }
  .pop-body .pop-body_title{
    line-height: 25px;
    display: inline;
    vertical-align: middle;
    margin-left: 5px;
  }
  .pop-body .pop-body_content{
    border-top:1px solid lightgrey;
    box-shadow: 0px 0px 5px lightgrey inset;
    border-radius: inherit;
    height: calc(100% - 25px);
    padding: 0px 2px 0px 2px;
  }
  .pop-box-table{
    font-size: 12px;
  }

  .table-inner{
    background-color: #F5F5F5;
  }
  .table-inner .inner-row{
    display: flex;
    line-height: 25px;
    border-bottom: 1px solid white;
  }
  .table-inner .inner-row:hover {
    /*background-color: white;*/
  }
  .table-inner .inner-col{
    flex: 1;
    display: inline-block;
  }
  .left{
    flex: 8 !important;
    padding-left: 20px;
    text-align: left;
  }
  .right{
    position: relative;
  }
  .active-icon{
    margin-top:0px;
    width:10px;
    height:10px;
    border-radius:50%;
    display: inline-block;
    margin-right: 5px;
  }
</style>
<style>
  .el-table td,.el-table th{
    padding: 5px;
  }
  .el-table__expanded-cell[class*=cell] {
    padding: 0px;
  }

</style>
