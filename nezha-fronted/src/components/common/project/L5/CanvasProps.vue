<template>
  <div class="props-box" :loading="loading">
    <!--所有属性-->
    <el-tabs v-model="tab" type="card" v-if="selection.pen" @tab-click="tabClick">
      <el-tab-pane :label="$t('project.topology.data')" name="1">
        <el-form v-model="selection.pen.data" class="pens-data" label-position="top">
          <!--module-->
          <el-form-item v-if="!selection.pen.type&&!fromDiagram" class="sub-box half-form-item" :label="$t('overall.module')"
                        prop="moduleId">
            <el-select v-model="selection.pen.data.moduleId" :placeholder="$t('el.select.placeholder')"
                       :popper-append-to-body="true" popper-class="asset-dropdown right-box-select-top" size="small"
                       @change="moduleIdChange">
              <el-option
                v-for="item in modules"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>

          <!--value mapping-->
          <el-row class="form-row-title">
            {{ $t('dashboard.panel.chartForm.thresholds') }}
            <span v-if="selection.pen.data.valueMappingSort !=='desc'" class="title__label"
            >（0:Ok > … >{{
                selection.pen.data.valueMapping.length
              }}:Critical）</span>
            <span v-if="selection.pen.data.valueMappingSort ==='desc'" class="title__label"
            >（{{
                selection.pen.data.valueMapping.length
              }}:Critical > … >0:Ok）</span>
            <el-form-item class="float-right" prop="type" style="height: 100%;">
              <el-switch
                v-model="selection.pen.data.valueMappingShow"
                :active-value="true"
                :inactive-value="false"
              />
            </el-form-item>
          </el-row>
          <!--metric-->
          <transition name="el-zoom-in-top">
            <div v-show="selection.pen.data.valueMappingShow">
              <el-row v-for="(item,index) in selection.pen.data.expressArr" :key="index" class="element-item form-row-item"
                      style="">
                <promql-input
                  v-if="selection.pen"
                  :from-father-data="true"
                  :isTopo="true"
                  :metricOptionsParent="metricOptions"
                  :id="index"
                  :key="index"
                  :ref="'promql-'+'-1'"
                  :expression-list="selection.pen.data.expressArr"
                  :index="index"
                  type="metric"
                  :plugins="['metric-selector', 'metric-input', 'remove']"
                  :showRemove="false"
                  :styleType="2"
                  @change="expressionChange"
                ></promql-input>
                <el-row style="margin-top: 10px">
                  <template>
                    <!--chart aggregation-->
                    <el-col class="legend-title">
                      {{ $t('dashboard.panel.chartForm.aggregation') }}&nbsp;
                    </el-col>
                    <el-col style="width: calc(100% - 120px)">
                      <el-select v-model="selection.pen.data.aggregation" :placeholder="$t('el.select.placeholder')"
                                 :popper-append-to-body="true" class="right-box-row-with-btn right-box-select-top right-public-box-dropdown-top"
                                 popper-class="chart-box-dropdown-small"
                                 size="mini"
                                 style="width: 100%" value-key="chartType">
                        <el-option v-for="item in aggregationList" :key="item.id" :label="item.name" :value="item.name">
                          <span class="panel-dropdown-label-txt">{{ item.name }}</span>
                        </el-option>
                      </el-select>
                    </el-col>
                  </template>
                </el-row>
              </el-row>
              <div style="width: 100%;margin: 10px 0; box-sizing: border-box; padding: 0 10px;">
                <div class="thresholds-box">
                  <el-row class="thresholds-title">
                    <el-col :span="5" class="thresholds-cell">{{ $t('alert.severity') }}
                      <span @click="changeValueMappingSort">
                    <i
                      :class="['nz-icon','nz-icon-arrow-up1',selection.pen.data.valueMappingSort==='desc'?'is-arrow-active':'']"></i>
                    <i
                      :class="['nz-icon','nz-icon-arrow-down2',selection.pen.data.valueMappingSort==='desc'?'':'is-arrow-active']"></i>
                  </span>
                    </el-col>
                    <el-col :span="4" class="thresholds-cell">{{ $t('project.topology.color') }}</el-col>
                    <el-col :span="6" class="thresholds-cell">{{ $t('overall.value') }}</el-col>
                    <el-col :span="7" class="thresholds-cell">{{ $t('project.topology.animation') }}</el-col>
                    <el-col :span="2" class="thresholds-cell"></el-col>
                  </el-row>

                  <el-row v-for="(item,index) in selection.pen.data.valueMapping" :key="index">
                    <el-col :span="5" class="thresholds-cell">
                      <span v-if="selection.pen.data.valueMappingSort==='desc'">
                         {{ index === 0 ? selection.pen.data.valueMapping.length - 1 : (item.level - 1) }}
                      </span>
                      <span v-else>
                        {{ item.level }}
                      </span>
                    </el-col>
                    <el-col :span="4" class="thresholds-cell">
                      <span v-if="item.level!==0">
                        <div style="display: inline-block">
                          <nezhaColor :isTopo="true"
                                      :color-val="item.color"
                                      :presetColors="predefineColors" :single="false"
                                      :value-arr="[{name:'fill',value:item.color.fill,key:'bac'},{name:'line',value:item.color.line,key:'line'},{name:'text',value:item.color.text,key:'text'}]" @colorChange="(val,key)=>{colorChangeTable(item,val,key)}"/>
                        </div>
                      </span>
                      <span v-else>base</span>
                    </el-col>
                    <el-col :span="6" class="thresholds-cell" style="display: flex">
                      <el-input
                        v-if="item.level!==0"
                        v-model.number="item.value"
                        size="small"
                        @change="valueMappingValueChange(item)"
                      >
                        <template slot="prepend"> ></template>
                      </el-input>
                      <span v-else>base</span>
                    </el-col>
                    <el-col :span="7" class="thresholds-cell">
                      <!--线-->
                      <el-select v-if="selection.pen&&selection.pen.type&&item.level!==0"
                                 v-model="item.animateType"
                                 :popper-append-to-body="true"
                                 popper-class="right-box-select-top right-public-box-dropdown-top"
                                 size="small">
                        <el-option
                          v-for="(item,index) in lineAnimateOptions"
                          :key="index"
                          :label="item.name"
                          :value="item.id">
                        </el-option>
                      </el-select>
                      <!--点-->
                      <el-select v-if="selection.pen&&!selection.pen.type&&item.level!==0"
                                 v-model="item.animateType"
                                 :popper-append-to-body="true"
                                 popper-class="right-box-select-top right-public-box-dropdown-top"
                                 size="small">
                        <el-option
                          v-for="(item,index) in nodeAnimateOptions"
                          :key="index"
                          :label="item.name"
                          :value="item.id">
                        </el-option>
                      </el-select>
                      <!--默认-->
                      <span v-if="item.level===0">base</span>
                    </el-col>
                    <el-col :span="2" class="thresholds-cell" style="text-align: center">
                      <i v-if="item.level!==0" class="nz-icon nz-icon-minus"
                         @click="valueMappingDel(index, item)" :title="$t('overall.delete')">
                      </i>
                    </el-col>
                  </el-row>
                </div>
              </div>
              <div class="value-mapping-add" style="text-align: center;margin: 0 10px;" @click="valueMappingAdd()" :title="$t('tip.add')">
                <i class="nz-icon nz-icon-plus"></i>
              </div>
            </div>
          </transition>
          <!--tooltip-->
          <el-row class="form-row-title" :style="{'margin-top': '10px'}">
            {{ $t('dashboard.panel.chartForm.tooltip') }}
            <el-form-item class="float-right" prop="type" style="height: 100%;">
              <el-switch
                v-model="selection.pen.data.tooltipShow"
                :active-value="true"
                :inactive-value="false"
                active-color="#ee9d3f"
              />
            </el-form-item>
          </el-row>
          <transition name="el-zoom-in-top">
            <div v-show="selection.pen.data.tooltipShow" class="sub-box">
              <!--title-->
              <el-form-item :label="$t('project.topology.title')" class="full-form-item" prop="type">
                <el-input v-model="selection.pen.data.chartTitle" class="input" size="small"></el-input>
              </el-form-item>
              <!--remark-->
              <el-form-item :label="$t('overall.remark')" class="full-form-item" prop="remark">
                <el-input v-model="selection.pen.data.remark" maxlength="256"
                          show-word-limit type="textarea" size="small" :rows="2"/>
              </el-form-item>
              <!--chart unit-->
              <el-form-item v-show="selection.pen.data.type !='text'" :label="$t('dashboard.panel.chartForm.unit')" class="half-form-item"
                            prop="unit">
                <el-cascader v-model="selection.pen.data.unit"
                             :options="unitOptions"
                             :placeholder="$t('el.select.placeholder')"
                             :props="{ expandTrigger: 'hover',emitPath:false }"
                             :show-all-levels="false"
                             filterable
                             popper-class="dc-dropdown right-box-select-top right-public-box-dropdown-top"
                             size="mini"
                >
                </el-cascader>
              </el-form-item>
              <el-form-item :label="$t('overall.type')" class="half-form-item half-form-item--end"
                            prop="type">
                <el-select v-model="selection.pen.data.type" :placeholder="$t('el.select.placeholder')"
                           :popper-append-to-body="true" class="right-box-row-with-btn"
                           popper-class="chart-box-dropdown-small right-box-select-top"
                           size="mini" value-key="chartType">
                  <el-option v-for="item in chartTypeList" :key="item.id" :label="item.name" :value="item.id">
                    <span class="panel-dropdown-label-txt">{{ item.name }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <!--value mapping-->
              <el-row v-for="(item,index) in selection.pen.data.expressAllArr" :key="index"
                      class="element-item form-row-item form-row-item-border"
                      style="width: 100%; border-radius: 2px; padding-right: 60px;">
                <promql-input
                  v-if="selection.pen"
                  :from-father-data="true"
                  :isTopo="true"
                  :metricOptionsParent="metricOptions"
                  :id="index"
                  :pqid="'vm'"
                  :key="index"
                  :ref="'promql-'+index"
                  :expression-list="selection.pen.data.expressAllArr"
                  :index="index"
                  :plugins="['metric-selector', 'metric-input', 'remove']"
                  :showRemove="false"
                  :styleType="2"
                  @change="expressionChange"
                  @removeExpression="removeExpression"
                ></promql-input>
                <el-row style="margin-top: 10px">
                  <template>
                    <el-col class="legend-title">
                      {{ $t('dashboard.panel.chartForm.legend') }}&nbsp;
                      <el-popover placement="top" trigger="hover" width="211" popper-class="prevent-clickoutside">
                        <div :style="{'word-break':language!=='zh'?'keep-all':'break-all'}">{{ $t('dashboard.panel.chartForm.legendTip') }}</div>
                        <i slot="reference" class="nz-icon nz-icon-info-normal" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"
                           @mouseover="rz"></i>
                      </el-popover>
                    </el-col>
                    <el-col style="width: calc(100% - 120px);">
                      <el-input v-model="selection.pen.data.legendsAll[index]" size="small" type="text"></el-input>
                    </el-col>
                  </template>
                </el-row>
                <div class="nz-icon-minus-position" style="box-sizing: border-box; padding: 10px;">
                  <span class="nz-icon-minus-medium" :title="$t('overall.delete')">
                    <i class="nz-icon nz-icon-minus" @click="removeExpression(index)"></i>
                  </span>
                  <span class="nz-icon-copy" :title="$t('overall.duplicate')" style="padding: 2px 6px">
                    <i class="nz-icon nz-icon-override" @click="copyExpression(index)"></i>
                  </span>
                </div>
              </el-row>
              <div class="value-mapping-add" style="text-align: center" @click="addExpression()" :title="$t('tip.add')">
                <i class="nz-icon nz-icon-plus"></i>
              </div>
            </div>
          </transition>
        </el-form>
      </el-tab-pane>
      <el-tab-pane :label="$t('project.topology.style')" name="4">
        <el-collapse v-model="activeNames">
          <!--&lt;!&ndash;位置大小&ndash;&gt;-->
          <!--<el-collapse-item :label="$t('project.topology.positionAndSize')" name="3" v-if="selection.pen&&!selection.pen.type">-->
          <!--<div class="flex flex-warp">-->

          <!--</div>-->
          <!--</el-collapse-item>-->
          <!--样式-->
          <el-collapse-item :title="$t('project.topology.style')" name="4" v-if="selection.pen">
            <div class="flex flex-warp">

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type">
                <div>X</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="2"
                    controls-position="right"
                    size="small"
                    name="x"
                    class="input"
                    v-model.number="selection.pen.x"
                    :readonly="readonly"
                    required
                    @change="onChange()"
                  >
                    <template slot="append">px</template>
                  </el-input-number>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type">
                <div>Y</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="2"
                    controls-position="right"
                    size="small"
                    name="x"
                    class="input"
                    v-model.number="selection.pen.y"
                    :readonly="readonly"
                    required
                    @change="onChange()">
                    <template slot="append">px</template>
                  </el-input-number>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type">
                <div>{{ $t('dashboard.panel.chartForm.width') }}</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="2"
                    controls-position="right"
                    size="small"
                    name="x"
                    class="input"
                    v-model.number="selection.pen.width"
                    :readonly="readonly"
                    required
                    @change="onChange()"
                    :min="0">
                    <template slot="append">px</template>
                  </el-input-number>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type">
                <div>{{ $t('dashboard.panel.chartForm.high') }}</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="2"
                    controls-position="right"
                    size="small"
                    name="x"
                    class="input"
                    v-model.number="selection.pen.height"
                    :readonly="readonly"
                    required
                    @change="onChange()"
                    :min="0">
                    <template slot="append">px</template>
                  </el-input-number>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type">
                <div>{{ $t('project.topology.circularBead') }}（0 - 1）</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="2"
                    controls-position="right"
                    size="small"
                    :min="0"
                    :max="1"
                    :step="0.1"
                    name="x"
                    class="input"
                    v-model.number="selection.pen.borderRadius"
                    :readonly="readonly"
                    required
                    @change="onChange()"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type">
                <div>{{ $t('project.topology.rotate') }}（°）</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="2"
                    controls-position="right"
                    size="small" name="x"
                    class="input"
                    v-model.number="selection.pen.rotate"
                    :readonly="readonly"
                    required
                    @change="onChange()"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type&&!selection.pen.iconFamily">
                <div>{{ $t('project.topology.bac') }}</div>
                <div class="p10 pl0">
                  <nezhaColor :isTopo="true" :value-arr="[{name:'background',value:selection.pen.background}]"
                              @colorChange="colorChange"/>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type&&selection.pen.iconFamily">
                <div>{{ $t('project.topology.iconColor') }}</div>
                <div class="p10 pl0">
                  <nezhaColor :isTopo="true" :value-arr="[{name:'iconColor',value:selection.pen.iconColor}]"
                              @colorChange="colorChange"/>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type">
                <div>{{ $t('project.topology.gradient') }}</div>
                <div class="p10 pl0 gradient-to">
                  <el-select :popper-append-to-body="true" v-model="selection.pen.gradientType" size="small"
                             :placeholder="''"
                             class="color-before-select" popper-class="color-before-select right-box-select-top right-public-box-dropdown-top" @change="bkTypeChange">
                    <div slot="prefix">
                      <i
                        :class="['nz-icon',bkTypeOption.find(item1=>item1.id==selection.pen.data.gradientType).label,bkTypeOption.find(item1=>item1.id==selection.pen.data.gradientType).fontSize]"></i>
                    </div>

                    <el-option v-for="(item,index) in bkTypeOption" :value="item.id" :label="''" :key="index">
                      <i :class="['nz-icon',item.label,item.fontSize]"></i>
                    </el-option>
                    <!--el-input__inner-->
                  </el-select>
                  <div class="gradient-to-color">
                    <nezhaColor :isTopo="true" :value-arr="[{name:'gradientColor',value:selection.pen.data.gradientColor}]"
                                @colorChange="colorChange"/>
                  </div>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen">
                <div>{{ $t('project.topology.transparency') }}（0 - 1）</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="2"
                    name="globalAlpha"
                    class="input full"
                    v-model.Number="selection.pen.globalAlpha"
                    controls-position="right"
                    size="small"
                    :readonly="readonly"
                    @change="onChange()"
                    :step="0.1"
                    :min="0.01"
                    :max="1"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item special-select">
                <div>{{ $t('project.topology.lineDash') }}</div>
                <div class="p10 pl0">
                  <el-select :popper-append-to-body="true" v-model="selection.pen.dash" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
                             @change="(val)=>{onChange('lineDash', val)}">
                    <div slot="prefix">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" :stroke="theme === 'light' ? 'black' : '#BEBEBE'" stroke-width="1">
                            <path
                              :d="penDash.find((item,i)=>i==(selection.pen.dash?selection.pen.dash:0)).d"
                              :stroke-dasharray="penDash.find((item,i)=>i==(selection.pen.dash?selection.pen.dash:0))['stroke-dasharray']">
                            </path>
                          </g>
                        </svg>
                      </div>
                    </div>
                    <el-option v-for="(item,index) in penDash" :value="index" :key="index">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" :stroke="(selection.pen.dash==index)?'#ee9d3f':item.strokeColor" stroke-width="1">
                            <path :d="item.d" :stroke-dasharray="item['stroke-dasharray']"></path>
                          </g>
                        </svg>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>

              <div class="props-pen-item special-select" v-if="selection.pen&&selection.pen.type">
                <div>{{ $t('project.topology.lineType') }}</div>
                <div class="p10 pl0">
                  <el-select :popper-append-to-body="true" v-model="selection.pen.lineName" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
                             @change="onClickName">
                    <div slot="prefix">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" :stroke="theme === 'light' ? 'black' : '#BEBEBE'" stroke-width="1">
                            <path
                              :d="penLineType.find((item,i)=>item.name==selection.pen.lineName).d"
                            >
                            </path>
                          </g>
                        </svg>
                      </div>
                    </div>
                    <el-option v-for="(item,index) in penLineType" :value="item.name" :key="index">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" :stroke="(selection.pen.lineName==item.name)?'#ee9d3f':item.strokeColor" stroke-width="1">
                            <path :d="item.d" :stroke-dasharray="item['stroke-dasharray']"></path>
                          </g>
                        </svg>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>

              <div class="props-pen-item special-select" v-if="selection.pen&&selection.pen.type">
                <div>{{ $t('project.topology.fromArrow') }}</div>
                <div class="p10 pl0">
                  <el-select :popper-append-to-body="true" v-model="selection.pen.fromArrow" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
                             @change="onClickFromArrow">
                    <div slot="prefix">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" :stroke="theme === 'light' ? 'black' : '#BEBEBE'" stroke-width="1" v-for="(item,index) in penLineFromTOArrow"
                             :key="index" v-if="selection.pen.fromArrow==item.name">
                            <path :d="item.d"></path>
                            <polygon v-if="item.points" :points="item.points" :fill="item.fill" :stroke="item.stroke"
                                     :strokeWidth="item['stroke-width']"></polygon>
                            <circle v-if="item.cx" :cx="item.cx" :cy="item.cy" :r="item.r" :fill="item.fill"
                                    :stroke="item.stroke" :strokeWidth="item['stroke-width']"></circle>
                          </g>
                        </svg>
                      </div>
                    </div>
                    <el-option v-for="(item,index) in penLineFromTOArrow" :value="item.name" :key="index">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" :stroke="(selection.pen.fromArrow==item.name)?'#ee9d3f':item.strokeColor"
                             stroke-width="1">
                            <path :d="item.d"></path>
                            <polygon
                              v-if="item.points"
                              :points="item.points"
                              :fill="(selection.pen.fromArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                              :stroke="(selection.pen.fromArrow==item.name)?'#ee9d3f':item.stroke"
                              :strokeWidth="item['stroke-width']"
                            ></polygon>
                            <circle
                              v-if="item.cx"
                              :cx="item.cx"
                              :cy="item.cy"
                              :r="item.r"
                              :fill="(selection.pen.fromArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                              :stroke="(selection.pen.fromArrow==item.name)?'#ee9d3f':item.stroke"
                              :strokeWidth="item['stroke-width']"
                            ></circle>
                          </g>
                        </svg>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>

              <div class="props-pen-item special-select" v-if="selection.pen&&selection.pen.type">
                <div>{{ $t('project.topology.toArrow') }}</div>
                <div class="p10 pl0">
                  <el-select :popper-append-to-body="true" v-model="selection.pen.toArrow" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
                             @change="onClickToArrow">
                    <div slot="prefix">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" :stroke="theme === 'light' ? 'black' : '#BEBEBE'" stroke-width="1" v-for="(item,index) in penLineFromTOArrow"
                             :key="index" v-if="selection.pen.toArrow==item.name">
                            <path :d="item.d"></path>
                            <polygon v-if="item.points" :points="item.points" :fill="item.fill" :stroke="item.stroke"
                                     :strokeWidth="item['stroke-width']"></polygon>
                            <circle v-if="item.cx" :cx="item.cx" :cy="item.cy" :r="item.r" :fill="item.fill"
                                    :stroke="item.stroke" :strokeWidth="item['stroke-width']"></circle>
                          </g>
                        </svg>
                      </div>
                    </div>
                    <el-option v-for="(item,index) in penLineFromTOArrow" :value="item.name" :key="index">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" :stroke="(selection.pen.toArrow==item.name)?'#ee9d3f':item.strokeColor"
                             stroke-width="1">
                            <path :d="item.d"></path>
                            <polygon
                              v-if="item.points"
                              :points="item.points"
                              :fill="(selection.pen.toArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                              :stroke="(selection.pen.toArrow==item.name)?'#ee9d3f':item.stroke"
                              :strokeWidth="item['stroke-width']"
                            ></polygon>
                            <circle
                              v-if="item.cx"
                              :cx="item.cx"
                              :cy="item.cy"
                              :r="item.r"
                              :fill="(selection.pen.toArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                              :stroke="(selection.pen.toArrow==item.name)?'#ee9d3f':item.stroke"
                              :strokeWidth="item['stroke-width']"
                            ></circle>
                          </g>
                        </svg>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>

              <div class="props-pen-item">
                <div>{{ $t('project.topology.lineWidth') }}（px）</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="2"
                    controls-position="right"
                    size="small"
                    name="x"
                    class="input"
                    v-model.number="selection.pen.data.lineWidth"
                    :readonly="readonly"
                    required
                    :min="selection.pen.type?1:(selection.pen.name==='rectangleImg2' || selection.pen.name==='rectangleImg' || selection.pen.name==='myCube' ?0:1)"
                    @change="onChange('lineWidth')"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div>{{ $t('project.topology.lineColor') }}</div>
                <div class="p10 pl0">
                  <nezhaColor :isTopo="true" :value-arr="[{name:'color',value:selection.pen.color}]"
                              @colorChange="colorChange"/>
                </div>
              </div>
              <div class="props-pen-item" v-if="selection.pen&&selection.pen.type">
                <div>{{ $t('project.topology.arrowColor') }}</div>
                <div class="p10 pl0">
                  <nezhaColor :isTopo="true" :value-arr="[{name:'toArrowColor',value:selection.pen.toArrowColor}]"
                              @colorChange="colorChange"/>
                </div>
              </div>

            </div>
          </el-collapse-item>
          <el-collapse-item :title="$t('project.topology.font')" name="5" v-if="selection.pen&&!selection.pen.type">
            <div class="flex flex-warp">
              <div class="props-pen-item" style="width: 100%">
                <div>{{ $t('project.topology.textContent') }}</div>
                <div class="p10 pl0">
                  <el-input v-model="selection.pen.data.title" class="input" size="small"
                            @change="changeTitle"></el-input>
                </div>
              </div>
              <div class="props-pen-item">
                <div>{{ $t('project.topology.fontSize') }}</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="0"
                    controls-position="right"
                    size="small" name="x"
                    class="input"
                    v-model.number="selection.pen.fontSize"
                    :readonly="readonly"
                    required
                    @change="onChange()"></el-input-number>
                </div>
              </div>
              <div class="props-pen-item">
                <div>{{ $t('project.topology.fontColor') }}</div>
                <div class="p10 pl0">
                  <nezhaColor :isTopo="true" :value-arr="[{name:'textColor',value:selection.pen.textColor}]"
                              @colorChange="colorChange"/>
                </div>
              </div>

              <div class="props-pen-item">
                <div>{{ $t('project.topology.textAlign') }}</div>
                <div class="p10 pl0">
                  <el-select :placeholder="$t('el.select.placeholder')" :popper-append-to-body="true"
                             class="right-box-row-with-btn no-style-class" popper-class="chart-box-dropdown-small right-box-select-top right-public-box-dropdown-top"
                             size="mini"
                             v-model="selection.pen.textAlign" value-key="chartType" @change="onChange">
                    <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in textAlignOptions">
                      <span class="panel-dropdown-label-txt">{{ item.name }}</span>
                    </el-option>
                  </el-select>
                </div>
              </div>

              <div class="props-pen-item">
                <div>{{ $t('project.topology.textBaseline') }}</div>
                <div class="p10 pl0">
                  <el-select :placeholder="$t('el.select.placeholder')" :popper-append-to-body="true"
                             class="right-box-row-with-btn no-style-class" popper-class="chart-box-dropdown-small right-box-select-top right-public-box-dropdown-top"
                             size="mini"
                             v-model="selection.pen.textBaseline" value-key="chartType" @change="onChange">
                    <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in textBaselineOptions">
                      <span class="panel-dropdown-label-txt">{{ item.name }}</span>
                    </el-option>
                  </el-select>
                </div>
              </div>

              <!--              <div class="props-pen-item">-->
              <!--                <div>{{ $t('project.topology.textOffsetX') }}</div>-->
              <!--                <div class="p10 pl0">-->
              <!--                  <el-input-number-->
              <!--                    @focus="inputFocus"-->
              <!--                    @blur="inputBlur"-->
              <!--                    :precision="0"-->
              <!--                    controls-position="right"-->
              <!--                    size="small" name="x"-->
              <!--                    class="input"-->
              <!--                    v-model.number="selection.pen.textLeft"-->
              <!--                    :readonly="readonly"-->
              <!--                    required-->
              <!--                    @change="onChange()"></el-input-number>-->
              <!--                </div>-->
              <!--              </div>-->

              <!--              <div class="props-pen-item">-->
              <!--                <div>{{ $t('project.topology.textOffsetY') }}</div>-->
              <!--                <div class="p10 pl0">-->
              <!--                  <el-input-number-->
              <!--                    @focus="inputFocus"-->
              <!--                    @blur="inputBlur"-->
              <!--                    :precision="0"-->
              <!--                    controls-position="right"-->
              <!--                    size="small" name="x"-->
              <!--                    class="input"-->
              <!--                    v-model.number="selection.pen.textTop"-->
              <!--                    :readonly="readonly"-->
              <!--                    required-->
              <!--                    @change="onChange()"></el-input-number>-->
              <!--                </div>-->
              <!--              </div>-->

            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
    </el-tabs>
    <!--选中多个-->
    <keep-alive>
      <div v-if="selection.pens" class="">
      <el-collapse v-model="activeNames">
        <!--对齐方式-->
        <el-collapse-item :title="$t('project.topology.align')" name="1" v-if="selection.pens">
          <label class="hover pointer mr10 iconLabel" v-for="item in nodesAlign" :title="item.desc" :key="item.value">
            <i :class="['iconfont','iconfontSize16',`icon-align-${item.value}`]"
               @click="onNodesAlign(item.value)"></i>
          </label>
        </el-collapse-item>
        <!--排版-->
        <el-collapse-item :title="$t('project.topology.composing')" name="2" v-if="selection.pens">
          <div class="mt10">
            <!--            <div class="flex middle mb10">-->
            <!--              <label>{{$t('project.topology.maxWidth')}}：</label>-->
            <!--              <div class="full pr10">-->
            <!--                <el-input-number :precision="0" controls-position="right" type="number" class="input" size="small"-->
            <!--                                 v-model.number="layout.maxWidth" ></el-input-number>-->
            <!--              </div>-->
            <!--            </div>-->
            <div class="flex middle mb10">
              <label>{{ $t('project.topology.maxCount') }}：</label>
              <div class="full pr10">
                <el-input-number :precision="0" type="number" controls-position="right" class="input" size="small"
                                 v-model.number="layout.maxCount"
                                 title=""></el-input-number>
              </div>
            </div>
            <div class="flex middle mb10">
              <label>{{ $t('project.topology.nodeWidth') }}：</label>
              <div class="full pr10">
                <el-input-number :precision="0" controls-position="right" type="number" class="input" size="small"
                                 v-model.number="layout.nodeWidth" title=""></el-input-number>
              </div>
            </div>
            <div class="flex middle mb10">
              <label>{{ $t('project.topology.nodeHeight') }}：</label>
              <div class="full pr10">
                <el-input-number :precision="0" controls-position="right" type="number" class="input" size="small"
                                 v-model.number="layout.nodeHeight" title=""></el-input-number>
              </div>
            </div>
            <div class="flex middle mb10">
              <label>{{ $t('project.topology.spaceWidth') }}：</label>
              <div class="full pr10">
                <el-input-number :precision="0" controls-position="right" type="number" class="input" size="small"
                                 v-model.number="layout.spaceWidth" title=""></el-input-number>
              </div>
            </div>
            <div class="flex middle mb10">
              <label>{{ $t('project.topology.spaceHeight') }}：</label>
              <div class="full pr10">
                <el-input-number :precision="0" controls-position="right" type="number" class="input" size="small"
                                 v-model.number="layout.spaceHeight" title=""></el-input-number>
              </div>
            </div>
            <div class="flex middle">
              <label></label>
              <div class="full pr10">
                <button class="button primary nz-btn nz-btn-size-mini-new nz-btn-style-light" @click="onLayout">
                  {{ $t('project.topology.onLayout') }}
                </button>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    </keep-alive>
    <!-- 选中为空 -->
    <keep-alive>
      <div v-if="!selection.pens&&!selection.pen" style="height: 100%">
      <div class="project-title">
        Project
      </div>
      <div class="project-content">
        <!--        <div class="project-content-title">{{$t('project.topology.title')}}</div>-->

        <!--        <div class="project-content-box" style="width: 100%">-->

        <!--          <div class="project-content-item">-->
        <!--            <label>{{$t('overall.name')}}</label>-->
        <!--            <div class="full pr10">-->
        <!--              <el-input class="input" size="small" v-model="topologyData.data.name" :placeholder="$t('el.select.placeholder')"-->
        <!--                        @change="changeTopologyOpt"></el-input>-->
        <!--            </div>-->
        <!--          </div>-->

        <!--          <div class="project-content-item half">-->
        <!--            <label>{{$t('project.topology.fontSize')}}</label>-->
        <!--            <div class="full pr10 h32">-->
        <!--              <el-input-number-->
        <!--                @focus="inputFocus"-->
        <!--                @blur="inputBlur"-->
        <!--                :precision="2"-->
        <!--                controls-position="right"-->
        <!--                size="small"-->
        <!--                name="fontSize"-->
        <!--                class="input"-->
        <!--                v-model.number="topologyData.data.fontSize"-->
        <!--                :readonly="readonly"-->
        <!--                required-->
        <!--                :min="10"-->
        <!--                @change="changeTopologyOpt(topologyData.data.fontSize,'fontSize')"></el-input-number>-->
        <!--            </div>-->
        <!--          </div>-->

        <!--          <div class="project-content-item half">-->
        <!--            <label>{{$t('project.topology.textColor')}}</label>-->
        <!--            <div class="full pr10 h32">-->
        <!--              <nezhaColor :isTopo=true :value-arr="[{name:'textColor',value:topologyData.data.textColor}]" @colorChange="(val,key)=>{-->
        <!--                changeTopologyOpt(val,key,true)-->
        <!--                }"/>-->
        <!--            </div>-->
        <!--          </div>-->

        <!--          <div class="project-content-item half">-->
        <!--            <label>{{$t('project.topology.align')}}</label>-->
        <!--            <div class="full pr10 h32">-->
        <!--              <el-radio-group v-model="topologyData.data.align" size="small" @change="changeTopologyOpt">-->
        <!--                <el-radio-button label="left">left</el-radio-button>-->
        <!--                <el-radio-button label="center">center</el-radio-button>-->
        <!--                <el-radio-button label="right">right</el-radio-button>-->
        <!--              </el-radio-group>-->
        <!--            </div>-->
        <!--          </div>-->

        <!--          <div class="project-content-item half">-->
        <!--            <label>{{$t('project.topology.opacity')}}</label>-->
        <!--            <div class="full pr10 h32">-->
        <!--              <el-input-number-->
        <!--                @focus="inputFocus"-->
        <!--                @blur="inputBlur"-->
        <!--                :precision="2"-->
        <!--                controls-position="right"-->
        <!--                size="small"-->
        <!--                name="fontSize"-->
        <!--                class="input"-->
        <!--                v-model.number="topologyData.data.opacity"-->
        <!--                :readonly="readonly"-->
        <!--                required-->
        <!--                :step="0.2"-->
        <!--                :min="0"-->
        <!--                @change="changeTopologyOpt(topologyData.data.opacity,'opacity')"></el-input-number>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->

        <!--        <div class="project-content-title">-->
        <!--          Appearance-->
        <!--          &lt;!&ndash;{{$t('overall.name')}}&ndash;&gt;-->
        <!--        </div>-->

        <div class="project-content-box" style="width: 100%">
          <div class="project-content-item half">
            <label>{{ $t('project.topology.bac') }}</label>
            <div class="full pr10 h32">
              <nezhaColor :isTopo="true" :value-arr="[{name:'background',value:topologyData.data.background}]" @colorChange="(val,key)=>{
                changeTopologyOpt(val,key,true)
                }"/>
            </div>
          </div>

          <!--          <div class="project-content-item half">-->
          <!--            <label>{{$t('project.topology.bacImage')}}</label>-->
          <!--            <div class="full pr10 h32">-->
          <!--              &lt;!&ndash;暂时是input 输入网址&ndash;&gt;-->
          <!--              <el-input class="input" size="small" v-model="topologyData.data.bkImage" @change="changeTopologyOpt"></el-input>-->
          <!--            </div>-->
          <!--          </div>-->

          <!-- <div class="project-content-item half">
             <label>{{$t('project.topology.rule')}}</label>
             <div class="full pr10 h32">
               <el-switch
                 v-model="topologyData.data.rule"
                 :active-value="true"
                 :inactive-value="false"
                 active-color="#ee9d3f"
                 @change="changeTopologyOpt(topologyData.data.rule,'rule')">
               </el-switch>
             </div>
           </div>

           <div class="project-content-item half special-select">
             <label>{{$t('project.topology.defaultStartArrow')}}</label>
             <div class="full pr10 h32">
               <el-select :popper-append-to-body='false' v-model="topologyData.data.fromArrow" size="small"

                          @change="changeTopologyOpt(topologyData.data.fromArrow,'fromArrow')">
                 <div slot="prefix">
                   <div class="icon-item">
                     <svg>
                       <g fill="none" stroke="black" stroke-width="1" v-for="(item,index) in penLineFromTOArrow"
                          :key="index" v-if="topologyData.data.fromArrow==item.name">
                         <path :d="item.d"></path>
                         <polygon v-if="item.points" :points="item.points" :fill="item.fill" :stroke="item.stroke"
                                  :strokeWidth="item['stroke-width']"></polygon>
                         <circle v-if="item.cx" :cx="item.cx" :cy="item.cy" :r="item.r" :fill="item.fill"
                                 :stroke="item.stroke" :strokeWidth="item['stroke-width']"></circle>
                       </g>
                     </svg>
                   </div>
                 </div>
                 <el-option v-for="(item,index) in penLineFromTOArrow" :value="item.name" :key="index">
                   <div class="icon-item">
                     <svg>
                       <g fill="none" :stroke="(topologyData.data.fromArrow==item.name)?'#ee9d3f':'black'"
                          stroke-width="1">
                         <path :d="item.d"></path>
                         <polygon
                           v-if="item.points"
                           :points="item.points"
                           :fill="(topologyData.data.fromArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                           :stroke="(topologyData.data.fromArrow==item.name)?'#ee9d3f':item.stroke"
                           :strokeWidth="item['stroke-width']"
                         ></polygon>
                         <circle
                           v-if="item.cx"
                           :cx="item.cx"
                           :cy="item.cy"
                           :r="item.r"
                           :fill="(topologyData.data.fromArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                           :stroke="(topologyData.data.fromArrow==item.name)?'#ee9d3f':item.stroke"
                           :strokeWidth="item['stroke-width']"
                         ></circle>
                       </g>
                     </svg>
                   </div>
                 </el-option>
               </el-select>
             </div>
           </div>

           <div class="project-content-item half special-select">
             <label>{{$t('project.topology.defaultEndArrow')}}</label>
             <div class="full pr10 h32">
               <el-select :popper-append-to-body='false' v-model="topologyData.data.toArrow" size="small"

                          @change="changeTopologyOpt('toArrow')">
                 <div slot="prefix">
                   <div class="icon-item">
                     <svg>
                       <g fill="none" stroke="black" stroke-width="1" v-for="(item,index) in penLineFromTOArrow"
                          :key="index" v-if="topologyData.data.toArrow==item.name">
                         <path :d="item.d"></path>
                         <polygon v-if="item.points" :points="item.points" :fill="item.fill" :stroke="item.stroke"
                                  :strokeWidth="item['stroke-width']"></polygon>
                         <circle v-if="item.cx" :cx="item.cx" :cy="item.cy" :r="item.r" :fill="item.fill"
                                 :stroke="item.stroke" :strokeWidth="item['stroke-width']"></circle>
                       </g>
                     </svg>
                   </div>
                 </div>
                 <el-option v-for="(item,index) in penLineFromTOArrow" :value="item.name" :key="index">
                   <div class="icon-item">
                     <svg>
                       <g fill="none" :stroke="(topologyData.data.toArrow==item.name)?'#ee9d3f':'black'"
                          stroke-width="1">
                         <path :d="item.d"></path>
                         <polygon
                           v-if="item.points"
                           :points="item.points"
                           :fill="(topologyData.data.toArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                           :stroke="(topologyData.data.toArrow==item.name)?'#ee9d3f':item.stroke"
                           :strokeWidth="item['stroke-width']"
                         ></polygon>
                         <circle
                           v-if="item.cx"
                           :cx="item.cx"
                           :cy="item.cy"
                           :r="item.r"
                           :fill="(topologyData.data.toArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                           :stroke="(topologyData.data.toArrow==item.name)?'#ee9d3f':item.stroke"
                           :strokeWidth="item['stroke-width']"
                         ></circle>
                       </g>
                     </svg>
                   </div>
                 </el-option>
               </el-select>
             </div>
           </div>-->

        </div>

        <!--        <div class="project-content-title">Appearance</div>-->

        <!--        <div class="project-content-box" style="width: 100%">-->

        <!--          <div class="project-content-item half">-->
        <!--            <label>Project Info</label>-->
        <!--            <div class="full pr10 h32">-->
        <!--              <el-switch-->
        <!--                v-model="topologyData.data.projectInfo"-->
        <!--                :active-value="true"-->
        <!--                :inactive-value="false"-->
        <!--                active-color="#ee9d3f"-->
        <!--                @change="changeTopologyOpt(topologyData.data.projectInfo,'projectInfo')">-->
        <!--              </el-switch>-->
        <!--            </div>-->
        <!--          </div>-->

        <!--          <div class="project-content-item half">-->
        <!--            <label>Alert Info</label>-->
        <!--            <div class="full pr10 h32">-->
        <!--              <el-switch-->
        <!--                v-model="topologyData.data.alertInfo"-->
        <!--                :active-value="true"-->
        <!--                :inactive-value="false"-->
        <!--                active-color="#ee9d3f"-->
        <!--                @change="changeTopologyOpt(topologyData.data.alertInfo,'alertInfo')">-->
        <!--              </el-switch>-->
        <!--            </div>-->
        <!--          </div>-->

        <!--        </div>-->

        <!--        <div class="project-content-title">{{$t('overall.link')}}</div>-->

        <!--        <div class="project-content-box" style="width: 100%">-->

        <!--          <div class="project-content-item">-->
        <!--            <label>Url</label>-->
        <!--            <div class="full pr10">-->
        <!--              <el-input class="input" size="small" v-model="topologyData.data.url" :placeholder="$t('el.select.placeholder')"-->
        <!--                        @change="changeTopologyOpt"></el-input>-->
        <!--            </div>-->
        <!--          </div>-->

        <!--        </div>-->

      </div>
    </div>
    </keep-alive>
  </div>
