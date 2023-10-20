<template>
  <div class="noteboook-chart-addWrap" :class="{'hasPop':beforePop||afterPop}">
    <!-- before -->
    <el-popover
      v-model="beforePop"
      ref="before"
      placement="bottom-end"
      trigger="click"
      popper-class="noteboook-pop"
      transition=''
      >
        <ul class="noteboook-pop-list">
          <li class="noteboook-pop-item" v-for="item in typeList" :key="item.name" @click="addNotebook({...item,position:{position:'before',id:chartInfo.id}})">
            <svg aria-hidden="true">
              <use :xlink:href="item.icon"></use>
            </svg>
            <span>{{item.name}}</span>
          </li>
        </ul>
    </el-popover>
    <el-tooltip
      v-model="afterTip"
      :content="$t('notebook.addchart')"
      effect="light"
      placement="top"
      popper-class="noteboook-tip"
      transition=''
      :enterable="false">
      <div class="noteboook-chart-add addBefore" v-popover:before>
        <i class="nz-icon nz-icon-plus" @click="showAdd"></i>
      </div>
    </el-tooltip>
    <!-- after -->
    <el-popover
      v-model="afterPop"
      ref="after"
      placement="bottom-end"
      trigger="click"
      popper-class="noteboook-pop"
      transition=''
      >
        <ul class="noteboook-pop-list">
          <li class="noteboook-pop-item" v-for="item in typeList" :key="item.name" @click="addNotebook({...item,position:{position:'after',id:chartInfo.id}})">
            <svg aria-hidden="true">
              <use :xlink:href="item.icon"></use>
            </svg>
            <span>{{item.name}}</span>
          </li>
        </ul>
    </el-popover>
    <el-tooltip
      v-model="beforeTip"
      :content="$t('notebook.addchart')"
      effect="light"
      placement="top"
      popper-class="noteboook-tip"
      transition=''
      :enterable="false">
      <div class="noteboook-chart-add addAfter" v-popover:after>
        <i class="nz-icon nz-icon-plus" @click="showAdd"></i>
      </div>
    </el-tooltip>
  </div>
</template>

<script>
import bus from '@/libs/bus'
export default {
  name: 'notebookAdd',
  props: {
    chartInfo: Object
  },
  data () {
    return {
      typeList: [
        { icon: '#nz-icon-text2', name: this.$t('dashboard.dashboard.chartForm.typeVal.text.label'), type: 'text', less: true, datasource: 'misc' },
        { icon: '#nz-icon-line_chart', name: this.$t('dashboard.dashboard.chartForm.typeVal.line.label'), type: 'line', less: true, datasource: 'metrics' },
        { icon: '#nz-icon-a-Areacharts', name: this.$t('dashboard.dashboard.chartForm.typeVal.stackArea.label'), type: 'area', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Point', name: this.$t('dashboard.dashboard.chartForm.typeVal.point.label'), type: 'point', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Stat', name: this.$t('dashboard.dashboard.chartForm.typeVal.singleStat.label'), type: 'stat', less: true, datasource: 'metrics' },
        { icon: '#nz-icon-hexagon', name: this.$t('dashboard.dashboard.chartForm.typeVal.hexagonFigure.label'), type: 'hexagon', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Bar_chart', name: this.$t('dashboard.dashboard.chartForm.typeVal.bar.label'), type: 'bar', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-a-Piechat', name: this.$t('dashboard.dashboard.chartForm.typeVal.pie.label'), type: 'pie', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-a-Doughnutchart', name: this.$t('dashboard.dashboard.chartForm.typeVal.doughnut.label'), type: 'doughnut', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-a-Rosechart', name: this.$t('dashboard.dashboard.chartForm.typeVal.rose.label'), type: 'rose', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Bubble', name: this.$t('dashboard.dashboard.chartForm.typeVal.bubble.label'), type: 'bubble', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-funnel1', name: this.$t('dashboard.dashboard.chartForm.typeVal.funnel.label'), type: 'funnel', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-rank1', name: this.$t('dashboard.dashboard.chartForm.typeVal.rank.label'), type: 'rank', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Sankey', name: this.$t('dashboard.dashboard.chartForm.typeVal.sankey.label'), type: 'sankey', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Guage', name: this.$t('dashboard.dashboard.chartForm.typeVal.gauge.label'), type: 'gauge', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Treemap', name: this.$t('dashboard.dashboard.chartForm.typeVal.treemap.label'), type: 'treemap', less: false, datasource: 'metrics' },
        { icon: '#nz-icon-Table', name: this.$t('dashboard.dashboard.chartForm.typeVal.table.label'), type: 'table', less: true, datasource: 'metrics' }
      ],
      beforeTip: false,
      afterTip: false,
      beforePop: false,
      afterPop: false
    }
  },
  methods: {
    showAdd () {
      this.beforeTip = false
      this.afterTip = false
    },
    addNotebook: bus.debounceFn(function (data) {
      this.beforePop = false
      this.afterPop = false
      bus.$emit('addNotebook', data)
    }, 100, true)
  }
}
</script>
