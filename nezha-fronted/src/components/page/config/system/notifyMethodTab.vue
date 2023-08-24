<template>
  <div class="notify-method-tab" style="height: 100%">
    <nz-data-list
      ref="dataList"
      class="notify-table"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.notify"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search">
      <template v-slot:top-tool-left>

      </template>
      <template v-slot:top-tool-right>
        <button id="notify-add" v-has="'system_notification_add'" :title="$t('config.system.notification.create')" class="top-tool-btn margin-r-10" type="button" @click="addNotify">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
      </template>
      <template v-slot:default="slotProps">
        <notify-method-table
          ref="dataTable"
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"
        ></notify-method-table>
      </template>
    </nz-data-list>
    <div class="notificationMessage">
      <i class="nz-icon nz-icon-info-normal"></i>
      <div style="margin-left: 15px">
        <div>. {{$t('noftiyMethod.permissions')}}</div>
        <div>. {{$t('noftiyMethod.parameters')}}</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;① {{$t('noftiyMethod.account')}}</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;② {{$t('noftiyMethod.json')}}
          <el-tooltip placement="top" effect="light">
              <pre slot="content" style="word-break: break-all">
               {
                  "assetId": 1,
                  "dcId": 1,
                  "description": "The endpoint is down, the detailed information
                  Asset : 192.168.40.161, Project: system, Module: node_exporter,
                  Data center: center, EndpointId: 1",
                  "endAt": 1606240496000,
                  "endpointId": 1,
                  "hashKey": "34a17b57f289592a94ff65ee0864094b",
                  "id": 1,
                  "labels": "{\"severity\":\"P2\",\"endpoint\":\"1\",\"alertname\":\"1\",
                  \"module\":\"node_exporter\",\"project\":\"system\",\"datacenter\":
                  \"center\",\"asset\":\"192.168.40.161\"}",
                  "moduleId": 1,
                  "projectId": 1,
                  "ruleId": 1,
                  "severity": "P2",
                  "startAt": 1606009916000,
                  "state": 2,
                  "summary": "The endpoint is down, endpointId is 1"
              }
              </pre>
            <span class="more">...</span>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { parentTableCommon } from './systemCommon'
import notifyMethodTable from './notifyMethodTable'
import dataListMixin from '@/components/common/mixin/dataList'
import nzDataList from '@/components/common/table/nzDataList'

export default {
  name: 'notifyMethodTab',
  components: { nzDataList, notifyMethodTable },
  mixins: [dataListMixin, parentTableCommon],
  props: {
    switchTab: String
  },
  data () {
    return {
      url: 'alert/notify/method',
      tableId: 'notifyTable',
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
    addNotify: function () {
      this.$refs.dataTable.addNotify()
    }
  }
}
</script>
