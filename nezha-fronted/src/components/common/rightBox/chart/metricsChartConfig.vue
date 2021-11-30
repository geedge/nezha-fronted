<template>
  <div class="chart-config">
    <el-form ref="metricschartForm" :model="chartConfig" :rules="rules" label-position= "top" label-width="120px">
      <div v-if="chartConfig.elements">
          <el-row
          :key="'ele' + index" class="element-item form-row-item" style="" v-for="index of chartConfig.elements.length"
        >
          <div class="chart-title">
            <span class="endpoint-title-content">
              <i class="nz-icon nz-icon-arrow-down" :class="expressionsShow[index-1]?'':'is-active'" @click="showExpression(index)"></i>
            </span>
          </div>
          <transition name="el-zoom-in-top">
            <el-row v-show="expressionsShow[index-1]">
              <promql-input
                :from-father-data="true"
                :metricOptionsParent="metricOptions"
                :expression-list="expressions"
                :id="promqlKeys[index-1]"
                :index="index-1"
                :required = 'true'
                :type="promqlType"
                :key="promqlKeys[index-1]"
                :plugins="['metric-selector', 'metric-input', 'remove']"
                :ref="'promql-'+(index-1)"
                :showRemove="false"
                :styleType="2"
                @change="expressionChange"
                @removeExpression="removeExpression"
              ></promql-input>
              <el-row style="margin-top: 18px">
                <el-col class="legend-title">
                  <span class="legend-title__span">{{$t('dashboard.panel.chartForm.legend')}}&nbsp;</span>
                  <el-popover placement="top" trigger="hover" width="211" popper-class="prevent-clickoutside">
                    <div :style="{'word-break':language!=='cn'?'keep-all':'break-all'}">{{$t('dashboard.panel.chartForm.legendTip')}}</div>
                    <i @mouseover="rz" class="nz-icon nz-icon-info-normal" slot="reference" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                  </el-popover>
                </el-col>
                <el-col style="width: calc(100% - 160px);">
                  <el-input maxlength="512" show-word-limit size="small" type="text" v-model="legends[index-1]" ></el-input>
                </el-col>
              </el-row>
            </el-row>
          </transition>
        </el-row>
      </div>
    </el-form>
  </div>
</template>

<script>
import promqlInput from '@/components/page/dashboard/explore/promqlInput'
import promqlInputMixin from '@/components/common/mixin/promqlInput'
import { getUUID, resetZIndex } from '@/components/common/js/common'
const rz = {
  methods: {
    rz (e) {
      resetZIndex(e)
    }
  }
}
export default {
  name: 'metricsChartConfig',
  props: {
    params: {}
  },
  components: {
    promqlInput
  },
  mixins: [rz, promqlInputMixin],
  computed: {},
  data () {
    return {
      language: localStorage.getItem('nz-language'),
      chartConfig: {},
      rules: {},
      promqlType: 'metrics',
      promqlCount: 0,
      promqlKeys: [],
      elementIds: [],
      expressions: [],
      expressionsShow: [],
      legends: []
    }
  },
  methods: {
    init () {
      this.chartConfig = JSON.parse(JSON.stringify(this.params))
      // 重置相关属性
      this.promqlCount = 0
      this.promqlKeys = []
      this.elementIds = []
      this.expressions = []
      this.expressionsShow = []
      this.legends = []
      if (!this.chartConfig.elements.length) {
        this.addExpression()
      } else {
        this.chartConfig.elements.forEach(item => {
          this.addExpression(item)
        })
      }
    },
    expressionChange: function () {
      if (this.expressions[0]) {
        this.chartConfig.elements = []
        this.expressions.forEach((expr, i) => {
          this.chartConfig.elements.push({ id: this.elementIds[i], expression: expr, type: 'expert', legend: this.legends[i] })
        })
      } else {
        this.chartConfig.elements = []
      }
      this.change()
    },
    addExpression (item) {
      if (!item) {
        this.expressions.push('')
        this.legends.push('')
        this.promqlKeys.push(getUUID())
        this.elementIds.push('')
        this.expressionsShow.push(true)
        this.promqlCount++
        this.expressionChange()
      } else {
        this.expressions.push(item.expression)
        this.legends.push(item.legend)
        this.promqlKeys.push(getUUID())
        this.elementIds.push(item.id)
        this.expressionsShow.push(true)
        this.promqlCount++
      }
    },
    removeExpression (index) {
      if (this.promqlCount > 1) {
        this.expressions.splice(index, 1)
        this.legends.splice(index, 1)
        this.promqlKeys.splice(index, 1)
        this.expressionsShow.splice(index, 1)
        this.elementIds.splice(index, 1)
        this.promqlCount--
        this.$nextTick(() => {
          this.expressions.forEach((ex, index) => {
            if (ex) {
              this.$refs[`promql-${index}`][0].metricChange(ex)
            }
          })
        })
      }
    },
    copyExpression (index) {
      this.expressions.push(this.expressions[index])
      this.legends.push(this.legends[index])
      this.promqlKeys.push(getUUID())
      this.elementIds.push('')
      this.expressionsShow.push(true)
      this.promqlCount++
      this.$nextTick(() => {
        this.expressions.forEach((ex, index) => {
          if (ex) {
            this.$refs[`promql-${index}`][0].metricChange(ex)
          }
        })
      })
    },
    showExpression (index) {
      console.log(index, this.expressionsShow[index - 1])
      this.$set(this.expressionsShow, index - 1, !this.expressionsShow[index - 1])
    },
    change () {
      this.$nextTick(() => {
        this.$emit('change', this.chartConfig)
      })
    }
  },
  created () {
    this.init()
  }
}
</script>

<style scoped>

</style>
