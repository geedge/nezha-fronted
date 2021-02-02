<template>
  <div class="props-box">
    <!--删除按钮-->
    <button id="edit-ep-del" type="button" class="nz-btn nz-btn-size-normal nz-btn-size-alien del-btn"
            v-if="selection.pen" @click="delTopologyPen">
      <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
      <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
    </button>
    <!--所有属性-->
    <el-tabs v-model="tab" type="card" v-if="selection.pen" @tab-click="tabClick">
      <el-tab-pane label="数据" name="1">
        <el-form v-model="selection.pen.data">
          <!--module-->
          <el-form-item label="Module Name" prop="moduleId" v-if="!selection.pen.type">
            <el-select v-model="selection.pen.data.moduleId" placeholder="" popper-class="asset-dropdown" size="small"
                       @change="moduleIdChange" :popper-append-to-body="false">
              <el-option
                v-for="item in modules"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <!--tooltip-->
          <el-form-item :label="$t('dashboard.panel.chartForm.tooltip')" class="half-form-item" prop="type">
            <el-switch v-model="selection.pen.data.tooltipShow"/>
          </el-form-item>

          <!--chart type-->
          <el-form-item :label="$t('dashboard.panel.chartForm.aggregation')" class="half-form-item" prop="type">
            <el-select class="right-box-row-with-btn" placeholder="" popper-class="chart-box-dropdown-small" size="mini"
                       v-model="selection.pen.data.aggregation" value-key="chartType">
              <el-option :key="item.id" :label="item.name" :value="item.name" v-for="item in aggregationList">
                <span class="panel-dropdown-label-txt">{{item.name}}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <!--chart type-->
          <el-form-item :label="$t('dashboard.panel.chartForm.type')" class="half-form-item" prop="type">
            <el-select class="right-box-row-with-btn" placeholder="" popper-class="chart-box-dropdown-small" size="mini"
                       v-model="selection.pen.data.type" value-key="chartType">
              <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in chartTypeList">
                <span class="panel-dropdown-label-txt">{{item.name}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <!--chart unit-->
          <el-form-item :label="$t('dashboard.panel.chartForm.unit')" class="half-form-item" prop="unit"
                        v-show="selection.pen.data.type !='text'">
            <el-cascader :options="unitOptions"
                         :props="{ expandTrigger: 'hover',emitPath:false }"
                         :show-all-levels="false"
                         filterable
                         placeholder=""
                         popper-class="dc-dropdown"
                         size="mini"
                         v-model="selection.pen.data.unit"
            >
            </el-cascader>
          </el-form-item>

          <!--displayChart-->
          <el-form-item :label="$t('dashboard.panel.chartForm.displayChart')" class="half-form-item" prop="type">
            <el-switch v-model="selection.pen.data.displayChart"/>
          </el-form-item>
          <!--metric-->
          <div class="right-box-sub-title" style="margin-bottom: 20px">
            <span>{{$t('alert.config.expr')}}</span>
              <span @click="addExpression" class="float-right" style="height: 19px;display: inline-block;line-height: 1;">
              <span class="create-square-box">
                <i style="font-size: 17px; cursor: pointer;" class="nz-icon nz-icon-create-square"></i>
              </span>
            </span>
          </div>
          <el-row :key="index" class="element-item form-row-item" style="" v-for="(item,index) in selection.pen.data.expressArr">
            <promql-input
              :expression-list="selection.pen.data.expressArr"
              :id="index"
              :index="index"
              :key="index"
              :plugins="['metric-selector', 'metric-input', 'remove']"
              :ref="'promql-'+index"
              :showRemove="false"
              :styleType="2"
              :metricOptionsParent="metricOptions"
              @change="expressionChange"
              @removeExpression="removeExpression"
            ></promql-input>
            <el-row>
              <template>
                <el-col style="width: 120px; padding-right: 20px; text-align: right; color: #666">
                  {{$t('dashboard.panel.chartForm.legend')}}&nbsp;
                  <el-popover placement="top" trigger="hover" width="211">
                    <div style="word-break:keep-all;">{{$t('dashboard.panel.chartForm.legendTip')}}</div>
                    <i class="nz-icon nz-icon-info-normal" slot="reference" @mouseover="rz" style="font-size: 14px; -webkit-transform:scale(0.75);display:inline-block;"></i>
                  </el-popover>
                </el-col>
                <el-col style="width: calc(100% - 120px);">
                  <el-input size="small" type="text" v-model="selection.pen.data.legends[index]"></el-input>
                </el-col>
              </template>
            </el-row>
            <span class="nz-icon-minus-medium nz-icon-minus-position">
            <i class="nz-icon nz-icon-minus" @click="removeExpression(index - 1)"></i>
          </span>
          </el-row>
          <!--value mapping-->
          <!--<el-row class="value-mapping-title">-->
            <!--<el-col>level</el-col>-->
            <!--<el-col>color</el-col>-->
            <!--<el-col>value</el-col>-->
            <!--<el-col>animation</el-col>-->
            <!--<el-col></el-col>-->
          <!--</el-row>-->
          <!--<el-row class="value-mapping-content">-->
            <!--<el-row v-for="(item,index) in selection.pen.data.valueMapping" :key="index">-->
              <!--<el-col>level</el-col>-->
              <!--<el-col>color</el-col>-->
              <!--<el-col>value</el-col>-->
              <!--<el-col>animation</el-col>-->
              <!--<el-col></el-col>-->
            <!--</el-row>-->
          <!--</el-row>-->
          <el-table v-model="selection.pen.data.valueMapping">
            <el-table-column
              prop="level"
              :label="'level'"
              >
              <template slot-scope="scope">
                {{scope.$index}}
              </template>
            </el-table-column>
            <el-table-column
              prop="color"
              :label="'color'"
            >
            </el-table-column>
            <el-table-column
              prop="value"
              :label="'value'"
            >
              <template slot-scope="scope">
                <el-input v-model="scope.row.value" @change="valueMappingValueChange(scope.$index, scope.row)"/>
              </template>
            </el-table-column>
            <el-table-column
              prop="animation"
              :label="'animation'"
            >
            </el-table-column>
            <el-table-column>
              <template slot="header" slot-scope="scope">

              </template>
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="danger"
                  @click="valueMappingDel(scope.$index, scope.row)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div @click="valueMappingAdd()">add</div>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="属性" name="4">
        <el-collapse v-model="activeNames">
          <!--位置大小-->
          <el-collapse-item title="位置和大小" name="3" v-if="selection.pen&&!selection.pen.type">
            <div class="flex flex-warp">

              <div class="props-pen-item">
                <div>X（px）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                                   v-model.number="selection.pen.rect.x"
                                   :readonly="readonly" required @change="onChange()"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div>Y（px）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                                   v-model.number="selection.pen.rect.y"
                                   :readonly="readonly" required @change="onChange()"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div>宽（px）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                                   v-model.number="selection.pen.rect.width"
                                   :readonly="readonly" required @change="onChange()" :min="0"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div>高（px）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                                   v-model.number="selection.pen.rect.height"
                                   :readonly="readonly" required @change="onChange()" :min="0"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div title="百分比%对应的小数值">圆角（0 - 1）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" :min="0" :max="1" :step="0.1"
                                   name="x" class="input" v-model.number="selection.pen.borderRadius"
                                   :readonly="readonly" required @change="onChange()"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div>旋转（°）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                                   v-model.number="selection.pen.rotate"
                                   :readonly="readonly" required @change="onChange()"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div>内边距 上（px）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                                   v-model.number="selection.pen.paddingTop"
                                   :readonly="readonly" required @change="onChange()" :min="0"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div>内边距 下（px）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                                   v-model.number="selection.pen.paddingBottom"
                                   :readonly="readonly" required @change="onChange()" :min="0"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div>内边距 左（px）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                                   v-model.number="selection.pen.paddingLeft"
                                   :readonly="readonly" required @change="onChange()" :min="0"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div>内边距 右（px）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                                   v-model.number="selection.pen.paddingRight"
                                   :readonly="readonly" required @change="onChange()" :min="0"></el-input-number>
                </div>
              </div>

            </div>
          </el-collapse-item>
          <!--样式-->
          <el-collapse-item title="样式" name="4" v-if="selection.pen">
            <div class="flex flex-warp">
              <div class="props-pen-item special-select" v-if="selection.pen.name!=='image'">
                <div>线条样式</div>
                <div class="p10 pl0">
                  <el-select v-model="selection.pen.dash" placeholder="请选择" size="small" :popper-append-to-body="false"
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
                <div>连线类型</div>
                <div class="p10 pl0">
                  <el-select v-model="selection.pen.name" placeholder="请选择" size="small" :popper-append-to-body="false"
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
                <div>起点箭头</div>
                <div class="p10 pl0">
                  <el-select v-model="selection.pen.fromArrow" placeholder="请选择" size="small"
                             :popper-append-to-body="false" @change="onClickFromArrow">
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
                <div>终点箭头</div>
                <div class="p10 pl0">
                  <el-select v-model="selection.pen.toArrow" placeholder="请选择" size="small"
                             :popper-append-to-body="false" @change="onClickToArrow">
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

              <div class="props-pen-item" v-if="selection.pen.name!=='image'">
                <div>线条宽度（px）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                                   v-model.number="selection.pen.data.lineWidth"
                                   :readonly="readonly" required @change="onChange('lineWidth')"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen.name!=='image'">
                <div>线条颜色</div>
                <div class="p10 pl0">
                  <el-color-picker @active-change="(val)=>colorChange(val,'strokeStyle')"
                                   v-model="selection.pen.strokeStyle" size="mini"></el-color-picker>
                </div>
              </div>
              <div class="props-pen-item" v-if="selection.pen.name!=='image'">
                <div>箭头颜色</div>
                <div class="p10 pl0">
                  <el-color-picker @active-change="(val)=>colorChange(val,'arrowColor')"
                                   v-model="selection.pen.fromArrowColor" size="mini"></el-color-picker>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen && !selection.pen.bkType&&!selection.pen.type">
                <div>背景颜色</div>
                <div class="p10 pl0">
                  <el-color-picker @active-change="(val)=>colorChange(val,'fillStyle')"
                                   v-model="selection.pen.fillStyle" size="mini"></el-color-picker>
                </div>
              </div>

              <div class="props-pen-item" v-if="selection.pen">
                <div>透明度（0 - 1）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" name="globalAlpha" class="input full"
                                   v-model.Number="selection.pen.globalAlpha"
                                   controls-position="right" size="small" :readonly="readonly" @change="onChange()"
                                   :min="0.01"
                                   :max="1"></el-input-number>
                </div>
              </div>

            </div>
          </el-collapse-item>
          <!--动画-->
          <el-collapse-item title="动画" name="5" v-if="selection.pen&&selection.pen.type">
            <div class="flex flex-warp">
              <div class="props-pen-item">
                <div>动画类型</div>
                <div class="p10 pl0">
                  <el-select v-model="selection.pen.animateType" placeholder="请选择" size="small"
                             :popper-append-to-body="false" @change="onAnimate">
                    <el-option v-for="(item,index) in lineAnimateOptions" :value="item.id" :key="index"
                               :label="item.name"></el-option>
                  </el-select>
                </div>
              </div>

              <div class="props-pen-item">
                <div>圆点大小（px）</div>
                <div class="p10 pl0">
                  <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                                   v-model.number="selection.pen.animateDotSize"
                                   :readonly="readonly" required @change="onChange()" :min="0"></el-input-number>
                </div>
              </div>

              <div class="props-pen-item">
                <div>线条颜色</div>
                <div class="p10 pl0">
                  <el-color-picker @active-change="(val)=>colorChange(val,'animateColor')"
                                   v-model="selection.pen.animateColor" size="mini"></el-color-picker>
                </div>
              </div>

              <!--<div class="props-pen-item">-->
              <!--<div>快慢</div>-->
              <!--<div class="p10 pl0">-->
              <!--<el-slider v-model="selection.pen.animateSpan" :min="1"  :max="5"></el-slider>-->
              <!--</div>-->
              <!--</div>-->

              <!--<div class="props-pen-item">-->
              <!--<div>是否播放 </div>-->
              <!--<div class="p10 pl0">-->
              <!--<el-button @click="selection.pen.animateStart=1;onAnimate()" size="mini">-->
              <!--播放-->
              <!--</el-button>-->
              <!--<el-button @click="selection.pen.animateStart=0;onAnimate()" size="mini">-->
              <!--暂停-->
              <!--</el-button>-->
              <!--</div>-->
              <!--</div>-->

              <div class="props-pen-item">
                <div>开启</div>
                <!--自动播放-->
                <div class="p10 pl0">
                  <el-switch
                    v-model="selection.pen.animatePlay"
                    :active-value="true"
                    :inactive-value="false"
                    active-color="#ee9d3f"
                    @change="()=>{onAnimate()}">
                  </el-switch>
                </div>
              </div>
            </div>

          </el-collapse-item>
        </el-collapse>
        <div>

        </div>
      </el-tab-pane>
      <!--<el-tab-pane label="事件" name="2">事件</el-tab-pane>-->
      <!--<el-tab-pane label="动效" name="3" v-if="selection.pen.type">--><!--</el-tab-pane>-->
      <!--<el-tab-pane label="结构" name="5">结构</el-tab-pane>-->
    </el-tabs>


    <!--选择多个节点-->
    <!--<div v-if="selection.pens" class="">-->
      <!--<el-collapse v-model="activeNames">-->
        <!--&lt;!&ndash;对齐方式&ndash;&gt;-->
        <!--<el-collapse-item title="对齐" name="1" v-if="selection.pens">-->
          <!--<label class="hover pointer mr10 iconLabel" v-for="item in nodesAlign" :title="item.desc">-->
            <!--<i :class="['iconfont','iconfontSize16',`icon-align-${item.value}`]"-->
               <!--@click="onNodesAlign(item.value)"></i>-->
          <!--</label>-->
        <!--</el-collapse-item>-->
        <!--&lt;!&ndash;排版&ndash;&gt;-->
        <!--<el-collapse-item title="排版" name="2" v-if="selection.pens">-->
          <!--<div class="mt10">-->
            <!--<div class="flex middle mb10">-->
              <!--<label>最大宽度：</label>-->
              <!--<div class="full pr10">-->
                <!--<el-input-number :precision="2" controls-position="right" type="number" class="input" size="small"-->
                                 <!--v-model.number="layout.maxWidth" title="超出最大宽度换行"></el-input-number>-->
              <!--</div>-->
            <!--</div>-->
            <!--<div class="flex middle mb10">-->
              <!--<label>节点宽度：</label>-->
              <!--<div class="full pr10">-->
                <!--<el-input-number :precision="2" controls-position="right" type="number" class="input" size="small"-->
                                 <!--v-model.number="layout.nodeWidth" title="固定每个节点的宽度"></el-input-number>-->
              <!--</div>-->
            <!--</div>-->
            <!--<div class="flex middle mb10">-->
              <!--<label>节点高度：</label>-->
              <!--<div class="full pr10">-->
                <!--<el-input-number :precision="2" controls-position="right" type="number" class="input" size="small"-->
                                 <!--v-model.number="layout.nodeHeight" title="固定每个节点的高度"></el-input-number>-->
              <!--</div>-->
            <!--</div>-->
            <!--<div class="flex middle mb10">-->
              <!--<label>水平个数：</label>-->
              <!--<div class="full pr10">-->
                <!--<el-input-number :precision="2" type="number" controls-position="right" class="input" size="small"-->
                                 <!--v-model.number="layout.maxCount"-->
                                 <!--title="超出最大个数，将自动计算水平间距（下面水平间距设置将无效）"></el-input-number>-->
              <!--</div>-->
            <!--</div>-->
            <!--<div class="flex middle mb10">-->
              <!--<label>水平间距：</label>-->
              <!--<div class="full pr10">-->
                <!--<el-input-number :precision="2" controls-position="right" type="number" class="input" size="small"-->
                                 <!--v-model.number="layout.spaceWidth" title="节点之间水平间距（px）"></el-input-number>-->
              <!--</div>-->
            <!--</div>-->
            <!--<div class="flex middle mb10">-->
              <!--<label>垂直间距：</label>-->
              <!--<div class="full pr10">-->
                <!--<el-input-number :precision="2" controls-position="right" type="number" class="input" size="small"-->
                                 <!--v-model.number="layout.spaceHeight" title="节点之间垂直间距（px）"></el-input-number>-->
              <!--</div>-->
            <!--</div>-->
            <!--<div class="flex middle">-->
              <!--<label></label>-->
              <!--<div class="full pr10">-->
                <!--<button class="button primary" @click="onLayout">开始排版</button>-->
              <!--</div>-->
            <!--</div>-->
          <!--</div>-->
        <!--</el-collapse-item>-->
      <!--</el-collapse>-->
    <!--</div>-->
    <!-- 选中为空 -->
    <div v-if="!selection.pen && !selection.pens">
      <div class="project-title">
        Project
      </div>
      <div class="project-content">
        <div class="project-content-title">Title</div>

        <div class="project-content-box" style="width: 100%">

          <div class="project-content-item">
            <label>Name：</label>
            <div class="full pr10">
              <el-input class="input" size="small" v-model="topologyData.data.name" placeholder="请输入名称"  @change="changeTopologyOpt"></el-input>
            </div>
          </div>
        </div>

        <div class="project-content-title">Appearance</div>

        <div class="project-content-box" style="width: 100%">
          <div class="project-content-item half">
            <label>Backgroud：</label>
            <div class="full pr10 h32">
              <el-color-picker @active-change="(val)=>changeTopologyOpt(val,'bkColor')"
                               v-model="topologyData.data.bkColor" size="mini"></el-color-picker>
            </div>
          </div>

          <div class="project-content-item half">
            <label>Image：</label>
            <div class="full pr10 h32">
              <!--暂时是input 输入网址-->
              <el-input class="input" size="small" v-model="topologyData.data.bkImage" placeholder="背景图片网址"></el-input>
            </div>
          </div>

          <div class="project-content-item half">
            <label>默认线宽：</label>
            <div class="full pr10 h32">
              <el-input-number :precision="2"
                               controls-position="right"
                               size="small"
                               name="x" class="input"
                               v-model.number="topologyData.data.lineWidth"
                               required
                               @change="changeTopologyOpt(topologyData.data.lineWidth,'lineWidth')">
              </el-input-number>
            </div>
          </div>

          <div class="project-content-item half">
            <label>背景网格：</label>
            <div class="full pr10 h32">
              <el-switch
                v-model="topologyData.data.grid"
                :active-value="true"
                :inactive-value="false"
                active-color="#ee9d3f"
                @change="changeTopologyOpt(topologyData.data.grid,'grid')">
              </el-switch>
            </div>
          </div>

          <div class="project-content-item half">
            <label>网格大小：</label>
            <div class="full pr10 h32">
              <el-input-number :precision="2" controls-position="right" size="small" name="x" class="input"
                               v-model.number="topologyData.data.gridSize"
                               :readonly="readonly" required
                               @change="changeTopologyOpt(topologyData.data.gridSize,'gridSize')"></el-input-number>
            </div>
          </div>

          <div class="project-content-item half">
            <label>网格颜色：</label>
            <div class="full pr10 h32">
              <el-color-picker @active-change="(val)=>changeTopologyOpt(val,'gridColor')"
                               v-model="topologyData.data.gridColor" size="mini"
                               popper-class="can-clear"></el-color-picker>
            </div>
          </div>

          <div class="project-content-item half">
            <label>标尺：</label>
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

          <div class="project-content-item half">
            <label>标尺颜色：</label>
            <div class="full pr10 h32">
              <el-color-picker @active-change="(val)=>changeTopologyOpt(val,'ruleColor')"
                               v-model="topologyData.data.ruleColor" size="mini"
                               popper-class="can-clear"></el-color-picker>
            </div>
          </div>

          <div class="project-content-item half special-select">
            <label>默认开始箭头：</label>
            <div class="full pr10 h32">
              <el-select v-model="topologyData.data.fromArrow" placeholder="请选择" size="small"
                         :popper-append-to-body="false"
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
            <label>默认结束箭头：</label>
            <div class="full pr10 h32">
              <el-select v-model="topologyData.data.toArrow" placeholder="请选择" size="small" :popper-append-to-body="false"
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
                      <g fill="none" :stroke="(topologyData.data.toArrow==item.name)?'#ee9d3f':'black'" stroke-width="1">
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
          </div>

        </div>

        <div class="project-content-title">Appearance</div>

        <div class="project-content-box" style="width: 100%">

          <div class="project-content-item half">
            <label>Project Info：</label>
            <div class="full pr10 h32">
              <el-switch
                v-model="topologyData.data.projectInfo"
                :active-value="true"
                :inactive-value="false"
                active-color="#ee9d3f"
                @change="changeTopologyOpt(topologyData.data.projectInfo,'projectInfo')">
              </el-switch>
            </div>
          </div>

          <div class="project-content-item half">
            <label>Alert Info：</label>
            <div class="full pr10 h32">
              <el-switch
                v-model="topologyData.data.alertInfo"
                :active-value="true"
                :inactive-value="false"
                active-color="#ee9d3f"
                @change="changeTopologyOpt(topologyData.data.alertInfo,'alertInfo')">
              </el-switch>
            </div>
          </div>

        </div>

        <div class="project-content-title">Link</div>

        <div class="project-content-box" style="width: 100%">

          <div class="project-content-item">
            <label>Url：</label>
            <div class="full pr10">
              <el-input class="input" size="small" v-model="topologyData.data.url" placeholder="请输入名称"  @change="changeTopologyOpt"></el-input>
            </div>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script>
  import {alignNodes,spaceBetween,layout} from '@topology/layout';
  import {getTopology} from "../../js/common";
  // import ChartMetric from "./chartMetric";
  import chartDataFormat from '../../../charts/chartDataFormat';
  import promqlInput from "../../../page/dashboard/explore/promqlInput";
  import {getUUID, resetZIndex} from "../../../common/js/common";
  var rz = {
    methods: {
      rz(e) {
        resetZIndex(e);
      }
    }
  };
  export default {
    //pen.type 0为node 1位line
    data(){
      return {
        expressions: [],
        chartTypeList:[
          {
            id:"line",
            name:this.$t("dashboard.panel.chartForm.typeVal.line.label")
          },
          {
            id:'stackArea',
            name:this.$t("dashboard.panel.chartForm.typeVal.stackArea.label")
          },
          {
            id:"bar",
            name:this.$t("dashboard.panel.chartForm.typeVal.bar.label")
          },
          {
            id:"table",
            name:this.$t("dashboard.panel.chartForm.typeVal.table.label")
          },
        ],
        aggregationList:[
          {
            id:"last",
            name:'last'
          },{
            id:"first",
            name:'first'
          },{
            id:"min",
            name:'min'
          },{
            id:"max",
            name:'max'
          },{
            id:"avg",
            name:'avg'
          },{
            id:"count",
            name:'count'
          },{
            id:"sum",
            name:'sum'
          }
        ],
        metricList: [], // metric列表
        metricCascaderList:[],//metric级联列表
        metricAllData:new Map(),//存放所有的project-module-metric-labelValue，避免重复加载
        metricOptions: [],
        unitOptions:chartDataFormat.unitOptions(),
        lineId:null,
        lineIsJson:false,
        lineData:'',
        penId:null,
        penIsJson:false,
        penData:'',
        tab:'1',
        drowdown:0,
        readonly:false,
        topologyData:{
          data:{
            name:'',
            bkColor:'#FFFFFF',
            bkImage:'',
            grid:false,
            gridSize:'',
            gridColor:undefined,
            rule:false,
            ruleColor:undefined,
            lineName:'curve',
            lineWidth:1,
            fromArrow:'',
            toArrow:'triangleSolid',
            projectInfo:true,
            alertInfo:true,
            url:'',
          }
        },
        pen:{
          dash:'',
          font:'',
          lineWidth:'',
          strokeStyle:'',
          textMaxLine:'',
          textOffsetX:'',
          textOffsetY:'',
          globalAlpha:'',
        },
        penNumber:'',
        nodesAlign:[//对齐方式
          {
            value:'left',
            desc:'左对齐'
          },{
            value:'right',
            desc:'右对齐'
          },{
            value:'top',
            desc:'顶部对齐'
          },{
            value:'bottom',
            desc:'底部对齐'
          },{
            value:'center',
            desc:'垂直居中'
          },{
            value:'middle',
            desc:'水平居中'
          }],
        layout:{//显示对应属性
          maxWidth:1000,
          nodeWidth:0,
          nodeHeight:0,
          maxCount:0,
          spaceWidth:30,
          spaceHeight:30
        },
        activeNames:['1','2','3','4','5'],
        show:{//显示对应属性
          pos:true,
          layout:true,
          looks:true,
        },
        data:{},
        penDash:[
          {d:'M5 14 l85 0',"stroke-dasharray":""},
          {d:'M5 14 l85 0',"stroke-dasharray":"5,5"},
          {d:'M5 14 l85 0',"stroke-dasharray":"10,10"},
          {d:'M5 14 l85 0',"stroke-dasharray":"10,10,2,10"},
        ],
        penLineType:[
          {d:'M5 14 a100,50 0 0,1 85,0',"stroke-dasharray":"",name:'curve'},
          {d:'M5 8 l40 0 l0 12 l40 0',"stroke-dasharray":"",name:'polyline'},
          {d:'M5 14 l85 0',"stroke-dasharray":"",name:'line'},
          {d:'M5 20 C0,8 50,0 85,0',"stroke-dasharray":"",name:'mind'},
        ],
        penLineFromTOArrow:[
          {d:'M5 14 l85 0',"points":"",fill:'',stroke:"",'stroke-width':"",name:''},
          {d:'M5 14 l85 0',"points":"5 14,20 9,20 19",fill:'#000000',stroke:"",'stroke-width':"",name:'triangleSolid'},
          {
            d:'M5 14 l85 0',
            "points":"5 14,20 9,20 19",
            fill:'#ffffff',
            stroke:"#000000",
            'stroke-width':"1",
            name:'triangle'
          },
          {d:'M5 14 l85 0',fill:'#000000',stroke:"",'stroke-width':"",cx:"10",cy:"14",r:"5",name:'circleSolid'},
          {d:'M5 14 l85 0',fill:'#ffffff',stroke:"#000000",'stroke-width':"1",cx:"10",cy:"14",r:"5",name:'circle'},
        ],
        lineAnimateOptions:[
          {id:1,name:'水流'},
          {id:'beads',name:'水珠流动'},
          {id:'dot',name:'圆点'},
          {id:'comet',name:'彗星'},
        ],
      }
    },
    mixins: [rz],
    components:{
      promqlInput
    },
    computed:{},
    props:{
      selection:{
        type:Object,
        require:true
      },
      index:{
        type:Number,
        require:true,
      },
      modules:{}
    },
    watch:{
      selection:{
        handler(n){
          if(n){
            this.drowdown=0;
          }
        },
        deep:true,
        immediate:true,
      },
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
      // }
    },
    created(){
      let dataOption=getTopology(this.index).data;
      console.log(dataOption);
      Object.keys(this.topologyData.data).forEach((key)=>{
        console.log()
        this.topologyData.data[key]=(JSON.stringify(dataOption[key])?dataOption[key]:this.topologyData.data[key]);
      });
    },
    mounted(){
      this.queryMetrics();
      // this.topologyData.data.grid= !!dataOption.grid;
      // this.topologyData.data.rule= !!dataOption.rule;
      // this.topologyData.data.projectInfo= !!dataOption.projectInfo;
      // this.topologyData.data.alertInfo= !!dataOption.alertInfo;
      console.log(this.topologyData);
    },
    updated(){
      if(!this.selection.pen){//没选中node line返回
        return;
      }
      if(this.penId===this.selection.pen.id){
        return;
      }
      if(this.selection.pen.id){
        this.selection.expand=false;
        this.penId=this.selection.pen.id;
        let originData=this.selection.pen.data;
        this.penIsJson=this.isJson(originData);
        this.penData=this.penIsJson?
          JSON.stringify(originData,null,4):
          this.penData=originData;
      }
    },
    methods:{
      queryMetrics() {
        this.metricOptions = [];
        this.$get('prom/api/v1/label/__name__/values').then(response=>{
          if(response.status == 'success'){
            let metrics=response.data.sort();
            let metricMap=new Map();
            metrics.forEach((item)=>{
              let key='';
              if(/^[a-zA-Z]+?_[a-zA-Z]*/.test(item)){
                key=item.split('_')[0];
              }else if(/^_\w*/.test(item)){
                key='      ';
              }else{
                key=item;
              }
              if(metricMap.get(key)){
                let values=metricMap.get(key);
                values.push({label:item,value:item});
              }else{
                let values=[{label:item,value:item}];
                metricMap.set(key,values);
              }
              //this.metricStore.push({label:item,value:item,insertText:item})
            });
            for(let key of metricMap.keys()){
              let option={
                label:key,
                value:key,
              };
              if(metricMap.get(key) && metricMap.get(key).length>1){
                option.children=metricMap.get(key);
              }
              this.metricOptions.push(option);
            }
          }
        })
      },
      tabClick(n){
        console.log(n);
        if(this.selection.pen&&this.tab=='1'){

        }
      },
      moduleIdChange(n){
        this.selection.pen.data.moduleName=this.modules.find(item=>item.id===n).name;
      },
      onChange(value){
        if(value==='lineWidth'){
          this.pen.lineWidth=this.selection.pen.data.lineWidth;
        }
        if(this.selection.pens){
          for(const item of this.selection.pens){
            item.dash=this.pen.dash;
            item.strokeStyle=this.pen.strokeStyle;
            item.lineWidth=this.pen.lineWidth;
            item.globalAlpha=this.pen.globalAlpha;
            item.font=Object.assign({},this.pen.font);
            item.textMaxLine=this.pen.textMaxLine;
            item.textOffsetX=this.pen.textOffsetX;
            item.textOffsetY=this.pen.textOffsetY;
          }
        }
        if(!this.selection.pen.type||this.selection.pens){
          this.$emit('change',this.selection.pen||this.selection.pens);
        }else{// 线更新
          this.$emit('change');
        }
      },
      changeExpand(){
        this.selection.expand= !this.selection.expand;
      },
      isJson(obj){
        return typeof (obj)=="object"&&Object.prototype.toString.call(obj).toLowerCase()=="[object object]"&& !obj.length;
      },

      //组件事件
      onNodesAlign(align){//对齐node
        alignNodes(getTopology(this.index).activeLayer.pens,getTopology(this.index).activeLayer.rect,align);
        getTopology(this.index).updateProps();
      },
      onSpaceBetween(){
        spaceBetween(getTopology(this.index).activeLayer.pens,getTopology(this.index).activeLayer.rect.width);
        getTopology(this.index).updateProps();
      },
      onLayout(){//改变布局
        layout(getTopology(this.index).activeLayer.pens,this.layout);
        getTopology(this.index).updateProps();
      },
      onClickDash(number){//改变线型
        this.pen.dash=number;
        this.drowdown=0;
        if(this.selection.pen){
          this.selection.pen.dash=number;
        }

        this.onChange();
      },
      onClickName(name){
        this.pen.name=name;
        this.drowdown=0;
        if(this.selection.pen){
          this.selection.pen.name=name;
        }
        this.onChange();
      },
      colorChange(val,name){//改变颜色
        if(name==='arrowColor'){
          this.selection.pen.fromArrowColor=this.colorRGBtoHex(val);
          this.selection.pen.toArrowColor=this.colorRGBtoHex(val);
          this.selection.pen.data['fromArrowColor']=this.colorRGBtoHex(val);
          this.selection.pen.data['toArrowColor']=this.colorRGBtoHex(val);
        }else{
          this.selection.pen[name]=this.colorRGBtoHex(val);
        }
        this.selection.pen.data[name]=this.colorRGBtoHex(val);


        this.onChange();
      },
      changeTopologyOpt(val,key){
        // this.topologyData.data[key]=this.colorRGBtoHex(val);
        // getTopology(this.index).data[key]=val;
        // getTopology(this.index).render();
        this.topologyData.data[key]=val;
        Object.keys(this.topologyData.data).forEach((key1)=>{
          getTopology(this.index).data[key1]=this.topologyData.data[key1];
        });
        // console.log(dataOption[key]);
        getTopology(this.index).render();
        console.log(123213123);
      },
      colorRGBtoHex(color){//获取颜色16进制数
        return color;
        if(!color){
          return ""
        }
        ;
        let rgb=color.split(',');
        let r=parseInt(rgb[0].split('(')[1]);
        let g=parseInt(rgb[1]);
        let b=parseInt(rgb[2].split(')')[0]);
        let hex="#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
        return hex;
      },
      onClickToArrow(arrow){
        this.selection.pen.toArrow=arrow;
        this.drowdown=0;
        this.onChange();
      },
      onClickFromArrow(arrow){
        this.selection.pen.fromArrow=arrow;
        this.drowdown=0;
        this.onChange();
      },
      onAnimate(val){
        this.selection.pen.animateStart=this.selection.pen.animateStart?Date.now():0;
        this.selection.pen.data.animatePlay=this.selection.pen.animatePlay;
        this.onChange();
        this.$emit('animate');
      },
      delTopologyPen(){
        let delObj=this.selection.pen?this.selection.pen.id:this.selection.pens
        this.$emit('del',delObj);
      },
      getMetricOptions() {
        return this.metricOptions;
      },
      addExpression(){
        this.selection.pen.data.expressArr.push('');
        this.selection.pen.data.legends.push('');
      },
      expressionChange(item){

      },
      removeExpression(index) {
        if (this.selection.pen.data.expressArr.length > 1) {
          this.selection.pen.data.expressArr.splice(index, 1);
          this.selection.pen.data.legends.splice(index, 1);
          this.$nextTick(() => {
            this.expressions.forEach((ex, index) => {
              if (ex) {
                this.$refs[`promql-${index}`][0].metricChange(ex);
              }
            });
          });
        }
      },
      valueMappingAdd(){
        this.selection.pen.data.valueMapping.push({
          color:{
            border:'#000',
            bac:'#fff',
            text:'#000',
          },
          animation:'upDown',
          value:'',
        });
      },
      valueMappingValueChange(index,row){
        console.log(index,row)
      },
      valueMappingDel(index,row){
        console.log(index,row)
      },
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

</style>
<style>
  .can-clear.el-color-dropdown .el-color-dropdown__link-btn {
    display: inline-block !important;
    margin-right: 5px;
  }
</style>
<style lang="scss" scoped>
  .project-title{
    background: #eeeeee;
    height: 36px;
    line-height: 36px;
    border-radius:10px 0 0 0;
    padding-left: 10px;
  }
  .project-content{
    margin: 10px;
    .project-content-title{
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
    .project-content-box{
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 15px;
    }
    .half.project-content-item{
      width: calc(50% - 15px);
      height: 64px;
    }
    .project-content-item{
      padding-left: 10px;
      display: inline-block;
      width: 100%;
      label{
        font-family: PingFangSC-Regular;
        font-size: 14px;
        color: #666666;
        letter-spacing: 0;
        font-weight: 400;
      }
      .h32{
        height: 32px;
      }
    }
  }
  /deep/ .el-tabs.el-tabs--card {
    height: 100%;

    .el-tabs__content {
      height: calc(100% - 55px) !important;
      overflow-y: auto;
    }
  }

  /deep/ .el-collapse-item__header {
    padding: 0 10px;
    background-color: #F9F9F9;
  }

  /deep/ .el-collapse-item__wrap {
    padding: 0 10px;
    background-color: #F9F9F9;
  }

  /deep/ .el-collapse-item__content {
    padding: 12px 0px;
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
    width: calc(100% - 20px);
    height: calc(100% - 20px);
    overflow-y: scroll;
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
    }

    .icon-item {
      width: 100%;
      height: 100%;
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
</style>
