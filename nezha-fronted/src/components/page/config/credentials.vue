<template>
  <div style="height: 100%">
    <nz-data-list
      v-show="showTab === 'credentials'"
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.mib"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg">
      <template v-slot:top-tool-left>
        <div id="module-type-6" class="nz-tab-item-box" @click="toFileTab">
          <div class="nz-tab-item ">{{$t("config.mib.mibFiles")}}</div>
        </div>
        <div id="module-type-7"  class="nz-tab-item-box" @click="toBrowserTab"><!--v-has="'snmp_browser_view'"-->
          <div class="nz-tab-item">{{$t("config.mib.mibBrowser")}}</div>
        </div>
        <div id="module-type-8"  class="nz-tab-item-box" >
          <div class="nz-tab-item nz-tab-item-active">{{$t("config.mib.credentials")}}</div>
        </div>
      </template>
      <template v-slot:top-tool-right>
        <button id="mib-add" v-has="'credential_add'" :title="$t('overall.createMib')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="mib-list-batch-delete" v-has="'credential_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <credentials-table
          ref="dataTable"
          v-loading="tools.loading"
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
    showTab: String
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
        zheze_none: true,
        searchLabelList: [{
          name: 'ID',
          type: 'input',
          label: 'id',
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
    closeSnmpBox (refresh) {
      this.rightBox.show = false
      if (refresh) {
        this.getTableData()
      }
    }
  }
}
</script>

<style scoped>

</style>
