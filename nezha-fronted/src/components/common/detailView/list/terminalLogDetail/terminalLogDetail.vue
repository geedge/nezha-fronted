<template>
  <div class="detail-left-box">
    <div class="order-box">
      <el-select v-model="orderBy" size="small" :placeholder="$t('asset.detail.orderBy')" popper-class="right-box-select-top" class="detail-select">
        <el-option
          v-for="item in tableTitle"
          v-if="item.sortable==='custom'"
          :key="item.prop"
          :label="$t('asset.detail.orderByLabel',{label:item.label})"
          :value="item.prop">
          {{item.label}}
        </el-option>
      </el-select>
      <button @click="orderTypeChange" size="small" class="detail-button top-tool-btn table-column-setting margin-l-10">
        <i class="nz-icon nz-icon-arrow-up1" v-if="orderType=='ascending'" :title="$t('dashboard.explore.ascending')" />
        <i class="nz-icon nz-icon-arrow-down2" v-if="orderType=='descending'"  :title="$t('dashboard.explore.descending')"/>
      </button>
    </div>
    <ul class="detail-row-box" ref="dataTable">
      <li
        v-for="(item,index) in tableData"
        :key="index"
        class="detail-row"
        :id="'globalSearch' + item.id"
        :class="item.id === detailViewRightObj.id ? 'selected' : ''"
        @click="detailViewRightShow(item)"
        @mouseenter="labelHover(item, 'other', true, false, $event)"
        @mouseleave="labelHover(item, 'other', false, false,)"
      >
        <div class="detail-row-info">
          <div class="asset-manageIp">
            <el-tooltip effect="light" placement="right">
              <div slot="content">
                {{$t(getStatusText(item.status))}}
              </div>
              <span><i class="nz-icon" :class="statusClass(item.status)"/></span>
            </el-tooltip>
            <span>{{getRemoteText(item)}}</span>
          </div>
          <div class="asset-name">
            <span>{{item.username?item.username:'-'}}</span>
          </div>
        </div>
      </li>
    </ul>
    <nzTooltip
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :detailList="true"
      :type="alertLabelType"
      :width="305"
      @tipHover='tipHover'
      ref="nzTooltip"
      class="data-column__"
      style="padding: 0;border: none !important;"
    >
      <div style="word-break: break-all">
        <div name="default">
          <terminalLogInfo
            :alertLabelData="alertLabelObj"
            :detailList="false"
          ></terminalLogInfo>
        </div>
      </div>
    </nzTooltip>
  </div>
</template>

<script>

import detailViewLeftMixin from '@/components/common/mixin/detailViewLeftMixin'
import alertLabel from '@/components/common/alert/alertLabel'
import { terminalLog } from '@/components/common/js/constants'
import { calcDurationByStringTimeB } from '@/components/common/js/tools'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
import terminalLogInfo from '@/components/common/alert/terminalLogInfo'
import nzTooltip from '@/components/common/alert/nzTooltip'
export default {
  name: 'terminalLogDetail',
  mixins: [detailViewLeftMixin, alertLabelMixin],
  components: {
    alertLabel,
    nzTooltip,
    terminalLogInfo
  },
  computed: {
    getStatusText () {
      return function (status) {
        return terminalLog.status[status]
      }
    },
    getRemoteText () {
      return function (record) {
        if (record.host) {
          return `${record.loginUser}@${record.host}:${record.port}`
        } else {
          return `${record.loginUser}@${record.host}`
        }
      }
    },
    statusClass () {
      return function (status) {
        switch (status) {
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
      }
    }
  },
  data () {
    return {
      tableTitle: [
        {
          label: this.$t('asset.id'),
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('config.terminallog.SessionID'),
          prop: 'uuid',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('config.operationlog.username'),
          prop: 'username',
          minWidth: 200,
          show: true
        },
        {
          label: this.$t('ping.sourceIp'),
          prop: 'sourceIp',
          minWidth: 115,
          show: true,
          sortable: 'custom'
        },
        {
          label: this.$t('config.terminallog.remote'),
          prop: 'remote',
          show: true
        },
        {
          label: this.$t('webshell.protocol'),
          prop: 'protocol',
          show: true
        },
        {
          label: this.$t('overall.startTime'),
          prop: 'startTime',
          minWidth: 100,
          show: true
        },
        {
          label: this.$t('config.terminallog.duration'),
          prop: 'duration',
          show: true
        },
        {
          label: this.$t('config.terminallog.authtype'),
          prop: 'authType',
          minWidth: 100,
          show: false
        },
        {
          label: this.$t('overall.state'), // killusername鼠标悬停形式
          prop: 'state',
          show: true,
          width: 150,
          sortable: 'custom'
        }
      ]
    }
  },
  methods: {
  }
}
</script>
