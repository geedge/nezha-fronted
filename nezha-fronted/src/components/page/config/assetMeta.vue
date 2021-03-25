<template>
  <div class="main-list main-and-sub-transition" :class="{'main-list-with-sub': bottomBox.showSubList}">
    <!--工具组-->
    <div class="top-tools" v-show="bottomBox.mainResizeShow">
      <div class="top-tool-main-right" :class="{'top-tool-main-right-to-left': bottomBox.showSubList}">
        <div class="top-tool-search margin-r-20">
          <search-input :searchMsg="searchMsg" @search="search"
                        :inTransform="bottomBox.inTransform" :single="true"></search-input>
        </div>
        <button :title="$t('overall.exportExcelLower')" @click="addMeta" type="button" v-has="'expr_temp_save'"
                class="nz-btn nz-btn-size-normal nz-btn-style-light" id="meta-add-meta">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>

        <delete-button :delete-objs="batchDeleteObjs" @after="getAssetMeta"
                       :api="'asset/field/meta'" v-has="'expr_temp_delete'" id="meta-msg-batch-delete"></delete-button>
      </div>
      <div class="pagination-top pagination-top-hide display-none"></div>
    </div>
    <!-- content -->
    <div class="content">
      <div class="asset-meta-group">
        <div class="group-title">
          <span>
            <button @click="addGroup" type="button" v-has="'asset:fieldgroup:add'" :disabled="metaGroupLock"
                    :class="{'nz-btn-disabled' : metaGroupLock}"
                    class="nz-btn nz-btn-size-normal nz-btn-style-light" id="meta-list-export">
              <i class="nz-icon nz-icon-create-square"></i>
            </button>
             <button @click="metaGroupLock=!metaGroupLock" class="nz-btn nz-btn-size-normal nz-btn-style-light" type="button" id="panel-lock"><i :class="{'nz-icon nz-icon-lock':metaGroupLock,'nz-icon nz-icon-unlock':!metaGroupLock}"></i></button>
        </span>
        </div>
        <el-tree
          :data="groupData"
          :props="defaultProps"
          :node-key="'id'"
          @node-click="changeGroup"
          ref="groupTree"
          check-on-click-node
          check-strictly
        >
          <div class="meta-group" slot-scope="{ node, data }">
        <div>
          <i class="nz-icon nz-icon-reading" v-if="!data.children"></i>
          <i class="el-icon-folder-opened" v-if="data.children"></i>
          {{ node.label }}
        </div>
        <div v-if="!data.children&&!metaGroupLock" class="icon-box">
          <span :id="'asset-group-edit-'+node.id" :title="$t('overall.edit')" @click.stop="editGroup(data)"
                                    class="content-right-option" v-has="'asset:fieldgroup:update'">
            <i class="nz-icon nz-icon-edit"></i>
          </span>
          <span
            :id="'asset-group-del-'+node.id"
            :title="$t('overall.delete')"
            @click.stop="delGroup(data)"
            class="content-right-option"
            v-has="'asset:fieldgroup:delete'">
            <i  class="nz-icon nz-icon-delete"></i>
          </span>
        </div>
      </div>
        </el-tree>
      </div>
      <div class="asset-meta-table">
        <!--表格开始-->
        <transition name="el-zoom-in-top">
          <element-set
            id="meta-rule-element-set"
            v-if="tools.showCustomTableTitle"
            @close="tools.showCustomTableTitle = false"
            :custom-table-title.sync="tools.customTableTitle"
            :original-table-title="tableTitle"
            ref="customTableTitle"
          ></element-set>
        </transition>
        <el-table
          id="meta-rule-table"
          class="nz-table"
          :data="tableData"
          border
          v-show="bottomBox.mainResizeShow"
          ref="assetMetaTable"
          tooltip-effect="light"
          :height="mainTableHeight"
          v-loading="tools.loading"
          style="width: 100%;"
          @sort-change="tableDataSort"
          @selection-change="(selection)=>{this.batchDeleteObjs=selection}"
        >
          <el-table-column
            :resizable="false"
            type="selection"
            width="40"
            align="center">
          </el-table-column>

          <el-table-column
            :resizable="true"
            v-for="(item, index) in tools.customTableTitle"
            v-if="item.show"
            :key="`col-${index}`"
            :label="item.label"
            :show-overflow-tooltip="item.prop!=='matchers'"
            :sort-orders="['ascending', 'descending']"
            :sortable="$tableSet.sortableShow(item.prop,'assetMeta')"
            :prop="$tableSet.propTitle(item.prop,'assetMeta')"
            :width="item.width"
          >
            <template slot-scope="scope" :column="item">
              <div v-if="item.prop === 'option'" class="content-right-options">
            <span :id="'meta-edit-'+scope.row.id" :title="$t('overall.edit')" @click.stop="edit(scope.row)"
                  class="content-right-option" v-has="'expr_temp_update'">
              <i class="nz-icon nz-icon-edit"></i>
            </span>
                <span
                  :id="'meta-del-'+scope.row.id"
                  :title="$t('overall.delete')"
                  @click="del(scope.row)"
                  class="content-right-option"
                  v-has="'expr_temp_delete'">
              <i  class="nz-icon nz-icon-delete"></i>
            </span>
              </div>
              <div v-else-if=" item.prop === 'group' ">
                {{scope.row[item.prop].name}}
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

          <el-table-column width="28" :resizable="false">
            <template slot="header">
          <span @mousedown.stop="!tools.showCustomTableTitle && (tools.showCustomTableTitle = true)"
                class="nz-table-gear">
            <i class="nz-icon nz-icon-gear"></i>
          </span>
            </template>
          </el-table-column>
        </el-table>
        <button :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}"
                @click="toTop(scrollbarWrap)" class="to-top" v-show="tools.showTopBtn && bottomBox.mainResizeShow"
                id="meta-rule-toTop"><i class="nz-icon nz-icon-top"></i></button>
        <!--表格结束-->
        <!--分页部分-->
        <div class="pagination-bottom" v-show="!bottomBox.showSubList">
          <Pagination :tableId="tableId" :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize'
                      ref="Pagination"></Pagination>
        </div>
      </div>
    </div>
    <!--侧滑-->
    <transition name="right-box">
      <assetMetaBox v-if="rightBox.metaShow" :assetMeta="assetMeta" @close="closeRightBox"
                   ref="assetMetaBox"></assetMetaBox>
    </transition>
    <transition name="right-box">
      <assetMetaGroup v-if="rightBox.groupShow" :metaGroup="metaGroup" @close="closeRightBox"
                    ref="assetMetaBox"></assetMetaGroup>
    </transition>
  </div>
