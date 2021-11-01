<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.link"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search">
      <template v-slot:top-tool-left>

      </template>
      <template v-slot:top-tool-right>
        <button id="link-add" v-has="'snmp_mibFile_add'" :title="$t('config.system.notification.create')" class="top-tool-btn" type="button" @click="addLink">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
      </template>
      <template v-slot:default="slotProps">
        <link-table
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
        ></link-table>
      </template>
    </nz-data-list>
  </div>
</template>

<script>
import linkTable from './linkTable'
import dataListMixin from '@/components/common/mixin/dataList'
import nzDataList from '@/components/common/table/nzDataList'
import { parentTableCommon } from './systemCommon'

export default {
  name: 'linkTab',
  components: { nzDataList, linkTable },
  mixins: [dataListMixin, parentTableCommon],
  data () {
    return {
      url: '/link',
      tableId: 'linkTable',
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          // {
          //   id: 1,
          //   name: this.$t('config.system.link.create'),
          //   type: 'input',
          //   label: 'createBy',
          //   disabled: false
          // }
          {
            id: 1,
            name: 'ID',
            type: 'input',
            label: 'id',
            disabled: false
          },
          {
            id: 5,
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }
        ]
      }
    }
  },
  methods: {
    addLink: function () {
      this.$refs.dataTable.addLink()
    }
  }
}
</script>
