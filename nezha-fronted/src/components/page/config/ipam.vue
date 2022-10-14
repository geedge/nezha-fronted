<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.ipam"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'ipam_add'" :title="$t('overall.createipam')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="ipam"
          :params="searchLabel"
          :permissions="{
            import: 'ipam_add',
            export: 'ipam_edit'
          }"
          class="top-tool-export margin-r-10"
          export-file-name="ipam"
          export-url="/ipam/subnet/export"
          import-url="/ipam/subnet/import"
          @afterImport="getTableData"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="'ipam'"
                  :forceDeleteShow="true"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  v-has="'ipam_delete'"
                  id="account-list-batch-delete"
                  :api="url"
                  :delete-objs="batchDeleteObjs"
                  @after="getTableData"
                  @before="delFlag=true"></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot="slotProps">
        <ipam-table
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></ipam-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <ipam-box v-if="rightBox.show" :obj="object" @close="closeRightBox"></ipam-box>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import ipamBox from '@/components/common/rightBox/ipamBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import ipamTable from '@/components/common/table/settings/ipamTable'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'

export default {
  name: 'ipam',
  components: {
    nzDataList,
    ipamBox,
    ipamTable,
    deleteButton,
    topToolMoreOptions
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'ipam/subnet',
      blankObject: { // 空白对象
        id: '',
        name: '',
        type: 4,
        addr: '',
        mask: '24',
        vlan: '',
        remark: '',
        dc: { id: '', name: '' }
      },
      tableId: 'ipamTable',
      searchMsg: { // 给搜索框子组件传递的信息
        searchLabelList: [
          {
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          },
          {
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }, {
            name: this.$t('overall.type'),
            type: 'select',
            label: 'ipamType',
            disabled: false
          }, {
            name: this.$t('overall.addr'),
            type: 'input',
            label: 'addr',
            disabled: false
          }, {
            name: this.$t('overall.dc'),
            type: 'dc',
            label: 'dcIds',
            disabled: false
          }, {
            name: this.$t('overall.vlan'),
            type: 'input',
            label: 'vlan',
            disabled: false
          }
        ]
      }
    }
  }
}
</script>
