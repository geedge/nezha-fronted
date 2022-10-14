<template>
  <div style="height: 100%">
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.mib"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="mib-add" v-has="'snmp_mibFile_add'" :title="$t('overall.createMib')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button
          ref="deleteButton"
          :single="false"
          :from="'mib'"
          :forceDeleteShow="false"
          id="mib-list-batch-delete"
          v-has="'snmp_mibFile_delete'"
          :api="url"
          :delete-objs="batchDeleteObjs"
          @after="getTableData"
          @before="delFlag=true"
        ></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <mib-table
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
        ></mib-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <mib-box v-if="rightBox.show" ref="mibBox" :mib="object" @close="closeRightBox" @reload="getTableData"></mib-box>
    </transition>
  </div>
</template>
<script>
import mibBox from '@/components/common/rightBox/mibBox'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import mibTable from '@/components/common/table/settings/mibTable'
export default {
  name: 'mib',
  components: {
    mibBox,
    deleteButton,
    nzDataList,
    mibTable
  },
  mixins: [dataListMixin],
  props: {
    switchTab: String
  },
  data () {
    return {
      url: 'mib',
      tableId: 'mibTable', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: null,
        name: '',
        remark: '',
        models: '',
        file: null
      },
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
    toCredentialTab () {
      this.$emit('toCredentialTab')
    },
    toBrowserTab () {
      this.$emit('toBrowserTab')
    },
    edit (u) {
      this.object = { ...u }
      this.rightBox.show = true
    }
  }
}
</script>
