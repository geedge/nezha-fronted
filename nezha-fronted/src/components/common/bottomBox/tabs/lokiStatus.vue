<template>
    <nz-bottom-data-list
      id="lokiStatus"
      :showTitle='showTitle'
      :obj='obj'
      :tableId="tableId"
      :custom-table-title.sync="tools.customTableTitle"
      :tabs="tabs"
      :targetTab="targetTab"
      :showPagination="false"
      @changeTab="changeTab"
    >
      <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
      <template v-slot>
          <loki-status-table
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :configTableData='configTableData'
          :servicesTableData='servicesTableData'
          @configval='configval'>
          </loki-status-table>
      </template>
    </nz-bottom-data-list>
  </template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import lokiStatusTable from '@/components/common/table/settings/lokiStatusTable'

export default {
  name: 'lokiStatus',
  mixins: [dataListMixin, subDataListMixin],
  components: {
    nzBottomDataList,
    lokiStatusTable
  },
  props: {
    obj: Object,
    showTitle: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      async handler (n) {
        await this.getReadyTableData()
        await this.getConfigTableData()
        this.getservicesTableData()
      }
    }
  },
  data () {
    return {
      tableId: 'lokiStatus',
      configMode: 'defaults',
      configTableData: [],
      servicesTableData: [],
      readyTableData: ''
    }
  },
  mounted () {
  },
  methods: {
    configval (val) {
      this.configMode = val
      this.getConfigTableData()
    },
    async getConfigTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/loki/config?mode=' + this.configMode)
      if (response.code === 200) {
        this.configTableData = response.data.content.split(/\n/)
      }
    },
    async getReadyTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/loki/ready')
      if (response.code === 200) {
        this.readyTableData = response.data.status
      }
    },
    async getservicesTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/loki/services')
      if (response.code === 200) {
        const serObj = {}
        response.data.list.forEach(item => {
          serObj[item.service] = item.status
        })
        serObj.ready = this.readyTableData
        this.servicesTableData.push(serObj)
        this.tools.loading = false
      }
    }
  }
}
</script>
