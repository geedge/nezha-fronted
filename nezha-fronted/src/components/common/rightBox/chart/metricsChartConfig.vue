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
              <span>
                {{expressionName[index-1]}}
<!--                名称修改 暂未实现-->
              </span>
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
          <el-select id="chart-box-span"  v-model="chartConfig.span" :disabled="chartConfig.type === 'group'" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="chartSpan" @change="change">
            <el-option v-for="item in spanList" :key="item" :label="'span-' + item" :value="item">
              <span class="panel-dropdown-label-txt" > span-{{item}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!--height-->
        <el-form-item :label="$t('dashboard.panel.chartForm.high')" class="form-item--half-width"  prop="height">
          <!-- 由px改为span -->
          <el-select id="chart-box-height"  v-model="chartConfig.height" :disabled="chartConfig.type === 'group'" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="chartSpan" @change="change">
            <el-option v-for="item in spanList" :key="item" :label="'span-' + item" :value="item">
              <span class="panel-dropdown-label-txt" > span-{{item}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!--stack-->
        <el-form-item :label="$t('dashboard.panel.chartForm.stack')" class="form-item--half-width"  prop="height" v-if="isStackShow(chartConfig.type)">
          <el-select id="chart-box-height" v-model="chartConfig.param.stack" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="chartSpan" @change="change">
            <el-option :value="1" label="true">
            </el-option>
            <el-option :value="0" label="false">
            </el-option>
          </el-select>
        </el-form-item>

        <!--statistics-->
        <el-form-item v-if="isStatisticsShow(chartConfig.type)" :label="$t('dashboard.panel.chartForm.statistics')" class="form-item--half-width" prop="param.statistics">
          <el-select id="chart-box-statistics" v-model="chartConfig.param.statistics" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" @change="change, $forceUpdate()">
            <el-option v-for="item in statisticsList" :key="item.value" :label="$t(item.label)" :value="item.value">
              <span class="panel-dropdown-label-txt" >{{$t(item.label)}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!--   nullType     -->
        <el-form-item  :label='"Null value"' class="form-item--half-width"  prop="nullType">
          <el-select id="chart-box-nullType" v-model="chartConfig.param.nullType" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" @change="change, $forceUpdate()" >
            <el-option v-for="item in nullTypeList" :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div v-if="isShowLegend(chartConfig.type)">
        <!--legendConfig-->
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.legendConfig')}}</span>
          <el-switch v-model="chartConfig.param.legend.show" size="small" @change="change"></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <div v-if="chartConfig.param.legend.show" class="form-items--half-width-group">
            <el-form-item :label="$t('dashboard.panel.chartForm.legendPosition')" class="form-item--half-width"  prop="nullType">
              <el-select id="chart-box-legend-show" v-model="chartConfig.param.legend.placement" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" @change="change, $forceUpdate()">
                <el-option v-for="item in legendPositionList" :key="item.value" :label="$t(item.label)" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('dashboard.panel.chartForm.legendValues')" class="form-item--half-width"  prop="nullType">
              <el-select id="chart-box-legend-value" v-model="chartConfig.param.legend.values" multiple collapse-tags placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" @change="change, $forceUpdate()">
                <el-option v-for="item in statisticsList" :key="item.value" :label="$t(item.label)" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </transition>

        <!--thresholdConfig-->
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.threshold')}}</span>
          <el-switch v-model="chartConfig.param.thresholdShow" size="small" @change="thresholdShowChange"></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <el-row v-if="chartConfig.param.thresholdShow">
            <div v-for="(item,index) in chartConfig.param.thresholds" :key="index" class="thresholds-item">
              <nezhaColor :value-arr="[{name:'thresholds',value:item.color}]" :show-text="false" :color-val="item.color"
                          @colorChange="(color,key)=>{colorChange(color,key,index)}"/>
              <el-input-number size="small" placeholder="" v-model="item.value" :controls="false" @blur="sortThresholds" @change="change"/>
              <span @click="delThresholds(index)" class="del-thresholds-icon">
              <i class="nz-icon nz-icon-delete" />
            </span>
            </div>
            <div @click="addThresholds" class="thresholds-add">
              Add thresholds
            </div>
          </el-row>
        </transition>
      </div>
<!--      valueMapping  -->
      <div v-if="isShowValueMapping(chartConfig.type)">
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.valueMapping')}}</span>
          <el-switch v-model="chartConfig.param.valueMapping.show" size="small" @change="change"></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <el-row v-if="chartConfig.param.valueMapping.show">
            <div v-for="(item,index) in chartConfig.param.valueMapping.mapping" :key="index">
              <div class="chart-title chart-title-config">
                <span class="endpoint-title-content">
                  <i class="nz-icon nz-icon-arrow-down" :class="item.show?'':'is-active'" @click="showMapping(index)"></i>
                  123
                </span>
                <span>
                  <span @click="addMapping('')">
                      <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
                  </span>
                  <span class="nz-icon-copy">
                      <i @click="copyMapping(index)" class="nz-icon nz-icon-override"></i>
                  </span>
                  <span class="nz-icon-minus-medium">
                      <i @click="removeMapping(index)" class="nz-icon nz-icon-minus"></i>
                  </span>
                </span>
              </div>
              <transition-group appear tag="div" name="el-zoom-in-top">
                <el-row v-show="item.show" :key="1" class="thresholds-item">
                  <el-select v-model="item.type" size="small" style="width: 100px" @change="(val)=>{mappingItemChange(index,val)}">
                    <el-option v-for="item in mappingTypeList" :value="item.value" :label="item.label" :key="item.value"/>
                  </el-select>
                  <el-input-number :controls="false" v-if="item.type === 'value'" size="small" v-model="item.value" placeholder="value"></el-input-number>
                  <el-input-number :controls="false" v-if="item.type === 'range'" size="small" v-model="item.from" placeholder="from"></el-input-number>
                  <el-input-number :controls="false" v-if="item.type === 'range'" size="small" v-model="item.to" placeholder="to" style="margin-left: 10px"></el-input-number>
                  <el-input v-if="item.type === 'regx'" size="small" v-model="item.regx" placeholder="regx"></el-input>
                </el-row>
                <el-row v-show="item.show" :key="2" class="thresholds-item" style="position: relative">
                  <div class='mapping-display'>Display</div>
                  <el-input v-model="item.display"  style="margin-right: 10px" size="small"/>
                  <nezhaColor :color-val="item.color" :single="false" :value-arr="[{name:'bac',value:item.color.bac,key:'bac'},{name:'text',value:item.color.text,key:'text'}]" @colorChange="(val,key)=>{colorChange(index,key,val)}"/>
                </el-row>
              </transition-group>
            </div>
            <div @click="addMapping" class="thresholds-add">
              Add valueMapping
            </div>
          </el-row>
        </transition>
      </div>

<!--      table column-->
      <div v-if="isTable(chartConfig.type)">

      </div>
    </el-form>
  </div>
</template>

<script>
import promqlInput from '@/components/page/dashboard/explore/promqlInput'
import nezhaColor from '@/components/common/nezhaColor'
import promqlInputMixin from '@/components/common/mixin/promqlInput'
import publicConfig from '@/components/common/rightBox/chart/publicConfig'
export default {
  name: 'metricsChartConfig',
  props: {
    params: {}
  },
  components: {
    promqlInput,
    nezhaColor
  },
  mixins: [promqlInputMixin, publicConfig],
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
          id: 'point',
          name: this.$t('dashboard.panel.chartForm.typeVal.point.label')
        },
        {
          id: 'singleStat',
          name: this.$t('dashboard.panel.chartForm.typeVal.singleStat.label')
        },
        {
          id: 'bar',
          name: this.$t('dashboard.panel.chartForm.typeVal.bar.label')
        },
        {
          id: 'guage',
          name: this.$t('dashboard.panel.chartForm.typeVal.guage.label')
        },
        {
          id: 'treemap',
          name: this.$t('dashboard.panel.chartForm.typeVal.treemap.label')
        },
        {
          id: 'pie',
          name: this.$t('dashboard.panel.chartForm.typeVal.pie.label')
        },
        {
          id: 'table',
          name: this.$t('dashboard.panel.chartForm.typeVal.table.label')
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
    chartTypeChange (type) {
      switch (type) {
        case 'line':
        case 'stackArea':
        case 'point':
          this.chartConfig.param = {
            stack: 0,
            nullType: this.chartConfig.param.nullType,
            legend: { placement: 'bottom', values: [], show: true },
            thresholdShow: true,
            thresholds: []
          }
          this.$nextTick(() => {
            this.chartConfig.param.thresholds.push({ value: '', color: '#eeeeeeff' })
          })
          break
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          this.chartConfig.param = {
            nullType: this.chartConfig.param.nullType,
            statistics: 'last',
            valueMapping: {
              show: true,
              mapping: []
            }
          }
          break
        case 'table':
          this.chartConfig.param = {
            nullType: this.chartConfig.param.nullType,
            statistics: 'last',
            column: []
          }
          break
      }
      this.change()
    },
    sortThresholds () {
      if (this.param && this.param.thresholds.length > 1) {
        this.param.thresholds = this.chartConfig.param.thresholds.sort((a, b) => {
          const value1 = a.value
          const value2 = b.value
          return value1 - value2
        })
      }
      this.change()
    },
    thresholdShowChange () {
      // if (this.chartConfig.param.thresholdShow) {
      //
      // } else {
      //
      // }
      this.change()
    },
    addThresholds () {
      this.chartConfig.param.thresholds.push({
        value: '',
        color: '#eeeeeeff'
      })
      this.change()
    },
    delThresholds (index) {
      if (this.chartConfig.param.thresholds.length === 1) {
        return
      }
      this.chartConfig.param.thresholds.splice(index, 1)
      this.change()
    },
    isStackShow (type) {
      switch (type) {
        case 'line':
        case 'stackArea':
        case 'point':
          return true
        case 'table':
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return false
        default: return false
      }
    },
    isStatisticsShow (type) {
      switch (type) {
        case 'line':
        case 'stackArea':
        case 'point':
          return false
        case 'table':
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return true
        default: return false
      }
    },
    isShowLegend (type) {
      switch (type) {
        case 'line':
        case 'stackArea':
        case 'point':
          return true
        case 'table':
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return false
        default: return false
      }
    },
    isShowValueMapping (type) {
      switch (type) {
        case 'line':
        case 'stackArea':
        case 'point':
        case 'table':
          return false
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return true
        default: return false
      }
    },
    isTable (type) {
      switch (type) {
        case 'table':
          return true
        case 'line':
        case 'stackArea':
        case 'point':
        case 'singleStat':
        case 'bar':
        case 'treemap':
        case 'pie':
          return false
        default: return false
      }
    }
  },
  created () {
    this.init()
  }
}
</script>

<style scoped>

</style>
