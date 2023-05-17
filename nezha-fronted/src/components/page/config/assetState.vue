<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :components="['searchInput', 'elementSet', 'pagination']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.assetState"
      :search-msg="searchMsg"
      :table-id="tableId"
      :table-title="tableTitle"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="assetState-add" v-has="'assetState_toAdd'" :title="$t('asset.createAssetState')" class="top-tool-btn margin-l-20"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button
          ref="deleteButton"
          :single="false"
          :from="'assetState'"
          :forceDeleteShow="false"
          id="asset-state-list-batch-delete"
          v-has="'assetState_delete'"
          :delete-objs="batchDeleteObjs"
          api="/asset/stateConf"
          @after="getTableData"
          @before="delFlag=true"
        ></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <el-table
          id="role-list-table"
          ref="dataTable"
          v-my-loading="tools.loading"
          :loading="tools.loading"
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
            :key="`col-${index}-${item.prop}`"
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
              <el-switch
                v-if="item.prop === 'ping'"
                v-model="scope.row.ping"
                :active-value="1"
                :disabled="!hasButton('assetState_toEdit')"
                :inactive-value="0"
                @change="(val)=>{statusChange(scope.row)}">
              </el-switch>
              <el-switch
                v-else-if="item.prop === 'monitor'"
                v-model="scope.row.monitor"
                :active-value="1"
                :disabled="!hasButton('assetState_toEdit')"
                :inactive-value="0"
                @change="(val)=>{statusChange(scope.row)}">
              </el-switch>
              <el-switch
                v-else-if="item.prop === 'alert'"
                v-model="scope.row.alert"
                :active-value="1"
                :disabled="!hasButton('assetState_toEdit')"
                :inactive-value="0"
                @change="(val)=>{statusChange(scope.row)}">
              </el-switch>
              <span v-else>{{scope.row[item.prop]}}</span>
            </template>
          </el-table-column>
          <el-table-column
            :resizable="false"
            :width="operationWidth"
            fixed="right">
            <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
            <div slot-scope="scope" class="table-operation-items">
              <button class="table-operation-item" @click="$refs.dataList.showBottomBox('operationLog', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
              <el-dropdown size="medium" trigger="click" @command="tableOperation">
                <div class="table-operation-item table-operation-item--more">
                  <span>…</span><i class="nz-icon nz-icon-arrow-down"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="['edit', scope.row]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
                  <el-dropdown-item :command="['delete', scope.row, `/asset/stateConf?ids=${scope.row.id}`]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-table-column>
        </el-table>
        <!-- 回到table顶部的按钮 -->
        <button v-show="tools.showTopBtn && slotProps.mainResizeShow" id="role-list-totop" :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" class="to-top" @click="toTop(scrollbarWrap)" :title="$t('overall.backToTop')"><i class="nz-icon nz-icon-top"></i></button>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <asset-state-box v-if="rightBox.show" :asset-state="object" :asset-state-data="assetStateData" @close="closeRightBox"></asset-state-box>
    </transition>
  </div>
</template>
<script>
import assetStateBox from '@/components/common/rightBox/assetStateBox'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import tableMixin from '@/components/common/mixin/table'

export default {
  name: 'asset-state-list',
  components: {
    deleteButton,
    assetStateBox,
    nzDataList
  },
  mixins: [tableMixin],
  data () {
    return {
      assetStateData: [],

      tableId: 'assetStateTable', // 需要分页的table的id，用于记录每页数量
      blankObject: { // 空白对象
        id: '', name: '', ping: 0, monitor: 0, alert: 0, remark: ''
      },
      tableTitle: [ // 原table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true
        }, {
          label: 'Ping',
          prop: 'ping',
          show: true
        }, {
          label: this.$t('config.system.monitor.monitor'),
          prop: 'monitor',
          show: true
        }, {
          label: this.$t('overall.alert'),
          prop: 'alert',
          show: true
        }, {
          label: this.$t('config.assetState.assetTotal'),
          prop: 'assetTotal',
          show: true
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true
        }
      ],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          disabled: false
        }]
      }
    }
  },
  methods: {
    statusChange (obj) {
      this.$nextTick(() => {
        this.$put('/asset/stateConf', obj).then(response => {
          if (response.code === 200) {
            this.rightBox.show = false
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
          } else {
            this.$message.error(response.msg)
          }
          this.getTableData()
        })
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
      if (!this.scrollbarWrap) {
        this.$nextTick(() => {
          this.scrollbarWrap = this.$refs.assetStateTable.bodyWrapper
          this.toTopBtnHandler(this.scrollbarWrap)
        })
      }
      this.tools.loading = true
      this.$get('/asset/stateConf', this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.assetStateTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    }
  }
}
</script>
