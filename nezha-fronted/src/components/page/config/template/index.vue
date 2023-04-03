<template>
  <div class="temp">
    <exprTemp class="template-tab" :switch-tab="switchTab" v-if="switchTab == 'exprTemp'"></exprTemp>
    <chartTemp class="template-tab" :switch-tab="switchTab" v-if="switchTab == 'chartTemp'"></chartTemp>
  </div>
</template>

<script>
import exprTemp from './exprTemp'
import chartTemp from './chartTemp'
import routerPathParams from '@/components/common/mixin/routerPathParams'
import store from '@/store'
export default {
  name: 'v-template',
  components: {
    exprTemp,
    chartTemp
  },
  mixins: [routerPathParams],
  data () {
    return {
      switchTab: '',
      templateHasTab: '',
      templateHasTabExprTemp: ''
    }
  },
  computed: {
    buttonList () {
      return this.$store.getters.buttonList
    }
  },
  methods: {
    templateSwitchTab (tab) {
      this.switchTab = tab
      if (tab !== 'browser') {
        this.updatePath({ tab })
      } else {
        const t = +new Date()
        this.updatePath({ t })
      }
    },
    templateHas () {
      this.buttonList.forEach(e => {
        if (e === 'expressionTemplate_view') {
          this.templateHasTabExprTemp = 'exprTemp'
          this.templateHasTab = this.templateHasTabExprTemp
        } else if (e === 'chartTemplate_view') {
          this.templateHasTabExprTemp = 'chartTemp'
          this.templateHasTab = this.templateHasTabExprTemp
        } else {
          this.templateHasTabExprTemp = 'exprTemp'
        }
      })
      if (this.templateHasTabExprTemp) {
        this.templateHasTab = this.templateHasTabExprTemp
      }
    }
  },
  created () {
  },
  mounted () {
    this.templateHas()
    this.switchTab = this.$route.query.switchTab || this.templateHasTab
  }
}
</script>

<style>
.temp .template-tab{
  height: 100%;
}
</style>
