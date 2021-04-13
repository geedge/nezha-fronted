<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.alertSilence"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg">
      <template v-slot:top-tool-right>
        <button id="roles-add" v-has="'alertSilence_add'" :title="$t('overall.create')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="role-list-batch-delete" v-has="'alertSilence_expire'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <alert-silence-table
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></alert-silence-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <alert-silence-box v-if="rightBox.show" :alert-silence="object" @close="closeRightBox"></alert-silence-box>
    </transition>
    <!--导出-->
    <div class="export-xlsx">
      <el-dialog :modal-append-to-body='false' :show-close="true" :title="importBox.title"
                 :visible.sync="importBox.show" class="nz-dialog" width="300px" @close="closeDialog">
        <div class="upload-body">
          <button id="alert-msg-exportcur" class="el-button el-button--default el-button--small" @click="exportCur">
            <span>{{$t('overall.exportCur')}}</span>
          </button>
          <button id="alert-msg-exportall" class="el-button el-button--default el-button--small" @click="exportAll">
            <span>{{$t('overall.exportAll')}}</span>
          </button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import alertSilenceTable from '@/components/common/table/alert/alertSilenceTable'

export default {
  name: 'silence',
  components: {
    alertSilenceTable,
    deleteButton,
    nzDataList,
    alertSilenceBox
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'alert/silence',
      tableId: 'silenceTable',
      /* 搜素相关 */
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            id: 11,
            name: this.$t('alert.silence.datacenter'),
            type: 'input',
            label: 'datacenter',
            disabled: false
          }, {
            id: 12,
            name: this.$t('alert.silence.project'),
            type: 'input',
            label: 'project',
            disabled: false
          }, {
            id: 13,
            name: this.$t('alert.silence.module'),
            type: 'input',
            label: 'module',
            disabled: false
          }, {
            id: 14,
            name: this.$t('alert.silence.endpoint'),
            type: 'input',
            label: 'endpoint',
            disabled: false
          }, {
            id: 15,
            name: this.$t('alert.silence.asset'),
            type: 'input',
            label: 'asset ',
            disabled: false
          }
        ]
      },
      // 导出相关
      importBox: { show: false, title: this.$t('overall.exportExcel') },
      deleteBox: { show: false, ids: '', remark: '', state: 2 },
      // 创建修改相关
      blackObject: {
        id: '',
        startAt: '',
        endAt: '',
        ruleId: '',
        matcher: '',
        type: 'asset',
        linkId: '',
        reason: ''
      },
      nowTime: ''
    }
  },
  mounted () {
    this.initEvent()
  },
  methods: {
    initEvent () {
      bus.$on('alert-rule-list-change', () => {
        this.getTableData()
      })
      bus.$on('dc-list-change', () => {
        this.getTableData()
      })
      bus.$on('alert-message-change', () => {
        this.getTableData()
      })
    },
    exportCur () {
      const searchLabel = Object.assign({}, this.searchLabel)
      this.$set(searchLabel, 'language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
      this.exportExcel(searchLabel)
      this.closeDialog()
    },
    exportAll () {
      const temp = JSON.parse(JSON.stringify(this.searchLabel))
      temp.pageSize = -1
      this.$set(temp, 'language', localStorage.getItem('nz-language') ? localStorage.getItem('nz-language') : 'en')
      this.exportExcel(temp)
      this.closeDialog()
    },
    closeDialog () {
      this.importBox.show = false
      this.deleteBox.show = false
    },
    add () {
      this.blackObject.startAt = bus.timeFormate(bus.getOffsetTimezoneData(), 'yyyy-MM-dd hh:mm:ss')
      this.blackObject.endAt = bus.timeFormate(bus.getOffsetTimezoneData(1), 'yyyy-MM-dd hh:mm:ss')
      this.object = JSON.parse(JSON.stringify(this.blackObject))
      this.rightBox.show = true
    }
  }
}
</script>

