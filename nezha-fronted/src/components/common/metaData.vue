<template>
 <div>
   <ul>
     <li><span class="metric-tip-list">metric&nbsp;:&nbsp;</span><span>{{metricTip ? metricTip : '--'}}</span></li>
   </ul>
   <ul v-for="(item,index) in metaDataList" :key="index">
     <li><span class="metric-tip-list">type&nbsp;:&nbsp;</span><span>{{item.type ? item.type : 'unknown'}}</span></li>
     <li><span class="metric-tip-list">help&nbsp;:&nbsp;</span><span>{{item.help ? item.help : '--'}}</span></li>
     <li><span class="metric-tip-list">unit&nbsp;:&nbsp;</span><span>{{item.unit ? item.unit : '--'}}</span></li>
   </ul>
 </div>
</template>

<script>
export default {
  name: 'metaData',
  props: {
    metaDataList: Array,
    metricTip: String
  },
  data () {
    return {}
  }
}
</script>
