<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :components="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.role"
      :search-msg="searchMsg"
      :table-id="tableId"
      :table-title="tableTitle">
      <template v-slot:top-tool-left>
        <select-group ref="selectGroup" :filter-object="filterGroup" :object-data="groupData" :placement="'bottom-start'"
                      :show-object="showGroup" style="width: 300px;" @del="delGroup" @edit="editGroup" @selectObject="groupChange">
          <template v-slot:header>
            <div class="panel-select-header">
              <el-input id="panel-list-search" v-model="filterGroup" :placeholder="$t('overall.search')" clearable size="mini" style="width: 240px; margin-right: 5px;"></el-input>
              <span id="panel-list-toadd" v-has="'panel_toAdd'" :title='$t("dashboard.panel.createPanelTitleSec")' class="panel-select-add" @click="addGroup"><i class="nz-icon nz-icon-plus"></i></span>
            </div>
          </template>
          <template v-slot:trigger>
            <el-input v-model="showGroup.name" class="panel-name" placeholder="" readonly="readonly" size="small"></el-input>
          </template>
        </select-group>
      </template>
      <template v-slot:top-tool-right>
        <button id="meta-add-meta" v-has="'expr_temp_save'" :title="$t('overall.exportExcelLower')" class="top-tool-btn margin-l-20"
                type="button" @click="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
        <delete-button :delete-objs="batchDeleteObjs" @after="getTableData"
                       :api="'asset/field/meta'" v-has="'expr_temp_delete'" id="meta-msg-batch-delete"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <el-table
          id="role-list-table"
          ref="dataTable"
          v-loading="tools.loading"
          :data="tableData"
          :height="mainTableHeight"
          border
          @header-dragend="dragend"
          @sort-change="tableDataSort"
          @selection-change="(selection)=>{batchDeleteObjs=selection}"
        >
          <el-table-column
            :resizable="false"
            align="center"
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            v-for="(item, index) in tools.customTableTitle"
            v-if="item.show"
            :key="`col-${index}`"
            :fixed="item.fixed"
            :label="item.label"
            :prop="item.prop"
            :resizable="true"
            :sort-orders="['ascending', 'descending']"
            :width="`${item.width}`"
            class="data-column"
          >
            <template slot="header">
              <span>
                <span>{{item.label}}</span>
                <div class="col-resize-area"></div>
              </span>
            </template>
            <template slot-scope="scope" :column="item">
              <div v-if="item.prop === 'group'">
                {{scope.row[item.prop] ? scope.row[item.prop].name : '-'}}
              </div>
              <div v-else-if=" item.prop === 'display' ">
                <el-switch
                  v-model="scope.row[item.prop]"
                  active-color="#ee9d3f"
                  :active-value="1"
                  @change="putMeta(scope.row)"
                  :inactive-value="0">
                </el-switch>
              </div>
              <div v-else-if=" item.prop === 'search' ">
                <el-switch
                  v-model="scope.row[item.prop]"
                  active-color="#ee9d3f"
                  :active-value="1"
                  @change="putMeta(scope.row)"
                  :inactive-value="0">
                </el-switch>
              </div>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop] || '-'}}</span>
              <template v-else>-</template>
            </template>
          </el-table-column>
          <el-table-column
            :resizable="false"
            :width="operationWidth"
            fixed="right">
            <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
            <div slot-scope="scope" class="table-operation-items">
              <button class="table-operation-item" @click="$refs.dataList.showBottomBox('operationLog', scope.row)"><i class="nz-icon nz-icon-view1"></i></button>
              <el-dropdown size="medium" trigger="hover" @command="tableOperation">
                <div class="table-operation-item table-operation-item--more">
                  <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="['edit', scope.row]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
                  <el-dropdown-item :command="['delete', scope.row, `asset/field/meta?ids=${scope.row.id}`]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-table-column>
        </el-table>
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
      <assetMetaBox v-if="rightBox.metaShow" ref="assetMetaBox" :asset-meta="object"
                    @close="closeRightBox"></assetMetaBox>
    </transition>
    <transition name="right-box">
      <assetMetaGroup v-if="rightBox.groupShow" :metaGroup="metaGroup" @close="closeRightBox"
                      ref="assetMetaBox"></assetMetaGroup>
    </transition>
  </div>
</template>

<script>
import deleteButton from '@/components/common/deleteButton'
import assetMetaGroup from '@/components/common/rightBox/assetMetaGroup'
import assetMetaBox from '@/components/common/rightBox/assetMetaBox'
import selectGroup from '@/components/common/popBox/selectAssetMetaGroup'
import nzDataList from '@/components/common/table/nzDataList'
import tableMixin from '@/components/common/mixin/table'

export default {
  name: 'assetMeta',
  components: {
    deleteButton,
    assetMetaGroup,
    assetMetaBox,
    selectGroup,
    nzDataList
  },
  mixins: [tableMixin],
  data () {
    return {
      tableId: 'assetMeta',
      // 侧滑
      rightBox: {
        metaShow: false,
        groupShow: false
      },
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('config.assetMeta.name'),
          prop: 'name',
          show: true
        }, {
          label: this.$t('config.assetMeta.key'),
          prop: 'metaKey',
          show: true
        }, {
          label: this.$t('config.assetMeta.group'),
          prop: 'group',
          show: true
        }, {
          label: this.$t('config.assetMeta.search'),
          prop: 'search',
          show: true
        }, {
          label: this.$t('config.assetMeta.display'),
          prop: 'display',
          show: true
        }, {
          label: this.$t('config.assetMeta.type'),
          prop: 'type',
          show: true
        }, {
          label: this.$t('config.assetMeta.params'),
          prop: 'param',
          show: false
        }
      ],
      groupData: [{
        name: this.$t('config.assetMeta.all'),
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
            name: this.$t('config.assetMeta.name'),
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
        search: 1,
        display: 1,
        type: 'text',
        param: {},
        remark: ''
      },
      object: {},
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
      this.$get('asset/field/meta', this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code == 200) {
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
          // console.info(this.$refs.dataTable)
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    afterTableListChange () {
      this.getTableData()
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
      this.assetMeta = JSON.parse(JSON.stringify(this.blankObject))
      this.rightBox.metaShow = true
    },
    edit (row) {
      this.$get('asset/field/meta/' + row.id).then(res => {
        this.assetMeta = { ...res.data, param: JSON.parse(res.data.param) }
        this.rightBox.metaShow = true
      })
    },
    putMeta (row) {
      this.tools.loading = true
      this.$put('asset/field/meta', row).then(response => {
        this.prevent_opt.save = false
        if (response.code === 200) {
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
        } else {
          this.$message.error(response.msg)
        }
        this.getTableData()
      })
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
