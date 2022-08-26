<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.credential"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="mib-add" v-has="'credential_add'" :title="$t('overall.createdCredentials')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button
          ref="deleteButton"
          :from="'credentials'"
          :forceDeleteShow="false"
          id="mib-list-batch-delete"
          v-has="'credential_delete'"
          :api="url"
          :delete-objs="batchDeleteObjs"
          @after="getTableData"
          @before="delFlag=true"
        ></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <credentials-table
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
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"
        ></credentials-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <snmp-credential-box :credential="object" v-if="rightBox.show" ref="credentialBox"  @close="closeSnmpBox" @reload="getTableData"></snmp-credential-box>
    </transition>
  </div>
</template>

<script>
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import credentialsTable from '@/components/common/table/settings/credentialsTable'
import snmpCredentialBox from '../../common/rightBox/snmpCredentialBox'
export default {
  name: 'credentials',
  props: {
    switchTab: String
  },
  components: {
    deleteButton,
    nzDataList,
    credentialsTable,
    snmpCredentialBox
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'snmp/credential',
      tableId: 'credentialTable', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: null,
        name: '',
        type: 2,
        port: 161,
        remark: '',
        config: {

        }
      },
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [{
          name: 'ID',
          type: 'input',
          label: 'ids',
          disabled: false
        }, {
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          disabled: false
        }, {
          name: this.$t('overall.type'),
          type: 'select',
          label: 'credentialType',
          readonly: true,
          disabled: false
        }]
      }
    }
  },
  methods: {
    toFileTab () {
      this.$emit('toFileTab')
    },
    toBrowserTab () {
      this.$emit('toBrowserTab')
    },
    toCredentialTab () {
      this.$emit('toCredentialTab')
    },
    closeSnmpBox (refresh) {
      this.rightBox.show = false
      if (refresh) {
        this.getTableData()
      }
    }
  }
}
</script>
