<template>
  <nz-bottom-data-list
    id="cortexDetail"
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
        <cortexDetailTable
        v-my-loading="tools.loading"
        :loading="tools.loading"
        :ringTableData='ringTableData'
        :configTableData='configTableData'
        :servicesTableData='servicesTableData'>
        </cortexDetailTable>
    </template>
  </nz-bottom-data-list>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import cortexDetailTable from '@/components/common/table/settings/cortexDetailTable'

export default {
  name: 'cortexDetail',
  mixins: [dataListMixin, subDataListMixin],
  components: {
    nzBottomDataList,
    cortexDetailTable
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
        await this.getIngesterTableData()
        await this.getStoreGatewayTableData()
        await this.getConfigTableData()
        this.getservicesTableData()
      }
    }
  },
  data () {
    return {
      tableId: 'cortexDetail',
      configTableData: [],
      servicesTableData: [],
      ringTableData: [],
      readyTableData: ''
    }
  },
  mounted () {
  },
  methods: {
    async getIngesterTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/cortex/ingester/ring')
      if (response.code === 200) {
        this.ringTableData.push(response.data.list)
      }
    },
    async getStoreGatewayTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/cortex/store-gateway/ring')
      if (response.code === 200) {
        this.ringTableData.push(response.data.list)
      }
    },
    async getConfigTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/cortex/config?mode=defaults')
      if (response.code === 200) {
        this.configTableData = response.data.conent.split(/\n/)
        this.configTableData.unshift('{')
        this.configTableData.push('}')
      }
    },
    async getReadyTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/cortex/ready')
      if (response.code === 200) {
        this.readyTableData = response.data.status
      }
    },
    async getservicesTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/cortex/services')
      if (response.code === 200) {
        const serObj = {}
        response.data.list.forEach(item => {
          serObj[item.name] = item.status
        })
        serObj.ready = this.readyTableData
        this.servicesTableData.push(serObj)
        this.tools.loading = false
      }
    }
  }
}
</script>
