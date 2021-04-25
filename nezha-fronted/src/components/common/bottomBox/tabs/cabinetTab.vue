<template>
  <div>
    <nz-bottom-data-list
      :api="url"
      style="height: 100%"
      :custom-table-title.sync="tools.customTableTitle"
      :layout="['searchInput', 'elementSet']"
      :search-msg="searchMsg"
      :tabs="tabs"
      @search="search"
      @changeTab="changeTab"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot>
        <cabinet-table
          ref="dataTable"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
        ></cabinet-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-bottom-data-list>
    <transition name="right-box">
      <cabinet-box v-if="rightBox.show" :current-dc="obj" :obj="object" ref="cabinetEditBox" @close="closeRightBox"></cabinet-box>
    </transition>
  </div>
</template>

<script>
import cabinetBox from '../../rightBox/setting/cabinetBox'
import deleteButton from '../../deleteButton'
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import cabinetTable from "@/components/common/table/settings/cabinetTable";
export default {
  name: 'cabinetTab',
  mixins: [dataListMixin, subDataListMixin],
  components: {
    nzBottomDataList,
    'cabinet-box': cabinetBox,
    'delete-button': deleteButton,
    cabinetTable
  },
  props: {
    obj: Object // 关联的实体对象
  },
  data () {
    return {
      url:'/cabinet',
      tableId:'cabinetTable',
      blankObject: {
        id: '',
        idcId: '',
        name: '',
        remark: '',
        seq: '',
        uSize: 1
      },
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            id: 11,
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          },
          {
            id: 12,
            name: this.$t('asset.uSize'),
            label: 'uSize',
            disabled: false
          },
          {
            id: 13,
            name: this.$t('config.dc.remark'),
            label: 'remark',
            disabled: false
          }
        ]
      },
    }
  },
  methods: {
    // 切换tab
    changeTab (tab) {
      this.$emit('changeTab', tab)
    },
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          this.currentDc = JSON.parse(JSON.stringify(n))
          this.searchLabel = { dcId: this.currentDc.id }
          this.getTableData()
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
