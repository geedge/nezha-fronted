<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.recordRule"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="record-add" v-has="'record_rule_add'" :title="$t('overall.createRecordRule')" class="top-tool-btn" @click.stop="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
        <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="record-rule"
          :params="searchLabel"
          :permissions="{
                  import: 'record_rule_add',
                  export: 'record_rule_edit'
                }"
          class="top-tool-export margin-l-10 margin-r-10"
          export-file-name="record-rule"
          export-url="/record/rule/export"
          import-url="/record/rule/import"
          @afterImport="getTableData"
        >
        </top-tool-more-options>
      </template>
      <template v-slot:default="slotProps">
        <record-rule-table
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
          @showBottomBox="
            (targetTab, object) => {
              $refs.dataList.showBottomBox(targetTab, object);
            }
          "
        ></record-rule-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination
          ref="Pagination"
          :pageObj="pageObj"
          :tableId="tableId"
          @pageNo="pageNo"
          @pageSize="pageSize"
        ></Pagination>
      </template>
    </nz-data-list>
     <transition name="right-box">
      <record-rule-box
        v-if="rightBox.show"
        :record-rule="object"
        @close="closeRightBox"
      ></record-rule-box>
    </transition>
  </div>
</template>

<script>
import bus from '@/libs/bus'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import recordRuleTable from '@/components/common/table/settings/recordRuleTable'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import recordRuleBox from '@/components/common/rightBox/recordRuleBox'
// import deleteButton from '@/components/common/deleteButton'

export default {
  name: 'recordRule',
  components: {
    recordRuleTable,
    // deleteButton,
    nzDataList,
    topToolMoreOptions,
    recordRuleBox
  },
  mixins: [dataListMixin, routerPathParams],
  data () {
    return {
      url: 'record/rule',
      tableId: 'recordRuleTable',
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          },
          {
            name: 'Name',
            type: 'input',
            label: 'name',
            disabled: false
          },
          {
            name: 'Type',
            type: 'select',
            label: 'recordType',
            disabled: false
          },
          {
            name: 'Expression',
            type: 'input',
            label: 'expr',
            disabled: false
          },
          {
            name: 'State',
            type: 'select',
            label: 'recordState',
            disabled: false
          },
          {
            name: 'Starrd',
            type: 'select',
            label: 'starrd',
            disabled: false
          },
          {
            name: 'Build_in',
            type: 'select',
            label: 'buildIn',
            disabled: false
          }
        ]
      },
      // 创建修改相关
      blankObject: {
        id: '',
        name: '',
        type: '',
        expr: '',
        inr: '',
        labels: [{ label: '', value: '' }],
        remark: '',
        state: ''
      }
    }
  },
  mounted () {
  },
  methods: {
  },
  created () {
  }
}
</script>
