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
        <draggable
          v-model="chartConfig.elements"
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
            handle: '.drag-sort'
          }">
        <el-row
          class="element-item form-row-item thresholds-from-item"
          style="margin-bottom: 10px !important"
          v-for="index of chartConfig.elements.length"
          :key="expressionName[index-1] + index"
        >
          <div class="chart-title chart-title-config">
            <span class="chart-title-content el-form-item" :class="{
              'is-error' : expressionsShow[index-1].error,
              'hide-input': expressionsShow[index-1].hideInput
            }">
              <i class="nz-icon nz-icon-arrow-down" :class="expressionsShow[index-1].show?'':'is-active'" @click.stop="showExpression(index)"></i>
              <el-input
                style="width: 120px"
                @mousedown.stop
                v-model="expressionName[index-1]"
                size="small"
                @input="(val)=>{expressionNameInput(val,index-1)}"
                @change="expressionNameChange(index-1)"
                @focus.stop="showInput(index-1,false)"
                @blur="showInput(index-1,true)"
              />
              <div v-if="expressionsShow[index-1].error"  class="el-form-item__error" style="top: 10px;left: 164px"> {{expressionsShow[index-1].error}}</div>
            </span>
            <span>
              <!-- 显示隐藏 -->
              <span v-if="expressionsShow[index-1].state === 1" @click="()=>{switchExpression(index - 1,1)}" :title="$t('overall.visible')" style="margin-right: 5px;padding-left: 10px">
                <i class="nz-icon nz-icon-mimakejian"></i>
              </span>
              <span v-else @click="()=>{switchExpression(index - 1,0)}" :title="$t('overall.invisible')" style="margin-right: 5px;padding-left: 10px">
                <i class="nz-icon nz-icon-mimabukejian"></i>
              </span>
              <span @click="()=>{addExpression()}" style="margin-right: 5px" :title="$t('tip.add')">
                <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
              </span>
              <span @click="copyExpression(index - 1)" style="margin-right: 5px" :title="$t('overall.duplicate')">
                <i class="nz-icon nz-icon-override"></i>
              </span>
              <span @click="removeExpression(index - 1)" class="nz-icon-minus-medium" style="margin-right: 5px" :title="$t('overall.delete')">
                <i class="nz-icon nz-icon-minus"></i>
              </span>
              <span style="margin-right: 5px;fontSize:17px;cursor: grab;" class="drag-sort" :title="$t('dashboard.dashboard.chartForm.sort')">
                <i class="nz-icon nz-icon-sort" style="cursor: grab;"></i>
              </span>
            </span>
          </div>
          <transition name="el-zoom-in-top">
            <el-row v-show="expressionsShow[index-1].show">
              <el-form-item :prop="'elements.' + (index -1) + '.expression'" :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}">
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
                  <span class="legend-title__span">{{$t('dashboard.dashboard.chartForm.legend')}}&nbsp;</span>
                  <el-popover placement="top" trigger="hover" width="211" popper-class="prevent-clickoutside">
                    <div style="white-space: normal" :style="{'word-break':language!=='zh'?'keep-all':'break-all'}">{{$t('dashboard.dashboard.chartForm.legendTip')}}</div>
                    <!-- <div :style="{'word-break':language!=='cn'?'keep-all':'break-all'}">{{$t('dashboard.dashboard.chartForm.legendTip')}}</div> -->
                    <i @mouseover="rz" class="nz-icon nz-icon-info-normal" slot="reference" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                  </el-popover>
                </el-col>
                <el-col style="flex: 1">
                  <el-input maxlength="512" show-word-limit size="small" type="text" v-model="expressionsShow[index-1].legend" @change="expressionChange"></el-input>
                </el-col>
              </el-row>
            </el-row>
          </transition>
        </el-row>
        </draggable>
      </div>

      <!--title-->
      <div class="form__sub-title" >
        <span>{{$t('dashboard.dashboard.chartForm.displayConfig')}}</span>
      </div>
      <div class="form-items--half-width-group">
        <!-- type -->
        <el-form-item
          :label="$t('overall.type')"
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
              :disabled="item.id==='group' && chartConfig.isGroup"
              :label="item.name"
              :value="item.id">
              <span class="panel-dropdown-label-txt" >{{item.name}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- unit -->
        <el-form-item
          v-show="!isTable(chartConfig.type)&&!isLog(chartConfig.type)"
          :label="$t('dashboard.dashboard.chartForm.unit')"
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
          :label="$t('dashboard.dashboard.chartForm.tableIndex')"
          class="form-item--half-width"
          prop="param.index"
        >
          <vue-tags-input
            v-model="tag"
            :maxlength="32"
            :placeholder="$t('overall.addParameter')"
            :tags="chartConfig.param.tags"
            @tags-changed="(newTags)=>{tagsChange(newTags)}"
          />
        </el-form-item>

        <!-- limit -->
        <el-form-item
          v-show="isLog(chartConfig.type)"
          :label="$t('overall.limit')"
          class="form-item--half-width"
          prop="param.limit">
          <el-input-number
            size="small"
            :placeholder="$t('placeholder.log.limit')"
            v-model.number="chartConfig.param.limit"
            :controls="false"
            @change="change"/>
        </el-form-item>

        <!--width-->
        <el-form-item
          :label="$t('dashboard.dashboard.chartForm.width')"
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
          :label="$t('dashboard.dashboard.chartForm.high')"
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
          :label="$t('dashboard.dashboard.chartForm.stack')"
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
          :label="$t('dashboard.dashboard.chartForm.statistics')"
          class="form-item--half-width"
          prop="param.statistics"
        >
          <el-select
            id="chart-box-statistics"
            v-model="chartConfig.param.statistics"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            @change="change"
          >
            <el-option v-for="item in statisticsList" :key="item.value" :label="$t(item.label)" :value="item.value">
              <span class="panel-dropdown-label-txt" >{{$t(item.label)}}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!--   nullType     -->
        <el-form-item
          :label="$t('dashboard.dashboard.chartForm.nullType')"
          class="form-item--half-width"
          prop="param.nullType"
          v-if="isShowNullType(chartConfig.type)"
        >
          <el-select
            id="chart-box-nullType"
            v-model="chartConfig.param.nullType"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            @change="change"
          >
            <el-option
              v-for="item in nullTypeList"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- text -->
        <el-form-item
          :label="$t('config.assetLabel.display')"
          class="form-item--half-width"
          prop="param.text"
          v-if="isShowText(chartConfig.type)"
        >
          <el-select
            id="chart-box-text"
            v-model="chartConfig.param.text"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            @change="change"
          >
            <el-option
              v-for="item in textList"
              :key="item.value"
              :label="$t(item.label)"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div class="form-items--half-width-group" v-if="isShowMinMax(chartConfig.type)">
        <!--min-->
        <el-form-item :label="$t('dashboard.dashboard.chartForm.min')" class="form-item--half-width">
          <el-input-number
            size="small"
            style="margin-top: 2px"
            :controls="false"
            @change="change"
            show-word-limit
            :placeholder="chartConfig.param.min?'':'Auto'"
            v-model="chartConfig.param.min"/>
        </el-form-item>
        <!--max-->
        <el-form-item :label="$t('dashboard.dashboard.chartForm.max')" class="form-item--half-width">
          <el-input-number
            size="small"
            style="margin-top: 2px"
            :controls="false"
            @change="change"
            show-word-limit
            :placeholder="chartConfig.param.max?'':'Auto'"
            v-model="chartConfig.param.max"/>
        </el-form-item>
      </div>

      <div class="form-items--half-width-group" v-if="isSankey(chartConfig.type)" key="sankey">
        <!--Source label-->
        <el-form-item class="form-item--half-width" :label="$t('dashboard.dashboard.chartForm.sourceLabel')" prop="param.sourceLabel"
          :rules="[
            { required: true, message: $t('validate.required'), trigger: 'blur'},
            { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: $t('dashboard.dashboard.matchRegex'), trigger: 'blur'},
            { validator: labelValidator,trigger: 'blur'},
          ]"
        >
          <el-input
            size="small"
            style="margin-top: 2px"
            :placeholder="$t('overall.placeHolder')"
            @change="change"
            v-model="chartConfig.param.sourceLabel"/>
        </el-form-item>
        <!--Target label-->
        <el-form-item class="form-item--half-width" :label="$t('dashboard.dashboard.chartForm.targetLabel')" prop="param.targetLabel"
          :rules="[
            { required: true, message: $t('validate.required'), trigger: 'blur'},
            { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: $t('dashboard.dashboard.matchRegex'), trigger: 'blur'},
            { validator: labelValidator,trigger: 'blur'},
          ]"
        >
          <el-input
            size="small"
            style="margin-top: 2px"
            :placeholder="$t('overall.placeHolder')"
            @change="change"
            v-model="chartConfig.param.targetLabel"/>
        </el-form-item>
      </div>

      <div class="form-items--half-width-group">
        <!--decimals-->
        <el-form-item :label="$t('overall.decimal')" class="form-item--half-width" v-if="isShowDecimals(chartConfig.type)">
          <el-input-number
            size="small"
            style="margin-top: 2px"
            :controls="false"
            @change="change"
            :placeholder="'Default 2'"
            show-word-limit v-model="chartConfig.param.decimals"/>
        </el-form-item>
        <!-- Sparkline mode -->
        <el-form-item :label="$t('dashboard.chartForm.sparklineMode')" class="form-item--half-width" v-if="isStat(chartConfig.type)">
          <el-select
            v-model="chartConfig.param.sparklineMode"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            @change="change"
          >
            <el-option
              v-for="item in sparklineTypeList"
              :key="item.value"
              :label="$t(item.name)"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>

      <div class="form-items--half-width-group">
        <!-- comparison -->
        <el-form-item :label="$t('dashboard.chartForm.comparison')" class="form-item--half-width" v-if="isStat(chartConfig.type)">
          <el-select
            v-model="chartConfig.param.comparison"
            placeholder=""
            popper-class="right-box-select-top prevent-clickoutside"
            size="small"
            @change="change"
          >
            <el-option
              v-for="item in comparisonTypeList"
              :key="item.value"
              :label="$t(item.name)"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>

      <!-- option  -->
      <div v-if="isTimeSeries(chartConfig.type)">
        <div class="form__sub-title">
          <span>{{$t('dashboard.dashboard.chartForm.option')}}</span>
        </div>
        <div
          class="form-items--half-width-group"
        >
          <!--lineWidth-->
          <el-form-item
            v-if="chartConfig.type!=='point'"
            :label="$t('dashboard.dashboard.chartForm.lineWidth')"
            class="form-item--half-width"
            prop="param.option.lineWidth"
            >
            <el-input-number
              size="small"
              :controls="false"
              @change="change"
              show-word-limit
              v-model="chartConfig.param.option.lineWidth"/>
          </el-form-item>
          <!--pointSize-->
          <el-form-item
            :label="$t('dashboard.dashboard.chartForm.pointSize')"
            class="form-item--half-width"
            prop="param.option.pointSize"
            >
            <el-input-number
              size="small"
              :controls="false"
              @change="change"
              show-word-limit
              v-model="chartConfig.param.option.pointSize"/>
          </el-form-item>
        </div>
      </div>

      <!-- Right Y Axis   -->
      <div v-if="isTimeSeries(chartConfig.type)">
        <div class="form__sub-title">
          <span>{{$t('dashboard.dashboard.chartForm.rightYAxis')}}</span>
          <el-switch
            v-model="chartConfig.param.enable.rightYAxis"
            size="small"
            @change="change"
          ></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <div
            v-if="chartConfig.param.enable.rightYAxis"
            class="form-items--half-width-group"
          >
          <!-- Data Source -->
            <el-form-item
              :label="$t('dashboard.dashboard.chartForm.datasource')"
              class="form-item--half-width"
              prop="param.rightYAxis.elementNames"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}"
            >
              <el-select
                v-model="chartConfig.param.rightYAxis.elementNames"
                multiple
                collapse-tags
                placeholder=""
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change"
              >
                <el-option
                  v-for="item in chartConfig.elements"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                  >
                </el-option>
              </el-select>
            </el-form-item>
            <!-- type -->
            <el-form-item
              :label="$t('overall.type')"
              class="form-item--half-width"
              prop="param.rightYAxis.style"
            >
              <el-select
                v-model="chartConfig.param.rightYAxis.style"
                placeholder=""
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change"
              >
                <el-option
                  v-for="item in timeSeriesTypeList"
                  :key="item.value"
                  :label="$t(item.name)"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- unit -->
            <el-form-item
              :label="$t('dashboard.dashboard.chartForm.unit')"
              class="form-item--half-width"
              prop="param.rightYAxis.unit"
            >
              <el-cascader
                v-model="chartConfig.param.rightYAxis.unit"
                :options="unitOptions"
                :props="{ expandTrigger: 'hover',emitPath:false }"
                :show-all-levels="false"
                filterable
                popper-class="dc-dropdown right-box-select-top right-public-box-dropdown-top prevent-clickoutside chart-box-unit"
                size="small"
                style="width: 100%"
                @change="unitSelected"
              >
              </el-cascader>
            </el-form-item>
            <!-- label -->
            <el-form-item
              :label="$t('alert.list.labels')"
              class="form-item--half-width"
              prop="param.rightYAxis.label"
            >
              <el-input
                size="small"
                v-model="chartConfig.param.rightYAxis.label"
                placeholder=""
                @change="change"
              ></el-input>
            </el-form-item>
            <!--min-->
            <el-form-item
              :label="$t('dashboard.dashboard.chartForm.min')"
              class="form-item--half-width"
              prop="param.rightYAxis.min"
              >
              <el-input-number
                size="small"
                style="margin-top: 2px"
                :controls="false"
                @change="change"
                show-word-limit
                :placeholder="chartConfig.param.rightYAxis.min?'':'Auto'"
                v-model="chartConfig.param.rightYAxis.min"/>
            </el-form-item>
            <!--max-->
            <el-form-item
              :label="$t('dashboard.dashboard.chartForm.max')"
              class="form-item--half-width"
              prop="param.rightYAxis.max"
              >
              <el-input-number
                size="small"
                style="margin-top: 2px"
                :controls="false"
                @change="change"
                show-word-limit
                :placeholder="chartConfig.param.rightYAxis.max?'':'Auto'"
                v-model="chartConfig.param.rightYAxis.max"/>
            </el-form-item>
          </div>
        </transition>
      </div>

      <div v-if="isShowLegend(chartConfig.type)">
        <!--legendConfig-->
        <div class="form__sub-title">
          <span>{{$t('dashboard.dashboard.chartForm.legend')}}</span>
          <el-switch v-model="chartConfig.param.enable.legend" size="small" @change="change"></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <div
            v-if="chartConfig.param.enable.legend"
            class="form-items--half-width-group"
          >
            <el-form-item
              :label="$t('dashboard.dashboard.chartForm.legendPosition')"
              class="form-item--half-width"
              prop="param.legend.placement"
            >
              <el-select
                id="chart-box-legend-show"
                v-model="chartConfig.param.legend.placement"
                placeholder=""
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change"
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
              :label="$t('dashboard.dashboard.chartForm.legendValues')"
              class="form-item--half-width"
              prop="param.legend.values"
              v-if="isShowLegendVlaues(chartConfig.type)"
            >
              <el-select
                id="chart-box-legend-value"
                v-model="chartConfig.param.legend.values"
                multiple
                collapse-tags
                :placeholder="$t('el.select.placeholder')"
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change"
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
        <div class="form__sub-title" v-if="isThresholdConfig(chartConfig.type)">
          <span>{{$t('dashboard.dashboard.chartForm.thresholds')}}</span>
          <el-switch
            v-model="chartConfig.param.enable.thresholds"
            size="small"
            @change="thresholdShowChange"
          ></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <el-row v-if="chartConfig.param.enable.thresholds && isThresholdConfig(chartConfig.type)">
            <el-form-item
              v-for="(item,index) in chartConfig.param.thresholds"
              :key="item.id + '' + index"
              class="thresholds-item"
              :prop="'param.thresholds.' + index + '.value'"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
            >
              <nezhaColor
                :value-arr="[{name:'thresholds',value:item.color}]"
                :show-text="false"
                :color-val="item.color"
                @colorChange="(color,key)=>{colorChange(color,key,index)}"
              />
              <el-input-number
                size="small"
                style="margin-top: 2px"
                :placeholder="$t('placeholder.chart.threshold')"
                v-model.number="item.value"
                :controls="false"
                @blur="sortThresholds"
                @change="change"
              />
              <span
                @click="delThresholds(index)"
                class="del-thresholds-icon"
                :title="$t('overall.delete')"
              >
              <i class="nz-icon nz-icon-delete" />
            </span>
            </el-form-item>
            <div @click="addThresholds" class="thresholds-add">
             {{$t('overall.addThresholds')}}
            </div>
          </el-row>
        </transition>
      </div>

      <!--      table column-->
      <div v-if="isTable(chartConfig.type)">
        <div class="form__sub-title">
          <span>{{$t('dashboard.dashboard.chartForm.columns')}}</span>
        </div>
        <draggable
          v-model="chartConfig.param.columns"
          @end="change"
          :scroll-sensitivity="150"
          :options="{
          dragClass:'drag-columns-class',
          fallbackClass:'fallback-class',
          forceFallback:true,
          ghostClass:'chart-ghost',
          chosenClass:'choose-class',
          scroll:true,
          filter: '.drag-disabled',
          animation: 150,
          handle: '.drag-sort'
        }">
          <div v-for="(item,index) in chartConfig.param.columns" :key="index" :class="item.error? 'is-item-box-error' : ''">
            <div class="chart-title chart-title-config">
              <span class="chart-title-content">
                <i class="nz-icon nz-icon-arrow-down" :class="item.show?'':'is-active'" @click="showColumns(index)"></i>
                <span v-show="!item.show" class="title-content-left">
                  <span>
                    {{item.title}}
                  </span>
                </span>
              </span>
              <span>
                <span @click="addColumns('')" :title="$t('tip.add')">
                  <i class="nz-icon nz-icon-create-square" style="font-weight: normal; font-size: 17px; cursor: pointer;"></i>
                </span>
                <span style="margin-right: 5px" :title="$t('overall.duplicate')">
                  <i @click="copyColumns(index)" class="nz-icon nz-icon-override"></i>
                </span>
                <span style="margin-right: 5px" class="nz-icon-minus-medium" :title="$t('overall.delete')">
                  <i @click="removeColumns(index)" class="nz-icon nz-icon-minus"></i>
                </span>
                <span style="margin-right: 5px;fontSize:17px;cursor: grab;" class="drag-sort" :title="$t('dashboard.dashboard.chartForm.sort')">
                  <i class="nz-icon nz-icon-sort" style="cursor: grab;"></i>
                </span>
              </span>
            </div>
            <transition-group appear tag="div" name="el-zoom-in-top">
              <el-row class="thresholds-item" v-show="item.show" :key="1">
                <div>
                  <div class='mapping-display'>{{$t('project.topology.title')}}</div>
                </div>
                <el-form-item :prop="'param.columns.' + index + '.title'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" class="thresholds-from-item" style="flex: 1">
                  <el-input size="small" v-model="item.title" @change="change('columns',index)"></el-input>
                </el-form-item>
                <div>
                  <div class='mapping-display'>{{$t('dashboard.dashboard.chartForm.unit')}}</div>
                </div>
                <el-cascader :id="'columns-unit' + index" v-model="item.unit" :options="unitOptions" :props="{ expandTrigger: 'hover',emitPath:false }"  :show-all-levels="false" filterable
                  placeholder=""
                  popper-class="dc-dropdown right-box-select-top right-public-box-dropdown-top prevent-clickoutside chart-box-unit"
                  size="small"
                  style="flex: 1"
                  @change="unitSelected"
                >
                </el-cascader>
              </el-row>
              <el-row class="thresholds-item" v-show="item.show" :key="2">
                <div>
                  <div class='mapping-display'>
                    <span>{{$t('config.assetLabel.display')}}</span>
                    <el-popover placement="top" trigger="hover" popper-class="prevent-clickoutside">
                      <div class="columns-dispaly-pop" style="width:396px">
                        <div class="columns-dispaly-title" v-pre>{{&lt;expression name&gt;.$labels.&lt;label name&gt;}}</div>
                        <div class="columns-dispaly-msg">{{$t('tip.expressionLabel')}}{{$t('tip.$labels')}}</div>
                        <div class="columns-dispaly-title" v-pre>{{&lt;expression name&gt;.$value}}</div>
                        <div class="columns-dispaly-msg">{{$t('tip.expressionValue')}}</div>
                      </div>
                      <span slot="reference">
                        <i class="nz-icon nz-icon-info-normal" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                      </span>
                    </el-popover>
                  </div>
                </div>
                <el-form-item :prop="'param.columns.' + index + '.display'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" class="thresholds-from-item">
                  <el-input v-model="item.display" size="small"  @change="change('columns',index)"/>
                </el-form-item>
              </el-row>
            </transition-group>
          </div>
        </draggable>
        <div @click="addColumns" class="thresholds-add">
          {{$t('overall.addColumns')}}
        </div>
      </div>

      <!--      valueMapping  -->
      <div v-if="isShowValueMapping(chartConfig.type) || isTable(chartConfig.type)">
        <div class="form__sub-title">
          <span>{{$t('dashboard.dashboard.chartForm.valueMapping')}}</span>
          <el-switch
            v-model="chartConfig.param.enable.valueMapping"
            size="small"
            @change="change"
          ></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <el-row v-if="chartConfig.param.enable.valueMapping">
            <draggable
              v-model="chartConfig.param.valueMapping"
              @end="change"
              :scroll-sensitivity="150"
              :options="{
              dragClass:'drag-valueMapping-class',
              fallbackClass:'fallback-class',
              forceFallback:true,
              ghostClass:'chart-ghost',
              chosenClass:'choose-class',
              scroll:true,
              filter: '.drag-disabled',
              animation: 150,
              handle: '.drag-sort'
            }">
              <div
                v-for="(item,index) in chartConfig.param.valueMapping"
                :key="item.uid"
                :class="item.error? 'is-item-box-error' : ''"
              >
                <div class="chart-title chart-title-config">
                  <span class="chart-title-content">
                    <i class="nz-icon nz-icon-arrow-down" :class="item.show?'':'is-active'" @click="showMapping(index)"></i>
                    <span v-if="item.column && !item.show">{{item.column}}:</span>
                    <span v-show="!item.show" class="title-content-left">
                      <span v-if="item.type === 'value'">
                        {{item.value}}
                      </span>
                      <span v-if="item.type === 'range'">
                        [{{item.from}}，{{item.to}})
                      </span>
                      <span v-if="item.type === 'regx'">
                        {{item.regx}}
                      </span>
                      <div class="prev-mapping-icon">
                        <i :class="item.icon" :style="{ color: item.color.icon }"></i>
                      </div>
                      <div :style="{background:item.color.bac}" class="prev-mapping-box">
                          <span :style="{color:item.color.text}">
                            {{item.display || "T"}}
                          </span>
                        </div>
                    </span>
                  </span>
                  <span>
                    <span @click="addMapping('')" style="margin-right: 5px" :title="$t('tip.add')">
                      <i class="nz-icon nz-icon-create-square"></i>
                    </span>
                    <span @click="copyMapping(index)" style="margin-right: 5px" :title="$t('overall.duplicate')">
                      <i  class="nz-icon nz-icon-override"></i>
                    </span>
                    <span @click="removeMapping(index)" style="margin-right: 5px" :title="$t('overall.delete')">
                      <i  class="nz-icon nz-icon-minus"></i>
                    </span>
                    <span style="margin-right: 5px;fontSize:17px;cursor: grab;" class="drag-sort" :title="$t('dashboard.dashboard.chartForm.sort')">
                      <i class="nz-icon nz-icon-sort" style="cursor: grab;"></i>
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
                          :label="$t(item.label)"
                          :key="item.value"/>
                      </el-select>
                    </div>
                    <el-form-item
                      v-if="item.type === 'value'"
                      :prop="'param.valueMapping.' + index + '.value'"
                      :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
                      class="thresholds-from-item"
                      key="value"
                    >
                      <el-input-number
                        :controls="false"
                        size="small"
                        v-model.number="item.value"
                        placeholder="value"
                        @change="change('valueMapping', index)"
                      ></el-input-number>
                    </el-form-item>
                    <el-form-item
                      v-if="item.type === 'range'"
                      :prop="'param.valueMapping.' + index + '.from'"
                      :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
                      class="thresholds-from-item"
                      key="from"
                    >
                      <el-input-number
                        :controls="false"
                        size="small"
                        v-model.number="item.from"
                        placeholder="from"
                        @change="change('valueMapping', index)"
                      ></el-input-number>
                    </el-form-item>
                    <el-form-item
                      v-if="item.type === 'range'"
                      :prop="'param.valueMapping.' + index + '.to'"
                      :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
                      class="thresholds-from-item"
                      key="to"
                    >
                      <el-input-number
                        :controls="false"
                        size="small"
                        v-model.number="item.to"
                        @change="change('valueMapping', index)"
                        placeholder="to"
                      ></el-input-number>
                    </el-form-item>
                    <el-form-item
                      v-if="item.type === 'regx'"
                      :prop="'param.valueMapping.' + index + '.regx'"
                      :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
                      class="thresholds-from-item"
                      key="regx"
                    >
                      <el-input
                        size="small"
                        v-model="item.regx"
                        placeholder="regx"
                        @change="change('valueMapping', index)"
                      ></el-input>
                    </el-form-item>
                  </el-row>
                  <el-row v-show="item.show" :key="2" class="thresholds-item">
                    <div v-if="isTable(chartConfig.type)">
                      <div class='mapping-display'>{{$t('placeholder.chart.column')}}</div>
                    </div>
                    <el-form-item v-if="isTable(chartConfig.type)" :prop="'param.valueMapping.' + index + '.column'" :rules="{ required: true, message: $t('validate.required'), change: 'blur'}" class="thresholds-from-item">
                      <el-select
                        v-model="item.column"
                        size="small"
                        :placeholder="$t('placeholder.chart.column')"
                        style="margin-right: 10px"
                        @change="change('valueMapping', index)"
                        filterable
                        allow-create :maxlength="64"
                        default-first-option
                      >
                      <el-option
                        v-for="item in chartConfig.param.columns.filter(item=> item.title)"
                        :value="item.title"
                        :label="item.title"
                        :key="item.title"/>
                      </el-select>
                    </el-form-item>
                    <div>
                      <div class='mapping-display'>{{$t('config.assetLabel.display')}}</div>
                    </div>
                    <el-form-item :prop="'param.valueMapping.' + index + '.display'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" class="thresholds-from-item">
                      <el-input v-model="item.display" style="margin-right: 10px" :placeholder="$t('placeholder.chart.display')" size="small" @change="change('valueMapping', index)" class="mapping-display-input">
                        <el-dropdown trigger="click" slot="prefix" placement="top-start">
                          <div class="el-dropdown-link">
                            <i v-if="item.icon" class="mapping-icon" :class="item.icon" :style="{ color: item.color.icon }"></i>
                            <div v-else class="mapping-iconSelect" :title="$t('tip.add')">
                              <i class="nz-icon nz-icon-create-square"></i>
                            </div>
                          </div>
                          <el-dropdown-menu slot="dropdown" class="mapping-iconPop">
                              <ul class="mapping-iconList">
                                <li class="mapping-iconItem" :class="{active:item.icon===subItem.value}" v-for="subItem in mappingIconList" @click="iconActive(item,subItem,index)" :key="subItem.value">
                                  <i :class="subItem.value"></i>
                                </li>
                              </ul>
                          </el-dropdown-menu>
                        </el-dropdown>
                      </el-input>
                    </el-form-item>
                    <nezhaColor
                      :color-val="item.color"
                      :single="false"
                      :value-arr="[{name:'icon',value:item.color.icon,key:'icon'},{name:'bac',value:item.color.bac,key:'bac'},{name:'text',value:item.color.text,key:'text'}]"
                      @colorChange="(val,key)=>{colorChange(val, key, index)}"
                    />
                  </el-row>
                </transition-group>
              </div>
            </draggable>
            <div @click="addMapping" class="thresholds-add">
              {{$t('overall.addMapping')}}
            </div>
          </el-row>
        </transition>
      </div>

      <!-- visibility -->
      <div v-if="params.type === 'group'">
        <div class="form__sub-title">
          <span>{{$t('dashboard.dashboard.showHidden')}}</span>
          <el-switch
            v-model="chartConfig.param.enable.visibility"
            size="small"
            @change="change"
          ></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <div
            v-if="chartConfig.param.enable.visibility"
            class="form-items--half-width-group"
          >
            <!-- Variable name -->
            <el-form-item
              :label="$t('dashboard.dashboard.variableName')"
              class="form-item--half-width"
              prop="param.visibility.varName"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
            >
              <el-select
                v-model="chartConfig.param.visibility.varName"
                :placeholder="$t('el.select.placeholder')"
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change"
                filterable
                allow-create :maxlength="64"
                default-first-option
              >
                <el-option
                  v-for="item in variables"
                  :key="item.name"
                  :label="$t(item.name)"
                  :value="item.name"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- Operator -->
            <el-form-item
              :label="$t('alert.config.operator')"
              class="form-item--half-width"
              prop="param.visibility.operator"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
            >
              <el-select
                v-model="chartConfig.param.visibility.operator"
                :placeholder="$t('el.select.placeholder')"
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change"
              >
                <el-option
                  v-for="item in operatorList"
                  :key="item.value"
                  :label="$t(item.label)"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- Value -->
            <el-form-item
              :label="$t('overall.value')"
              class="form-item--half-width"
              prop="param.visibility.varValue"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
            >
              <el-input
                :placeholder="$t('overall.placeHolder')"
                size="small"
                v-model="chartConfig.param.visibility.varValue"
                @change="change">
              </el-input>
            </el-form-item>
            <!-- Result -->
            <el-form-item
              :label="$t('dashboard.dashboard.chartForm.result')"
              class="form-item--half-width"
              prop="param.visibility.result"
              :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
            >
              <el-select
                v-model="chartConfig.param.visibility.result"
                :placeholder="$t('el.select.placeholder')"
                popper-class="right-box-select-top prevent-clickoutside"
                size="small"
                @change="change"
              >
                <el-option
                v-for="item in showHidden"
                :key="item.id"
                :label="item.name"
                :value="item.id">{{item.name}}</el-option>
                <!-- <el-option value="hidden">{{$t('overall.hidden')}}</el-option> -->
              </el-select>
            </el-form-item>
          </div>
        </transition>
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
import { s8 } from '@/components/common/js/common'
import { randomcolor, ColorReverse } from '@/components/common/js/radomcolor/randomcolor'
import { isSankey } from '@/components/chart/chart/tools'

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
      oldType: '',
      tag: '',
      promqlType: 'log',
      language: localStorage.getItem('nz-language') || 'en',
      showHidden: [
        {
          id: 'show',
          name: this.$t('overall.show')
        }, {
          id: 'hidden',
          name: this.$t('overall.hidden')
        }
      ],
      chartTypeList: []
    }
  },
  methods: {
    isSankey,
    beforeInit () {
      this.promqlType = this.type
      this.chartTypeList = this[this.type + 'ChartTypeList']
    },
    init () {
      this.chartConfig = JSON.parse(JSON.stringify(this.params))
      this.oldType = this.chartConfig.type
      // 重置相关属性
      this.expressions = []
      this.expressionsShow = []
      this.expressionName = []
      if (!this.chartConfig.elements.length) {
        this.addExpression()
      } else {
        // 根据orderNum排序
        this.chartConfig.elements = this.chartConfig.elements.sort((a, b) => a.orderNum - b.orderNum)
        this.chartConfig.elements.forEach(item => {
          this.addExpression(item)
        })
        this.expressionChange()
      }
    },
    // 变量名校验 防止重复
    labelValidator (rule, value, callback) {
      const sourceLabel = this.chartConfig.param.sourceLabel
      const targetLabel = this.chartConfig.param.targetLabel
      setTimeout(() => {
        if (sourceLabel === targetLabel) {
          callback(new Error(this.$t('error.labelEqual')))
        } else {
          callback()
        }
      }, 100)
    },
    chartTypeChange (type) {
      switch (type) {
        case 'line':
        case 'area':
        case 'point':
          if (this.oldType === 'line' || this.oldType === 'area' || this.oldType === 'point') {
            break
          }
          this.chartConfig.param = {
            stack: 0,
            link: this.chartConfig.param.link,
            nullType: this.chartConfig.param.nullType,
            legend: { placement: 'bottom', values: [], show: true },
            thresholdShow: true,
            thresholds: [],
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false,
              visibility: false,
              rightYAxis: false
            },
            showHeader: this.chartConfig.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            rightYAxis: {
              elementNames: [],
              style: 'line',
              unit: 2,
              label: '',
              min: undefined,
              max: undefined
            },
            option: {
              lineWidth: 2,
              pointSize: 86
            }
          }
          this.$nextTick(() => {
            this.chartConfig.param.thresholds.push({ value: undefined, color: randomcolor() })
          })
          break
        case 'stat':
        case 'hexagon':
        case 'gauge':
        case 'sankey':
        case 'bubble':
        case 'rank':
        case 'funnel':
          if (type === 'stat') {
            if (!this.chartConfig.param.sparklineMode) { this.chartConfig.param.sparklineMode = 'line' }
            if (!this.chartConfig.param.comparison) { this.chartConfig.param.comparison = 'none' }
          }
          if (this.oldType === 'stat' || this.oldType === 'gauge' || this.oldType === 'sankey' || this.oldType === 'hexagon' || this.oldType === 'bubble' || this.oldType === 'rank' || this.oldType === 'funnel') {
            break
          }
          this.chartConfig.param = {
            nullType: this.chartConfig.param.nullType,
            link: this.chartConfig.param.link,
            statistics: 'last',
            text: 'value',
            valueMapping: [],
            min: 0,
            max: 100,
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false,
              visibility: false
            },
            showHeader: this.chartConfig.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            },
            sparklineMode: 'line',
            comparison: 'none'
          }
          break
        case 'bar':
        case 'treemap':
        case 'pie':
          if (this.oldType === 'bar' || this.oldType === 'treemap' || this.oldType === 'pie') {
            break
          }
          this.chartConfig.param = {
            nullType: this.chartConfig.param.nullType,
            link: this.chartConfig.param.link,
            statistics: 'last',
            text: 'value',
            valueMapping: [],
            legend: { placement: 'bottom', values: [], show: true },
            min: 0,
            max: 100,
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false,
              visibility: false
            },
            showHeader: this.chartConfig.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            }
          }
          break
        case 'table':
          if (this.oldType === 'table') {
            break
          }
          this.chartConfig.param = {
            nullType: this.chartConfig.param.nullType,
            link: this.chartConfig.param.link,
            statistics: 'last',
            columns: [],
            tags: [],
            indexs: '',
            valueMapping: [],
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false,
              visibility: false
            },
            showHeader: this.chartConfig.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            }
          }
          break
        case 'log':
          if (this.oldType === 'log') {
            break
          }
          this.chartConfig.param = {
            link: this.chartConfig.param.link,
            limit: 100,
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false,
              visibility: false
            },
            showHeader: this.chartConfig.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            }
          }
          break
      }
      this.oldType = type
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
        id: s8(),
        value: undefined,
        color: randomcolor()
      })
      this.change()
    },
    delThresholds (index) {
      if (this.chartConfig.param.thresholds.length === 1) {
        return
      }
      this.chartConfig.param.thresholds.splice(index, 1)
      this.chartConfig.param.thresholds.forEach((item, index) => {
        this.$refs.chartForm.validateField('param.thresholds.' + index + '.value')
      })
      this.change()
    },
    move () {

    },
    end (event) {
      this.expressions = []
      this.expressionName = []
      if (!this.chartConfig.elements.length) {
        this.addExpression()
      } else {
        const expressionsShow = this.$lodash.cloneDeep(this.expressionsShow)
        this.chartConfig.elements.forEach((item, index) => {
          this.expressions.push(item.expression)
          this.expressionName.push(item.name)
          // 更新promqlInput视图
          this.$nextTick(() => {
            this.$refs[`promql-${index}`][0].promqlInputChange(item)
          })
          // 设置orderNum排序
          item.orderNum = index
          // expressionsShow调整顺序
          expressionsShow.forEach((subItem) => {
            if (item.name == subItem.oldName) {
              this.$set(this.expressionsShow, index, this.$lodash.cloneDeep(subItem))
            }
          })
        })
        const arr = this.chartConfig.elements.map((item, index) => 'elements.' + (index) + '.expression')
        this.$refs.chartForm.clearValidate(arr)
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
