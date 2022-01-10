<template>
  <div class="temp">
    <div class="temp-tab">
      <div id="module-type-1" v-has="'expressionTemplate_view'" class="nz-tab-item-box" @click="templateSwitchTab('exprTemp')">
        <div class="nz-tab-item" :class="{'nz-tab-item-active': switchTab === 'exprTemp'}">{{$t("config.exprTemp.exprTemp")}}</div>
      </div>
      <div id="module-type-2" class="nz-tab-item-box" @click="templateSwitchTab('chartTemp')">
        <div class="nz-tab-item" :class="{'nz-tab-item-active': switchTab === 'chartTemp'}">{{$t("config.chartTemp.chartTemp")}}</div>
      </div>
    </div>
    <exprTemp class="template-tab" :switch-tab="switchTab" v-if="switchTab == 'exprTemp'"></exprTemp>
    <chartTemp class="template-tab" :switch-tab="switchTab" v-if="switchTab == 'chartTemp'"></chartTemp>
  </div>
</template>

<script>
import exprTemp from './exprTemp'
import chartTemp from './chartTemp'
import routerPathParams from '@/components/common/mixin/routerPathParams'
export default {
  name: 'v-template',
  components: {
    exprTemp,
    chartTemp
  },
  mixins: [routerPathParams],
  data () {
    return {
      switchTab: 'exprTemp',
      templateHasTab: '',
      templateHasTabExprTemp: ''
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
      const date = JSON.parse(localStorage.getItem('nz-user-permissions'))
      date.map(e => {
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
    this.templateHas()
    this.switchTab = this.$route.query.switchTab || this.templateHasTab
  }
}
</script>

<style scoped>
.template-tab{
  height: 100%;
}
</style>
