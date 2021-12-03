<template>
  <div class="chart-config">
    <el-form
      ref="chartForm"
      :model="chartConfig"
      :rules="rules"
      label-position= "top"
      label-width="120px"
      @submit.native.prevent
    >
      <div
        v-if="chartConfig.elements"
        class="metrics-input-box"
      >
        <draggable v-model="chartConfig.elements"
                   :move="move"
                   @end="end"
                   @start="start"
                   :scroll-sensitivity="150"
                   :options="{
                 dragClass:'drag-chart-class',
                 fallbackClass:'fallback-class',
                 forceFallback:true,
                 ghostClass:'chart-ghost',
                 chosenClass:'choose-class',
                 scroll:true,
                 filter: '.drag-disabled',
                 animation: 150,
                 handle: '.chart-title-content'
               }"  >
        <el-row
          :key="index"
          class="element-item form-row-item thresholds-from-item"
          style=""
          v-for="index of chartConfig.elements.length"
        >
          <div class="chart-title chart-title-config">
            <span class="chart-title-content el-form-item" :class="{
              'is-error' : expressionsShow[index-1].error,
              'hide-input': expressionsShow[index-1].hideInput
            }">
              <i class="nz-icon nz-icon-arrow-down" :class="expressionsShow[index-1].show?'':'is-active'" @click.stop="showExpression(index)"></i>
              <el-input
                v-model="expressionName[index-1]"
                size="small"
                @input="(val)=>{expressionNameInput(val,index-1)}"
                @change="expressionNameChange(index-1)" style="width: 120px"
                @focus="showInput(index-1)"
              />
              <div v-if="expressionsShow[index-1].error"  class="el-form-item__error" style="top: 10px;left: 164px"> {{expressionsShow[index-1].error}}</div>
            </span>
            <span>
              <span @click="()=>{addExpression()}" style="margin-right: 5px;padding-left: 10px">
                  <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
              </span>
              <span @click="copyExpression(index - 1)" style="margin-right: 5px">
                  <i  class="nz-icon nz-icon-override"></i>
              </span>
              <span @click="removeExpression(index - 1)" class="nz-icon-minus-medium" style="margin-right: 5px">
                  <i  class="nz-icon nz-icon-minus"></i>
              </span>
            </span>
          </div>
          <transition name="el-zoom-in-top">
            <el-row v-show="expressionsShow[index-1].show">
              <el-form-item :prop="'elements.' + (index -1) + '.expression'"
                            :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}">
                <promql-input
                  :from-father-data="true"
                  :metricOptionsParent="metricOptions"
                  :expression-list="expressions"
                  :id="'promqlKeys' + [index-1]"
                  :index="index-1"
                  :required = 'true'
                  :type="promqlType"
                  :key="index-1"
                  :plugins="['metric-selector', 'metric-input', 'remove']"
                  :ref="'promql-'+(index-1)"
                  :showRemove="false"
                  :styleType="2"
                  @change="expressionChange"
                  @removeExpression="removeExpression"
                ></promql-input>
              </el-form-item>
              <el-row style="margin-top: 18px;display: flex">
                <el-col class="legend-title">
                  <span class="legend-title__span">{{$t('dashboard.panel.chartForm.legend')}}&nbsp;</span>
                  <el-popover placement="top" trigger="hover" width="211" popper-class="prevent-clickoutside">
                    <div :style="{'word-break':language!=='cn'?'keep-all':'break-all'}">{{$t('dashboard.panel.chartForm.legendTip')}}</div>
                    <i @mouseover="rz" class="nz-icon nz-icon-info-normal" slot="reference" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                  </el-popover>
                </el-col>
                <el-col style="flex: 1">
                  <el-input maxlength="512" show-word-limit size="small" type="text" v-model="expressionsShow[index-1].legend" ></el-input>
                </el-col>
              </el-row>
            </el-row>
          </transition>
        </el-row>
        </draggable>
      </div>

      <!--title-->
      <div class="form__sub-title" >
        <span>{{$t('dashboard.panel.chartForm.displayConfig')}}</span>
      </div>
      <div class="form-items--half-width-group">
        <!-- type -->
        <el-form-item
          :label="$t('dashboard.panel.chartForm.type')"
          class="form-item--half-width"
          prop="type"
        >
          <el-select
            id="chart-box-type"
            v-model="chartConfig.type"
            :disabled="chartConfig.type==='group'&&chartConfig.children&&chartConfig.children.length"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            value-key="chartType"
            @change="chartTypeChange">
            <el-option
              v-for="item in chartTypeList"
              :key="item.id"
              :disabled="
               item.id==='group' && chartConfig.isGroup"
              :label="item.name"
              :value="item.id">
              <span class="panel-dropdown-label-txt" >{{item.name}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- unit -->
        <el-form-item
          v-show="!isTable(chartConfig.type)&&!isLog(chartConfig.type)"
          :label="$t('dashboard.panel.chartForm.unit')"
          class="form-item--half-width"
          prop="unit"
        >
          <el-cascader id="chart-box-unit"
                       v-model="chartConfig.unit"
                       :options="unitOptions"
                       :props="{ expandTrigger: 'hover',emitPath:false }"
                       :show-all-levels="false" filterable
                       placeholder=""
                       popper-class="dc-dropdown right-box-select-top right-public-box-dropdown-top prevent-clickoutside chart-box-unit"
                       size="small"
                       style="width: 100%"
                       @change="unitSelected"
          >
          </el-cascader>
        </el-form-item>

        <!-- index -->
        <el-form-item
          v-show="isTable(chartConfig.type)"
          :label="$t('dashboard.panel.chartForm.tableIndex')"
          class="form-item--half-width"
          prop="param.index"
        >
          <vue-tags-input
            v-model="chartConfig.param.indexs"
            :maxlength="32"
            :placeholder="$t('overall.addParameter')"
            :tags="chartConfig.param.tags"
            @tags-changed="(newTags)=>{tagsChange(newTags)}"
          />
        </el-form-item>

        <!-- limit -->
        <el-form-item
          v-show="isLog(chartConfig.type)"
          :label="$t('dashboard.panel.chartForm.limit')"
          class="form-item--half-width"
          prop="param.limit">
          <el-input-number
            size="small"
            :placeholder="$t('placeholder.log.limit')"
            v-model="chartConfig.param.limit"
            :controls="false"
            @change="change"/>
        </el-form-item>

        <!--width-->
        <el-form-item
          :label="$t('dashboard.panel.chartForm.width')"
          class="form-item--half-width"
          prop="span">
          <el-select
            id="chart-box-span"
            v-model="chartConfig.span"
            :disabled="chartConfig.type === 'group'"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            value-key="chartSpan"
            @change="change"
          >
            <el-option
              v-for="item in spanList"
              :key="item"
              :label="'span-' + item"
              :value="item">
              <span class="panel-dropdown-label-txt" > span-{{item}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!--height-->
        <el-form-item
          :label="$t('dashboard.panel.chartForm.high')"
          class="form-item--half-width"
          prop="height">
          <!-- 由px改为span -->
          <el-select
            id="chart-box-height"
            v-model="chartConfig.height"
            :disabled="chartConfig.type === 'group'"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            value-key="chartSpan"
            @change="change"
          >
            <el-option
              v-for="item in spanList"
              :key="item"
              :label="'span-' + item"
              :value="item"
            >
              <span class="panel-dropdown-label-txt" > span-{{item}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!--stack-->
        <el-form-item
          :label="$t('dashboard.panel.chartForm.stack')"
          class="form-item--half-width"
          prop="param.stack"
          v-if="isStackShow(chartConfig.type)"
        >
          <el-select
            id="chart-box-height"
            v-model="chartConfig.param.stack"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            value-key="chartSpan"
            @change="change"
          >
            <el-option :value="1" label="true">
            </el-option>
            <el-option :value="0" label="false">
            </el-option>
          </el-select>
        </el-form-item>

        <!--statistics-->
        <el-form-item
          v-if="isStatisticsShow(chartConfig.type)"
          :label="$t('dashboard.panel.chartForm.statistics')"
          class="form-item--half-width"
          prop="param.statistics"
        >
          <el-select
            id="chart-box-statistics"
            v-model="chartConfig.param.statistics"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            @change="change, $forceUpdate()"
          >
            <el-option v-for="item in statisticsList" :key="item.value" :label="$t(item.label)" :value="item.value">
              <span class="panel-dropdown-label-txt" >{{$t(item.label)}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!--   nullType     -->
        <el-form-item
          :label='"Null value"'
          class="form-item--half-width"
          prop="param.nullType"
          v-if="!isLog(chartConfig.type)"
        >
          <el-select
            id="chart-box-nullType"
            v-model="chartConfig.param.nullType"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            @change="change, $forceUpdate()"
          >
            <el-option
              v-for="item in nullTypeList"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            ></el-option>
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
          <div
            v-if="chartConfig.param.legend.show"
            class="form-items--half-width-group"
          >
            <el-form-item
              :label="$t('dashboard.panel.chartForm.legendPosition')"
              class="form-item--half-width"
              prop="param.legend.placement"
            >
              <el-select
                id="chart-box-legend-show"
                v-model="chartConfig.param.legend.placement"
                placeholder=""
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change, $forceUpdate()"
              >
                <el-option
                  v-for="item in legendPositionList"
                  :key="item.value"
                  :label="$t(item.label)"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              :label="$t('dashboard.panel.chartForm.legendValues')"
              class="form-item--half-width"
              prop="param.legend.values"
            >
              <el-select
                id="chart-box-legend-value"
                v-model="chartConfig.param.legend.values"
                multiple
                collapse-tags
                :placeholder="$t('el.select.placeholder')"
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change, $forceUpdate()"
              >
                <el-option
                  v-for="item in statisticsList"
                  :key="item.value"
                  :label="$t(item.label)"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </transition>

        <!--thresholdConfig-->
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.threshold')}}</span>
          <el-switch
            v-model="chartConfig.param.thresholdShow"
            size="small"
            @change="thresholdShowChange"
          ></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <el-row v-if="chartConfig.param.thresholdShow">
            <el-form-item
              v-for="(item,index) in chartConfig.param.thresholds"
              :key="index"
              class="thresholds-item"
              :prop="'param.thresholds.' + index + '.value'"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
            >
              <nezhaColor
                :value-arr="[{name:'thresholds',value:item.color}]"
                :show-text="false"
                :color-val="item.color"
                @colorChange="(color,key)=>{colorChange(color,key,index)}"
              />
              <el-input-number
                size="small"
                style="margin-top: 3px"
                :placeholder="$t('placeholder.chart.threshold')"
                v-model="item.value"
                :controls="false"
                @blur="sortThresholds"
                @change="change"
              />
              <span
                @click="delThresholds(index)"
                class="del-thresholds-icon"
              >
              <i class="nz-icon nz-icon-delete" />
            </span>
            </el-form-item>
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
          <el-switch
            v-model="chartConfig.param.valueMapping.show"
            size="small"
            @change="change"
          ></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <el-row v-if="chartConfig.param.valueMapping.show">
            <div
              v-for="(item,index) in chartConfig.param.valueMapping.mapping"
              :key="index"
            >
              <div class="chart-title chart-title-config">
                <span class="chart-title-content">
                  <i class="nz-icon nz-icon-arrow-down" :class="item.show?'':'is-active'" @click="showMapping(index)"></i>
                  <span v-show="!item.show" class="title-content-left">
                    <span v-if="item.type === 'value'">
                      {{item.value}}
                    </span>
                    <span v-if="item.type === 'range'">
                      {{item.from}} -> {{item.to}}
                    </span>
                    <span v-if="item.type === 'regx'">
                      {{item.regx}}
                    </span>
                     <div :style="{background:item.color.bac}" class="prev-mapping-box">
                        <span :style="{color:item.color.text}">
                          {{item.display || "T"}}
                        </span>
                      </div>
                  </span>
                </span>
                <span>
                  <span @click="addMapping('')" style="margin-right: 5px">
                      <i class="nz-icon nz-icon-create-square"></i>
                  </span>
                  <span @click="copyMapping(index)" style="margin-right: 5px">
                      <i  class="nz-icon nz-icon-override"></i>
                  </span>
                  <span @click="removeMapping(index)" style="margin-right: 5px">
                      <i  class="nz-icon nz-icon-minus"></i>
                  </span>
                </span>
              </div>
              <transition-group appear tag="div" name="el-zoom-in-top">
                <el-row
                  v-show="item.show"
                  :key="1"
                  class="thresholds-item"
                >
                  <div>
                    <el-select
                      v-model="item.type"
                      size="small"
                      style="width: 100px"
                      @change="(val)=>{mappingItemChange(index,val)}"
                    >
                      <el-option
                        v-for="item in mappingTypeList"
                        :value="item.value"
                        :label="item.label"
                        :key="item.value"/>
                    </el-select>
                  </div>
                  <el-form-item
                    v-if="item.type === 'value'"
                    :prop="'param.valueMapping.mapping.' + index + 'value'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
                    class="thresholds-from-item"
                  >
                    <el-input-number
                      :controls="false"
                      size="small"
                      v-model="item.value"
                      placeholder="value"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item
                    v-if="item.type === 'range'"
                    :prop="'param.valueMapping.mapping.' + index + 'from'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
                    class="thresholds-from-item"
                  >
                    <el-input-number
                      :controls="false"
                      size="small"
                      v-model="item.from"
                      placeholder="from"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item
                    v-if="item.type === 'range'"
                    :prop="'param.valueMapping.mapping.' + index + 'to'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
                    class="thresholds-from-item"
                  >
                    <el-input-number
                      :controls="false"
                      size="small"
                      v-model="item.to"
                      placeholder="to"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item
                    v-if="item.type === 'regx'"
                    :prop="'param.valueMapping.mapping.' + index + 'regx'"
                    :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
                    class="thresholds-from-item"
                  >
                    <el-input
                      size="small"
                      v-model="item.regx"
                      placeholder="regx"
                    ></el-input>
                  </el-form-item>
                </el-row>
                <el-row v-show="item.show" :key="2" class="thresholds-item">
                  <div>
                    <div class='mapping-display'>Display</div>
                  </div>
                  <el-form-item :prop="'param.valueMapping.mapping.' + index + 'display'" :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}" class="thresholds-from-item">
                    <el-input v-model="item.display"  style="margin-right: 10px" :placeholder="$t('placeholder.chart.display')" size="small"/>
                  </el-form-item>
                  <nezhaColor :color-val="item.color" :single="false" :value-arr="[{name:'bac',value:item.color.bac,key:'bac'},{name:'text',value:item.color.text,key:'text'}]" @colorChange="(val,key)=>{colorChange(val, key, index)}"/>
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
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.valueMapping')}}</span>
        </div>
        <div v-for="(item,index) in chartConfig.param.columns" :key="index">
          <div class="chart-title chart-title-config">
                <span class="chart-title-content">
                  <i class="nz-icon nz-icon-arrow-down" :class="item.show?'':'is-active'" @click="showColumns(index)"></i>
                  <span v-show="!item.show" class="title-content-left">
                    <span>
                      {{item.value}}
                    </span>
                  </span>
                </span>
            <span>
                  <span @click="addColumns('')">
                      <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
                  </span>
                  <span class="nz-icon-copy">
                      <i @click="copyColumns(index)" class="nz-icon nz-icon-override"></i>
                  </span>
                  <span class="nz-icon-minus-medium">
                      <i @click="removeColumns(index)" class="nz-icon nz-icon-minus"></i>
                  </span>
                </span>
          </div>
          <transition-group appear tag="div" name="el-zoom-in-top">
            <el-row class="thresholds-item" v-show="item.show" :key="1">
              <div>
                <div class='mapping-display'>Title</div>
              </div>
              <el-form-item :prop="'param.columns.' + index + 'title'" :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}" class="thresholds-from-item">
                <el-input size="small" v-model="item.title" placeholder="regx"></el-input>
              </el-form-item>
              <div>
                <div class='mapping-display'>Unit</div>
              </div>
              <el-cascader :id="'columns-unit' + index" v-model="item.unit" :options="unitOptions" :props="{ expandTrigger: 'hover',emitPath:false }"  :show-all-levels="false" filterable
                           placeholder=""
                           popper-class="dc-dropdown right-box-select-top right-public-box-dropdown-top prevent-clickoutside chart-box-unit"
                           size="small"
                           style="width: 100%"
                           @change="unitSelected"
              >
              </el-cascader>
            </el-row>
            <el-row class="thresholds-item" v-show="item.show" :key="2">
              <div>
                <div class='mapping-display'>Display</div>
              </div>
              <el-form-item :prop="'param.columns.' + index + 'display'" :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}" class="thresholds-from-item">
                <el-input v-model="item.display"  style="margin-right: 10px" size="small"/>
              </el-form-item>
            </el-row>
          </transition-group>
        </div>
        <div @click="addColumns" class="thresholds-add">
          Add Colums
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import promqlInput from '@/components/page/dashboard/explore/promqlInput'
import nezhaColor from '@/components/common/nezhaColor'
import promqlInputMixin from '@/components/common/mixin/promqlInput'
import publicConfig from '@/components/common/rightBox/chart/publicConfig'
import chartTypeShow from '@/components/common/rightBox/chart/chartTypeShow'
import VueTagsInput from '@johmun/vue-tags-input'
import draggable from 'vuedraggable'
export default {
  name: 'chartConfig',
  components: {
    promqlInput,
    nezhaColor,
    VueTagsInput,
    draggable
  },
  props: {
    type: {
      type: String,
      default: 'metrics'
    }
  },
  watch: {
    type: {
      immediate: true,
      handler (n) {
        this.beforeInit()
      }
    }
  },
  mixins: [promqlInputMixin, publicConfig, chartTypeShow],
  computed: {},
  data () {
    return {
      rules: {
      },
      promqlType: 'log',
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
          id: 'log',
          name: this.$t('dashboard.panel.chartForm.typeVal.log.label')
        },
        {
          id: 'table',
          name: this.$t('dashboard.panel.chartForm.typeVal.table.label')
        }

      ]
    }
  },
  methods: {
    beforeInit () {
      this.promqlType = this.type
      this.chartTypeList = this[this.type + 'ChartTypeList']
    },
    init () {
      this.chartConfig = JSON.parse(JSON.stringify(this.params))
      // 重置相关属性
      this.expressions = []
      this.expressionsShow = []
      this.expressionName = []
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
            this.chartConfig.param.thresholds.push({ value: undefined, color: '#eeeeeeff' })
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
            columns: [],
            tags: [],
            indexs: ''
          }
          break
        case 'log':
          this.chartConfig.param = {
            limit: 100
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
        value: undefined,
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
    move () {

    },
    end (event) {
      this.expressions = []
      this.expressionsShow = []
      this.expressionName = []
      if (!this.chartConfig.elements.length) {
        this.addExpression()
      } else {
        this.chartConfig.elements.forEach(item => {
          this.addExpression(item)
        })
      }
      this.change()
    },
    start () {

    }
  },
  created () {
    this.init()
  }
}
</script>

<style scoped>

</style>
