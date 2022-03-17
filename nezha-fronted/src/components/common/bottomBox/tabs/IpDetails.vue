<template>
  <div class="scrape-endpoint">
    <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      :targetTab.sync="targetTab"
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
        <ip-details-table
          ref="dataTable"
          :api="url"
          :orderByFa="orderBy"
          v-loading="tools.loading"
          :loading="tools.loading"
          :custom-table-title="tools.customTableTitle"
          :height="subTableHeight"
          :table-data="tableData"
          :assetTab="true"
          @del="del"
          @edit="edit"
          @addSilence="addSilence"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
        ></ip-details-table>
      </template>
      <template v-slot:top-tool-right>
        <button id="ipam-ip" class="top-tool-btn margin-r-10 margin-l-10" @click.stop="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-bottom-data-list>
    <transition name="right-box">
      <ip-details-box v-if="rightBox.show" :obj="object" @close="closeRightBox"></ip-details-box>
    </transition>
  </div>
</template>

<script>
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
import ipDetailsTable from '@/components/common/table/settings/ipDetailsTable'
import ipDetailsBox from '@/components/common/rightBox/ipDetailsBox'
export default {
  name: 'IpDetails',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    ipDetailsTable,
    ipDetailsBox
  },
  data () {
    return {
      url: '/ipam/ip',
      tableId: 'IpDetails', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: '',
        name: '',
        addr: '',
        mac: '',
        state: '',
        remark: '',
        asset: { id: '', name: '' }
      },
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
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
          name: 'IP',
          type: 'input',
          label: 'manageIp',
          disabled: false
        }, {
          name: this.$t('asset.state'),
          type: 'assetState',
          label: 'stateIds',
          id: 'stateIds',
          readonly: true,
          disabled: false
        }]
      }
    }
  },
  methods: {
    // 数据请求
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
      this.$set(this.searchLabel, 'id', this.obj.id)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      this.tableData = [{
        id: 1,
        name: 'node-1',
        subnet: {
          id: 1,
          name: 'bj'
        },
        asset: {
          id: 1,
          name: 'bj'
        },
        addr: '192.168.40.0',
        mac: '1a:1b:6b:1d:65:1d',
        remark: '',
        state: 1,
        uts: 1646982371692
      }, {
        id: 2,
        name: 'node-1',
        subnet: {
          id: 1,
          name: 'bj'
        },
        asset: {
          id: 1,
          name: 'bj'
        },
        addr: '192.168.40.0',
        mac: '1a:1b:6b:1d:65:1d',
        remark: '',
        state: 1,
        uts: 1646982371692
      }]
      this.$get(this.url, { ...this.searchLabel }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
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
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n, o) {
        if (n) {
          this.getTableData()
        }
      }
    }
  }
}
</script>
