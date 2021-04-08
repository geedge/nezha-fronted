<template>
  <div style="height: 100%">
    <nz-data-list
      v-if="showTab === 'file'"
      ref="dataList"
      :components="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.mib"
      :search-msg="searchMsg"
      :table-id="tableId"
      :table-title="tableTitle">
      <template v-slot:top-tool-left>
        <div id="module-type-1" class="nz-tab-item-box">
          <div class="nz-tab-item nz-tab-item-active">{{$t("config.mib.mibFiles")}}</div>
        </div>
        <div id="module-type-2" v-has="'snmp_browser_view'" class="nz-tab-item-box" @click="showTab = 'browser'">
          <div class="nz-tab-item">{{$t("config.mib.mibBrowser")}}</div>
        </div>
      </template>
      <template v-slot:top-tool-right>
        <button id="mib-add" v-has="'snmp_file_toAdd'" :title="$t('overall.createMib')" class="top-tool-btn margin-l-20" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="mib-list-batch-delete" v-has="'snmp_file_delete'" :delete-objs="batchDeleteObjs" api="mib" @after="getTableData" @before="delFlag=true"></delete-button>
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
              <template v-if="item.prop == 'updateUser'" >{{scope.row[item.prop].name}}</template>
              <template v-else-if="item.prop == 'fileName' && scope.row[item.prop]" >
                <span class="link" @click="downloadMib(scope.row)">{{scope.row[item.prop]}}</span>
              </template>
              <template v-else-if="item.prop === 'modelsDetail' && scope.row['modelsDetail'] && scope.row['modelsDetail'].length >0" >
                <div style="height: 100%">
                  <div style="height: 100%; overflow: auto;">
                    <div v-for="(n,i) in scope.row['modelsDetail']" :key="n.name+'-'+n.id+'-'+i" class="detail-item-content">
                      <el-popover placement="top" trigger="hover" >
                        <div>
                          <div>
                            <span>{{$t('overall.name')}}:</span>
                            <span>{{n.name}}</span>
                          </div>
                          <div>
                            <span>{{$t('config.mib.vendor')}}:</span>
                            <span>{{n.vendor}}</span>
                          </div>
                          <div>
                            <span>{{$t('config.mib.type')}}:</span>
                            <span>{{n.type}}</span>
                          </div>
                        </div>
                        <template slot="reference">
                          <div v-if="i < scope.row['modelsDetail'].length-1" class="detail-item-content">{{n.name}},</div>
                          <div v-else class="detail-item-content">{{n.name}}</div>
                        </template>
                      </el-popover>
                    </div>
                  </div>
                </div>
              </template>
              <span v-else-if="item.prop === 'updateAt'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
              <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
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
                  <el-dropdown-item v-has="'snmp_file_download'" :command="['edit', scope.row]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
                  <el-dropdown-item :command="['download', scope.row]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-download1"></i><span class="operation-dropdown-text">{{$t('overall.download')}}</span></el-dropdown-item>
                  <el-dropdown-item :command="['delete', scope.row, `mib?ids=${scope.row.id}`]" :disabled="isBuildIn(scope.row)"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
    <mib-browser :show-tab="showTab" v-if="showTab == 'browser'" @toFileTab="showTab = 'file'"></mib-browser>
    <transition name="right-box">
      <mib-box v-if="rightBox.show" ref="mibBox" :mib="object" @close="closeRightBox" @reload="getTableData"></mib-box>
    </transition>
  </div>
</template>
<script>
import axios from 'axios'
import mibBrowser from './mibBrowser'
import mibBox from '@/components/common/rightBox/mibBox'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import tableMixin from '@/components/common/mixin/table'

export default {
  name: 'mib',
  components: {
    mibBox,
    mibBrowser,
    deleteButton,
    nzDataList
  },
  mixins: [tableMixin],
  data () {
    return {
      showTab: 'file', // file/browser
      tableId: 'mibTable', // 需要分页的table的id，用于记录每页数量
      object: {},
      blankObject: {
        id: null,
        name: '',
        remark: '',
        models: '',
        file: null
      },
      tableTitle: [
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
          label: this.$t('config.mib.fileName'),
          prop: 'fileName',
          show: true
        }, {
          label: this.$t('config.mib.models'),
          prop: 'modelsDetail',
          show: true
        }, {
          label: this.$t('config.mib.remark'),
          prop: 'remark',
          show: true
        }, {
          label: this.$t('config.mib.updateUser'),
          prop: 'updateUser',
          show: true
        }, {
          label: this.$t('config.mib.updateAt'),
          prop: 'updateAt',
          show: true
        }
      ],
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
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          disabled: false
        }]
      }
    }
  },
  methods: {
    getTableData () {
      if (!this.hasButton('snmp_file_view')) {
        this.$message.error(this.$t('tip.noAccess'))
        return
      }
      this.tableData = []
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.$get('mib', this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
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
    downloadMib (mib) {
      if (!this.hasButton('snmp_file_download')) {
        return
      }
      axios.get('/mib/download?id=' + mib.id, { responseType: 'blob' }).then(data => {
        let fileName = new Date().getTime() + '.txt'
        const disposition = data.headers['content-disposition']
        if (disposition) {
          fileName = disposition.split(';')[1].split('filename=')[1]
        }
        // 由于ie不支持download属性，故需要做兼容判断
        if (navigator.appVersion.toString().indexOf('.NET') > 0) {
          // ie独有的msSaveBlob属性，data.data为Blob文件流
          window.navigator.msSaveBlob(data.data, fileName)
        } else {
          // 以下流程即为文章开始的下载流程
          const url = window.URL.createObjectURL(data.data)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(link.href)
        }
      })
    }
  }
}
</script>
<style >
  .mib-table .el-divider--horizontal{
    margin:2px 0 !important;
  }
  .mib-table td .cell .detail-item-content{
    height: 20px;
    line-height: 20px;
    display: inline-block;
  }
  .mib-table.el-table td .cell{
    height: 20px !important;
  }

</style>
