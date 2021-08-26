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
        <button id="account-add" v-has="'project_add'" :title="$t('overall.createProject')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="account-list-batch-delete" v-has="'project_delete'" :api="url" :delete-objs="batchDeleteObjs" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot="slotProps">
        <project-table
          ref="dataTable"
          v-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="projectTableHeight"
          :table-data="tableData"
          :tableId="tableId"
          style="padding-right: 0"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @addSilence="addSilence"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></project-table>
      </template>
      <template v-slot:pagination>
        <div class="project-page">
          <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo'
                      @pageSize='pageSize'></Pagination>
        </div>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <projectBox v-if="rightBox.show" :project="object" @close="closeRightBox"></projectBox>
    </transition>
    <transition name="right-box"><alert-silence-box v-if='silenceBoxShow' :alert-silence="objectSilence" @close="closeSilenceBox"></alert-silence-box>
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

export default {
  name: 'projectList',
  components: {
    nzDataList,
    projectBox,
    deleteButton,
    projectTable,
    alertSilenceBox
  },
  mixins: [dataListMixin],
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
      roles: []
    }
  },
  methods: {
    getTableData (params) {
      if (params && Object.keys(params).length > 0) {
        for (const key in params) {
          this.$set(this.searchLabel, key, params[key])
        }
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
          if (!this.$store.state.currentProject.id) {
            this.$store.commit('currentProjectChange', response.data.list[0])
          }
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    }
  },
  computed: {
  },
  created () {
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
<style lang="scss" scoped>
  .project-list{
    .project-page{
      margin: 0 0 0 20px;
      border: 1px solid $--right-box-border-color;
      border-top: none;
      /deep/ .pagination{
        padding: 5px 0;
      }
    }
    /deep/ .pagination-bottom{
      width: calc(100% - 30px);
      bottom: 18px;
    }
  }
</style>
