<template>
  <div class="messgae-info">
    <div class="messgae-info-header">{{$t('project.topology.alert')}}</div>
    <div class="messgae-info-content">
      <!-- summary -->
      <div class="messgae-info-row">
        <span class="messgae-info-title">{{$t('alert.summary')}}</span>
        <span class="messgae-info-value">{{infoData.summary?infoData.summary:'--'}}</span>
      </div>
      <!-- description -->
      <div class="messgae-info-row">
        <span class="messgae-info-title">{{$t('overall.remark')}}</span>
        <span class="messgae-info-value">{{infoData.description?infoData.description:'--'}}</span>
      </div>
      <!-- labels -->
      <div class="messgae-info-row">
        <span class="messgae-info-title">{{$t('alert.list.labels')}}</span>
        <div class="messgae-info-value" style="display: flex;flex-wrap: wrap;" v-if="infoData.labels">
          <span v-for="(item, i) in labelsSort(infoData.labels)" :key="i">
            <span
              @mouseenter="labelHover(infoData, item.label, true, true, $event)"
              @mouseleave="labelHover(infoData, item.label, false, true,)">
              <nz-alert-tag
                v-if="item.label !== 'alertname' && item.label !== 'severity'" :key="item.label" :cursor-point="tagType(item.label) !== 'info'"
                :label="item.label"
                :type="tagType(item.label)"
                style="margin: 5px 5px 5px 0px;"
                :title="item.value"
              >
              {{item.value}}
              </nz-alert-tag>
            </span>
          </span>
        </div>
      </div>
      <!-- startAt -->
      <div class="messgae-info-row">
        <span class="messgae-info-title">{{$t('overall.startTime')}}</span>
        <span class="messgae-info-value">{{infoData.startAt?utcTimeToTimezoneStr(infoData.startAt):'--'}}</span>
      </div>
      <!-- duration -->
      <div class="messgae-info-row">
        <span class="messgae-info-title">{{$t('config.terminallog.duration')}}</span>
        <span class="messgae-info-value">
          <el-tooltip :disabled="!infoData.endAt" effect="light" placement="right">
            <div slot="content">
              {{$t('overall.endTime')}}<br/>
              {{utcTimeToTimezoneStr(infoData.endAt)}}
            </div>
            <span>{{infoData.startAt?getDuration(infoData):'--'}}</span>
          </el-tooltip>
        </span>
      </div>
    </div>
    <alertLabel
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :type="alertLabelType"
      :alertTableDialog="true"
    ></alertLabel>
  </div>
</template>

<script>
import alertMessageLabelMixin from '@/components/common/alert/alertMessageLabelMixin'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
import { calcDurationByStringTimeB } from '@/components/common/js/tools'
export default {
  name: 'alertMessageInfoDetail',
  props: {
    infoData: {
      type: Object
    },
    nowTime: {
      type: String
    }
  },
  mixins: [alertMessageLabelMixin, alertLabelMixin],
  computed: {
    getDuration () {
      return function (record) {
        if (record.endAt) {
          return calcDurationByStringTimeB(record.startAt, record.endAt)
        }
        return calcDurationByStringTimeB(record.startAt, this.nowTime)
      }
    }
  },
  data () {
    return {
      cardNames: [
        { key: 'summary', label: this.$t('alert.summary') },
        { key: 'description', label: this.$t('overall.remark') },
        { key: 'labels', label: this.$t('alert.list.labels') },
        { key: 'startAt', label: this.$t('overall.startTime') },
        { key: 'duration', label: this.$t('config.terminallog.duration') }
      ]
    }
  }
}
</script>
