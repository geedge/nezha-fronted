<template>
  <div class="system">
    <div class="system-config-form basicForm">
      <div class="system-title">{{$t('overall.basicInfo')}}</div>
      <el-form :model="monitor"  label-width="180px" size="small" ref="monitorForm" :rules="monitorRules" :validate-on-rule-change="false">
        <el-form-item :label="$t('setup.system.federation')" prop="prometheus_federation_enabled">
          <el-checkbox v-model="monitor.prometheus_federation_enabled" true-label="1" false-label="0"  id="system-monitor-prometheus_federation_enabled"></el-checkbox>
        </el-form-item>
        <el-form-item :label="$t('project.endpoint.scrape_interval')" prop="default_scrape_interval">
          <el-input v-model.number="monitor.default_scrape_interval" >
            <template slot="append"><span >{{$t('alert.config.second')}}</span></template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.scrapeTimeout')" prop="default_scrape_timeout">
          <el-input v-model.number="monitor.default_scrape_timeout" >
            <template slot="append"><span >{{$t('alert.config.second')}}</span></template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.basic.assetPingInterval')" prop="asset_ping_interval">
          <el-input v-model.number="monitor.asset_ping_interval" >
            <template slot="append"><span >{{$t('alert.config.second')}}</span></template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.monitor.asset_ping_from')" prop="asset_ping_from">
          <el-select v-model="monitor.asset_ping_from" popper-class="right-box-select-top right-public-box-dropdown-top">
            <el-option label="Global" value="1"></el-option>
            <el-option label="Per-datacenter" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('config.system.monitor.interface_name')" prop="interface_name">
          <vue-tags-input
                        v-model="tag"
                        :maxlength="32"
                        :class="monitor.interface_name.length !== 0 ? 'interface-name' : ''"
                        :placeholder="$t('overall.add.interface_name')"
                        :tags="monitor.interface_name"
                        @tags-changed="newTags=> monitor.interface_name = newTags"
                      />
        </el-form-item>
        <!--metrics-->
        <div class="system-title system-title-border">{{$t('config.system.monitor.metricsTitle')}}</div>
        <el-form-item :label="$t('config.system.monitor.metrics_storage_retention')" prop="metrics_storage_retention">
          <el-input v-model.number="monitor.metrics_storage_retention" id="monitor-metrics_storage_retention">
            <template slot="append"><span >{{$t('config.system.basic.day')}}</span></template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.monitor.metrics_storage_type')" prop="metrics_storage_type">
          <el-select v-model="monitor.metrics_storage_type" popper-class="right-box-select-top right-public-box-dropdown-top">
            <el-option :label="$t('config.system.monitor.local')" value="1"></el-option>
            <el-option :label="$t('config.system.monitor.s3')" value="2"></el-option>
          </el-select>
        </el-form-item>
        <transition name="el-zoom-in-top">
          <div v-show="monitor.metrics_storage_type == 2">
            <el-form-item :label="$t('asset.endpoint')" prop="metrics_storage_s3_endpoint" :rules=" [ { required: monitor.metrics_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
              <el-input v-model="monitor.metrics_storage_s3_endpoint" id="monitor-metrics_storage_s3_endpoint">
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.monitor.metrics_storage_s3_bucket')" prop="metrics_storage_s3_bucket" :rules=" [ { required: monitor.metrics_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
              <el-input v-model="monitor.metrics_storage_s3_bucket" id="monitor-metrics_storage_s3_bucket">
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.monitor.metrics_storage_s3_access_key')" prop="metrics_storage_s3_access_key" :rules=" [ { required: monitor.metrics_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
              <el-input v-model="monitor.metrics_storage_s3_access_key" id="monitor-metrics_storage_s3_access_key">
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.terminallog.key')" prop="metrics_storage_s3_secret_access_key" :rules=" [ { required: monitor.metrics_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]" class="monitorLastEle">
              <el-input v-model="monitor.metrics_storage_s3_secret_access_key" id="monitor-metrics_storage_s3_secret_access_key" type="password">
              </el-input>
            </el-form-item>
          </div>
        </transition>
        <el-form-item :label="$t('config.system.basic.maxSeries')" prop="metrics_query_max_series">
          <el-input-number v-model="monitor.metrics_query_max_series" controls-position="right" :min="-1" :max="1000" :precision="0" id="system-monitor-metrics_query_max_series"></el-input-number>
        </el-form-item>
        <!--logs-->
        <div class="system-title system-title-border">{{$t('config.system.monitor.logsTitle')}}</div>
        <el-form-item :label="$t('config.system.monitor.metrics_storage_retention')" prop="logs_storage_retention">
          <el-input v-model.number="monitor.logs_storage_retention" id="monitor-logs_storage_retention">
            <template slot="append"><span >{{$t('config.system.basic.day')}}</span></template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('config.system.monitor.metrics_storage_type')" prop="logs_storage_type">
          <el-select v-model="monitor.logs_storage_type" popper-class="right-box-select-top right-public-box-dropdown-top">
            <el-option :label="$t('config.system.monitor.local')" value="1"></el-option>
            <el-option :label="$t('config.system.monitor.s3')" value="2"></el-option>
          </el-select>
        </el-form-item>
        <transition name="el-zoom-in-top">
          <div v-show="monitor.logs_storage_type == 2">
            <el-form-item :label="$t('asset.endpoint')" prop="logs_storage_s3_endpoint" :rules=" [ { required: monitor.logs_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
              <el-input v-model="monitor.logs_storage_s3_endpoint" id="monitor-logs_storage_s3_endpoint">
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.monitor.metrics_storage_s3_bucket')" prop="logs_storage_s3_bucket" :rules=" [ { required: monitor.logs_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
              <el-input v-model="monitor.logs_storage_s3_bucket" id="monitor-logs_storage_s3_bucket">
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.monitor.metrics_storage_s3_access_key')" prop="logs_storage_s3_access_key" :rules=" [ { required: monitor.logs_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
              <el-input v-model="monitor.logs_storage_s3_access_key" id="monitor-logs_storage_s3_access_key">
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.terminallog.key')" prop="logs_storage_s3_secret_access_key" :rules=" [ { required: monitor.logs_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]" class="monitorLastEle">
              <el-input v-model="monitor.logs_storage_s3_secret_access_key" id="monitor-logs_storage_s3_secret_access_key" type="password">
              </el-input>
            </el-form-item>
          </div>
        </transition>
        <el-form-item :label="$t('config.system.monitor.logs_query_range_default_limit')" prop="logs_query_range_default_limit">
          <el-input-number v-model="monitor.logs_query_range_default_limit" controls-position="right" :min="-1" :max="1000" :precision="0" id="system-monitor-logs_query_range_default_limit"></el-input-number>
        </el-form-item>
        <el-form-item>
          <button id="system-monitor-save" v-has="'system_basic_edit'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal"  type="button" @click="saveSetInfo('monitor','monitorForm')">{{$t('overall.save')}}</button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import systemMixin from '../../common/mixin/system/systemMixin'
