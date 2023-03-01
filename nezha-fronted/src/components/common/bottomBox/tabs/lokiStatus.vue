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
        <div v-if="!loading" style="height:auto;">
          <loki-status-table
          :ringTableData='ringTableData'
          :configTableData='configTableData'
          :servicesTableData='servicesTableData'
          @configval='configval'>
          </loki-status-table>
        </div>
        <loading v-else ref="loading"></loading>
      </template>
    </nz-bottom-data-list>
  </template>

<script>
import loading from '@/components/common/loading'
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import lokiStatusTable from '@/components/common/table/settings/lokiStatusTable'

export default {
  name: 'lokiStatus',
  mixins: [dataListMixin, subDataListMixin],
  components: {
    nzBottomDataList,
    lokiStatusTable,
    loading
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
        this.loading = true
        this.getReadyTableData().then(res => {
          this.getTableData()
        }).catch(res => {
          this.$refs.loading.endLoading()
        })
      }
    }
  },
  data () {
    return {
      tableId: 'lokiStatus',
      configMode: 'defaults',
      configTableData: [],
      servicesTableData: [],
      ringTableData: [],
      readyTableData: '',
      loading: false
    }
  },
  mounted () {
  },
  methods: {
    async getTableData () {
      await this.getservicesTableData()
      await this.getCompactorTableData()
      this.getConfigTableData()
    },
    configval (val) {
      this.configMode = val
      this.getConfigTableData()
    },
    async getConfigTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/loki/config?mode=' + this.configMode)
      if (response.code === 200) {
        this.configTableData = response.data.content.split(/\n/)
      }
      this.$refs.loading.endLoading()
      this.loading = false
    },
    async getCompactorTableData () {
      const response = await this.$get('agent/' + this.obj.id + '/loki/compactor/ring')
      if (response.code === 200) {
        this.ringTableData = response.data.list
      }
    },
    async getReadyTableData () {
      return new Promise((resolve, reject) => {
        this.$get('agent/' + this.obj.id + '/loki/ready').then(response => {
          if (response.code === 200) {
            this.$refs.loading.startLoading()
            this.readyTableData = response.data.status
            resolve()
          } else {
            reject()
          }
        })
      })
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
      }
    }
  }
}
</script>
