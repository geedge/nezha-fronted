<template>
  <div class="chart-config">
    <el-form
      ref="chartForm"
      :model="chartConfig"
      :rules="rules"
      label-position= "top"
      label-width="120px"
    >

      <div  v-my-loading="loading" v-for="(item, index) in chartConfig.param.datasource " :key="index" class="chart-system-top-box">
        <div class="chart-title chart-title-config">
            <span class="chart-title-content el-form-item" :class="{
              'is-error' : systemNameShow[0].error,
              'hide-input': systemNameShow[0].hideInput
            }">
              <i class="nz-icon nz-icon-arrow-down" :class="systemNameShow[0].show?'':'is-active'" @click.stop="showSystemNameShow(0)"></i>
              <el-input
                @mousedown.stop
                v-model="chartConfig.param.datasource[0].name"
                size="small"
                @input="(val)=>{systemNameInput(val,0)}"
                @change="systemNameChange(0)" style="width: 120px"
                @focus.stop="showsystemInput(0,false)"
                @blur="showsystemInput(0,true)"
              />
              <div v-if="systemNameShow[0].error"  class="el-form-item__error" style="top: 10px;left: 164px"> {{systemNameShow[0].error}}</div>
        </span>
          </div>
        <transition name="el-zoom-in-top">
          <div  v-show="systemNameShow[0].show">
            <div class="system-chart-config">
              <div class="system-chart-config-left">
                <ul>
                  <li
                    v-for="(system,index1) in systemData"
                    :key="index1"
                    class="system-chart-item"
                    :class="system.name == chartConfig.param.datasource[index].type  ? 'is-select' : ''"
                    @click="changeSystem(system, index)"
                  >{{system.name}}<i class="nz-icon nz-icon-check"/></li>
                </ul>
              </div>
              <div class="system-chart-config-right">
                <div class="form-items--half-width-group">
                  <el-form-item
                    :label="$t('dashboard.panel.chartForm.dimension')"
                    class="form-item--half-width"
                    prop="param.systemGroup"
                  >
                    <el-select size="small" v-model="item.systemGroup" multiple collapse-tags :placeholder="$t('el.select.placeholder')" @change="systemGroupChange(index)"   popper-class="right-box-select-top prevent-clickoutside">
                      <el-option v-for="group in groupList" :value="group.name" :key="group.name" :label="group.name"/>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    v-if="selectList.length"
                    :label="$t('dashboard.panel.chartForm.select')"
                    class="form-item--half-width"
                    prop="param.systemSelect"
                  >
                    <el-select size="small" v-model="item.systemSelect" :placeholder="$t('el.select.placeholder')" @change="systemSelectChange(index)" popper-class="right-box-select-top prevent-clickoutside">
                      <el-option v-for="selectItem in selectList" :value="selectItem.name" :key="selectItem.name" :label="selectItem.name"/>
                    </el-select>
                  </el-form-item>
                </div>
                <div class="form-items--half-width-group">
                  <el-form-item
                    :label="$t('dashboard.panel.chartForm.sort')"
                    class="form-item--half-width"
                    prop="param.sort"
                  >
                    <el-select
                      id="chart-box-height"
                      v-model="item.sort"
                      placeholder=""
                      popper-class="right-box-select-top prevent-clickoutside"
                      size="small"
                      value-key="chartSpan"
                      @change="change"
                    >
                      <el-option :value="'desc'" :label="$t('dashboard.explore.descending')">
                      </el-option>
                      <el-option :value="'asc'" :label="$t('dashboard.explore.ascending')">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    :label="$t('overall.limit')"
                    class="form-item--half-width"
                    prop="param.limit"
                  >
                    <el-input-number :controls="false" v-model.number="item.limit" :placeholder="$t('placeholder.system.limit')"  size="small" @change="change"/>
                  </el-form-item>
                </div>
                <div class="form-items--half-width-group">
                  <el-form-item
                    :label="$t('dashboard.panel.chartForm.filter')"
                    class="form-item"
                    style="width: 100%"
                    prop="param.filter"
                  >
                  <filterSearch
                    ref="filterSearch"
                    :valueList.sync="item.filter"
                    @change="change"
                    :keyList="keyList"
                  />
                  </el-form-item>
                </div>
              </div>
            </div>
            <el-row style="display: flex">
              <el-col class="legend-title">
                <span class="legend-title__span">{{$t('dashboard.panel.chartForm.legend')}}&nbsp;</span>
                <el-popover placement="top" trigger="hover" width="211" popper-class="prevent-clickoutside">
                  <div :style="{'word-break':language!=='zh'?'keep-all':'break-all'}">{{$t('dashboard.panel.chartForm.legendTip')}}</div>
                  <i @mouseover="rz" class="nz-icon nz-icon-info-normal" slot="reference" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                </el-popover>
              </el-col>
              <el-col style="flex: 1">
                <el-form-item style="margin: 0 0 10px 0">
                  <el-input size="small" v-model="item.legend" @change="change" style="line-height: 32px"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </transition>
        </div>
      <!--title-->
      <div class="form__sub-title">
        <span>{{$t('dashboard.panel.chartForm.displayConfig')}}</span>
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
        <!--refer-->
        <el-form-item
          :label="$t('dashboard.panel.chartForm.refer')"
          class="form-item--half-width"
          prop="param.stack"
          style="display: none"
        >
          <el-select
            id="chart-box-height"
            v-model="chartConfig.param.refer"
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
        <!-- index -->
        <el-form-item
          v-show="isTable(chartConfig.type)"
          :label="$t('dashboard.panel.chartForm.tableIndex')"
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
      </div>
      <div class="form-items--half-width-group">
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
      </div>
      <div class="form-items--half-width-group" v-if="isGauge(chartConfig.type)">
        <!--min-->
        <el-form-item :label="$t('dashboard.panel.chartForm.min')" class="form-item--half-width">
          <el-input-number
            size="small"
            style="margin-top: 2px"
            :controls="false"
            @change="change"
            show-word-limit v-model="chartConfig.param.min"/>
        </el-form-item>
        <!--max-->
        <el-form-item :label="$t('dashboard.panel.chartForm.max')" class="form-item--half-width">
          <el-input-number
            size="small"
            style="margin-top: 2px"
            :controls="false"
            @change="change"
            show-word-limit v-model="chartConfig.param.max"/>
        </el-form-item>
      </div>
      <div class="form-items--half-width-group">
        <!-- text -->
        <el-form-item
          :label="$t('config.assetLabel.display')"
          class="form-item--half-width"
          prop="param.nullType"
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
        <!--decimals-->
        <el-form-item v-if="isShowDecimals(chartConfig.type)" :label="$t('config.assetLabel.decimals')" class="form-item--half-width">
          <el-input-number
            size="small"
            style="margin-top: 2px"
            :controls="false"
            @change="change"
            :placeholder="'Default 2'"
            show-word-limit v-model="chartConfig.param.decimals"/>
        </el-form-item>
      </div>
      <!--legend-->
      <div v-if="isShowLegend(chartConfig.type)">
        <!--legendConfig-->
        <div class="form__sub-title">
          <span>{{$t('dashboard.panel.chartForm.legend')}}</span>
          <el-switch v-model="chartConfig.param.enable.legend" size="small" @change="change"></el-switch>
        </div>
        <transition name="el-zoom-in-top">
          <div
            v-if="chartConfig.param.enable.legend"
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
              :label="$t('dashboard.panel.chartForm.legendValues')"
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
          <span>{{$t('alert.config.threshold')}}</span>
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
              :key="index"
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
          <span>{{$t('dashboard.panel.chartForm.columns')}}</span>
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
                    {{item.value}}
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
                <span style="margin-right: 5px;fontSize:17px;cursor: grab;" class="drag-sort" :title="$t('dashboard.panel.chartForm.sort')">
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
                  <div class='mapping-display'>{{$t('dashboard.panel.chartForm.unit')}}</div>
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
          <span>{{$t('dashboard.panel.chartForm.valueMapping')}}</span>
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
                    <span style="margin-right: 5px;fontSize:17px;cursor: grab;" class="drag-sort" :title="$t('dashboard.panel.chartForm.sort')">
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
                        allow-create
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
                      style="margin-right:1px"
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
          <span>{{$t('dashboard.panel.showHidden')}}</span>
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
              :label="$t('dashboard.panel.variableName')"
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
                allow-create
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
              :label="$t('dashboard.panel.chartForm.result')"
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
                <el-option :label="$t('overall.show')" value="show">{{$t('overall.show')}}</el-option>
                <el-option :label="$t('overall.hidden')" value="hidden">{{$t('overall.hidden')}}</el-option>
              </el-select>
            </el-form-item>
          </div>
        </transition>
      </div>

    </el-form>
  </div>
