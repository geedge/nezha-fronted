<template>
  <div
    :class="calcHeight(alertLabelData.position, alertLabelData)"
    style="position: relative"
    class="alert-label__border"
    ref="alertLabels"
  >
    <div class="alert-label-header-title">
      <span style="margin-right: 5px;line-height: 24px;width: 24px;height: 24px"><i class="nz-icon" :class="statusClass(alertLabelData.status)" style="font-size: 24px"/></span>
      <div class="alert-label-header-name">
        {{getRemoteText(alertLabelData)}}
      </div>
    </div>
    <div
      class="alert-label-info"
      v-my-loading="loading"
    >
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.id ? alertLabelData.id : "--" }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('config.terminallog.SessionID')}}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.uuid ? alertLabelData.uuid.substring(0, 8).toUpperCase(): "--" }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('config.terminallog.sourceUser')}}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.username ? alertLabelData.username: "--" }}
        </div>
      </div>
      <div class="alert-label-box document-copy-block">
        <div class="alert-label-title">{{$t('ping.sourceIp')}}</div>
        <div class="alert-label-value document-copy-text" :title="alertLabelData && alertLabelData.remoteAddr ? alertLabelData.remoteAddr : '--'">{{alertLabelData && alertLabelData.remoteAddr ? alertLabelData.remoteAddr : '--'}}</div>
        <i v-if="alertLabelData && alertLabelData.remoteAddr" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.remoteAddr)" :title="$t('overall.copyText')"></i>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('config.terminallog.loginUser')}}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.loginUser ? alertLabelData.loginUser: "--" }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('config.terminallog.loginHost')}}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.host ? alertLabelData.host: "--" }}
        </div>
      </div>
      <div class="alert-label-box document-copy-block">
        <div class="alert-label-title">{{$t('config.terminallog.remote')}}</div>
        <div class="alert-label-value document-copy-text" :title="getRemoteText(alertLabelData)">{{getRemoteText(alertLabelData)}}</div>
        <i v-if="getRemoteText(alertLabelData)" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(getRemoteText(alertLabelData))" :title="$t('overall.copyText')"></i>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('webshell.protocol')}}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.protocol ? alertLabelData.protocol: "--" }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.startTime')}}</div>
        <div class="alert-label-value">
          {{utcTimeToTimezoneStr(alertLabelData.startTime)}}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('config.terminallog.duration')}}</div>
        <div class="alert-label-value">
          {{getDuration(alertLabelData)}}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('config.terminallog.authtype')}}</div>
        <div class="alert-label-value">
          <span v-if="alertLabelData.authType == 1">{{$t('login.pin')}}</span>
          <span v-else-if="alertLabelData.authType == 2">{{$t('config.terminallog.key')}}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('terminal.sftp')}}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.sftpNum ? alertLabelData.sftpNum: 0 }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('config.terminallog.cmd.cmd')}}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.cmdNum ? alertLabelData.cmdNum: 0 }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('overall.state')}}</div>
        <div class="alert-label-value">
          <span><i class="nz-icon" :class="statusClass(alertLabelData.status)" style="font-size: 14px"/>  {{getStatusText(alertLabelData.status)}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import trendMixin from './trendMixins'
import { calcDurationByStringTimeB } from '@/components/common/js/tools'
import { terminalLog as terminalLogStatus } from '@/components/common/js/constants'
export default {
  name: 'alertLabel',
  mixins: [trendMixin],
  props: {
    alertLabelData: {},
    detailList: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: true,
      heightList: 0,
      boxWidth: 0
    }
  },
  watch: {
    alertLabelData: {
      immediate: true,
      deep: true,
      handler (n) {
        this.init()
      }
    },
    LRTriangle: {
      immediate: true,
      deep: true,
      handler (n) {}
    }
  },
  computed: {
    calcHeight () {
      const self = this
      return function (position) {
        const clientHeight =
            document.body.clientHeight < document.documentElement.clientHeight
              ? document.body.clientHeight
              : document.documentElement.clientHeight
        const elHeight =
            self.type === 'asset' ? 318 : self.type === 'project' ? 70 : 70
        if (position.top + elHeight > clientHeight) {
          return 'alert-labelUp'
        } else {
          return 'alert-label'
        }
      }
    }
  },
  methods: {
    init () {
      this.loading = false
    },
    getRemoteText (record) {
      return `${record.loginUser}@${record.host}:${record.port}`
    },
    selectIcon (type) {
      switch (type) {
        case 'asset':
          return 'nz-icon-overview-project'
        case 'dc':
          return 'nz-icon-Datacenter2'
        case 'project':
          return 'nz-icon-project'
        case 'module':
          return 'nz-icon-overview-module'
        case 'endpoint':
          return 'nz-icon-overview-endpoint'
        case 'alertrule':
          return 'nz-icon-Alertrule'
      }
      return 'nz-icon-module5'
    },
    statusClass (status) {
      switch (Number(status)) {
        case 0:
          return 'nz-icon-connecting color23bf9a'
        case 1:
          return 'nz-icon-failed colorffa416'
        case 2:
          return 'nz-icon-over color999999'
        case 3:
          return 'nz-icon-stop colorec7f66'
        case 4:
          return 'nz-icon-unknown-error color535b64'
      }
    },
    getDuration (record) {
      if (record.endTime) {
        return calcDurationByStringTimeB(record.startTime, record.endTime)
      }
      return ''
    },
    getStatusText (status) {
      const self = this
      return self.$t(terminalLogStatus.status[status])
    }
  },
  mounted () {
    if (this.$refs.alertLabels) {
      this.heightList = this.$refs.alertLabels.getBoundingClientRect().height
      this.boxWidth = this.$refs.alertLabels.getBoundingClientRect().width
    } else {
      this.heightList = 0
      this.boxWidth = 0
    }
  },
  beforeDestroy () {}
}
</script>
<style>
</style>
