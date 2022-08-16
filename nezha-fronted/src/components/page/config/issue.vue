<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.issue"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="record-add" v-has="'issue_record_add'" :title="$t('overall.createIssue')" class="top-tool-btn margin-r-10" @click.stop="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
      </template>
      <template v-slot:default="slotProps">
        <issue-table
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
        ></issue-table>
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
      <issue-box
        v-if="rightBox.show"
        :issue="object"
        @close="closeRightBox"
      ></issue-box>
    </transition>
  </div>
</template>

<script>
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import issueTable from '@/components/common/table/settings/issueTable'
import issueBox from '@/components/common/rightBox/issueBox'

export default {
  name: 'issue',
  components: {
    issueTable,
    nzDataList,
    issueBox
  },
  mixins: [dataListMixin, routerPathParams],
  data () {
    return {
      url: 'issue',
      tableId: 'issueTable',
      orderBy: '-id',
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
          },
          {
            name: this.$t('overall.type'),
            type: 'issueType',
            label: 'issueType',
            disabled: false
          },
          {
            name: this.$t('overall.state'),
            type: 'select',
            label: 'issueState',
            disabled: false
          },
          {
            name: this.$t('alert.severity'),
            type: 'select',
            label: 'priority',
            disabled: false
          },
          {
            name: this.$t('issue.assetId'),
            type: 'input',
            label: 'assetId',
            disabled: false
          },
          {
            name: this.$t('issue.assetName'),
            type: 'input',
            label: 'assetName',
            disabled: false
          },
          {
            name: this.$t('issue.createUser'),
            type: 'issue',
            label: 'cid',
            disabled: false
          },
          {
            name: this.$t('config.mib.updateUser'),
            type: 'issue',
            label: 'uid',
            disabled: false
          },
          {
            name: this.$t('issue.reporter'),
            type: 'issue',
            label: 'rid',
            disabled: false
          },
          {
            name: this.$t('issue.assignee'),
            type: 'issue',
            label: 'aid',
            disabled: false
          },
          {
            name: this.$t('overall.starred'),
            type: 'select',
            label: 'starrd',
            disabled: false
          }
        ]
      },
      // 创建修改相关
      blankObject: {
        id: '',
        name: '',
        type: 'default',
        content: '',
        state: '',
        priority: 2,
        rid: '',
        aid: '',
        assetIds: ''
      }
    }
  },
  mounted () {
  },
  methods: {
    edit (u) {
      this.$nextTick(() => {
        this.$get(`${this.url}/${u.id}`).then(response => {
          if (response.code === 200) {
            this.object = {
              ...response.data,
              assetIds: response.data.assetIds.join(',')
            }
            this.rightBox.show = true
          }
        })
      })
    }
  },
  created () {
  }
}
</script>
