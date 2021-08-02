<template>
  <div class="explores">
    <explore-item
      v-for="item in exploreItems"
      :key="item"
      :closable="closable"
      :tab-index="item"
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
        }
      }
    }
  }
}
</script>

<style scoped>
.explores {
  display: flex;
  padding: 10px 0 10px 10px;
  background-color: #f6f6f6;
  box-sizing: border-box;
}
</style>
