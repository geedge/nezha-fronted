<template>
 <div>
   <ul>
     <li><span class="metric-tip-list">metric&nbsp;:&nbsp;</span><span>{{metaName ? metaName : '--'}}</span></li>
     <li><span class="metric-tip-list">help&nbsp;:&nbsp;</span><span>{{metricList.help}}</span></li>
     <li><span class="metric-tip-list">type&nbsp;:&nbsp;</span><span>{{metricList.type}}</span></li>
     <li><span class="metric-tip-list">unit&nbsp;:&nbsp;</span><span>{{metricList.unit}}</span></li>
   </ul>
 </div>
</template>

<script>
export default {
  name: 'metaData',
  props: {
    metaDataList: Array,
    metaName: String
  },
  data () {
    return {
      metricList: {}
    }
  },
  watch: {
    metaDataList: {
      deep: true,
      handler (n) {
        if (n) {
          this.metricList = n[0]
        }
      }
    }
  }
}
</script>
