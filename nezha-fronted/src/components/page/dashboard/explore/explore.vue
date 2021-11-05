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
  methods: {
    split (index) {
      const tabIndex = this.exploreItems.indexOf(index)
      if (tabIndex > -1) {
        if (this.exploreItems.length === 2) {
          this.exploreItems.splice(tabIndex, 1)
        } else {
          this.exploreItems.push(index === 0 ? 1 : 0)
          if (!this.$refs.exploreItem[0].showMetrics) {
            this.$nextTick(()=>{
              this.$refs.exploreItem[1].selectMetricsLogs(this.$t('overall.logs'), 'nz-icon nz-icon-logs', 'Logs')
            })
          }
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

<style lang="scss">
.explores {
  display: flex;
  padding: 10px 0 10px 10px;
  background-color: #f6f6f6;
  box-sizing: border-box;

  .el-table--border::after, .el-table--group::after, .el-table::before {
    height: 0;
  }
}
</style>