import routerPathParams from '../../common/mixin/routerPathParams'
import VueTagsInput from '@johmun/vue-tags-input'

export default {
  name: 'monitor',
  mixins: [systemMixin, routerPathParams],
  components: {
    VueTagsInput
  },
  data () {
    return {
      switchTab: 'monitor',
      tag: '',
      monitor: {
        // alert_api: '',
        asset_ping_from: '',
        asset_ping_interval: '',
        default_scrape_interval: '',
        default_scrape_timeout: '',
        logs_query_range_default_limit: '',
        logs_storage_retention: '',
        logs_storage_s3_access_key: '',
        logs_storage_s3_bucket: '',
        logs_storage_s3_endpoint: '',
        logs_storage_s3_secret_access_key: '',
        logs_storage_type: '',
        metrics_query_max_series: '',
        metrics_storage_retention: '',
        metrics_storage_s3_access_key: '',
        metrics_storage_s3_bucket: '',
        metrics_storage_s3_endpoint: '',
        metrics_storage_s3_secret_access_key: '',
        metrics_storage_type: '',
        prometheus_federation_enabled: '',
        interface_name: []
      },
      monitorRules: {
        // alert_api: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        asset_ping_from: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        asset_ping_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        default_scrape_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        default_scrape_timeout: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        logs_query_range_default_limit: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        logs_storage_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        logs_storage_type: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        metrics_query_max_series: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        metrics_storage_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        metrics_storage_type: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        prometheus_federation_enabled: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.querySetInfo(this.switchTab)
  },
  methods: {
    lnglatChange (lnglat, zoom) {
      const lnglatData = lnglat.split('.')
      this.basic.map_center_config.longitude = lnglatData[0]
      this.basic.map_center_config.latitude = lnglatData[1]
      this.basic.map_center_config.zoom = zoom
      this.basic.lnglat = lnglat
    }
  }
}
</script>
<style scoped>
.vue-tags-input{
  max-width: unset;
}
/deep/ .vue-tags-input .ti-input{
    min-height: 32px;
    padding: 0px 0px 0px 15px !important;
}
/deep/ .vue-tags-input .ti-input .ti-new-tag-input-wrapper{
  padding: 0;
  margin: 0;
}
/deep/ .vue-tags-input.interface-name .ti-input .ti-new-tag-input-wrapper{
  padding-left: 7px;
}
</style>
