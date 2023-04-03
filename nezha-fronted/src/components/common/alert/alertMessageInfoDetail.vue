<template>
  <div class="info-box-header">
    <div v-for="item in cardNames" :key="item.key" v-if="infoData[item.key]">
      <div class="info-box-title">{{item.label}}</div>
      <div v-if="item.key === 'summary' || item.key === 'description'" class="info-box-content">
        {{infoData[item.key]}}
      </div>
      <div v-if="item.key==='labels'" class="info-box-content">
         <span v-for="(item, i) in labelsSort(infoData.labels)" :key="i">
            <span
              @mouseenter="labelHover(infoData, item.label, true, true, $event)"
              @mouseleave="labelHover(infoData, item.label, false, true,)">
              <nz-alert-tag
                v-if="item.label !== 'alertname' && item.label !== 'severity'" :key="item.label" :cursor-point="tagType(item.label) !== 'info'"
                :label="item.label"
                :type="tagType(item.label)"
                style="margin: 5px 0 5px 5px;"
              >
               {{item.value}}
              </nz-alert-tag>
            </span>
          </span>
      </div>
      <div v-if="item.key==='startAt'" class="info-box-content">
        {{utcTimeToTimezoneStr(infoData[item.key])}}
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
export default {
  name: 'alertMessageInfoDetail',
  props: {
    infoData: {
      type: Object
    }
  },
  mixins: [alertMessageLabelMixin, alertLabelMixin],
  data () {
    return {
      cardNames: [
        { key: 'summary', label: this.$t('alert.summary') },
        { key: 'description', label: this.$t('overall.remark') },
        { key: 'labels', label: this.$t('alert.list.labels') },
        { key: 'startAt', label: this.$t('overall.startTime') }
      ]
    }
  }
}
</script>