</template>

<script>
// import { alignNodes, spaceBetween, layout } from '@topology/layout'
import { getTopology, resetZIndex } from '../../js/common'
import chartDataFormat from '../../../chart/chartDataFormat'
import promqlInput from '../../../page/dashboard/explore/promqlInput'
import nezhaColor from '../../nezhaColor'
import promqlInputMixin from '@/components/common/mixin/promqlInput'
import { s8 } from '@topology/core'

const rz = {
  methods: {
    rz (e) {
      resetZIndex(e)
    }
  }
}
export default {
  // pen.type 0为node 1位line
  data () {
    const theme = localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`) || 'light'
    return {
      theme: theme,
      expressions: [],
      language: localStorage.getItem('nz-language') || 'en',
      chartTypeList: [
        {
          id: 'line',
          name: this.$t('dashboard.panel.chartForm.typeVal.line.label')
        },
        {
          id: 'stackArea',
          name: this.$t('dashboard.panel.chartForm.typeVal.stackArea.label')
        }
        // {
        //   id: 'bar',
        //   name: this.$t('dashboard.panel.chartForm.typeVal.bar.label')
        // },
        // {
        //   id: 'table',
        //   name: this.$t('dashboard.panel.chartForm.typeVal.table.label')
        // }
      ],
      aggregationList: [
        {
          id: 'last',
          name: 'last'
        }, {
          id: 'first',
          name: 'first'
        }, {
          id: 'min',
          name: 'min'
        }, {
          id: 'max',
          name: 'max'
        }, {
          id: 'avg',
          name: 'avg'
        }, {
          id: 'total',
          name: 'total'
        }
      ],
      metricList: [], // metric列表
      metricCascaderList: [], // metric级联列表
      metricAllData: new Map(), // 存放所有的project-module-metric-labelValue，避免重复加载
      metricOptions: [],
      unitOptions: chartDataFormat.unitOptions(),
      lineId: null,
      lineIsJson: false,
      lineData: '',
      penId: null,
      penIsJson: false,
      penData: '',
      tab: '1',
      drowdown: 0,
      readonly: false,
      topologyData: {
        data: {
          name: '',
          background: '#FFFFFF',
          bkImage: '',
          lineName: 'curve',
          lineWidth: 1,
          fromArrow: '',
          toArrow: 'triangleSolid',
          projectInfo: true,
          alertInfo: true,
          url: '',
          fontSize: 14,
          align: 'left',
          textColor: '#000000',
          opacity: 1
        }
      },
      pen: {
        dash: '',
        font: '',
        lineWidth: '',
        color: '',
        textMaxLine: '',
        textLeft: '',
        textTop: '',
        globalAlpha: ''
      },
      penNumber: '',
      nodesAlign: [// 对齐方式
        {
          value: 'left',
          desc: this.$t('overall.left')
        }, {
          value: 'right',
          desc: this.$t('dashboard.panel.chartForm.alignList.right')
        }, {
          value: 'top',
          desc: this.$t('project.topology.topOffsetY')
        }, {
          value: 'bottom',
          desc: this.$t('project.topology.bottomOffsetY')
        }, {
          value: 'center',
          desc: this.$t('project.topology.center')
        }, {
          value: 'middle',
          desc: this.$t('project.topology.middleOffsetY')
        }],
      layout: { // 显示对应属性
        maxWidth: undefined,
        nodeWidth: 0,
        nodeHeight: 0,
        maxCount: 0,
        spaceWidth: 30,
        spaceHeight: 30
      },
      activeNames: ['1', '2', '3', '4', '5'],
      show: { // 显示对应属性
        pos: true,
        layout: true,
        looks: true
      },
      data: {},
      bkTypeOption: [
        {
          id: 0,
          name: 'X',
          label: 'nz-icon-close',
          fontSize: 'font12 v-sub'
        },
        {
          id: 2,
          name: '↑',
          label: 'nz-icon-arrow-up1',
          fontSize: 'font20'
        },
        {
          id: 4,
          name: '↓',
          label: 'nz-icon-arrow-down2',
          fontSize: 'font20'
        },
        {
          id: 1,
          name: '→',
          label: 'nz-icon-arrow-right1',
          fontSize: 'font12 v-sub'
        },
        {
          id: 3,
          name: '←',
          label: 'nz-icon-arrow-left1',
          fontSize: 'font12 v-sub'
        }
      ],
      penDash: [
        { d: 'M5 14 l85 0', 'stroke-dasharray': '', strokeColor: theme == 'light' ? 'black' : '#BEBEBE' },
        { d: 'M5 14 l85 0', 'stroke-dasharray': '5,5', strokeColor: theme == 'light' ? 'black' : '#BEBEBE' },
        { d: 'M5 14 l85 0', 'stroke-dasharray': '10,10', strokeColor: theme == 'light' ? 'black' : '#BEBEBE' },
        { d: 'M5 14 l85 0', 'stroke-dasharray': '10,10,2,10', strokeColor: theme == 'light' ? 'black' : '#BEBEBE' }
      ],
      penLineType: [
        { d: 'M5 14 a100,50 0 0,1 85,0', 'stroke-dasharray': '', name: 'curve', strokeColor: theme == 'light' ? 'black' : '#BEBEBE' },
        { d: 'M5 8 l40 0 l0 12 l40 0', 'stroke-dasharray': '', name: 'polyline', strokeColor: theme == 'light' ? 'black' : '#BEBEBE' },
        { d: 'M5 14 l85 0', 'stroke-dasharray': '', name: 'line', strokeColor: theme == 'light' ? 'black' : '#BEBEBE' }
        // {d:'M5 20 C0,8 50,0 85,0',"stroke-dasharray":"",name:'mind'},
      ],
      penLineFromTOArrow: [
        { d: 'M5 14 l85 0', points: '', fill: '', stroke: '', 'stroke-width': '', name: '', strokeColor: theme == 'light' ? 'black' : '#BEBEBE' },
        {
          d: 'M5 14 l85 0',
          points: '5 14,20 9,20 19',
          fill: '#000000',
          stroke: '',
          'stroke-width': '',
          name: 'triangleSolid',
          strokeColor: theme == 'light' ? 'black' : '#BEBEBE'

        },
        {
          d: 'M5 14 l85 0',
          points: '5 14,20 9,20 19',
          fill: '#ffffff',
          stroke: '#000000',
          'stroke-width': '1',
          name: 'triangle',
          strokeColor: theme == 'light' ? 'black' : '#BEBEBE'
        },
        {
          d: 'M5 14 l85 0',
          fill: '#000000',
          stroke: '',
          'stroke-width': '',
          cx: '10',
          cy: '14',
          r: '5',
          name: 'circleSolid',
          strokeColor: theme == 'light' ? 'black' : '#BEBEBE'
        },
        {
          d: 'M5 14 l85 0',
          fill: '#ffffff',
          stroke: '#000000',
          'stroke-width': '1',
          cx: '10',
          cy: '14',
          r: '5',
          name: 'circle',
          strokeColor: theme == 'light' ? 'black' : '#BEBEBE'
        }
      ],
      lineAnimateOptions: [
        { id: 'flow', name: this.$t('project.topology.flow') },
        { id: 'beads', name: this.$t('project.topology.beads') },
        { id: 'dot', name: this.$t('project.topology.dot') },
        // { id: 'comet', name: this.$t('project.topology.comet') },
        { id: 'custom', name: this.$t('project.topology.none') }
      ],
      nodeAnimateOptions: [
        {
          id: 'upDown',
          name: this.$t('project.topology.bounce')
        },
        {
          id: 'leftRight',
          name: this.$t('project.topology.shakeX')
        },
        {
          id: 'heart',
          name: this.$t('project.topology.heartBeat')
        },
        {
          id: 'warning',
          name: this.$t('project.topology.flash')
        },
        {
          id: 'show',
          name: this.$t('project.topology.swing')
        },
        {
          id: 'fade',
          name: this.$t('project.topology.fade')
        },
        {
          id: '',
          name: this.$t('project.topology.none')
        }
      ],
      predefineColors: [
        '#19730E', '#37872D', '#73BF69',
        '#CC9D00', '#E0B400', '#FADE2A',
        '#AD0317', '#C4162A', '#F2495C',
        '#1250B0', '#1F60C4', '#5794F2',
        '#E55400', '#FA6400', '#FF9830',
        '#7C2EA3', '#8F3BB8', '#B877D9'
      ],
      loading: false,
      textAlignOptions: [
        {
          id: 'left',
          name: this.$t('overall.left')
        },
        {
          id: 'center',
          name: this.$t('project.topology.center')
        },
        {
          id: 'right',
          name: this.$t('dashboard.panel.chartForm.alignList.right')
        }
      ],
      textBaselineOptions: [
        {
          id: 'top',
          name: this.$t('project.topology.topOffsetY')
        },
        {
          id: 'middle',
          name: this.$t('project.topology.middleOffsetY')
        },
        {
          id: 'bottom',
          name: this.$t('project.topology.bottomOffsetY')
        }
      ]
    }
  },
  mixins: [rz, promqlInputMixin],
  components: {
    promqlInput,
    nezhaColor
  },
  computed: {},
  props: {
    selection: {
      type: Object,
      require: true
    },
    index: {
      type: Number,
      require: true
    },
    modules: {},
    imgArr: {},
    fromDiagram: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    // 'topologyData.data':{
    //   handler(n){
    //     setTimeout(()=>{
    //       let dataOption=getTopology(this.index).data();
    //       Object.keys(this.topologyData.data).forEach((key)=>{
    //         dataOption[key]=this.topologyData.data[key];
    //       });
    //       getTopology(this.index).render();
    //     })
    //   },
    //   deep:true,
    //   immediate:false,
    // },
    selection: {
      handler (n) {
        // this.loading = false
        if (this.selection.pen && this.selection.pen.data && (!this.selection.pen.data.expressAllArr || this.selection.pen.data.expressAllArr.length === 0)) {
          this.selection.pen.data.expressAllArr = ['']
          this.selection.pen.data.legendsAll = ['']
        }
      },
      deep: true,
      immediate: true
    },
    'selection.pen.data': {
      handler (n, o) {
        if (this.selection.pen && JSON.stringify(this.selection.pen.type) && (JSON.stringify(n) !== JSON.stringify(o)) && o) {
          this.$emit('change', this.selection.pen)
        }
      }
    },
    fromDiagram: {
      handler () {
        if (this.selection.pen && this.selection.pen.data) {
          // eslint-disable-next-line vue/no-mutating-props
          this.selection.pen.data.iconToolState = false
        }
      },
      deep: true,
      immediate: true
    },
    imgArr: {
      handler () {
        // this.loading = false
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    const dataOption = this.index == -2 ? getTopology(-1).data : getTopology(this.index).data()
    if (!dataOption.data) {
      dataOption.data = {}
    }
    Object.keys(this.topologyData.data).forEach((key) => {
      if (key === 'projectInfo' || key === 'alertInfo' || key === 'fontSize' || key === 'align' || key === 'textColor' || key === 'opacity') {
        this.topologyData.data[key] = (JSON.stringify(dataOption.data[key]) ? dataOption.data[key] : this.topologyData.data[key])
      } else {
        this.topologyData.data[key] = (JSON.stringify(dataOption[key]) ? dataOption[key] : this.topologyData.data[key])
      }
    })
  },
  mounted () {
    // this.queryMetrics()
    // this.topologyData.data.grid= !!dataOption.grid;
    // this.topologyData.data.rule= !!dataOption.rule;
    // this.topologyData.data.projectInfo= !!dataOption.projectInfo;
    // this.topologyData.data.alertInfo= !!dataOption.alertInfo;
    // window.addEventListener('keydown', (e) => {
    //   if (e.target.className === 'cm-content cm-lineWrapping' && e.keyCode === 8) {
    //     if (e & e.stopPropagation) {
    //       e.stopPropagation() // iie 6, 7, 8
    //     } else {
    //       window.event.cancleBubble = true
    //     }
    //     return false
    //   }
    // })
  },
  updated (n, o) {
    if (!this.selection.pen) { // 没选中node line返回
      return
    }
    if (this.penId === this.selection.pen.id) {
      return
    }
    if (this.selection.pen.id) {
      this.selection.expand = false
      this.penId = this.selection.pen.id
      const originData = this.selection.pen.data
      this.penIsJson = this.isJson(originData)
      this.penData = this.penIsJson
        ? JSON.stringify(originData, null, 4)
        : this.penData = originData
    }
  },
  methods: {
    tabClick (n) {
    },
    moduleIdChange (n) {
      this.selection.pen.data.moduleName = this.modules.find(item => item.id === n).name
      if (!this.selection.pen.data.title) {
        this.selection.pen.data.title = this.selection.pen.data.moduleName
        this.selection.pen.text = this.selection.pen.data.title
        this.onChange()
        this.$emit('notModuleIDArrChange', this.selection.pen.id)
      }
    },
    changeTitle (val) {
      if (!val) {
        this.selection.pen.text = this.selection.pen.data.moduleName || ''
        this.selection.pen.data.title = this.selection.pen.data.moduleName || ''
      } else {
        this.selection.pen.text = val
      }
      this.onChange()
    },
    onChange (value, val) {
      if (value === 'lineWidth') {
        this.selection.pen.lineWidth = this.selection.pen.data.lineWidth
      }
      if (value === 'lineDash') {
        this.selection.pen.lineDash = val ? (val == 1 ? [5, 5] : ((val == 2 ? [10, 10] : [10, 10, 2, 10]))) : []
      }
      this.$emit('change', this.selection.pen)
      // if(!this.selection.pen.type||this.selection.pens){
      //   this.$emit('change',this.selection.pen||this.selection.pens);
      // }else{// 线更新
      //   this.$emit('change');
      // }
    },
    changeExpand () {
      this.selection.expand = !this.selection.expand
    },
    isJson (obj) {
      return typeof (obj) === 'object' && Object.prototype.toString.call(obj).toLowerCase() == '[object object]' && !obj.length
    },

    // 组件事件
    onNodesAlign (align) { // 对齐node
      // alignNodes(getTopology(this.index).activeLayer.pens, getTopology(this.index).activeLayer.rect, align)
      getTopology(this.index).updateProps()
    },
    onSpaceBetween () {
      // spaceBetween(getTopology(this.index).activeLayer.pens, getTopology(this.index).activeLayer.rect.width)
      getTopology(this.index).updateProps()
    },
    onLayout () { // 改变布局
      // layout(getTopology(this.index).activeLayer.pens, this.layout)
      getTopology(this.index).updateProps()
    },
    onClickDash (number) { // 改变线型
      this.pen.dash = number
      this.drowdown = 0
      if (this.selection.pen) {
        this.selection.pen.dash = number
      }

      this.onChange()
    },
    onClickName (name) {
      this.pen.lineName = name
      // this.selection.pen.calcControlPoints()
      this.drowdown = 0
      if (this.selection.pen) {
        this.selection.pen.lineName = name
        this.selection.pen.anchors = [
          this.selection.pen.anchors[0],
          this.selection.pen.anchors[this.selection.pen.anchors.length - 1]
        ]
        getTopology(this.index).updateLineType(this.selection.pen, name)
        this.onChange()
      }
    },
    bkTypeChange (val) {
      this.selection.pen.data.gradientType = val
      this.$forceUpdate()
      if (val === 0) {
        this.selection.pen.bkType = 0
      }

      if (val === 1 || val === 3) {
        this.selection.pen.bkType = 1
        this.selection.pen.gradientAngle = 0
      }
      if (val === 2 || val === 4) {
        this.selection.pen.bkType = 1
        this.selection.pen.gradientAngle = 90
      }

      if (val === 1 || val === 2) {
        this.selection.pen.gradientToColor = this.selection.pen.data.gradientColor
        this.selection.pen.gradientFromColor = this.selection.pen.background ? this.selection.pen.background : '#fff'
      }
      if (val === 3 || val === 4) {
        this.selection.pen.gradientFromColor = this.selection.pen.data.gradientColor
        this.selection.pen.gradientToColor = this.selection.pen.background ? this.selection.pen.background : '#fff'
      }
      this.onChange()
    },
    colorPickerClick (ref) {
      this.$refs[ref].showPicker = true
    },
    colorPickerClickTable (ref, row) {
      row.showColor = row.color.fill
      row.showType = 'fill'
      this.$nextTick(() => {
        this.$refs[ref][0].showPicker = true
      })
    },
    colorChange (val, name) { // 改变颜色
      const bktype = this.selection.pen.data.gradientType
      if (name === 'toArrowColor') {
        this.selection.pen.fromArrowColor = this.colorRGBtoHex(val)
        this.selection.pen.toArrowColor = this.colorRGBtoHex(val)
        this.selection.pen.data.fromArrowColor = this.colorRGBtoHex(val)
        this.selection.pen.data.toArrowColor = this.colorRGBtoHex(val)
        this.selection.pen.data.arrowColor = this.colorRGBtoHex(val)
      } else {
        this.selection.pen[name] = this.colorRGBtoHex(val)
      }
      if (name === 'gradientColor') {
        this.selection.pen.data.gradientColor = this.colorRGBtoHex(val)
        if (bktype === 1 || bktype === 2) {
          this.selection.pen.gradientToColor = this.selection.pen.data.gradientColor
          this.selection.pen.gradientFromColor = this.selection.pen.background ? this.selection.pen.background : '#fff'
        }
        if (bktype === 3 || bktype === 4) {
          this.selection.pen.gradientFromColor = this.selection.pen.data.gradientColor
          this.selection.pen.gradientToColor = this.selection.pen.background ? this.selection.pen.background : '#fff'
        }
      }

      if (name === 'background') {
        if (bktype === 1 || bktype === 2) {
          this.selection.pen.gradientToColor = this.selection.pen.data.gradientColor
          this.selection.pen.gradientFromColor = this.selection.pen.background ? this.selection.pen.background : '#fff'
        }
        if (bktype === 3 || bktype === 4) {
          this.selection.pen.gradientFromColor = this.selection.pen.data.gradientColor
          this.selection.pen.gradientToColor = this.selection.pen.background ? this.selection.pen.background : '#fff'
        }
      }
      if (name === 'textColor') {
        // this.selection.pen.font.color = this.colorRGBtoHex(val)
      }
      this.selection.pen.data[name] = this.colorRGBtoHex(val)
      this.onChange()
    },
    colorChangeTable (item, val, key) { // 改变颜色
      item.color[key] = this.colorRGBtoHex(val)
    },
    changeShowPicker (item, type) {
      this.$refs['colorPickerBac' + item.level][0].showPicker = true
      item.showType = type
      item.showColor = item.color[type]
    },
    colorOut (obj, e) {
      let flag = false
      e.path.forEach((item) => {
        if (item.className === 'el-color-dropdown el-color-picker__panel' || item.className === 'color-tab') {
          flag = true
        }
      })
      if (flag) {
        return
      }
      obj.showType = ''
      obj.showColor = undefined
    },
    changeTopologyOpt (val, key, isColor) {
      //
      // getTopology(this.index).data()[key]=val;
      // getTopology(this.index).render();
      if (isColor) {
        this.topologyData.data[key] = this.colorRGBtoHex(val)
      } else {
        this.topologyData.data[key] = val
      }
      // Object.keys(this.topologyData.data).forEach((key1) => {
      //   if (key1 === 'projectInfo' || key1 === 'alertInfo' || key1 === 'fontSize' || key1 === 'align' || key1 === 'textColor' || key1 === 'opacity') {
      //     getTopology(this.index).data().data[key1] = this.topologyData.data[key1]
      //   } else {
      //     getTopology(this.index).data()[key1] = this.topologyData.data[key1]
      //   }
      // })
      getTopology(this.index).setBackgroundColor(this.topologyData.data.background)
      getTopology(this.index).render()
      this.$emit('changeProjectTitle')
    },
    colorRGBtoHex (color) { // 获取颜色16进制数
      if (!color) {
        return ''
      }
      ;
      if (color.indexOf('#') === 0) {
        return color
      }
      const rgb = color.split(',')
      const r = parseInt(rgb[0].split('(')[1])
      const g = parseInt(rgb[1])
      const b = parseInt(rgb[2].split(')')[0])
      const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
      return hex
    },
    onClickToArrow (arrow) {
      this.selection.pen.toArrow = arrow
      this.drowdown = 0
      this.onChange()
    },
    onClickFromArrow (arrow) {
      this.selection.pen.fromArrow = arrow
      this.drowdown = 0
      this.onChange()
    },
    changeAnimatePlay (val, type) {
      if (type === 'node') {
        if (val === 'custom') {
          this.selection.pen.data.animatePlay = false
        } else {
          this.selection.pen.data.animatePlay = true
        }
      } else if (type === 'line') {
        if (val === 'custom') {
          this.selection.pen.data.animatePlay = false
        } else {
          this.selection.pen.data.animatePlay = true
        }
      }
      this.onChange()
    },
    onAnimate (val) {
      // this.selection.pen.animateStart=this.selection.pen.animateStart?Date.now():0;
      // this.selection.pen.data.animatePlay=this.selection.pen.animatePlay;
      this.onChange()
      // this.$emit('animate');
    },
    delTopologyPen () {
      const delObj = this.selection.pen ? this.selection.pen.id : this.selection.pens
      this.$emit('del', delObj)
    },
    getMetricOptions () {
      return this.metricOptions
    },
    addExpression () {
      this.selection.pen.data.expressAllArr.push('')
      this.selection.pen.data.legendsAll.push('')
    },
    expressionChange (item) {

    },
    removeExpression (index) {
      if (this.selection.pen.data.expressAllArr.length > 1) {
        this.selection.pen.data.expressAllArr.splice(index, 1)
        this.selection.pen.data.legendsAll.splice(index, 1)
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
      this.selection.pen.data.expressAllArr.push(this.selection.pen.data.expressAllArr[index])
      this.selection.pen.data.legendsAll.push(this.selection.pen.data.legendsAll[index])
      this.$nextTick(() => {
        this.expressions.forEach((ex, index) => {
          if (ex) {
            this.$refs[`promql-${index}`][0].metricChange(ex)
          }
        })
      })
    },
    valueMappingAdd () {
      if (this.selection.pen.data.valueMappingSort === 'desc') {
        this.selection.pen.data.valueMapping.push({
          color: {
            line: '#000000',
            fill: '#ffffff',
            text: '#000000'
          },
          showColor: undefined,
          animateType: this.selection.pen.type ? 1 : '',
          value: 0,
          level: 1,
          showType: 'fill'// bac text border
        })
        this.selection.pen.data.valueMapping.forEach((item, index) => {
          if (index === 0) {
            return
          }
          item.level = this.selection.pen.data.valueMapping.length - index
        })
      } else {
        this.selection.pen.data.valueMapping.push({
          color: {
            line: '#000000',
            fill: '#ffffff',
            text: '#000000'
          },
          showColor: undefined,
          animateType: this.selection.pen.type ? 1 : '',
          value: 0,
          level: this.selection.pen.data.valueMapping.length,
          showType: 'fill'// bac text border
        })
      }
    },
    valueMappingValueChange (index, row) {

    },
    changeValueMappingSort () {
      if (this.selection.pen.data.valueMappingSort === 'desc') {
        this.selection.pen.data.valueMappingSort = 'asc'
        const arr = JSON.parse(JSON.stringify(this.selection.pen.data.valueMapping))
        const a = arr.splice(0, 1)
        arr.reverse()
        arr.unshift(a[0])
        this.selection.pen.data.valueMapping = arr
      } else {
        this.selection.pen.data.valueMappingSort = 'desc'
        const arr = JSON.parse(JSON.stringify(this.selection.pen.data.valueMapping))
        const a = arr.splice(0, 1)
        arr.reverse()
        arr.unshift(a[0])
        this.selection.pen.data.valueMapping = arr
      }
    },
    valueMappingDel (index, row) {
      this.selection.pen.data.valueMapping.splice(index, 1)
      this.selection.pen.data.valueMapping.forEach((item, index) => {
        item.level = index
      })
    },
    inputFocus (e) {
      e.path[2].children[0].setAttribute('tabindex', '0')
      e.path[2].children[1].setAttribute('tabindex', '1')
    },
    inputBlur (e) {
    }
  }
}
</script>
