<template>
  <div v-loading="loading" class="search-item-box">
    <div class="search-item-title-icon">
      <i class="nz-icon monitorColor" :class="selectIcon(obj)"/>
    </div>
    <div class="search-item-path" v-html="searchItemPath(obj)"></div>
    <div class="search-item-name">{{obj.name}}</div>
    <div v-for="item in dataKey[obj.type]" :key="item.key" class="search-item-info">
      <div class="search-item-key">
        {{item.label}}
      </div>
      <div class="search-item-value-box" v-if="obj.type === 'endpoint'&&item.key==='state'">
        <span style="width: auto">
            <span class="endpoint-cell-left"><i class="nz-icon nz-icon-Metrics active" /> {{$t('project.endpoint.metrics')}} </span>
            <span v-if="alertLabelData && alertLabelData.configs[0].state === 0">
              <span class="active-icon red-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[0].state === 1">
              <span class="active-icon green-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[0].state">
              <span class="active-icon gray-bg inline-block"></span>
            </span>
          </span>
        <span style="width: auto">
            <span class="endpoint-cell-left" style="margin-left: 10px"><i class="nz-icon nz-icon-logs active" /> {{$t('project.endpoint.logs')}} </span>
            <span v-if="alertLabelData && alertLabelData.configs[1].state === 0">
              <span class="active-icon red-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[1].state === 1">
              <span class="active-icon green-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs[1].state">
              <span class="active-icon gray-bg inline-block"></span>
            </span>
          </span>
      </div>
      <div class="search-item-value-box" v-else-if="obj.type === 'datacenter'&&item.key==='state'">
        <div v-if="alertLabelData" :class="{'green-bg': alertLabelData && alertLabelData.state === 'ON','red-bg': alertLabelData && alertLabelData.state === 'OFF'}" class="active-icon" style="margin-top: 20px;"></div>
        <span v-if="alertLabelData && alertLabelData.state === 'ON'">{{ $t('overall.enabled') }}</span>
        <span v-if="alertLabelData && alertLabelData.state === 'OFF'">{{ $t('overall.disabled') }}</span>
      </div>
      <div class="search-item-value-box" v-else>
        <i v-if="item.icon" class="nz-icon" :class="searchItemClass(item)"/>
        <span class="search-item-value">
          {{getPathContent(item.key)}}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import lodash from 'lodash'
