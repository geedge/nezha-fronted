<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.apiKey"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search">
      <template v-slot:top-tool-left>

      </template>
      <template v-slot:top-tool-right>
        <button id="api-key-add" v-has="'system_apiKey_add'" :title="$t('config.system.notification.create')" class="top-tool-btn margin-r-10" type="button" @click="addApiKey">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
      </template>
      <template v-slot:default="slotProps">
        <api-key-table
          ref="dataTable"
          v-loading="tools.loading"
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"
        ></api-key-table>
      </template>
    </nz-data-list>
  </div>
</template>

<script>
import apiKeyTable from './apiKeyTable'
import dataListMixin from '@/components/common/mixin/dataList'
import nzDataList from '@/components/common/table/nzDataList'
import { parentTableCommon } from './systemCommon'

export default {
  name: 'apiKeyTab',
  components: { nzDataList, apiKeyTable },
  mixins: [dataListMixin, parentTableCommon],
  data () {
    return {
      url: '/sys/apiKey',
      tableId: 'apiKeyTable',
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
      }
    }
  },
  methods: {
    addApiKey: function () {
      this.$refs.dataTable.addApiKey()
      this.$refs.dataTable.getRoles()
    }
  }
}
</script>

<style scoped>
</style>
