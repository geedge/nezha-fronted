<template>
  <div class="">
    <div v-for="item in cardNames" :key="item.key" v-if="infoData[item.key]">
      <div>{{item.label}}</div>
      <div v-if="item.key === 'summary' || item.key === 'remark'">
        {{infoData[item.key]}}
      </div>
      <div v-if="item.key==='labels'">
        labels
      </div>
      <div v-if="item.key==='startAt'">
        {{utcTimeToTimezoneStr(infoData[item.key])}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'alertMessageInfoDetail',
  props: {
    infoData: {
      type: Object
    }
  },
  data () {
    return {
      cardNames: [
        { key: 'summary', label: this.$t('alert.summary') },
        { key: 'remark', label: this.$t('overall.remark') },
        { key: 'labels', label: this.$t('alert.list.labels') },
        { key: 'startAt', label: this.$t('alert.startAt') }
      ]
    }
  }
}
</script>

<style scoped>

</style>