export default {
  name: 'searchItemInfo',
  props: {
    obj: {},
    severityData: {}
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n.id) {
          this.loading = true
          if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
          }
          this.timer = setTimeout(() => {
            this.getInfo(n)
          }, 500)
        }
      }
    }
  },
  data () {
    return {
      timer: null,
      dataKey: {
        asset: [
          {
            key: 'id',
            label: 'Id'
          }, {
            key: 'name',
            label: this.$t('overall.name')
          }, {
            key: 'manageIp',
            label: this.$t('overall.manageIp')
          }, {
            key: 'type.name',
            label: this.$t('overall.type')
          }, {
            key: 'state.name',
            label: this.$t('overall.state')
          }, {
            key: 'pingInfo.rtt',
            icon: 'active-icon',
            label: 'Ping'
          }, {
            key: 'dc.name',
            label: this.$t('overall.dc')
          }, {
            key: 'cabinet.name',
            label: this.$t('overall.cabinet')
          }, {
            key: 'brand.name',
            label: this.$t('overall.brand')
          }, {
            key: 'model.name',
            label: this.$t('overall.model')
          }, {
            key: 'alertNum',
            icon: 'nz-icon-overview-alert',
            label: this.$t('overall.alert')
          }
        ],
        datacenter: [
          {
            key: 'id',
            label: 'Id'
          }, {
            key: 'name',
            label: this.$t('overall.name')
          }, {
            key: 'location',
            label: this.$t('overall.location')
          }, {
            key: 'cabinetNum',
            icon: 'nz-icon-cabinet  monitorColor',
            label: this.$t('overall.cabinet')
          }, {
            key: 'assetNum',
            icon: 'nz-icon-overview-project monitorColor',
            label: this.$t('overall.asset')
          }, {
            key: 'alertNum',
            icon: 'nz-icon-overview-alert',
            label: this.$t('overall.alert')
          }, {
            key: 'state',
            label: this.$t('overall.state')
          }
        ],
        project: [
          {
            key: 'id',
            label: 'Id'
          }, {
            key: 'name',
            label: this.$t('overall.name')
          }, {
            key: 'moduleNum',
            icon: 'nz-icon-overview-module monitorColor',
            label: this.$t('overall.module')
          }, {
            key: 'endpointNum',
            icon: 'nz-icon-overview-endpoint monitorColor',
            label: 'Endpoint'
          }, {
            key: 'assetNum',
            icon: 'nz-icon-overview-project monitorColor color23BF9A',
            label: this.$t('overall.asset')
          }, {
            key: 'alertNum',
            icon: 'nz-icon-overview-alert',
            label: this.$t('overall.alert')
          }, {
            key: 'remark',
            label: this.$t('overall.remark')
          }
        ],
        module: [
          {
            key: 'id',
            label: 'Id'
          }, {
            key: 'name',
            label: this.$t('overall.name')
          }, {
            key: 'project.name',
            label: this.$t('overall.project')
          }, {
            key: 'endpointNum',
            icon: 'nz-icon nz-icon-overview-endpoint monitorColor',
            label: 'Endpoint'
          }, {
            key: 'assetNum',
            icon: 'nz-icon nz-icon-overview-project monitorColor',
            label: this.$t('overall.asset')
          }, {
            key: 'alertNum',
            icon: 'nz-icon-overview-alert',
            label: this.$t('overall.alert')
          }, {
            key: 'remark',
            label: this.$t('overall.remark')
          }
        ],
        endpoint: [
          {
            key: 'id',
            label: 'Id'
          }, {
            key: 'name',
            label: this.$t('overall.name')
          }, {
            key: 'project.name',
            label: this.$t('overall.project')
          }, {
            key: 'module.name',
            label: this.$t('overall.module')
          }, {
            key: 'asset.name',
            icon: 'nz-icon-overview-project monitorColor',
            label: this.$t('overall.asset')
          }, {
            key: 'alertNum',
            icon: 'nz-icon-overview-alert',
            label: this.$t('overall.alert')
          }, {
            key: 'state',
            label: this.$t('overall.state')
          }
        ],
        alertrule: [
          {
            key: 'id',
            label: 'Id'
          }, {
            key: 'name',
            label: this.$t('alert.name')
          }, {
            key: 'type',
            label: this.$t('alert.type')
          }
        ]
      },
      alertLabelData: {},
      loading: true
    }
  },
  methods: {
    // lodash,
    init (type) {
      this.loading = true
      if (type === 'asset') {
        this.$get('asset/asset/' + this.obj.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (type === 'project') {
        this.$get('monitor/project/' + this.obj.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (type === 'module') {
        this.$get('monitor/module/' + this.obj.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (type === 'endpoint') {
        this.$get('monitor/endpoint/' + this.obj.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (type === 'datacenter') {
        this.$get('dc/' + this.obj.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (type === 'alertrule') {
        this.$get('/alert/rule/' + this.obj.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.severityData.forEach(item => {
              this.severityColor = item.color
            })
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }
    },
    getInfo () {
      this.init(this.obj.type)
    },
    searchItemClass (item) {
      let str = ''
      if (item.icon) {
        str += item.icon + ' '
      }
      if (item.key === 'alertNum') {
        str += this.alertLabelData[item.key] ? 'red' : 'green'
      }
      if (item.key === 'pingInfo.rtt') {
        str += this.alertLabelData.pingInfo.status ? 'red-bg' : 'green-bg'
      }
      return str
    },
    getPathContent (key) {
      let str = lodash.get(this.alertLabelData, key, '--')
      str += ''
      if (key === 'pingInfo.rtt' && str) {
        str += ' ms'
      }
      return str || '--'
    },
    selectIcon (item) {
      // console.log(item)
      switch (item.type) {
        case 'asset' : return 'nz-icon-overview-project'
        case 'datacenter' : return 'nz-icon-model'
        case 'project' : return 'nz-icon-project'
        case 'module' : return 'nz-icon-overview-module'
        case 'endpoint' : return 'nz-icon-overview-endpoint'
        case 'alertrule' : return 'nz-icon-Alertrule'
      }
      return 'nz-icon-module5'
    },
    searchItemPath (item) {
      let str = ''
      switch (item.type) {
        case 'asset' : str += '<span>Asset</span> <span>/</span> <span>Asset</span>'; break
        case 'datacenter' : str += '<span>Setting</span> <span>/</span> <span>Data center</span>'; break
        case 'project' : str += '<span>Monitor</span> <span>/</span> <span>Project</span>'; break
        case 'module' :str += '<span>Monitor</span> <span>/</span> <span>Module</span>'; break
        case 'endpoint' : str += '<span>Monitor</span> <span>/</span> <span>Endpoint</span>'; break
        case 'alertrule' : str += '<span>Alert</span> <span>/</span> <span>Alert rule</span>'; break
      }
      return str
    }
  }
}
</script>

<style scoped>

</style>
