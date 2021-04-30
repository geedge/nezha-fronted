<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :from="fromRoute.assetLabel"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-left>
        <select-group ref="selectGroup" :filter-object="filterGroup" :object-data="groupData" :placement="'bottom-start'"
                      :show-object="showGroup" style="width: 300px;" @del="delGroup" @edit="editGroup" @selectObject="groupChange">
          <template v-slot:header>
            <div class="panel-select-header">
              <el-input id="panel-list-search" v-model="filterGroup" :placeholder="$t('overall.search')" clearable size="mini" style="width: 240px; margin-right: 5px;"></el-input>
              <span id="panel-list-toadd" v-has="'asset_label_add'" :title='$t("dashboard.panel.createPanelTitleSec")' class="panel-select-add" @click="addGroup"><i class="nz-icon nz-icon-plus"></i></span>
            </div>
          </template>
          <template v-slot:trigger>
            <el-input v-model="showGroup.name" class="panel-name" placeholder="" readonly="readonly" size="small"></el-input>
          </template>
        </select-group>
      </template>
      <template v-slot:top-tool-right>
        <button id="meta-add-meta" v-has="'asset_label_add'" :title="$t('overall.exportExcelLower')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
        <delete-button :delete-objs="batchDeleteObjs" @after="getTableData"
                       id="meta-msg-batch-delete" v-has="'asset_label_delete'" :api="url"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <asset-meta-table
          ref="dataTable"
          v-loading="slotProps.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"
        ></asset-meta-table>
        <!-- 回到table顶部的按钮 -->
        <button v-show="tools.showTopBtn && slotProps.mainResizeShow" id="role-list-totop" :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" class="to-top" @click="toTop(scrollbarWrap)"><i class="nz-icon nz-icon-top"></i></button>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <!--侧滑-->
    <transition name="right-box">
      <asset-meta-box v-if="rightBox.metaShow" ref="assetMetaBox" v-bind:asset-label="object" @close="closeRightBox"></asset-meta-box>
    </transition>
    <transition name="right-box">
      <asset-meta-group v-if="rightBox.groupShow" :metaGroup="metaGroup" @close="closeRightBox"
                      ref="assetMetaBox"></asset-meta-group>
    </transition>
  </div>
</template>

<script>
import deleteButton from '@/components/common/deleteButton'
import assetMetaGroup from '@/components/common/rightBox/assetMetaGroup'
import assetMetaBox from '@/components/common/rightBox/assetMetaBox'
import selectGroup from '@/components/common/popBox/selectAssetMetaGroup'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import assetMetaTable from '@/components/common/table/asset/assetMetaTable'

export default {
  name: 'assetMeta',
  components: {
    deleteButton,
    assetMetaGroup,
    selectGroup,
    nzDataList,
    assetMetaBox,
    assetMetaTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'asset/field/meta',
      tableId: 'assetMeta',
      // 侧滑
      rightBox: {
        metaShow: false,
        groupShow: false
      },
      groupData: [{
        name: this.$t('config.assetLabel.all'),
        id: -1,
        children: []
      }],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      /* 搜素相关 */
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            id: 11,
            name: 'Id',
            type: 'input',
            label: 'id',
            disabled: false
          }, {
            id: 12,
            name: this.$t('config.assetLabel.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }
        ]
      },
      // 创建修改相关
      blankObject: {
        id: '',
        name: '',
        metaKey: '',
        groupId: '',
        search: '0',
        display: '0',
        type: 'text',
        param: {},
        remark: ''
      },
      blankMetaGroup: {
        id: '',
        name: '',
        remark: ''
      },
      filterGroup: '',
      showGroup: { name: '' },
      metaGroup: {}
    }
  },
  mounted () {
    this.getGroup()
    this.showGroup = this.groupData[0]
  },
  methods: {
    getGroup () {
      this.$get('asset/field/group', { pageSize: -1 }).then(response => {
        this.tools.loading = false
        if (response.code == 200) {
          this.groupData = [this.groupData[0]]
          this.groupData = this.groupData.concat(response.data.list)
          this.$forceUpdate()
        }
      })
    },
    getTableData () {
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      if (!this.searchLabel.groupId) {
        delete this.searchLabel.groupId
      }
      this.$get(this.url, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code == 200) {
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    addGroup () {
      this.metaGroup = JSON.parse(JSON.stringify(this.blankMetaGroup))
      this.rightBox.groupShow = true
    },
    editGroup (group) {
      this.metaGroup = JSON.parse(JSON.stringify(group))
      this.rightBox.groupShow = true
    },
    delGroup (group) {
      const selectKey = this.$refs.selectGroup.$refs.tree.getCurrentKey()
      if (this.prevent_opt.save) {
        return
      }
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('asset/field/group?ids=' + group.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getGroup()

            if (selectKey === group.id) {
              this.showGroup = -1
              this.searchLabel.groupId = ''
              this.getTableData()
              this.$refs.selectGroup.$refs.tree.setCurrentKey(this.showGroup)
            }
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    groupChange (item) {
      this.showGroup = item
      this.searchLabel.groupId = item.id !== -1 ? item.id : ''
      this.getTableData()
    },
    add () {
      this.object = JSON.parse(JSON.stringify(this.blankObject))
      console.log(this.object);
      this.rightBox.metaShow = true
    },
    edit (row) {
      /* this.$get('asset/field/meta/' + row.id).then(res => {
        this.object = { ...res.data, param: JSON.parse(res.data.param) }
        this.rightBox.metaShow = true
      }) */
      this.object = JSON.parse(JSON.stringify(row))
      this.rightBox.metaShow = true
    },
    closeRightBox (refresh) {
      this.rightBox.metaShow = false
      this.rightBox.groupShow = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
        this.getGroup()
      }
    }
  }
}
</script>

<style scoped>
  .content{
    display: flex;
    height: calc(100% - 40px);
  }
  .asset-meta-group{
    width: 200px;
    height: calc(100% - 100px);
    background: #fff;
    margin-right: 10px;
    border: 1px solid #d4d4d4;
  }
  .asset-meta-table{
    flex: 1;
  }
  .group-title {
    background-image: linear-gradient(#f8f8f8, #e6e6e6);
    border-bottom: 1px solid #d4d4d4;
    display: flex;
    justify-content: flex-end;
    padding: 3px 5px;
  }
  .group-box{
    height: 100%;
    overflow-y:auto;
  }
  /deep/ .el-tree-node.is-current>.el-tree-node__content{
    background-color: #F5F7FA;
    color: #ee9d3f;
  }
  /deep/ .el-tree-node.is-current>.el-tree-node__content .meta-group{
    background-color: #F5F7FA;
    color: #ee9d3f;
  }
  /deep/ .el-tree-node__content:hover .meta-group {
    color: #ee9d3f;
  }
  .meta-group{
    color: #606266;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .meta-group .nz-icon-edit{
    color: #606266;
  }
  .meta-group .icon-box{
    display: none;
  }
  .meta-group:hover .icon-box{
    display: inline-block;
  }

  .panel-select-header {
    padding: 0 0 10px 16px;
  }
</style>
