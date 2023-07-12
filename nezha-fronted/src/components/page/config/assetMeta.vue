<template>
  <div class="asset-meta">
    <nz-data-list
      ref="dataList"
      :api="url"
      :from="fromRoute.assetLabel"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-left>
        <select-group ref="selectGroup" :filter-object="filterGroup" :object-data="groupData" :placement="'bottom-start'"
                      :show-object="showGroup" @del="delGroup" @edit="editGroup" @selectObject="groupChange">
          <template v-slot:header>
            <div class="panel-select-header">
              <el-input id="panel-list-search" v-model="filterGroup" :placeholder="$t('overall.search')" clearable size="mini" style="width: 280px;"></el-input>
            </div>
          </template>
          <template v-slot:trigger>
<!--            <el-input v-model="showGroup.name" class="panel-name" placeholder="" readonly="readonly" size="small"></el-input>-->
            <span style="display: inline-block;padding: 0 7px;font-weight: bold">{{showGroup.name}}</span>
            <i style="font-size: 12px;color: #BEBEBE;" class="nz-icon nz-icon-arrow-down"></i>
          </template>
          <template v-slot:tail>
            <div class="panel-select-tail">
              <span id="panel-list-toadd" v-has="'asset_label_add'" :title='$t("dashboard.dashboard.createDashboardTitleSec")' class="panel-select-add" @click="addGroup"><i class="nz-icon nz-icon-create-square"></i>&nbsp;&nbsp;{{ $t('buttons.add') }}</span>
            </div>
          </template>
        </select-group>
      </template>
      <template v-slot:top-tool-right>
        <button id="meta-add-meta" v-has="'asset_label_add'" :title="$t('overall.createLabel')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
        <delete-button
          ref="deleteButton"
          :single="false"
          :from="'assetMeta'"
          :forceDeleteShow="true"
          :delete-objs="batchDeleteObjs"
          @after="getTableData"
          id="meta-msg-batch-delete"
          v-has="'asset_label_delete'"
          :api="url"
        ></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <asset-meta-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @copy="copy"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"
        ></asset-meta-table>
        <!-- 回到table顶部的按钮 -->
        <button v-show="tools.showTopBtn && slotProps.mainResizeShow" id="role-list-totop" :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" class="to-top" @click="toTop(scrollbarWrap)" :title="$t('overall.backToTop')"><i class="nz-icon nz-icon-top"></i></button>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <!--侧滑-->
    <transition name="right-box">
      <asset-meta-box v-if="rightBox.metaShow" ref="assetMetaBox" :obj="object" @close="closeRightBox"></asset-meta-box>
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
import routerPathParams from '@/components/common/mixin/routerPathParams'

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
  mixins: [dataListMixin, routerPathParams],
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
        name: this.$t('overall.exportAll'),
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
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          }, {
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }, {
            name: this.$t('overall.key'),
            type: 'input',
            label: 'key',
            disabled: false
          }
          // , {
          //   name: this.$t('dashboard.dashboard.chartForm.group'),
          //   type: 'group',
          //   label: 'group',
          //   readonly: true,
          //   disabled: false
          // }
        ]
      },
      // 创建修改相关
      blankObject: {
        id: '',
        name: '',
        metaKey: '',
        groupIds: '',
        group: {},
        search: '0',
        display: '0',
        required: '0',
        type: 'TEXT',
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
        if (response.code == 200) {
          this.groupData = [this.groupData[0]]
          this.groupData = this.groupData.concat(response.data.list)
          if (this.$route.query && this.$route.query.groupIds) {
            this.showGroup = this.groupData.find(item => item.id == this.$route.query.groupIds)
          }
          this.$forceUpdate()
        }
      })
    },
    getTableData () {
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      if (!this.searchLabel.groupIds) {
        delete this.searchLabel.groupIds
      }
      if (this.showGroup.id && this.showGroup.id !== -1) {
        this.searchLabel.groupIds = this.showGroup.id
      }
      const param = {
        ...this.searchLabel,
        ...this.searchCheckBox
      }
      const path = this.fromRoute.assetLabel
      this.updatePath(param, path)
      this.$get(this.url, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code == 200) {
          this.tableData = response.data.list
          this.tools.loading = false
          this.pageObj.total = response.data.total
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
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
              this.showGroup = {
                name: this.$t('overall.exportAll'),
                id: -1,
                children: []
              }
              this.searchLabel.groupIds = ''
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
      this.searchLabel.groupIds = item.id !== -1 ? item.id : ''
      this.getTableData()
    },
    add () {
      this.object = JSON.parse(JSON.stringify(this.blankObject))
      this.rightBox.metaShow = true
    },
    edit (row) {
      this.$get(`${this.url}/${row.id}`).then(response => {
        if (response.code === 200) {
          this.object = response.data
          this.rightBox.metaShow = true
        }
      })
    },
    copy (u) {
      this.object = { ...u, name: u.name + '-copy', id: '' }
      if (this.object.name.length > 64) {
        const length = this.object.name.length - 64
        this.object.name = u.name.substring(0, u.name.length - length) + '-copy'
      }
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
  },
  created () {
    const searchKeys = {
      // key: path 键
      // value: vue set 参数
      pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
      pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
      orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
      ids: {
        target: this.searchLabel,
        propertyName: 'ids',
        isSearchInput: true,
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 'ids',
          label: 'ids',
          name: 'ID',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      name: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'name',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 'name',
          label: 'name',
          name: 'Name',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      key: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'key',
        type: 'string',
        defaultJson: {
          disabled: false,
          label: 'key',
          name: 'Key',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      groupIds: {
        target: this.showGroup,
        propertyName: 'id',
        type: 'number',
        isSearchInput: false
      }
    }
    this.initQueryFromPath(searchKeys)
  }
}
</script>
