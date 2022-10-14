<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.menus"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="menus-add" class="top-tool-btn margin-l-20"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button
          ref="deleteButton"
          :single="false"
          :from="'menus'"
          :forceDeleteShow="false"
          id="menus-list-batch-delete"
          :api="url" :delete-objs="batchDeleteObjs"
          @after="getTableData"
          @before="delFlag=true"
        ></delete-button>
      </template>
      <template v-slot="slotProps">
        <menu-table
          ref="dataTable"
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
          @selectionChange="selectionChange"></menu-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <menu-box v-if="rightBox.show" :menu="object" @close="closeRightBox"></menu-box>
    </transition>
  </div>
</template>
<script>
import nzDataList from '@/components/common/table/nzDataList'
import deleteButton from '@/components/common/deleteButton'
import menuBox from '@/components/common/rightBox/menuBox'
import menuTable from '@/components/common/table/settings/menuTable'
import dataListMixin from '@/components/common/mixin/dataList'

export default {
  name: 'menus',
  components: {
    nzDataList,
    menuBox,
    menuTable,
    deleteButton
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'sys/menu',
      tableId: 'menusTable', // 需要分页的table的id，用于记录每页数量
      blankObject: { // 空白对象
        name: '',
        code: '',
        i18n: '',
        parentId: 0,
        type: 1,
        route: '',
        orderNum: 1,
        perms: '',
        icon: ''
      },
      tableTitle: [ // 原table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true
        }, {
          label: this.$t('config.menus.code'),
          prop: 'code',
          show: true
        }, {
          label: this.$t('config.menus.i18n'),
          prop: 'i18n',
          show: true
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          show: true
        }, {
          label: this.$t('config.menus.icon'),
          prop: 'icon',
          show: true
        }, {
          label: this.$t('config.menus.route'),
          prop: 'route',
          show: true
        }, {
          label: this.$t('config.menus.perms'),
          prop: 'perms',
          show: true
        }, {
          label: this.$t('config.menus.orderNum'),
          prop: 'orderNum',
          show: true
        }, {
          label: this.$t('overall.option'),
          prop: 'option',
          show: true,
          width: 120,
          fixed: 'right'
        }
      ],
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: 'ID',
          type: 'input',
          label: 'id',
          disabled: false
        }]
      }
    }
  },
  methods: {
    edit (u) {
      this.object = { ...u }
      this.rightBox.show = true
    }
  }
}
</script>