</template>

<script>
import publicConfig from '@/components/common/rightBox/chart/publicConfig'
import chartTypeShow from '@/components/common/rightBox/chart/chartTypeShow'
import nezhaColor from '@/components/common/nezhaColor'
import filterSearch from '@/components/common/filterSearch/filterSearch.vue'
import VueTagsInput from '@johmun/vue-tags-input'
import { isGauge } from '@/components/chart/chart/tools'
import draggable from 'vuedraggable'
export default {
  name: 'systemChartConfig',
  mixins: [publicConfig, chartTypeShow],
  components: {
    nezhaColor,
    filterSearch,
    VueTagsInput,
    draggable
  },
  data () {
    return {
      systemData: [],
      loading: false,
      rules: {},
      systemNameShow: [{
        error: false,
        hideInput: true,
        show: true,
        oldName: ''
      }],
      groupList: [],
      selectList: [],
      oldType: '',
      tag: '',
      chartTypeList: [
        {
          id: 'stat',
          name: this.$t('dashboard.panel.chartForm.typeVal.singleStat.label')
        },
        {
          id: 'hexagon',
          name: this.$t('dashboard.panel.chartForm.typeVal.hexagonFigure.label')
        },
        {
          id: 'bar',
          name: this.$t('dashboard.panel.chartForm.typeVal.bar.label')
        },
        {
          id: 'pie',
          name: this.$t('dashboard.panel.chartForm.typeVal.pie.label')
        },
        {
          id: 'bubble',
          name: this.$t('dashboard.panel.chartForm.typeVal.bubble.label')
        },
        {
          id: 'rank',
          name: this.$t('dashboard.panel.chartForm.typeVal.rank.label')
        },
        {
          id: 'gauge',
          name: this.$t('dashboard.panel.chartForm.typeVal.gauge.label')
        },
        {
          id: 'treemap',
          name: this.$t('dashboard.panel.chartForm.typeVal.treemap.label')
        },
        {
          id: 'table',
          name: this.$t('dashboard.panel.chartForm.typeVal.table.label')
        }
      ],
      keyList: [],
      compareList: [],
      language: localStorage.getItem('nz-language') || 'en'
    }
  },
  watch: {
    selectList (n) {
      if (!this.chartConfig.param.datasource[0].systemSelect) {
        this.chartConfig.param.datasource[0].systemSelect = this.selectList[0].name
        this.systemSelectChange(0)
      }
    }
  },
  methods: {
    isGauge,
    init () {
      this.chartConfig = JSON.parse(JSON.stringify(this.params))
      if (!this.chartConfig.param.datasource[0].filter) {
        this.chartConfig.param.datasource[0].filter = []
      }
      this.oldType = this.chartConfig.type
    },
    getSystemData () {
      this.loading = true
      this.$get('/sys/config/key/stat_query_json').then(res => {
        this.loading = false
        if (res.code === 200) {
          this.systemData = JSON.parse(res.data.paramValue)
          if (this.systemData.length) {
            if (!this.chartConfig.param.datasource[0].type) {
              this.chartConfig.param.datasource[0].type = this.systemData[0].name
              this.groupList = this.systemData[0].group
              this.selectList = this.systemData[0].select
              this.keyList = this.systemData[0].filter
            } else {
              const system = this.systemData.find(item => item.name === this.chartConfig.param.datasource[0].type)
              this.chartConfig.param.system = system.name
              this.groupList = system.group
              this.selectList = system.select
              this.keyList = system.filter
            }
            this.$refs.chartForm && this.$refs.chartForm.clearValidate()
          }
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    chartTypeChange (type) {
      switch (type) {
        case 'stat':
        case 'hexagon':
        case 'gauge':
        case 'bubble':
        case 'rank':
          if (this.oldType === 'stat' || this.oldType === 'gauge' || this.oldType === 'hexagon' || this.oldType === 'bubble' || this.oldType === 'rank') {
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
            datasource: [...this.chartConfig.param.datasource],
            showHeader: this.chartConfig.param.showHeader,
            visibility: {
              varName: '',
              operator: 'equal',
              varValue: '',
              result: 'show'
            }
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
            datasource: [...this.chartConfig.param.datasource],
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
          this.chartConfig.param = {
            link: this.chartConfig.param.link,
            refer: 1,
            system: '',
            indexs: '',
            tags: [],
            nullType: 'null',
            statistics: 'last',
            columns: [],
            valueMapping: [],
            enable: {
              legend: true,
              valueMapping: false,
              thresholds: false,
              visibility: false
            },
            datasource: [...this.chartConfig.param.datasource],
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
    changeSystem (item) {
      this.chartConfig.param.datasource[0].type = item.name
      this.chartConfig.param.datasource[0].systemGroup = ''
      this.chartConfig.param.datasource[0].systemSelect = ''
      this.chartConfig.param.datasource[0].group = ''
      this.chartConfig.param.datasource[0].select = ''
      this.chartConfig.param.datasource[0].filter = []
      this.$refs.filterSearch[0].metaList = []
      this.groupList = item.group
      this.selectList = JSON.parse(JSON.stringify(item.select))
      this.keyList = JSON.parse(JSON.stringify(item.filter))
    },
    systemGroupChange (index) {
      this.chartConfig.param.datasource[index].group = this.chartConfig.param.datasource[index].systemGroup.map(item => {
        const obj = this.groupList.find(group => group.name === item)
        return obj
      })
      this.change()
    },
    systemSelectChange (index) {
      this.chartConfig.param.datasource[index].select = this.selectList.find(item => item.name === this.chartConfig.param.datasource[index].systemSelect)
      this.change()
    },
    showSystemNameShow (index) {
      this.systemNameShow[index].show = !this.systemNameShow[index].show
      this.$set(this.systemNameShow, index, this.systemNameShow[index])
    },
    systemNameInput (val, index) {
      const findIndex = this.systemNameShow.indexOf(val)
      const lastIndex = this.systemNameShow.lastIndexOf(val)
      if (findIndex !== -1 && lastIndex != -1 && lastIndex !== findIndex) {
        this.systemNameShow[index].error = this.$t('error.nameDuplicate')
      } else if (!val) {
        this.systemNameShow[index].error = this.$t('validate.required')
      } else {
        this.systemNameShow[index].error = ''
      }
    },
    systemNameChange (index) {
      if (this.systemNameShow[index].error) {
        this.chartConfig.param.datasource[index].name = this.systemNameShow[index].oldName
        this.systemNameShow[index].error = ''
      } else if (!this.chartConfig.param.datasource[index].name) {
        this.chartConfig.param.datasource[index].name = this.systemNameShow[index].oldName
      } else {
        this.systemNameShow[index].oldName = this.chartConfig.param.datasource[index].name
      }
      this.change()
    },
    showsystemInput (index, flag) {
      this.systemNameShow[index].hideInput = flag
    }
  },
  created () {
    this.init()
  },
  mounted () {
    this.systemNameShow = [{
      error: false,
      hideInput: true,
      show: true,
      oldName: this.chartConfig.param.datasource[0].name
    }]
    this.getSystemData()
  }
}
</script>

<style scoped>

</style>
