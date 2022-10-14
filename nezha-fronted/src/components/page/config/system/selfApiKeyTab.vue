<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.apiKey"
      class="api-key"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search">
      <template v-slot:top-tool-left>

      </template>
      <template v-slot:top-tool-right>
        <button id="api-key-add" v-has="'system_apiKey_add'" class="top-tool-btn margin-r-10" type="button" @click="addApiKey" :title="$t('profile.box.newApiKey')">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
      </template>
      <template v-slot:default="slotProps">
        <self-api-key-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :table-id="tableId"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
        ></self-api-key-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
  </div>
</template>

<script>
import selfApiKeyTable from './selfApiKeyTable'
import dataListMixin from '@/components/common/mixin/dataList'
import nzDataList from '@/components/common/table/nzDataList'
import { parentTableCommon } from './systemCommon'
import bus from '@/libs/bus'

export default {
  name: 'selfApiKeyTab',
  components: { nzDataList, selfApiKeyTable },
  mixins: [dataListMixin, parentTableCommon],
  props: {
    switchTab: String
  },
  data () {
    return {
      url: 'sys/apiKey/self',
      tableId: 'api-key-tab',
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 1,
          name: 'ID',
          type: 'input',
          label: 'ids',
          disabled: false
        }, {
          id: 5,
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          disabled: false
        }]
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
          minWidth: 100,
          show: true
        }, {
          label: this.$t('apiKey.key'),
          prop: 'token',
          minWidth: 180,
          show: true
        }, {
          label: this.$t('config.system.apiKey.expireAt'),
          prop: 'expireAt',
          minWidth: 100,
          show: true
        }, {
          label: this.$t('config.system.apiKey.creatAt'),
          prop: 'createAt',
          minWidth: 100,
          show: false
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          minWidth: 100,
          show: true
        }
      ]
    }
  },
  mounted () {
    // this.getTableData()
    bus.$on('apiKey-tab2', () => {
      this.getTableData()
    })
  },
  methods: {
    addApiKey: function () {
      bus.$emit('addApiKeyBox', 'true')
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
      this.$get(this.url, { ...this.searchLabel }).then(res => {
        this.tools.loading = false
        if (res.code === 200) {
          this.tableData = res.data.list
          this.pageObj.total = res.data.total
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    del (row) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete(this.url + '?ids=' + row.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    }
  }
}
</script>
