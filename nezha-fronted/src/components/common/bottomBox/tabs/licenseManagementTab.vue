<template>
  <div class="full-width-height">
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :api="url"
      :tableId="tableId"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['elementSet']"
      :search-msg="searchMsg"
      :tabs="tabs"
      :targetTab="targetTab"
      :customClassName="'license-management-active'"
      @search="search"
      @changeTab="changeTab"
      class="full-width-height"
    >
      <template v-slot:title><span :title="obj ? obj.name: '-'">{{obj.name}}</span></template>
      <template v-slot:top-tool-right>
        <button id="license-mange-export" class="top-tool-btn margin-l-10" @click.stop="exportLicense()" :title="$t('overall.exportExcel')">
          <i class="nz-icon nz-icon-download1"></i>
        </button>
        <el-upload
          action=""
          :auto-upload="false"
          accept=".v2c,.V2CP,.H2R,.R2H,.H2H,.ID "
          :on-change="uploadChange"
          style="display: none"
          ref="upload"
        >
        </el-upload>
        <button id="license-mange-import" class="top-tool-btn margin-l-10 margin-r-10" @click.stop="importLicense" :title="$t('overall.importExcel')">
          <i class="nz-icon nz-icon-upload"></i>
        </button>
      </template>
      <template v-slot>
        <licenseMangeTable
          ref="dataTable"
          :orderByFa="'id'"
          v-my-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="subTableHeight"
          :now-time="nowTime"
          :table-data="tableData"
          :endpointTab="true"
          class="bottom-box__top"
          @del="del"
          @edit="edit"
          @copy="copy"
          @orderBy="tableDataSort"
          @addSilence="addSilence"
          @reload="getTableData"
          @topology="topology"
          @metricTarget="metricTarget"
          @selectionChange="selectionChange"
          @export="exportLicense"
        ></licenseMangeTable>
      </template>
<!--      <template v-slot:pagination>-->
<!--        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>-->
<!--      </template>-->
    </nz-bottom-data-list>
  </div>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import licenseMangeTable from '@/components/common/table/asset/licenseMangeTable'
import { fromRoute } from '@/components/common/js/constants'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
import axios from 'axios'

export default {
  name: 'licenseMangeTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    licenseMangeTable
  },
  watch: {
    obj: {
      immediate: true,
      async handler (n) {
        if (n) {
          this.searchLabel = {}
          this.tableData = []
          this.getTableData()
        }
      }
    }
  },
  data () {
    return {
      url: 'license/product',
      tableId: 'licenseMangeTable', // 需要分页的table的id，用于记录每页数量
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 13,
          name: this.$t('project.endpoint.endpointId'),
          type: 'input',
          label: 'ids',
          disabled: false
        },
        {
          id: 12,
          name: this.$t('project.endpoint.endpointName'),
          type: 'input',
          label: 'name',
          disabled: false
        }
        ]
      },
      blankSilenceObject: {
        startAt: ''
      },
      objectSilence: {},
      silenceBoxShow: false,
      nowTime: '',
      rightBox: {
        editShow: false,
        show: false
      },
      fromBottom: true,
      needAlertDaysData: true,
      trendKey: 'endpointId'
    }
  },
  methods: {
    getTableData () {
      this.tools.loading = true
      const params = {
        // ...this.searchLabel,
        // pageNo: this.pageObj.pageNo,
        // pageSize: this.pageObj.pageSize
      }
      params.saId = this.obj.id
      this.$get(this.url, params).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          response.data.list.forEach(item => {
            item.haspid += ''
          })
          this.tableData = response.data.list
          this.nowTime = this.utcTimeToTimezoneStr(response.time)
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        } else {
          this.$message.error(response.msg || response.error)
        }
      })
    },
    importLicense () {
      this.$refs.upload.$children[0].$refs.input.click()
    },
    exportLicense (params) {
      if (this.paramsType) {
        params.type = this.paramsType
      }
      if (!params) {
        params = {}
      }
      params.saId = this.obj.id
      axios.get('/license/downloadC2V', { responseType: 'blob', params: params }).then(res => {
        const filename = params.name ? params.name : (this.obj.name + '.csv')
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, filename)
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = filename
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    async uploadChange (file) {
      const form = new FormData()
      form.append('file', file.raw)
      form.append('saId', this.obj.id)
      const res = await this.$post('/license/uploadV2C', form, { 'Content-Type': 'multipart/form-data' })
      if (res.code === 200) {
        this.$message.success(this.$t('tip.uploadSuccess'))
      } else {
        this.$message.error(res.msg)
      }
    }
  }
}
</script>
