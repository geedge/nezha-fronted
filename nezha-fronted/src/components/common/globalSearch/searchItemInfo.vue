<template>
  <el-skeleton style="height: 100%;width: 100%" :loading="loading || faLoading" animated>
    <template slot="template">
      <div class="search-item-box" style="padding-top:70px;padding-left:75px;padding-right:45px">
        <div class="search-item-title-icon">
          <el-skeleton-item
            variant="image"
            style="width: 40px; height: 40px;"
          />
        </div>
        <el-skeleton-item class="search-item-path" variant="h3" style="width: 30%;height: 12px;margin-top: 12px;margin-bottom: 12px" />
        <el-skeleton-item class="search-item-name" variant="h3" style="width: 50%;height: 14px;margin-bottom: 12px" />
        <div v-for="item in skeletonArr" :key="item" class="search-item-info">
          <el-skeleton-item class="search-item-key" style="height: 21px"/>
          <el-skeleton-item class="search-item-value-box" style="width: 57%;margin-left: 20px;height: 21px;margin-top: 13px;margin-bottom: 13px"/>
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
            <span class="endpoint-cell-left"><i class="nz-icon nz-icon-Metrics active" /> {{$t('overall.metric')}} </span>
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
            <span class="endpoint-cell-left" style="margin-left: 10px"><i class="nz-icon nz-icon-logs active" /> {{$t('overall.logs')}} </span>
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
            <div class="search-item-value" v-html="getPathContent(item.key)">
            </div>
          </div>
          <div style="cursor: pointer" v-else-if="item.key === 'alertNum'">
            <i :class="Number(getPathContent(item.key)) ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover('',true, $event)" @mouseleave="tooltipHover('',false, $event)"></i>
            <div v-if="alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: position.left + 'px',top:position.top + 'px'}">
              <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('overall.active')}})</div>
              <div class="severity-info" style='justify-content: space-between'>
                <div class="severity-name">{{$t('overall.result.total')}}</div>
                <div class="severity-value">{{getPathContent(item.key)}}</div>
              </div>
            </div>
            <alertDaysInfo
              v-show="!trendLoading"
              :alertDaysData="alertDaysData"
            />
          </div>
          <!-- asset -->
          <div class="search-item-value-box" v-else-if="obj.type === 'asset'">
            <i v-if="(item.icon && getPathContent(item.key)!=='--') || item.key === 'pingInfo.rtt'" class="nz-icon" :class="searchItemClass(item)" :style="searchItemStyle(item)"/>
            <!-- item.key === name -->
            <div class="document-copy-block" v-if="item.key === 'name'">
              <span class="search-item-value document-copy-text" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
              {{getPathContent(item.key)}}
             </span>
              <i v-if="getPathContent(item.key)" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(getPathContent(item.key))" :title="$t('overall.copyText')"></i>
            </div>
            <!-- item.key === manageIp -->
            <div class="document-copy-block" v-else-if="item.key === 'manageIp'">
              <span class="search-item-value document-copy-text" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
              {{getPathContent(item.key)}}
             </span>
              <i v-if="getPathContent(item.key)" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(getPathContent(item.key))" :title="$t('overall.copyText')"></i>
            </div>
            <div v-else>
               <span class="search-item-value" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
                {{getPathContent(item.key)}}
               </span>
            </div>
          </div>
           <!-- endpoint -->
          <div class="search-item-value-box" v-else-if="obj.type === 'endpoint'">
            <i v-if="(item.icon && getPathContent(item.key)!=='--') || item.key === 'pingInfo.rtt'" class="nz-icon" :class="searchItemClass(item)" :style="searchItemStyle(item)"/>
            <!-- item.key === name -->
            <div class="document-copy-block" v-if="item.key === 'name'">
              <span class="search-item-value document-copy-text" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
              {{getPathContent(item.key)}}
             </span>
              <i v-if="getPathContent(item.key)" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(getPathContent(item.key))" :title="$t('overall.copyText')"></i>
            </div>
            <div v-else>
               <span class="search-item-value" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
                {{getPathContent(item.key)}}
               </span>
            </div>
          </div>
          <!-- project -->
          <div class="search-item-value-box" v-else-if="obj.type === 'project'">
            <i v-if="(item.icon && getPathContent(item.key)!=='--') || item.key === 'pingInfo.rtt'" class="nz-icon" :class="searchItemClass(item)" :style="searchItemStyle(item)"/>
            <!-- item.key === name -->
            <div class="document-copy-block" v-if="item.key === 'name'">
              <span class="search-item-value document-copy-text" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
              {{getPathContent(item.key)}}
             </span>
              <i v-if="getPathContent(item.key)" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(getPathContent(item.key))" :title="$t('overall.copyText')"></i>
            </div>
            <div v-else>
               <span class="search-item-value" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
                {{getPathContent(item.key)}}
               </span>
            </div>
          </div>
           <!-- module -->
          <div class="search-item-value-box" v-else-if="obj.type === 'module'">
            <i v-if="(item.icon && getPathContent(item.key)!=='--') || item.key === 'pingInfo.rtt'" class="nz-icon" :class="searchItemClass(item)" :style="searchItemStyle(item)"/>
            <!-- item.key === name -->
            <div class="document-copy-block" v-if="item.key === 'name'">
              <span class="search-item-value document-copy-text" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
              {{getPathContent(item.key)}}
             </span>
              <i v-if="getPathContent(item.key)" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(getPathContent(item.key))" :title="$t('overall.copyText')"></i>
            </div>
            <div v-else>
               <span class="search-item-value" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
                {{getPathContent(item.key)}}
               </span>
            </div>
          </div>
           <!-- datacenter -->
          <div class="search-item-value-box" v-else-if="obj.type === 'datacenter'">
            <i v-if="(item.icon && getPathContent(item.key)!=='--') || item.key === 'pingInfo.rtt'" class="nz-icon" :class="searchItemClass(item)" :style="searchItemStyle(item)"/>
            <!-- item.key === name -->
            <div class="document-copy-block" v-if="item.key === 'name'">
              <span class="search-item-value document-copy-text" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
              {{getPathContent(item.key)}}
             </span>
              <i v-if="getPathContent(item.key)" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(getPathContent(item.key))" :title="$t('overall.copyText')"></i>
            </div>
            <div v-else>
               <span class="search-item-value" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
                {{getPathContent(item.key)}}
               </span>
            </div>
          </div>
           <!-- alertrule -->
          <div class="search-item-value-box" v-else-if="obj.type === 'alertrule'">
            <i v-if="(item.icon && getPathContent(item.key)!=='--') || item.key === 'pingInfo.rtt'" class="nz-icon" :class="searchItemClass(item)" :style="searchItemStyle(item)"/>
            <!-- item.key === name -->
            <div class="document-copy-block" v-if="item.key === 'name'">
              <span class="search-item-value document-copy-text" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
              {{getPathContent(item.key)}}
             </span>
              <i v-if="getPathContent(item.key)" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(getPathContent(item.key))" :title="$t('overall.copyText')"></i>
            </div>
            <div v-else>
               <span class="search-item-value" v-if="item.key !== 'pingInfo.rtt' || (item.key === 'pingInfo.rtt'&& alertLabelData.pingInfo&&alertLabelData.pingInfo.status == 1)">
                {{getPathContent(item.key)}}
               </span>
            </div>
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
import chartDataFormat from '@/components/chart/chartDataFormat'
import alertDaysInfo from '@/components/common/alert/alertDaysInfo'
export default {
  name: 'searchItemInfo',
  components: {
    alertDaysInfo
  },
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
            label: this.$t('asset.manageIp')
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
            label: this.$t('asset.cabinet')
          }, {
            key: 'brand.name',
            label: this.$t('asset.brand')
          }, {
            key: 'model.name',
            label: this.$t('asset.model')
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
            label: this.$t('asset.location')
          }, {
            key: 'cabinetNum',
            icon: 'nz-icon-cabinet  monitorColor',
            label: this.$t('asset.cabinet')
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
            label: this.$t('asset.endpoint')
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
            label: this.$t('asset.endpoint')
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
            label: this.$t('overall.name')
          }, {
            key: 'type',
            label: this.$t('overall.type')
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
      loading: true,
      severityDataWeight: this.$store.getters.severityDataWeight,
      alertNumtooltipShow: false,
      position: {
        left: 0,
        top: 0
      },
      alertDaysData: [],
      trendLoading: false,
      trendTimer: null
    }
  },
  methods: {
    // lodash,
    init (type) {
      this.loading = true
      this.trendLoading = true
      let trendKey = ''
      if (type === 'asset') {
        trendKey = 'assetId'
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
        trendKey = 'projectId'
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
        trendKey = 'moduleId'
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
        trendKey = 'endpointId'
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
        trendKey = 'dcId'
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
        trendKey = 'ruleId'
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
      const weekDays = this.getWeeksTime()
      if (this.trendTimer) {
        clearTimeout(this.trendTimer)
        this.trendTimer = null
      }
      this.trendTimer = setTimeout(() => {
        this.trendLoading = true
        const params = {
          type: 'total',
          dimension: 'priority',
          step: 'd'
        }
        params[trendKey] = this.obj.id
        this.$get('/stat/alertMessage/trend', params).then((res) => {
          if (!res.data) {
            return
          }
          const alertDaysData = res.data.result ? res.data.result[0].values : []
          const newWeekDays = JSON.parse(JSON.stringify(weekDays))
          alertDaysData.forEach(item => {
            item.values.forEach(time => {
              const findItem = newWeekDays.find(days => days.time == time[0])
              if (findItem) {
                findItem[item.metric.priority] = time[1]
              }
            })
          })
          setTimeout(() => {
            this.alertDaysData = newWeekDays
            this.trendLoading = false
          })
        })
      })
    },
    getInfo () {
      if (this.obj && this.obj.type) {
        this.init(this.obj.type)
      }
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
      const arr = [this.$t('overall.metric'), this.$t('overall.logs'), 'SNMP trap']
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
        case 'asset' : str += `<span>${this.$t('overall.asset')}</span> <span>/</span> <span>${this.$t('overall.asset')}</span>`; break
        case 'datacenter' : str += `<span>${this.$t('config.config')}</span> <span>/</span> <span>${this.$t('overall.dc')}</span>`; break
        case 'project' : str += `<span>${this.$t('config.system.monitor.monitor')}</span> <span>/</span> <span>${this.$t('project.project.projectName')}</span>`; break
        case 'module' :str += `<span>${this.$t('config.system.monitor.monitor')}</span> <span>/</span> <span>${this.$t('overall.module')}</span>`; break
        case 'endpoint' : str += `<span>${this.$t('config.system.monitor.monitor')}</span> <span>/</span> <span>${this.$t('asset.endpoint')}</span>`; break
        case 'alertrule' : str += `<span>${this.$t('overall.alert')}</span> <span>/</span> <span>${this.$t('alert.rule')}</span>`; break
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
    },
    tooltipHover (item, flag, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.position.left = position.left
        this.$set(this.position, 'left', position.left)
        if (position.top > window.innerHeight / 2) {
          this.$set(this.position, 'top', position.top - 55)
        } else {
          this.$set(this.position, 'top', position.top + 30)
        }
        // this.$set(item, 'alertNumtooltipShow', flag)
        this.alertNumtooltipShow = flag
      }
    },
    getWeeksTime () {
      const localOffset = new Date().getTimezoneOffset() // 默认 显示时区偏移的结果 单位分钟
      const now = new Date(new Date().toLocaleDateString()).getTime() - localOffset * 60 * 1000
      const arr = []
      for (let i = 0; i < 7; i++) {
        const obj = {
          time: now - i * 24 * 60 * 60 * 1000,
          tooltipShow: false,
          position: {
            left: 0,
            top: 0
          }
        }
        this.severityDataWeight.forEach(item => {
          obj[item.name] = 0
          obj[item.name + 'Color'] = item.color
        })
        arr.unshift(obj)
      }
      return arr
    }
  }
}
</script>
