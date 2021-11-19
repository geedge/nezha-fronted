<template>
  <div class="props-box" :loading="loading">
    <!--删除按钮-->
    <!--<button id="edit-ep-del" type="button" class="nz-btn nz-btn-size-normal nz-btn-size-alien del-btn"-->
    <!--v-if="selection.pen" @click="delTopologyPen">-->
    <!--<span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>-->
    <!--<span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>-->
    <!--</button>-->
    <!--所有属性-->
    <keep-alive>
      <el-tabs v-model="tab" type="card" v-if="selection.pen" @tab-click="tabClick">
      <el-tab-pane :label="$t('project.topology.data')" name="1">
        <el-form v-model="selection.pen.data" class="pens-data" label-position="top">
          <!--module-->
          <el-form-item v-if="!selection.pen.type&&!fromDiagram" class="sub-box half-form-item" label="Module"
                        prop="moduleId">
            <el-select v-model="selection.pen.data.moduleId" :placeholder="$t('el.select.placeholder')"
                       :popper-append-to-body="true" popper-class="asset-dropdown" size="small"
                       @change="moduleIdChange">
              <el-option
                v-for="item in modules"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <!--iconToolState-->
          <!--          <el-form-item :label="'Icon state'" class="half-form-item" prop="type" v-if="!selection.pen.type">-->
          <!--            <el-switch-->
          <!--              v-model="selection.pen.data.iconToolState"-->
          <!--              :active-value="true"-->
          <!--              :inactive-value="false"-->
          <!--              active-color="#ee9d3f"-->
          <!--            />-->
          <!--          </el-form-item>-->

          <!--value mapping-->
          <el-row class="form-row-title">
            {{ $t('dashboard.panel.chartForm.thresholds') }}
            <span v-if="selection.pen.data.valueMappingSort !=='desc'"
                  style="font-size: 12px;color: #666666;letter-spacing: 0;font-weight: 400;margin-left: 10px">（0:Ok > … >{{
                selection.pen.data.valueMapping.length
              }}:Critical）</span>
            <span v-if="selection.pen.data.valueMappingSort ==='desc'"
                  style="font-size: 12px;color: #666666;letter-spacing: 0;font-weight: 400;margin-left: 10px">（{{
                selection.pen.data.valueMapping.length
              }}:Critical > … >0:Ok）</span>
            <el-form-item class="float-right" prop="type" style="height: 100%;">
              <el-switch
                v-model="selection.pen.data.valueMappingShow"
                :active-value="true"
                :inactive-value="false"
                active-color="#ee9d3f"
              />
            </el-form-item>
          </el-row>
          <!--metric-->
          <transition name="el-zoom-in-top">
            <div v-show="selection.pen.data.valueMappingShow">
              <el-row v-for="(item,index) in selection.pen.data.expressArr" :key="index" class="element-item form-row-item"
                      style="">
                <promql-input
                  :from-father-data="true"
                  :metricOptionsParent="metricOptions"
                  :id="index"
                  :key="index"
                  :ref="'promql-'+'-1'"
                  :expression-list="selection.pen.data.expressArr"
                  :index="index"
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
                                 :popper-append-to-body="true" class="right-box-row-with-btn"
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
                    <el-col :span="4" class="thresholds-cell">{{ $t('project.topology.level') }}
                      <span @click="changeValueMappingSort">
                    <i
                      :class="['nz-icon','nz-icon-arrow-up1',selection.pen.data.valueMappingSort==='desc'?'is-arrow-active':'']"></i>
                    <i
                      :class="['nz-icon','nz-icon-arrow-down2',selection.pen.data.valueMappingSort==='desc'?'':'is-arrow-active']"></i>
                  </span>
                    </el-col>
                    <el-col :span="4" class="thresholds-cell">{{ $t('project.topology.color') }}</el-col>
                    <el-col :span="6" class="thresholds-cell">{{ $t('project.topology.value') }}</el-col>
                    <el-col :span="8" class="thresholds-cell">{{ $t('project.topology.animation') }}</el-col>
                    <el-col :span="2" class="thresholds-cell"></el-col>
                  </el-row>

                  <el-row v-for="(item,index) in selection.pen.data.valueMapping" :key="index">
                    <el-col :span="4" class="thresholds-cell">
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
                          <nezhaColor
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
                    <el-col :span="8" class="thresholds-cell">
                      <!--线-->
                      <el-select v-if="selection.pen&&selection.pen.type&&item.level!==0"
                                 v-model="item.animateType"
                                 :popper-append-to-body="true"
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
                         @click="valueMappingDel(index, item)">
                      </i>
                    </el-col>
                  </el-row>
                </div>
              </div>
              <div class="value-mapping-add" style="text-align: center;margin: 0 10px;" @click="valueMappingAdd()">
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
            <div v-show="selection.pen.data.tooltipShow" class="tooltip-box sub-box">
              <!--title-->
              <el-form-item :label="$t('project.topology.title')" class="full-form-item" prop="type">
                <el-input v-model="selection.pen.data.chartTitle" class="input" size="small"></el-input>
              </el-form-item>
              <!--remark-->
              <el-form-item :label="$t('overall.remark')" class="full-form-item" prop="remark">
                <el-input v-model="selection.pen.data.remark" :autosize="{ minRows: 2, maxRows: 6}" maxlength="256"
                          show-word-limit type="textarea"/>
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
                             popper-class="dc-dropdown"
                             size="mini"
                >
                </el-cascader>
              </el-form-item>
              <el-form-item :label="$t('dashboard.panel.chartForm.type')" class="half-form-item half-form-item--end"
                            prop="type">
                <el-select v-model="selection.pen.data.type" :placeholder="$t('el.select.placeholder')"
                           :popper-append-to-body="true" class="right-box-row-with-btn"
                           popper-class="chart-box-dropdown-small"
                           size="mini" value-key="chartType">
                  <el-option v-for="item in chartTypeList" :key="item.id" :label="item.name" :value="item.id">
                    <span class="panel-dropdown-label-txt">{{ item.name }}</span>
                  </el-option>
                </el-select>
              </el-form-item>
              <!--value mapping-->
              <el-row v-for="(item,index) in selection.pen.data.expressAllArr" :key="index"
                      class="element-item form-row-item"
                      style="width: 100%; border: 1px dashed rgba(0,0,0,0.15); border-radius: 2px; padding-right: 60px;">
                <promql-input
                  :from-father-data="true"
                  :metricOptionsParent="metricOptions"
                  :id="index"
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
                      <el-popover placement="top" trigger="hover" width="211">
                        <div style="word-break:keep-all;">{{ $t('dashboard.panel.chartForm.legendTip') }}</div>
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
                  <span class="nz-icon-minus-medium">
                    <i class="nz-icon nz-icon-minus" @click="removeExpression(index)"></i>
                  </span>
                  <span class="nz-icon-copy">
                    <i class="nz-icon nz-icon-override" @click="copyExpression(index)"></i>
                  </span>
                </div>
              </el-row>
              <div class="value-mapping-add" style="text-align: center" @click="addExpression()">
                <i class="nz-icon nz-icon-plus"></i>
              </div>
            </div>
          </transition>
          <!--          &lt;!&ndash;link&ndash;&gt;-->
          <!--          <el-row class="form-row-title">-->
          <!--            {{$t('project.topology.link')}}-->
          <!--          </el-row>-->
          <!--          <el-form-item :label="'URL'" class="full-form-item" prop="type">-->
          <!--            <el-input v-model="selection.pen.data.url" class="input" size="small"></el-input>-->
          <!--          </el-form-item>-->

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
          <el-collapse-item :title="'Style'" name="4" v-if="selection.pen">
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
                    v-model.number="selection.pen.rect.x"
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
                    v-model.number="selection.pen.rect.y"
                    :readonly="readonly"
                    required
                    @change="onChange()">
                    <template slot="append">px</template>
                  </el-input-number>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type">
                <div>{{ $t('project.topology.width') }}</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="2"
                    controls-position="right"
                    size="small"
                    name="x"
                    class="input"
                    v-model.number="selection.pen.rect.width"
                    :readonly="readonly"
                    required
                    @change="onChange()"
                    :min="0">
                    <template slot="append">px</template>
                  </el-input-number>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type">
                <div>{{ $t('project.topology.height') }}</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="2"
                    controls-position="right"
                    size="small"
                    name="x"
                    class="input"
                    v-model.number="selection.pen.rect.height"
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
                  <nezhaColor :value-arr="[{name:'fillStyle',value:selection.pen.fillStyle}]"
                              @colorChange="colorChange"/>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type&&selection.pen.iconFamily">
                <div>{{ $t('project.topology.iconColor') }}</div>
                <div class="p10 pl0">
                  <nezhaColor :value-arr="[{name:'iconColor',value:selection.pen.iconColor}]"
                              @colorChange="colorChange"/>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen&&!selection.pen.type">
                <div>{{ $t('project.topology.gradient') }}</div>
                <div class="p10 pl0 gradient-to">
                  <el-select :popper-append-to-body="true" v-model="selection.pen.gradientType" size="small"
                             class="color-before-select" popper-class="color-before-select"
                             style="width: 60px;border-radius: 4px 0 0 4px;background: #F5F7FA" @change="bkTypeChange">
                    <div slot="prefix">
                      <i
                        :class="['nz-icon',bkTypeOption.find(item1=>item1.id==selection.pen.data.gradientType).label,bkTypeOption.find(item1=>item1.id==selection.pen.data.gradientType).fontSize]"></i>
                    </div>

                    <el-option v-for="(item,index) in bkTypeOption" :value="item.id" :key="index">
                      <i :class="['nz-icon',item.label,item.fontSize]"></i>
                    </el-option>
                    <!--el-input__inner-->
                  </el-select>
                  <div class="gradient-to-color">
                    <nezhaColor :value-arr="[{name:'gradientColor',value:selection.pen.data.gradientColor}]"
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
                  <el-select :popper-append-to-body="true" v-model="selection.pen.dash" size="small"
                             @change="onChange">
                    <div slot="prefix">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" stroke="black" stroke-width="1">
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
                          <g fill="none" :stroke="(selection.pen.dash==index)?'#ee9d3f':'black'" stroke-width="1">
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
                  <el-select :popper-append-to-body="true" v-model="selection.pen.name" size="small"
                             @change="onClickName">
                    <div slot="prefix">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" stroke="black" stroke-width="1">
                            <path
                              :d="penLineType.find((item,i)=>item.name==selection.pen.name).d"
                            >
                            </path>
                          </g>
                        </svg>
                      </div>
                    </div>
                    <el-option v-for="(item,index) in penLineType" :value="item.name" :key="index">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" :stroke="(selection.pen.name==item.name)?'#ee9d3f':'black'" stroke-width="1">
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
                  <el-select :popper-append-to-body="true" v-model="selection.pen.fromArrow" size="small"
                             @change="onClickFromArrow">
                    <div slot="prefix">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" stroke="black" stroke-width="1" v-for="(item,index) in penLineFromTOArrow"
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
                          <g fill="none" :stroke="(selection.pen.fromArrow==item.name)?'#ee9d3f':'black'"
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
                  <el-select :popper-append-to-body="true" v-model="selection.pen.toArrow" size="small"
                             @change="onClickToArrow">
                    <div slot="prefix">
                      <div class="icon-item">
                        <svg>
                          <g fill="none" stroke="black" stroke-width="1" v-for="(item,index) in penLineFromTOArrow"
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
                          <g fill="none" :stroke="(selection.pen.toArrow==item.name)?'#ee9d3f':'black'"
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
                  <nezhaColor :value-arr="[{name:'strokeStyle',value:selection.pen.strokeStyle}]"
                              @colorChange="colorChange"/>
                </div>
              </div>
              <div class="props-pen-item" v-if="selection.pen&&selection.pen.type">
                <div>{{ $t('project.topology.arrowColor') }}</div>
                <div class="p10 pl0">
                  <nezhaColor :value-arr="[{name:'toArrowColor',value:selection.pen.toArrowColor}]"
                              @colorChange="colorChange"/>
                </div>
              </div>

            </div>
          </el-collapse-item>
          <el-collapse-item :title="'Font'" name="5" v-if="selection.pen&&!selection.pen.type">
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
                  <nezhaColor :value-arr="[{name:'fontColor',value:selection.pen.fontColor}]"
                              @colorChange="colorChange"/>
                </div>
              </div>

              <div class="props-pen-item">
                <div>{{ $t('project.topology.textAlign') }}</div>
                <div class="p10 pl0">
                  <el-select :placeholder="$t('el.select.placeholder')" :popper-append-to-body="true"
                             class="right-box-row-with-btn no-style-class" popper-class="chart-box-dropdown-small"
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
                             class="right-box-row-with-btn no-style-class" popper-class="chart-box-dropdown-small"
                             size="mini"
                             v-model="selection.pen.textBaseline" value-key="chartType" @change="onChange">
                    <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in textBaselineOptions">
                      <span class="panel-dropdown-label-txt">{{ item.name }}</span>
                    </el-option>
                  </el-select>
                </div>
              </div>

              <div class="props-pen-item">
                <div>{{ $t('project.topology.textOffsetX') }}</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="0"
                    controls-position="right"
                    size="small" name="x"
                    class="input"
                    v-model.number="selection.pen.textOffsetX"
                    :readonly="readonly"
                    required
                    @change="onChange()"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div>{{ $t('project.topology.textOffsetY') }}</div>
                <div class="p10 pl0">
                  <el-input-number
                    @focus="inputFocus"
                    @blur="inputBlur"
                    :precision="0"
                    controls-position="right"
                    size="small" name="x"
                    class="input"
                    v-model.number="selection.pen.textOffsetY"
                    :readonly="readonly"
                    required
                    @change="onChange()"></el-input-number>
                </div>
              </div>

            </div>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
    </el-tabs>
    </keep-alive>
    <!--选中多个-->
    <keep-alive>
      <div v-if="selection.pens" class="">
      <el-collapse v-model="activeNames">
        <!--对齐方式-->
        <el-collapse-item :title="$t('project.topology.align')" name="1" v-if="selection.pens">
          <label class="hover pointer mr10 iconLabel" v-for="item in nodesAlign" :title="item.desc">
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
                <button class="button primary nz-btn nz-btn-size-mini-new nz-btn-style-light-new" @click="onLayout">
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
        <!--            <label>{{$t('project.topology.name')}}</label>-->
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
        <!--            <label>{{$t('project.topology.fontColor')}}</label>-->
        <!--            <div class="full pr10 h32">-->
        <!--              <nezhaColor :value-arr="[{name:'fontColor',value:topologyData.data.fontColor}]" @colorChange="(val,key)=>{-->
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
        <!--          &lt;!&ndash;{{$t('project.topology.name')}}&ndash;&gt;-->
        <!--        </div>-->

        <div class="project-content-box" style="width: 100%">
          <div class="project-content-item half">
            <label>{{ $t('project.topology.bac') }}</label>
            <div class="full pr10 h32">
              <nezhaColor :value-arr="[{name:'bkColor',value:topologyData.data.bkColor}]" @colorChange="(val,key)=>{
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

        <!--        <div class="project-content-title">{{$t('project.topology.link')}}</div>-->

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
import { alignNodes, spaceBetween, layout } from '@topology/layout'
import { getTopology, resetZIndex } from '../../js/common'
import chartDataFormat from '../../../charts/chartDataFormat'
import promqlInput from '../../../page/dashboard/explore/promqlInput'
import nezhaColor from '../../nezhaColor'
import promqlInputMixin from '@/components/common/mixin/promqlInput'

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
    return {
      expressions: [],
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
          bkColor: '#FFFFFF',
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
          fontColor: '#000000',
          opacity: 1
        }
      },
      pen: {
        dash: '',
        font: '',
        lineWidth: '',
        strokeStyle: '',
        textMaxLine: '',
        textOffsetX: '',
        textOffsetY: '',
        globalAlpha: ''
      },
      penNumber: '',
      nodesAlign: [// 对齐方式
        {
          value: 'left',
          desc: this.$t('project.topology.left')
        }, {
          value: 'right',
          desc: this.$t('project.topology.right')
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
        { d: 'M5 14 l85 0', 'stroke-dasharray': '' },
        { d: 'M5 14 l85 0', 'stroke-dasharray': '5,5' },
        { d: 'M5 14 l85 0', 'stroke-dasharray': '10,10' },
        { d: 'M5 14 l85 0', 'stroke-dasharray': '10,10,2,10' }
      ],
      penLineType: [
        { d: 'M5 14 a100,50 0 0,1 85,0', 'stroke-dasharray': '', name: 'curve' },
        { d: 'M5 8 l40 0 l0 12 l40 0', 'stroke-dasharray': '', name: 'polyline' },
        { d: 'M5 14 l85 0', 'stroke-dasharray': '', name: 'line' }
        // {d:'M5 20 C0,8 50,0 85,0',"stroke-dasharray":"",name:'mind'},
      ],
      penLineFromTOArrow: [
        { d: 'M5 14 l85 0', points: '', fill: '', stroke: '', 'stroke-width': '', name: '' },
        {
          d: 'M5 14 l85 0',
          points: '5 14,20 9,20 19',
          fill: '#000000',
          stroke: '',
          'stroke-width': '',
          name: 'triangleSolid'
        },
        {
          d: 'M5 14 l85 0',
          points: '5 14,20 9,20 19',
          fill: '#ffffff',
          stroke: '#000000',
          'stroke-width': '1',
          name: 'triangle'
        },
        {
          d: 'M5 14 l85 0',
          fill: '#000000',
          stroke: '',
          'stroke-width': '',
          cx: '10',
          cy: '14',
          r: '5',
          name: 'circleSolid'
        },
        {
          d: 'M5 14 l85 0',
          fill: '#ffffff',
          stroke: '#000000',
          'stroke-width': '1',
          cx: '10',
          cy: '14',
          r: '5',
          name: 'circle'
        }
      ],
      lineAnimateOptions: [
        { id: 1, name: this.$t('project.topology.flow') },
        { id: 'beads', name: this.$t('project.topology.beads') },
        { id: 'dot', name: this.$t('project.topology.dot') },
        { id: 'comet', name: this.$t('project.topology.comet') },
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
          name: this.$t('project.topology.left')
        },
        {
          id: 'center',
          name: this.$t('project.topology.center')
        },
        {
          id: 'right',
          name: this.$t('project.topology.right')
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
    //       let dataOption=getTopology(this.index).data;
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
      handler () {
        // this.loading = false
        if (this.selection.pen && this.selection.pen.data && (!this.selection.pen.data.expressAllArr || this.selection.pen.data.expressAllArr.length === 0)) {
          this.selection.pen.data.expressAllArr = ['']
          this.selection.pen.data.legendsAll = ['']
        }
      },
      deep: true,
      immediate: true
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
    const dataOption = this.index == -2 ? getTopology(-1).data : getTopology(this.index).data
    if (!dataOption.data) {
      dataOption.data = {}
    }
    Object.keys(this.topologyData.data).forEach((key) => {
      if (key === 'projectInfo' || key === 'alertInfo' || key === 'fontSize' || key === 'align' || key === 'fontColor' || key === 'opacity') {
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
    queryMetrics () {
      this.metricOptions = []
      this.$get('prom/api/v1/label/__name__/values').then(response => {
        if (response.status == 'success') {
          const metrics = response.data.sort()
          const metricMap = new Map()
          metrics.forEach((item) => {
            let key = ''
            if (/^[a-zA-Z]+?_[a-zA-Z]*/.test(item)) {
              key = item.split('_')[0]
            } else if (/^_\w*/.test(item)) {
              key = '      '
            } else {
              key = item
            }
            if (metricMap.get(key)) {
              const values = metricMap.get(key)
              values.push({ label: item, value: item })
            } else {
              const values = [{ label: item, value: item }]
              metricMap.set(key, values)
            }
            // this.metricStore.push({label:item,value:item,insertText:item})
          })
          for (const key of metricMap.keys()) {
            const option = {
              label: key,
              value: key
            }
            if (metricMap.get(key) && metricMap.get(key).length > 1) {
              option.children = metricMap.get(key)
            }
            this.metricOptions.push(option)
          }
        }
      })
    },
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
    onChange (value) {
      if (value === 'lineWidth') {
        this.selection.pen.lineWidth = this.selection.pen.data.lineWidth
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
      alignNodes(getTopology(this.index).activeLayer.pens, getTopology(this.index).activeLayer.rect, align)
      getTopology(this.index).updateProps()
    },
    onSpaceBetween () {
      spaceBetween(getTopology(this.index).activeLayer.pens, getTopology(this.index).activeLayer.rect.width)
      getTopology(this.index).updateProps()
    },
    onLayout () { // 改变布局
      layout(getTopology(this.index).activeLayer.pens, this.layout)
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
      this.pen.name = name
      this.selection.pen.calcControlPoints()
      this.drowdown = 0
      if (this.selection.pen) {
        this.selection.pen.name = name
      }
      this.onChange()
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
        this.selection.pen.gradientFromColor = this.selection.pen.fillStyle ? this.selection.pen.fillStyle : '#fff'
      }
      if (val === 3 || val === 4) {
        this.selection.pen.gradientFromColor = this.selection.pen.data.gradientColor
        this.selection.pen.gradientToColor = this.selection.pen.fillStyle ? this.selection.pen.fillStyle : '#fff'
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
          this.selection.pen.gradientFromColor = this.selection.pen.fillStyle ? this.selection.pen.fillStyle : '#fff'
        }
        if (bktype === 3 || bktype === 4) {
          this.selection.pen.gradientFromColor = this.selection.pen.data.gradientColor
          this.selection.pen.gradientToColor = this.selection.pen.fillStyle ? this.selection.pen.fillStyle : '#fff'
        }
      }

      if (name === 'fillStyle') {
        if (bktype === 1 || bktype === 2) {
          this.selection.pen.gradientToColor = this.selection.pen.data.gradientColor
          this.selection.pen.gradientFromColor = this.selection.pen.fillStyle ? this.selection.pen.fillStyle : '#fff'
        }
        if (bktype === 3 || bktype === 4) {
          this.selection.pen.gradientFromColor = this.selection.pen.data.gradientColor
          this.selection.pen.gradientToColor = this.selection.pen.fillStyle ? this.selection.pen.fillStyle : '#fff'
        }
      }
      if (name === 'fontColor') {
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
      // getTopology(this.index).data[key]=val;
      // getTopology(this.index).render();
      if (isColor) {
        this.topologyData.data[key] = this.colorRGBtoHex(val)
      } else {
        this.topologyData.data[key] = val
      }
      Object.keys(this.topologyData.data).forEach((key1) => {
        if (key1 === 'projectInfo' || key1 === 'alertInfo' || key1 === 'fontSize' || key1 === 'align' || key1 === 'fontColor' || key1 === 'opacity') {
          getTopology(this.index).data.data[key1] = this.topologyData.data[key1]
        } else {
          getTopology(this.index).data[key1] = this.topologyData.data[key1]
        }
      })
      getTopology(this.index).render()
      this.$emit('changeProjectTitle')
    },
    colorRGBtoHex (color) { // 获取颜色16进制数
      if (!color) {
        return ''
      }
      ;
      if (color.length <= 7) {
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
<style scoped>
.props-box label {
  line-height: 32px;
  width: 100px;
  font-size: 14px;
  text-align: right;
}

.props-box .iconLabel {
  line-height: 32px;
  width: 24px;
  font-size: 14px;
  text-align: center;
}

.props-box /deep/ .el-tabs--card > .el-tabs__header {
  background: #EEEEEE;
  border: none;
}

.props-box /deep/ .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
  background: #FFFFFF;
  font-family: Roboto-Bold;
  font-size: 14px;
  color: #FA901C;
  font-weight: 700;
  border-bottom-color: #FFF;
  border-top: 3px solid #FA901C;
}

.props-box /deep/ .el-tabs--card > .el-tabs__header .el-tabs__item {
  box-sizing: content-box;
  height: 31px;
  line-height: 31px;
}
</style>
<style>
.can-clear.el-color-dropdown .el-color-dropdown__link-btn {
  display: inline-block !important;
  margin-right: 5px;
}

.no-style-class.el-color-picker__panel {
  border-radius: 0 0 5px 5px;
  border-top: none;
}

.icon-item {
  width: 75%;
  height: 100%;
  padding-left: 25%;
}

.icon-item svg {
  width: 180px;
  height: 100%;
}

.el-color-predefine__color-selector:nth-child(10n+1) {
  margin-left: 8px;
}

.el-color-predefine__color-selector {
  margin: 0 0 8px 8px;
  width: 22px;
  height: 22px;
}

.color-before-select .el-input__inner {
  background: rgb(245, 247, 250);
}

.color-before-select .el-input__prefix {
  left: 1px;
  /*color: #333;*/
  width: 30px;
  height: 29px;
  top: 1px;
}

.color-before-select .el-select-dropdown__item {
  text-align: center;
}
</style>
<style lang="scss" scoped>
/deep/ .metric-selector-input-box {
  width: calc(100% - 120px) !important;
}

/deep/ .query-row .input-box {
  margin: 0;
}

.legend-title {
  width: 100px;
  margin-right: 10px;
  text-align: left;
  padding-left: 0px;
  margin-left: 10px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
  color: #606266;
}

.project-title {
  background: #eeeeee;
  height: 36px;
  line-height: 36px;
  border-radius: 0;
  padding-left: 10px;
}

.project-content {
  margin: 10px;
  height: calc(100% - 50px);
  overflow-y: auto;

  .project-content-title {
    background: #F6F6F6;
    padding-left: 10px;
    font-size: 14px;
    color: #333333;
    letter-spacing: 0;
    font-weight: 400;
    height: 32px;
    line-height: 31px;
    margin-bottom: 5px;
  }

  .project-content-box {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 15px;
  }

  .half.project-content-item {
    width: calc(50% - 15px);
    height: 64px;

    label {
      width: auto;
    }
  }

  .project-content-item {
    padding-left: 10px;
    display: inline-block;
    position: relative;
    width: 100%;

    label {
      font-family: PingFangSC-Regular;
      font-size: 14px;
      color: #666666;
      letter-spacing: 0;
      font-weight: 400;
    }

    .h32 {
      height: 32px;
    }
  }
}

.project-content.node-content {
  overflow-y: unset;
  height: auto;

  /deep/ .el-select-dropdown__wrap {
    max-height: 190px;
  }
}

.pens-data {
  /deep/ .el-form-item {
    margin-bottom: 10px;
  }

  .half-form-item {
    width: calc(50% - 5px);
    display: inline-block;
  }

  .half-form-item--end {
    margin-left: 5px;
  }

  .full-form-item {
    width: 100%;
    display: inline-block;
  }

  .form-row-title {
    height: 32px;
    line-height: 32px;
    background: #F6F6F6;
    font-size: 14px;
    padding: 0 10px;

    /deep/ .el-form-item__content {
      height: 100%;
      line-height: 32px;

      > div {
        width: 100%;
      }
    }
  }

  /deep/ .el-form-item__content {
    > div {
      width: 100%;
    }
  }

  /deep/ .el-form-item__label {
    line-height: 0;
    padding: 0;
  }

  .element-item {
    padding: 10px 10px 10px 0;
    width: 100%;
    margin-bottom: 10px;
    margin-top: 10px;
  }

  .right-box-form .element-item.form-row-item {
    width: calc(100% - 120px);
    padding: 20px 20px 20px 0;
  }

  .form-row-item .nz-icon-minus-position .nz-icon-minus-medium {
    background: rgba(236, 127, 102, 0.1);
    padding: 2px 6px;
    color: #EC7F66;
  }

  .form-row-item .nz-icon-minus-position {
    right: 6px;
  }
}

.sub-box {
  padding: 0 10px;
}

.props-box {
  /deep/ .el-tabs.el-tabs--card {
    height: 100%;

    .el-tabs__content {
      height: calc(100% - 55px) !important;
      overflow-y: auto;
      padding: 0 10px;
    }
  }

  /deep/ .el-collapse {
    background: #fff;
    border: none;
    font-size: 14px;
  }

  /deep/ .el-collapse-item__header {
    padding: 0 10px;
    background-color: #eeeeee;
    height: 32px;
    font-size: 14px;
    color: #333333;
    letter-spacing: 0;
    font-weight: 400;
    line-height: 14px;
  }

  /deep/ .el-collapse-item {
    margin-bottom: 10px;
  }
  /deep/ .el-collapse-item__wrap {
    padding: 0 10px;
    background-color: #ffffff;
    border: none;
  }

  /deep/ .el-collapse-item__content {
    padding: 10px 0 0 0;
  }

  /deep/ .el-input-number__decrease, /deep/ .el-input-number__increase {
    visibility: hidden;
    outline: none;
  }

  /deep/ .el-input-number:focus {
    .el-input-number__decrease, .el-input-number__increase {
      visibility: visible;
      outline: none;
    }
  }

  /deep/ .el-input-number:focus-within {
    .el-input-number__decrease, .el-input-number__increase {
      visibility: visible;
      outline: none;
    }
  }
}

.thresholds-box {
  background: #FFFFFF;
  border-top: 1px solid #E7EAED;
  border-left: 1px solid #E7EAED;
  border-radius: 2px;
  font-size: 12px;
  color: #333333;
  letter-spacing: 0;
  font-weight: 400;

  .thresholds-title {
    font-size: 12px;
    color: #333333;
    letter-spacing: 0;
    font-weight: 500;
  }

  .thresholds-cell {
    border-bottom: 1px solid #E7EAED;
    border-right: 1px solid #E7EAED;
    padding: 5px 5px;
    height: 42px;
    line-height: 32px;

    /deep/ .el-input-group__prepend {
      padding: 0 10px;
    }

    .is-arrow-active {
      color: #FA901C;
    }

    .nz-icon.nz-icon-arrow-up1 {
      margin-right: -15px;
    }
  }
}

.value-mapping-add {
  background: #FA901C30;
  margin-bottom: 10px;
  height: 24px;
  line-height: 24px;
  color: #FA901C;
  box-sizing: border-box;
}

.mb10 {
  margin-bottom: 10px;
}

.mt10 {
  margin-top: 10px;
}

.p10 {
  padding: 10px;
}

.pl0 {
  padding-left: 0;
}

.special-select .el-select.el-select--small {
  width: 100%;
}

.special-select /deep/ .el-input.el-input--prefix.el-input--suffix, .line-width /deep/ .el-input.el-input--prefix.el-input--suffix {
  border: 1px solid #DCDFE6;
  height: 28px;
}

.special-select /deep/ .el-input__inner, .line-width /deep/ .el-input__inner {
  display: none;
}

.special-select /deep/ .el-input__prefix, .line-width /deep/ .el-input__prefix {
  height: 28px;
  line-height: 28px;
  color: #899FB7;
  width: 100%;
}

.special-select /deep/ .el-input__prefix > div {
  width: 100%;
  height: 100%;
}

.props-box {
  position: relative;
  width: 100%;
  height: calc(100% - 20px);
  padding-bottom: 20px;

  .iconfont {
    cursor: pointer;
  }

  .iconfontSize16 {
    font-size: 16px;
    margin-right: 5px;
  }

  .flex {
    display: flex;

    .full {
      flex: 1;
    }
  }

  .flex-warp {
    flex-wrap: wrap;
  }

  .props-pen-item {
    width: 50%;

    .p10 {
      position: relative;
    }

    .gradient-to {
      /deep/ .el-select.el-select--small {
        vertical-align: top;
        width: calc(100% - 42px);
        margin-left: 5px;
      }
    }

    .gradient-to-color {
      display: inline-block;
      width: calc(100% - 70px);
    }
  }

  .icon-item {
    width: 75%;
    height: 100%;
    padding-left: 25%;
  }

  .icon-item svg {
    width: 100%;
    height: 100%;
  }

  .del-btn {
    position: absolute;
    top: 0;
    right: 0;
    border: none;
    cursor: pointer;
    z-index: 2;
  }

  .del-btn:hover {
    background: #D8D7D7 !important;
  }

  .bottom {
    font-size: 14px;
    position: absolute;
    bottom: 10px;
    left: 10px;
  }

  /deep/ .el-input-number--small {
    width: auto;
  }
}

.color-content {
  height: 0;
  width: 0;
  overflow: hidden;
  position: absolute;
  top: 15px;
  left: 66px;
}

.thresholds-cell .color-content {
  top: 32px;
  left: 137px;
}

.color-tab {
  position: absolute;
  top: 43px;
  left: 0;
  height: 28px;
  border-radius: 5px 5px 0 0;
  width: 312px;
  border: 1px solid #EBEEF5;
  border-bottom: none;
  background-color: #FFF;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  z-index: 1;
}

.color-tab div {
  text-align: center;
  flex: 1;
  color: #909399;
  transition: all .3s cubic-bezier(.645, .045, .355, 1);
  background: #E4E7ED;
  cursor: pointer;
  border-top: 2px solid transparent;
}

/*.color-tab div:first-child{*/
/*border-right-color: #DCDFE6;*/
/*}*/
.color-tab div:hover {
  color: #409EFF;
}

.color-tab .color-active {
  background-color: #FFF;
  font-size: 14px;
  color: #FA901C;
  font-weight: 700;
  border-color: #FA901C;;
}

.color {
  position: relative;
}

.color-show {
  border: 1px solid #E7EAED;
  border-radius: 5px;
  display: flex;
  align-items: center;
  width: 100%;
  height: 30px;
}

.color-show .color-text {
  font-family: PingFangSC-Regular;
  font-size: 14px;
  color: #333333;
  letter-spacing: 0;
  font-weight: 400;
}

.color-show-left {
  width: 18px;
  height: 18px;
  border: 1px solid #E7EAED;
  border-radius: 5px;
  margin: 0 5px;
}

.color-arrows {
  color: #C0C4CC;
  position: absolute;
  right: 12px;
}

.color-arrows .nz-icon {
  font-size: 12px;
}

.v-sub {
  vertical-align: sub;
}

.font12 {
  font-size: 12px;
}

.font20 {
  font-size: 20px;
}

/deep/ .metric-selector-title {
  margin-left: 10px;
  width: 98px !important;
}

/deep/ .query-row .input-box {
  margin-right: 0 !important;
}

/deep/ .el-cascader-node {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/deep/ .nz-cascade-temp {
  box-sizing: border-box;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/deep/ .metric-selector-title {
  background: #fff !important;
}
/deep/ .el-collapse-item__arrow.el-icon-arrow-right{
  display: inline-block !important;
}
/deep/ .el-select--mini {
  width: 100%;
}
</style>
