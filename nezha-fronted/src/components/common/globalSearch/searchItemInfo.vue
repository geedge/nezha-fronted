<template>
  <el-skeleton style="height: 100%;width: 100%" :loading="loading || faLoading" animated>
    <template slot="template">
      <div class="search-item-box">
        <div class="search-item-title-icon">
          <el-skeleton-item
            variant="image"
            style="width: 60px; height: 60px;"
          />
        </div>
        <el-skeleton-item  class="search-item-path" search-item-path variant="h3" style="width: 50%;" />
        <el-skeleton-item class="search-item-name" search-item-path variant="h3" style="width: 30%" />
        <div v-for="item in skeletonArr" :key="item" class="search-item-info">
          <el-skeleton-item class="search-item-key"/>
          <el-skeleton-item class="search-item-value-box" style="margin-left: 20px"/>
        </div>
      </div>
    </template>
    <template>
      <div class="search-item-box" v-if="alertLabelData.id&&obj&&obj.id">
        <div class="search-item-title-icon">
          <i class="nz-icon monitorColor" :class="selectIcon(obj)"/>
        </div>
        <div class="search-item-path" v-html="searchItemPath(obj)"></div>
        <div class="search-item-name">{{obj.name}}</div>
        <div v-for="item in dataKey[obj.type]" :key="item.key" class="search-item-info">
          <div class="search-item-key">
            {{item.label}}
          </div>
          <div class="search-item-value-box" v-if="obj.type === 'endpoint'&&item.key==='state'&&alertLabelData && alertLabelData.configs">
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
          <div class="search-item-value-box" v-else-if="obj.type === 'alertrule'&&item.key==='trbShot'">
            <i v-if="item.icon&&getPathContent(item.key)!=='--'" class="nz-icon" :class="searchItemClass(item)" :style="searchItemStyle(item)"/>
            <span class="search-item-value" v-html="getPathContent(item.key)">
            </span>
          </div>
          <div class="search-item-value-box" v-else>
            <i v-if="(item.icon && getPathContent(item.key)!=='--') || item.key === 'pingInfo.rtt'" class="nz-icon" :class="searchItemClass(item)" :style="searchItemStyle(item)"/>
            <span class="search-item-value" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
              {{getPathContent(item.key)}}
            </span>
          </div>
        </div>
      </div>
    </template>
  </el-skeleton>
</template>

<script>
import lodash from 'lodash'
import chartDataFormat from '@/components/charts/chartDataFormat'
export default {
  name: 'searchItemInfo',
  props: {
    obj: {},
    severityData: {},
    faLoading: {}
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n && n.id) {
          this.loading = true
          if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
          }
          this.timer = setTimeout(() => {
            this.alertLabelData = { }
            this.getInfo(n)
          }, 500)
        }
      }
    }
  },
  data () {
    return {
      timer: null,
      skeletonArr: 6,
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
            icon: 'nz-icon nz-icon-circle fz12',
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
          }, {
            key: 'severityId',
            label: this.$t('alert.severity'),
            color: this.severityColor,
            icon: 'nz-icon nz-icon-circle fz12'
          }, {
            key: 'expr',
            label: this.$t('alert.config.expr')
          }, {
            key: 'alertNum',
            icon: 'nz-icon-overview-alert',
            label: this.$t('overall.alert')
          }, {
            key: 'trbShot',
            icon: 'nz-icon-guzhangshuju',
            label: this.$t('alert.config.trbShot')
          }, {
            key: 'state',
            label: this.$t('overall.state'),
            icon: 'nz-icon nz-icon-circle fz12'
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
            this.severityColor = this.severityData.find(item => res.data.severityId == item.id).color
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
        str += this.alertLabelData.pingInfo && this.alertLabelData.pingInfo.status ? 'green' : 'red'
      }
      if (item.key === 'state' && this.obj.type === 'alertrule') {
        str += !this.alertLabelData.state ? 'red' : 'green'
      }
      return str
    },
    searchItemStyle (item) {
      const style = {}
      if (item.key === 'severityId' && this.obj.type === 'alertrule') {
        style.color = this.severityColor
        style['font-size'] = '12px'
        style['margin-right'] = '5px'
      }
      return style
    },
    alertruleStr () {
      const arr = [this.$t('project.metrics.metrics'), this.$t('overall.logs'), 'SNMP trap']
      if (this.alertLabelData.type) {
        return arr[this.alertLabelData.type - 1]
      } else {
        return '--'
      }
    },
    getPathContent (key) {
      let str = lodash.get(this.alertLabelData, key, '--')
      if (key === 'alertNum' || key === 'endpointNum' || key === 'assetNum' || key === 'cabinetNum' || key === 'moduleNum') {
        str += ''
      }
      if (key === 'pingInfo.rtt' && str && str !== '--') {
        str += ' ms'
      }
      if (key === 'type' && this.obj.type === 'alertrule') {
        str = this.alertruleStr()
      }
      if (key === 'expr' && this.obj.type === 'alertrule' && this.alertRuleData && this.alertRuleData.expr) {
        str = this.alertRuleData.expr + this.alertRuleData.operator + this.formatThreshold(this.alertRuleData.threshold, this.alertRuleData.unit)
      }
      if (key === 'state' && this.obj.type === 'alertrule') {
        str = this.alertLabelData.state ? this.$t('overall.enabled') : this.$t('overall.disabled')
      }
      if (key === 'trbShot' && this.obj.type === 'alertrule') {
        // str = ''
      }
      if (key === 'severityId' && this.obj.type === 'alertrule' && this.alertLabelData.severityId) {
        str = this.severityData.find(item => this.alertLabelData.severityId == item.id).name
      }
      return str || '--'
    },
    selectIcon (item) {
      switch (item.type) {
        case 'asset' : return 'nz-icon-overview-project'
        case 'datacenter' : return 'nz-icon-Datacenter2'
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
    },
    formatThreshold (value, unit) {
      const unitMethod = chartDataFormat.getUnit(unit)
      if (unitMethod && value) {
        return unitMethod.compute(value, null, 2)
      } else {
        return value
      }
    }
  }
}
</script>

<style scoped>

</style>
