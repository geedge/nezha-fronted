<template>
  <div class="project-list">
    <nz-data-list
      ref="dataList"
      :api="url"
      :tableId="tableId"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.project"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'project_add'" :title="$t('overall.createProject')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button
          ref="deleteButton"
          :single="false"
          :from="'project'"
          :forceDeleteShow="true"
          :deleteTitle="'overall.project'"
          id="account-list-batch-delete"
          v-has="'project_delete'"
          :api="url"
          :delete-objs="batchDeleteObjs"
          @after="getTableData"
          @before="delFlag=true"
        ></delete-button>
      </template>
      <template v-slot="slotProps">
        <project-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="projectTableHeight"
          :table-data="tableData"
          :tableId="tableId"
          style="padding-right: 0"
          @del="del"
          @edit="edit"
          @copy = 'copy'
          @orderBy="tableDataSort"
          @reload="getTableData"
          @addSilence="addSilence"
          @topology="topology"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></project-table>
      </template>
      <template v-slot:pagination>
        <div class="project-page">
          <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
        </div>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <projectBox v-if="rightBox.show" :project="object" @close="closeRightBox"></projectBox>
    </transition>
    <transition name="right-box">
      <alert-silence-box v-if='silenceBoxShow' :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import projectBox from '@/components/common/rightBox/projectBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import projectTable from '@/components/common/table/settings/projectTable'
import alertSilenceBox from '@/components/common/rightBox/alertSilenceBox'
import routerPathParams from '@/components/common/mixin/routerPathParams'

export default {
  name: 'projectList',
  components: {
    nzDataList,
    projectBox,
    deleteButton,
    projectTable,
    alertSilenceBox
  },
  mixins: [dataListMixin, routerPathParams],
  data () {
    return {
      url: 'monitor/project',
      blankObject: { // 空白对象
        id: '',
        name: '',
        remark: ''
      },
      blankSilenceObject: {
        id: '',
        startAt: '',
        endAt: '',
        ruleId: '',
        type: 'asset',
        linkId: '',
        remark: '',
        time: [],
        matchers: [
          { name: '', value: '', regex: 0 }
        ],
        name: ''
      },
      objectSilence: {},
      silenceBoxShow: false,
      projectTableHeight: 'calc(100% - 58px)',
      tableId: 'projectTable',
      queryPermission: 'account_view',
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
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          }
        ]
      },
      roles: [],
      needAlertDaysData: true,
      trendKey: 'projectId'
    }
  },
  methods: {
    getTableData (params) {
      if (params && Object.keys(params).length > 0) {
        for (const key in params) {
          this.$set(this.searchLabel, key, params[key])
        }
      }
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      const param = {
        ...this.searchLabel,
        ...this.searchCheckBox
      }
      const path = this.fromRoute.project
      this.updatePath(param, path)
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
          if (this.needAlertDaysData) {
            response.data.list.forEach(item => {
              item.trendLoading = true
              item.left = 0
              item.top = 0
              item.alertNumtooltipShow = false
              item.alertDaysData = [
                {
                  metric: { priority: 'P1' },
                  values: [[0, 0]]
                },
                {
                  metric: { priority: 'P2' },
                  values: [[0, 0]]
                },
                {
                  metric: { priority: 'P3' },
                  values: [[0, 0]]
                }
              ]
            })
          }
          if (!this.$store.state.currentProject.id) {
            this.$store.commit('currentProjectChange', JSON.parse(JSON.stringify(response.data.list[0])))
          }
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    },
    delCallBack (ids) {
      if (ids.indexOf(this.$store.state.currentProject.id) !== -1) {
        this.$store.commit('currentProjectChange', {
          id: '',
          name: '',
          remark: ''
        })
      }
    }
  },
  computed: {
  },
  created () {
    const searchKeys = {
      // key: path 键
      // value: vue set 参数
      pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
      pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
      orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
      ids: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'ids',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 'ids',
          label: 'ids',
          name: 'ID',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      },
      name: {
        target: this.searchLabel,
        propertyName: 'name',
        type: 'string',
        isSearchInput: true,
        defaultJson: {
          disabled: false,
          id: 'name',
          label: 'name',
          name: 'Name',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      }
    }
    this.initQueryFromPath(searchKeys)
  },
  mounted () {
  },
  destroyed () {
    this.$store.commit('currentProjectChange', {
      id: '',
      name: '',
      remark: ''
    })
  }
}
</script>
