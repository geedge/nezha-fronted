<template>
  <div class="chart-config">
    <el-form ref="metricschartForm" :model="chartConfig" :rules="rules" label-position= "top" label-width="120px">
      <div v-if="chartConfig.elements">
          <el-row
          :key="'ele' + index" class="element-item form-row-item" style="" v-for="index of chartConfig.elements.length"
        >
          <div class="chart-title chart-title-config">
            <span class="endpoint-title-content">
              <i class="nz-icon nz-icon-arrow-down" :class="expressionsShow[index-1]?'':'is-active'" @click="showExpression(index)"></i>
            </span>
            <span>
              <span @click="addExpression('')">
                  <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
              </span>
              <span class="nz-icon-copy">
                  <i @click="copyExpression(index - 1)" class="nz-icon nz-icon-override"></i>
              </span>
              <span class="nz-icon-minus-medium">
                  <i @click="removeExpression(index - 1)" class="nz-icon nz-icon-minus"></i>
              </span>
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

      <!--title-->
      <div class="form__sub-title">
        <span>{{$t('dashboard.panel.chartForm.displayConfig')}}</span>
      </div>
      <div class="form-items--half-width-group">
        <!-- type -->
        <el-form-item :label="$t('dashboard.panel.chartForm.type')" class="form-item--half-width" prop="type">
          <el-select
            id="chart-box-type"
            v-model="chartConfig.type"
            :disabled="chartConfig.type==='group'&&chartConfig.children&&chartConfig.children.length"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            value-key="chartType"
            @change="chartTypeChange">
            <el-option v-for="item in chartTypeList" :key="item.id" :disabled=" item.id==='group' && chartConfig.isGroup" :label="item.name" :value="item.id">
              <span class="panel-dropdown-label-txt" >{{item.name}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- unit -->
        <el-form-item v-show="chartConfig.type !='text' && chartConfig.type !=='url'&& chartConfig.type !=='group'&& chartConfig.type !=='diagram'" :label="$t('dashboard.panel.chartForm.unit')" class="form-item--half-width" prop="unit">
          <el-cascader id="chart-box-unit" v-model="chartConfig.unit" :options="unitOptions" :props="{ expandTrigger: 'hover',emitPath:false }"  :show-all-levels="false" filterable
                       placeholder=""
                       popper-class="dc-dropdown right-box-select-top right-public-box-dropdown-top prevent-clickoutside chart-box-unit"
                       size="small"
                       style="width: 100%"
                       @change="unitSelected"
          >
          </el-cascader>
        </el-form-item>

        <!--width-->
        <el-form-item :label="$t('dashboard.panel.chartForm.width')" class="form-item--half-width" prop="span">
          <el-select id="chart-box-span"  v-model="chartConfig.span" :disabled="chartConfig.type === 'group'" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="chartSpan">
            <el-option v-for="item in spanList" :key="item" :label="'span-' + item" :value="item">
              <span class="panel-dropdown-label-txt" > span-{{item}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!--height-->
        <el-form-item :label="$t('dashboard.panel.chartForm.high')" class="form-item--half-width"  prop="height">
          <!-- 由px改为span -->
          <el-select id="chart-box-height"  v-model="chartConfig.height" :disabled="chartConfig.type === 'group'" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="chartSpan">
            <el-option v-for="item in spanList" :key="item" :label="'span-' + item" :value="item">
              <span class="panel-dropdown-label-txt" > span-{{item}}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import promqlInput from '@/components/page/dashboard/explore/promqlInput'
import promqlInputMixin from '@/components/common/mixin/promqlInput'
import { getUUID, resetZIndex } from '@/components/common/js/common'
import publicConfig from '@/components/common/rightBox/chart/publicConfig'
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
  mixins: [rz, promqlInputMixin, publicConfig],
  computed: {},
  data () {
    return {
      rules: {},
      promqlType: 'metrics',
      chartTypeList: [
        {
          id: 'line',
          name: this.$t('dashboard.panel.chartForm.typeVal.line.label')
        },
        {
          id: 'stackArea',
          name: this.$t('dashboard.panel.chartForm.typeVal.stackArea.label')
        },
        {
          id: 'bar',
          name: this.$t('dashboard.panel.chartForm.typeVal.bar.label')
        },
        {
          id: 'singleStat',
          name: this.$t('dashboard.panel.chartForm.typeVal.singleStat.label')
        },
        {
          id: 'pie',
          name: this.$t('dashboard.panel.chartForm.typeVal.pie.label')
        },
        {
          id: 'table',
          name: this.$t('dashboard.panel.chartForm.typeVal.table.label')
        },
        {
          id: 'alertList',
          name: this.$t('dashboard.panel.chartForm.typeVal.alertList.label')
        },
        {
          id: 'logs',
          name: this.$t('dashboard.panel.chartForm.typeVal.logs.label')
        },
        {
          id: 'text',
          name: this.$t('dashboard.panel.chartForm.typeVal.text.label')
        },
        {
          id: 'url',
          name: this.$t('dashboard.panel.chartForm.typeVal.url.label')
        },
        {
          id: 'diagram',
          name: this.$t('dashboard.panel.chartForm.typeVal.diagram.label')
        },
        {
          id: 'group',
          name: this.$t('dashboard.panel.chartForm.typeVal.group.label')
        }

      ]
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
      if (this.expressions.length) {
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
      console.log(item, 213213123)
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
        this.expressionChange()
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
      this.expressionChange()
    },
    showExpression (index) {
      console.log(index, this.expressionsShow[index - 1])
      this.$set(this.expressionsShow, index - 1, !this.expressionsShow[index - 1])
    },
    chartTypeChange () {

    },
    unitSelected: function (value) {
      // this.chartConfig.unit=value[value.length-1];
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
