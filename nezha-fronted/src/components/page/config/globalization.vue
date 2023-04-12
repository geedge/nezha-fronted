<template>
  <div id="globalization">
    <nz-data-list
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.dc"
      :search-msg="searchMsg"
      @search="search"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="dc-add" v-has="'dc_add'" class="top-tool-btn margin-r-10"
                type="button" @click="add" :title="$t('config.menus.createI18n')">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
      </template>
      <template v-slot:default="slotProps">
        <globalization-table
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
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></globalization-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <i18n-box v-if="rightBox.show" :obj="object" :globalization-data="globalizationData" @close="closeRightBox" @reload="getTableData"></i18n-box>
    </transition>
  </div>
</template>
<script>
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import i18nBox from '@/components/common/rightBox/setting/globalizationBox'
import globalizationTable from '@/components/common/table/settings/globalizationTable'

export default {
  name: 'i18n',
  components: {
    nzDataList,
    i18nBox,
    globalizationTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'sys/i18n',
      tableId: 'i18nTable', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: '',
        name: '',
        code: '',
        lang: 'en',
        value: ''
      },
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          },
          {
            name: this.$t('config.menus.code'),
            type: 'input',
            label: 'code',
            disabled: false
          },
          {
            name: this.$t('config.user.language'),
            type: 'input',
            label: 'lang',
            disabled: false
          },
          {
            name: this.$t('overall.value'),
            type: 'input',
            label: 'value',
            disabled: false
          }
        ]
      },
      globalizationData: [],
      cabinetBoxShow: false
    }
  },
  methods: {
    copy (u) {
      this.object = { ...u, name: u.name, id: '' }
      this.rightBox.show = true
    },
    getUserData () {
      return new Promise(resolve => {
        this.$get('/sys/i18n', { pageSize: -1, pageNo: 1 }).then(response => {
          if (response.code === 200) {
            this.globalizationData = response.data.list
          } else {
            this.$message.error(response.msg)
          }
          resolve()
        })
      })
    },
    addCabinet () {
      this.cabinetBoxShow = true
    },
    closeRightBox (refresh) {
      this.rightBox.show = false
      this.cabinetBoxShow = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    }
  },
  mounted () {
    this.getUserData()
  }
}
</script>
<style>
#globalization /deep/ td .nz-icon-gear:before{
  color: #606266;
}
</style>
