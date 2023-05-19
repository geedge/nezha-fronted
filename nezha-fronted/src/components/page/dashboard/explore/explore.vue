<template>
  <div class="explores">
    <explore-item
      v-for="item in exploreItems"
      ref="exploreItem"
      :key="item"
      :closable="closable"
      :tab-index="item"
      :style="{width: exploreItems.length === 2 ? '50%' : ''}"
      @split="split"
    >
    </explore-item>
  </div>
</template>

<script>
import exploreItem from '@/components/page/dashboard/explore/exploreItem'
export default {
  name: 'explore',
  components: {
    exploreItem
  },
  data () {
    return {
      exploreItems: [0]
    }
  },
  computed: {
    closable () {
      return this.exploreItems.length === 2
    }
  },
  created () {
    const param = this.$route.query
    if (param.left && param.right) {
      this.exploreItems.push(1)
    }
  },
  methods: {
    split (index) {
      const tabIndex = this.exploreItems.indexOf(index)
      if (tabIndex > -1) {
        if (this.exploreItems.length === 2) { // 删除
          this.exploreItems.splice(tabIndex, 1)
          this.$nextTick(() => {
            this.$refs.exploreItem[0].updatePath()
          })
        } else { // 添加
          this.exploreItems.push(index === 0 ? 1 : 0)
          this.$nextTick(() => {
            if (!this.$refs.exploreItem[0].showMetrics) {
              this.$refs.exploreItem[1].selectMetricsLogs(this.$t('overall.logs'), 'nz-icon nz-icon-logs', 'Logs')
            }
            this.$refs.exploreItem[1].updatePath()
          })
        }
        this.$nextTick(() => {
          this.$refs.exploreItem.forEach(e => {
            const component = e.$refs.logDetail
            component && component.resizeChart()
          })
        })
      }
    }
  }
}
</script>