</template>

<script>
import deleteButton from '../../common/deleteButton'
import assetMetaGroup from '../../common/rightBox/assetMetaGroup'
import assetMetaBox from '../../common/rightBox/assetMetaBox'

export default {
  name: 'assetMeta',
  components: {
    'delete-button': deleteButton,
    assetMetaGroup,
    assetMetaBox
  },
  data () {
    return {
      tableId: 'assetMeta',
      // 侧滑
      rightBox: {
        metaShow: false,
        groupShow: false
      },
      metaGroupLock: true,
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
        }, {
          label: this.$t('alert.config.option'),
          prop: 'option',
          show: true,
          width: 120
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
      tableData: [],
      /* 二级列表相关 */
      mainTableHeight: this.$tableHeight.normal, // 主列表table高度
      /* 二级页面相关 */
      bottomBox: {
        tabList: [], // 二级列表的标签
        tabDetailList: [], // 多个详情
        mainResizeShow: true, // dom高度改变时是否展示|隐藏
        subResizeShow: true,
        isFullScreen: false, // 全屏状态
        showSubList: false, // 是否显示二级列表
        targetTab: '', // 显示二级列表中的哪个页签
        inTransform: false // 搜索框相关，搜索条件下拉框是否在transform里
      },
      /* 工具参数 */
      tools: {
        loading: false, // 是否显示table加载动画
        toTopBtnTop: this.$tableHeight.toTopBtnTop, // to-top按钮的top属性
        tableHover: false, // 控制滚动条和top按钮同时出现
        showTopBtn: false, // 显示To top按钮
        showCustomTableTitle: false, // 自定义列弹框是否显示
        customTableTitle: [] // 自定义列工具的数据
      },
      /* 批量删除相关 */
      batchDeleteObjs: [],
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
      searchLabel: {}, // 搜索参数
      pageObj: {
        pageNo: 1,
        pageSize: this.$CONSTANTS.defaultPageSize,
        total: 0
      },
      // 创建修改相关
      blackAssetMeta: {
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
      assetMeta: {

      },
      blackMetaGroup: {
        id: '',
        name: '',
        remark: ''
      },
      activeGroupId: -1,
      metaGroup: {

      }
    }
  },
  mounted () {
    // 初始化表头
    this.tools.customTableTitle = localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.$route.path)
      ? JSON.parse(localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.$route.path))
      : this.tableTitle
    this.tableTitleReset(this.tableTitle, this.tools.customTableTitle)
    this.initEvent()
  },
  methods: {
    initEvent () {
      this.$refs.groupTree.setCurrentKey(this.activeGroupId)
      this.getGroup()
      this.getAssetMeta()
    },
    getGroup () {
      this.$get('asset/field/group', { pageSize: -1 }).then(response => {
        this.tools.loading = false
        if (response.code == 200) {
          this.groupData[0].children = response.data.list
          this.$forceUpdate()
        }
      })
    },
    getAssetMeta () {
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
          // console.info(this.$refs.assetMetaTable)
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.assetMetaTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    pageNo (val) {
      this.pageObj.pageNo = val
      this.getAssetMeta()
    },
    pageSize (val) {
      this.pageObj.pageSize = val
      localStorage.setItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId, val)
      this.getAssetMeta()
    },
    search (searchObj) {
      let orderBy = ''
      if (this.searchLabel.orderBy) {
        orderBy = this.searchLabel.orderBy
      }
      this.searchLabel = {}
      this.pageObj.pageNo = 1
      for (const item in searchObj) {
        if (searchObj[item]) {
          this.$set(this.searchLabel, item, searchObj[item])
        }
      }
      if (orderBy) {
        this.$set(this.searchLabel, 'orderBy', orderBy)
      }
      this.$refs.assetMetaTable.bodyWrapper.scrollTop = 0
      this.getAssetMeta()
    },
    // 数据排序
    tableDataSort (item) {
      let orderBy = ''
      if (item.order === 'ascending') {
        orderBy = item.prop
      }
      if (item.order === 'descending') {
        orderBy = '-' + item.prop
      }
      this.$set(this.searchLabel, 'orderBy', orderBy)
      this.getAssetMeta()
    },
    afterTableListChange () {
      this.getAssetMeta()
    },
    addGroup () {
      this.metaGroup = JSON.parse(JSON.stringify(this.blackMetaGroup))
      this.rightBox.groupShow = true
    },
    editGroup (group) {
      this.metaGroup = JSON.parse(JSON.stringify(group))
      this.rightBox.groupShow = true
    },
    delGroup (group) {
      const selectKey = this.$refs.groupTree.getCurrentKey()
      if (this.prevent_opt.save) {
        return
      }
      ;
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
              this.activeGroupId = -1
              this.searchLabel.groupId = ''
              this.getAssetMeta()
              this.$refs.groupTree.setCurrentKey(this.activeGroupId)
            }
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    changeGroup (item) {
      this.activeGroupId = item.id
      this.searchLabel.groupId = item.id !== -1 ? item.id : ''
      this.getAssetMeta()
    },
    addMeta () {
      this.assetMeta = JSON.parse(JSON.stringify(this.blackAssetMeta))
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
        this.getAssetMeta()
      })
    },
    del (row) {
      if (this.prevent_opt.save) {
        return
      }
      ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('asset/field/meta?ids=' + row.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getAssetMeta()
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    closeRightBox (refresh) {
      this.rightBox.metaShow = false
      this.rightBox.groupShow = false
      if (refresh) {
        this.delFlag = true
        this.getAssetMeta()
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
</style>
