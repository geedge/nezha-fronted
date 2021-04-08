<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :components="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.promServer"
      :search-msg="searchMsg"
      :table-id="tableId"
      :table-title="tableTitle">
      <template v-slot:top-tool-right>
        <button id="prom-add" v-has="'prom_toAdd'" :title="$t('overall.createPrometheusServer')" class="top-tool-btn margin-l-20"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="promserver-list-batch-delete" v-has="'prom_delete'" :delete-objs="batchDeleteObjs" api="agent" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <el-table ref="dataTable"
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
          <el-table-column v-for="(item, index) in tools.customTableTitle" v-if="item.show"
                           :key="`col-${index}`"
                           :label="item.label"
                           :prop="propTitle(item.prop, fromRoute.promServer)"
                           :resizable="true"
                           :sort-orders="['ascending', 'descending']"
                           :sortable="sortableShow(item.prop, fromRoute.promServer)">
            <template slot="header">
              <span>
                <span>{{item.label}}</span>
                <div class="col-resize-area"></div>
              </span>
            </template>
            <template slot-scope="scope" :column="item">
              <span v-if="item.prop === 'idc'" >{{scope.row[item.prop]?scope.row[item.prop].name:'-'}}</span>

              <span v-else-if="item.prop === 'type'">
                {{findServerType(scope.row[item.prop]).text}}
              </span>
              <span v-else-if="item.prop === 'checkTime'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
              <span v-else-if="item.prop === 'status'">
                <el-popover :content="$t('asset.assetStatPre')+(scope.row.checkTime?utcTimeToTimezoneStr(scope.row.checkTime):$t('asset.assetStatDown'))" placement="right" trigger="hover" width="200">
                  <div slot="reference" style="width: 20px">
                    <div :class="{'active-icon green':scope.row[item.prop] == '1','active-icon red':scope.row[item.prop] == '0' || scope.row[item.prop] == '-1' || scope.row[item.prop] == '-2'}"></div>
                  </div>
                </el-popover>
              </span>
              <span v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</span>
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
                  <el-dropdown-item :command="['delete', scope.row, `agent?ids=${scope.row.id}`]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-table-column>
        </el-table>
        <!-- 回到table顶部的按钮 -->
        <button v-show="tools.showTopBtn && slotProps.mainResizeShow" id="account-list-totop" :class="{'to-top-is-hover': tools.tableHover}" :style="{top: tools.toTopBtnTop}" class="to-top" @click="toTop(scrollbarWrap)"><i class="nz-icon nz-icon-top"></i></button>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <prom-server-box v-if="rightBox.show" :prom-server="object" @close="closeRightBox"></prom-server-box>
    </transition>
  </div>

</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import promServerBox from '@/components/common/rightBox/promServerBox'
import { promServer } from '@/components/common/js/constants'
import nzDataList from '@/components/common/table/nzDataList'
import tableMixin from '@/components/common/mixin/table'
export default {
  name: 'promServer',
  components: {
    nzDataList,
    promServerBox,
    deleteButton
  },
  mixins: [tableMixin],
  data () {
    return {
      tableId: 'promTable', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: '',
        host: '',
        port: 9090,
        idc: { id: '', name: '', location: '' }
      },
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('config.dc.dc'),
          prop: 'idc',
          show: true
        }, {
          label: 'Host',
          prop: 'host',
          show: true
        }, {
          label: 'Port',
          prop: 'port',
          show: true
        }, {
          label: this.$t('config.promServer.type'),
          prop: 'type',
          show: true
        }, {
          label: this.$t('asset.state'),
          prop: 'status',
          show: true
        }, {
          label: this.$t('config.promServer.checkTime'),
          prop: 'checkTime',
          show: false
        }
      ],
      tableData: [],
      dcData: [],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 1,
          name: 'ID',
          type: 'input',
          label: 'id',
          disabled: false
        }, {
          id: 5,
          name: this.$t('config.promServer.dataCenter'),
          type: 'dc',
          label: 'dc',
          disabled: false
        }, {
          id: 6,
          name: this.$t('config.promServer.type'),
          type: 'select',
          label: 'promType',
          disabled: false
        }, {
          id: 8,
          name: this.$t('project.endpoint.host'),
          type: 'input',
          label: 'host',
          disabled: false
        }, {
          id: 9,
          name: this.$t('project.endpoint.port'),
          type: 'input',
          label: 'port',
          disabled: false
        }]
      },
      promServerType: null
    }
  },
  methods: {
    getTableData () {
      if (!this.hasButton('prom_view')) {
        this.$message.error(this.$t('tip.noAccess'))
        return
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.loading = true
      this.$get('agent', this.searchLabel).then(response => {
        this.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            for (let j = 0; j < this.dcData.length; j++) {
              if (response.data.list[i].idcId == this.dcData[j].id) {
                response.data.list[i].idc = this.dcData[j]
                break
              }
            }
          }
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    // 获取dc数据
    getDcData () {
      return new Promise(resolve => {
        this.$get('idc', { pageSize: -1 }).then(response => {
          if (response.code === 200) {
            this.dcData = response.data.list
          }
          resolve()
        })
      })
    },
    findServerType (type) {
      if (!this.promServerType) {
        this.promServerType = []
        promServer.theData.forEach(item => {
          this.promServerType = this.promServerType.concat(item.children)
        })
      }
      return this.promServerType.find(item => {
        return item.value == type
      })
    }
  },
  mounted () {
    // 初始化数据
    Promise.all([this.getDcData()]).then(response => {
      this.getTableData()
    })
  }
}
</script>
