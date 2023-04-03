<template>
  <div class="pens-data right-box__container" :key="pen.id">
    <div v-if="pen.id">
      <div class="form-row-box">
        <div class="form-row-content">
          <div class="form-row-item">
            <div class="form-row-key">
              {{$t('asset.id')}}
            </div>
            <div class="form-row-value">
              <el-input
                size="small"
                class="input"
                v-model.number="pen.id"
                readonly
                @change="change('id')"></el-input>
            </div>
          </div>
          <div class="form-row-item">
            <div class="form-row-key">
              {{$t('overall.name')}}
            </div>
            <div class="form-row-value">
              <el-input
                size="small"
                class="input"
                v-model.number="pen.nzName"
                @change="change('nzName')"></el-input>
            </div>
          </div>
          <div class="form-row-item form-row-item-full" v-if="!pen.type">
            <div class="form-row-key">
              {{$t('overall.module')}}
            </div>
            <div class="form-row-value">
              <el-select v-model="pen.moduleId" @change="change('moduleId')" size="small" clearable>
                <el-option v-for="item in modules" :value="item.id" :key="item.id" :label="item.name" :disabled="item.disabled"/>
              </el-select>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!pen.type">
        <div class="form-row-box">
          <!--        Position  -->
          <div class="form-row-title">
            {{$t('project.topology.position')}}
            <i class="nz-icon nz-icon-arrow-down"  :class="elements.position?'':'is-rotate'" @click="updateShow('position')"/>
          </div>
          <div v-show="elements.position" class="form-row-content">
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('topology.position.x')}}
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :step="1"
                  :precision="2"
                  controls-position="right"
                  size="small"
                  name="globalAlpha"
                  class="input"
                  v-model.number="pen.x"
                  required
                  @change="change('x')"></el-input-number>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('topology.position.y')}}
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :step="1"
                  :precision="2"
                  controls-position="right"
                  size="small"
                  name="globalAlpha"
                  class="input"
                  v-model.number="pen.y"
                  required
                  @change="change('y')"></el-input-number>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                <div>{{ $t('dashboard.dashboard.chartForm.width') }}</div>
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :step="1"
                  :precision="2"
                  controls-position="right"
                  size="small"
                  name="globalAlpha"
                  class="input"
                  v-model.number="pen.width"
                  required
                  @change="change('width')"></el-input-number>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                <div>{{ $t('dashboard.dashboard.chartForm.high') }}</div>
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :step="1"
                  :precision="2"
                  controls-position="right"
                  size="small"
                  name="globalAlpha"
                  class="input"
                  v-model.number="pen.height"
                  required
                  @change="change('height')"></el-input-number>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.lockRatio')}}
              </div>
              <div class="form-row-value">
                <el-switch
                  v-model="pen.ratio"
                  :active-value="true"
                  :inactive-value="false"
                  @change="change('ratio')"
                ></el-switch>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{ $t('project.topology.rotate') }}（°）
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :min="0"
                  :max="360"
                  :step="1"
                  :precision="2"
                  controls-position="right"
                  size="small"
                  name="globalAlpha"
                  class="input"
                  v-model.number="pen.rotate"
                  required
                  @change="change('rotate')"></el-input-number>
              </div>
            </div>
          </div>

          <!--         Border -->
          <div class="form-row-title">
            {{ $t('project.topology.border') }}
            <i class="nz-icon nz-icon-arrow-down" :class="elements.border?'':'is-rotate'" @click="updateShow('border')"/>
          </div>
          <div v-show="elements.border" class="form-row-content">
            <div class="form-row-item special-meta2d-select">
              <div class="form-row-key">
                {{$t('overall.type')}}
              </div>
              <div class="form-row-value">
                <el-select :popper-append-to-body="false" v-model="pen.borderType" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
                           @change="(val)=>{change('lineDash', val)}">
                  <div slot="prefix">
                    <div class="icon-item">
                      <svg>
                        <g fill="none" :stroke="theme === 'light' ? 'black' : '#BEBEBE'" stroke-width="1">
                          <path
                            :d="penDash.find((item,i)=>i==(pen.borderType?pen.borderType:0)).d"
                            :stroke-dasharray="penDash.find((item,i)=>i==(pen.borderType?pen.borderType:0))['stroke-dasharray']">
                          </path>
                        </g>
                      </svg>
                    </div>
                  </div>
                  <el-option v-for="(item,index) in penDash" :value="index" :key="index">
                    <div class="icon-item">
                      <svg>
                        <g fill="none" :stroke="(pen.borderType==index)?'#ee9d3f':item.strokeColor" stroke-width="1">
                          <path :d="item.d" :stroke-dasharray="item['stroke-dasharray']"></path>
                        </g>
                      </svg>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{ $t('dashboard.dashboard.chartForm.width') }}
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :step="1"
                  :min="0"
                  :precision="0"
                  controls-position="right"
                  size="small"
                  name="globalAlpha"
                  class="input"
                  v-model.number="pen.lineWidth"
                  required
                  @change="change('lineWidth')"></el-input-number>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{ $t('project.topology.color') }}
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :ref="'nezhaColorPenColor'"
                  :isTopo="true"
                  :value-arr="[{name:'color',value: pen.color}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{ $t('project.topology.radius') }}
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :step="1"
                  :min="0"
                  :precision="1"
                  controls-position="right"
                  size="small"
                  name="globalAlpha"
                  class="input"
                  v-model.number="pen.borderRadius"
                  required
                  @change="change('borderRadius')"></el-input-number>
              </div>
            </div>
          </div>

          <!--         backGround -->
          <div class="form-row-title">
            {{$t('project.topology.bac')}}
            <i class="nz-icon nz-icon-arrow-down" :class="elements.backGround?'':'is-rotate'" @click="updateShow('backGround')"/>
          </div>
          <div v-show="elements.backGround" class="form-row-content">
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.color')}}
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :ref="'nezhaColorPenBackground'"
                  :isTopo="true"
                  :value-arr="[{name:'background',value: pen.background}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.opacity')}}
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  :precision="2"
                  controls-position="right"
                  size="small"
                  name="globalAlpha"
                  class="input"
                  v-model.number="pen.globalAlpha"
                  required
                  @change="change('globalAlpha')"></el-input-number>
              </div>
              </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.image')}}
              </div>
              <div class="form-row-value">
<!--                <el-input  v-model="pen.image" size="small" @change="change('image')"/>-->
                <meta2dSelectImage :selectImage="pen.image" :imgId="pen.imageId" :icon="pen.icon" @updateImage="updateImage"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.imageRatio')}}
              </div>
              <div class="form-row-value">
                <el-switch
                  v-model="pen.imageRatio"
                  :active-value="true"
                  :inactive-value="false"
                  @change="change('imageRatio')"
                ></el-switch>
              </div>
            </div>
            </div>

          <!--         text -->
          <div class="form-row-title">
            {{$t('project.topology.text')}}
            <i class="nz-icon nz-icon-arrow-down" :class="elements.text?'':'is-rotate'" @click="updateShow('text')"/>
          </div>
          <div v-show="elements.text" class="form-row-content">
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.color')}}
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :ref="'nezhaColorPenTextColor'"
                  :isTopo="true"
                  :value-arr="[{name:'textColor',value: pen.textColor}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.fontSize')}}
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :min="10"
                  :step="1"
                  :precision="0"
                  controls-position="right"
                  size="small"
                  name="globalAlpha"
                  class="fontSize"
                  v-model.number="pen.fontSize"
                  required
                  @change="change('fontSize')"></el-input-number>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{ $t('project.topology.textAlign') }}
              </div>
              <div class="form-row-value">
                <el-select :placeholder="$t('el.select.placeholder')" :popper-append-to-body="true"
                           class="right-box-row-with-btn no-style-class" popper-class="chart-box-dropdown-small right-box-select-top right-public-box-dropdown-top"
                           size="mini"
                           v-model="pen.textAlign" value-key="chartType" @change="change('textAlign')">
                  <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in textAlignOptions">
                    <span class="panel-dropdown-label-txt">{{ item.name }}</span>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{ $t('project.topology.textBaseline') }}
              </div>
              <div class="form-row-value">
                <el-select :placeholder="$t('el.select.placeholder')" :popper-append-to-body="true"
                           class="right-box-row-with-btn no-style-class" popper-class="chart-box-dropdown-small right-box-select-top right-public-box-dropdown-top"
                           size="mini"
                           v-model="pen.textBaseline" value-key="chartType" @change="change('textBaseline')">
                  <el-option :key="item.id" :label="item.name" :value="item.id" v-for="item in textBaselineOptions">
                    <span class="panel-dropdown-label-txt">{{ item.name }}</span>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="form-row-item form-row-item-full">
              <div class="form-row-key">
                {{$t('profile.source')}}
              </div>
              <div class="form-row-value">
                <el-select :placeholder="$t('el.select.placeholder')" :popper-append-to-body="true"
                           class="right-box-row-with-btn no-style-class" popper-class="chart-box-dropdown-small right-box-select-top right-public-box-dropdown-top"
                           size="mini"
                           v-model="pen.data.source" value-key="chartType" @change="change('data.source')">
                  <el-option :label="'Text'" :value="'text'">
                    <span class="panel-dropdown-label-txt">{{ $t('project.topology.text') }}</span>
                  </el-option>
                  <el-option :label="'Legend'" :value="'legend'">
                    <span class="panel-dropdown-label-txt">{{ $t('dashboard.dashboard.chartForm.legend') }}</span>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="form-row-item  form-row-item-full" v-if="pen.data.source !== 'legend'">
              <div class="form-row-key">
                {{$t('dashboard.dashboard.chartForm.content')}}
              </div>
              <div class="form-row-value">
                <el-input  maxlength="256" show-word-limit v-model="pen.text" size="small" :rows="4" type="textarea" @change="change('text')"/>
              </div>
            </div>
            <div class="form-row-item  form-row-item-full" v-if="pen.data.source === 'legend'">
              <div class="form-row-value">
                <div class="form-row-item form-row-item-full">
                  <div class="form-row-key">
                    {{ $t('dashboard.dashboard.chartForm.legend') }}
                  </div>
                  <div class="form-row-value">
                    <div style="display: inline-block;width: calc(30% - 3px)">
                      <el-select v-model="pen.data.textParent" size="small">
                        <el-option v-for="item in queryValues.filter(query => query.type === 'title')" :key="item.id" :value="item.name" :label='item.name'></el-option>
                      </el-select>
                    </div>
                    <div style="display: inline-block;width: calc(70% - 13px);margin-left: 10px">
                      <el-select v-model="pen.data.textLegend" size="small">
                        <el-option v-for="item in queryValues.filter(query => (query.parent === pen.data.textParent) && query.type === 'item')" :key="item.id" :value="item.name" :label='item.name'></el-option>
                      </el-select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
<!--      line-->
      <div v-if="pen.type == 1">
        <div class="form-row-box">
          <!--        Line  -->
          <div class="form-row-title">
            {{$t('project.topology.line')}}
            <i class="nz-icon nz-icon-arrow-down" :class="elements.line?'':'is-rotate'" @click="updateShow('line')"/>
          </div>
          <div v-show="elements.line" class="form-row-content">
            <div class="form-row-item special-meta2d-select">
              <div class="form-row-key">
                {{$t('project.topology.style')}}
              </div>
              <div class="form-row-value">
                <el-select :popper-append-to-body="false" v-model="pen.borderType" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
                           @change="(val)=>{change('lineDash', val)}">
                  <div slot="prefix">
                    <div class="icon-item">
                      <svg>
                        <g fill="none" :stroke="theme === 'light' ? 'black' : '#BEBEBE'" stroke-width="1">
                          <path
                            :d="penDash.find((item,i)=>i==(pen.borderType?pen.borderType:0)).d"
                            :stroke-dasharray="penDash.find((item,i)=>i==(pen.borderType?pen.borderType:0))['stroke-dasharray']">
                          </path>
                        </g>
                      </svg>
                    </div>
                  </div>
                  <el-option v-for="(item,index) in penDash" :value="index" :key="index">
                    <div class="icon-item">
                      <svg>
                        <g fill="none" :stroke="(pen.borderType==index)?'#ee9d3f':item.strokeColor" stroke-width="1">
                          <path :d="item.d" :stroke-dasharray="item['stroke-dasharray']"></path>
                        </g>
                      </svg>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="form-row-item special-meta2d-select">
              <div class="form-row-key">
                {{$t('overall.type')}}
              </div>
              <div class="form-row-value">
                <el-select :popper-append-to-body="false" v-model="pen.lineName" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
                           @change="change('lineName')">
                  <div slot="prefix">
                    <div class="icon-item">
                      <svg>
                        <g fill="none" :stroke="theme === 'light' ? 'black' : '#BEBEBE'" stroke-width="1">
                          <path
                            :d="penLineType.find((item,i)=>item.name==pen.lineName).d"
                          >
                          </path>
                        </g>
                      </svg>
                    </div>
                  </div>
                  <el-option v-for="(item,index) in penLineType" :value="item.name" :key="index">
                    <div class="icon-item">
                      <svg>
                        <g fill="none" :stroke="(pen.lineName==item.name)?'#ee9d3f':item.strokeColor" stroke-width="1">
                          <path :d="item.d" :stroke-dasharray="item['stroke-dasharray']"></path>
                        </g>
                      </svg>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="form-row-item special-meta2d-select">
              <div class="form-row-key">
                {{$t('project.topology.fromArrow')}}
              </div>
              <div class="form-row-value">
                <el-select :popper-append-to-body="false" v-model="pen.fromArrow" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
                           @change="change('fromArrow')">
                  <div slot="prefix">
                    <div class="icon-item">
                      <svg>
                        <g fill="none" :stroke="theme === 'light' ? 'black' : '#BEBEBE'" stroke-width="1" v-for="(item,index) in penLineFromTOArrow"
                           :key="index" v-if="pen.fromArrow==item.name">
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
                        <g fill="none" :stroke="(pen.fromArrow==item.name)?'#ee9d3f':item.strokeColor"
                           stroke-width="1">
                          <path :d="item.d"></path>
                          <polygon
                            v-if="item.points"
                            :points="item.points"
                            :fill="(pen.fromArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                            :stroke="(pen.fromArrow==item.name)?'#ee9d3f':item.stroke"
                            :strokeWidth="item['stroke-width']"
                          ></polygon>
                          <circle
                            v-if="item.cx"
                            :cx="item.cx"
                            :cy="item.cy"
                            :r="item.r"
                            :fill="(pen.fromArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                            :stroke="(pen.fromArrow==item.name)?'#ee9d3f':item.stroke"
                            :strokeWidth="item['stroke-width']"
                          ></circle>
                        </g>
                      </svg>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="form-row-item special-meta2d-select">
              <div class="form-row-key">
                {{$t('project.topology.toArrow')}}
              </div>
              <div class="form-row-value">
                <el-select :popper-append-to-body="false" v-model="pen.toArrow" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
                           @change="change('toArrow')">
                  <div slot="prefix">
                    <div class="icon-item">
                      <svg>
                        <g fill="none" :stroke="theme === 'light' ? 'black' : '#BEBEBE'" stroke-width="1" v-for="(item,index) in penLineFromTOArrow"
                           :key="index" v-if="pen.toArrow==item.name">
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
                        <g fill="none" :stroke="(pen.toArrow==item.name)?'#ee9d3f':item.strokeColor"
                           stroke-width="1">
                          <path :d="item.d"></path>
                          <polygon
                            v-if="item.points"
                            :points="item.points"
                            :fill="(pen.toArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                            :stroke="(pen.toArrow==item.name)?'#ee9d3f':item.stroke"
                            :strokeWidth="item['stroke-width']"
                          ></polygon>
                          <circle
                            v-if="item.cx"
                            :cx="item.cx"
                            :cy="item.cy"
                            :r="item.r"
                            :fill="(pen.toArrow==item.name)?(item.fill=='#ffffff'?item.fill:'#ee9d3f'):item.fill"
                            :stroke="(pen.toArrow==item.name)?'#ee9d3f':item.stroke"
                            :strokeWidth="item['stroke-width']"
                          ></circle>
                        </g>
                      </svg>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.color')}}
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :ref="'nezhaColorPenColor'"
                  :isTopo="true"
                  :value-arr="[{name:'color',value: pen.color}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{ $t('dashboard.dashboard.chartForm.width') }}
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :step="1"
                  :min="1"
                  :precision="0"
                  controls-position="right"
                  size="small"
                  name="globalAlpha"
                  class="input"
                  v-model.number="pen.lineWidth"
                  required
                  @change="change('lineWidth')"></el-input-number>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.borderColor')}}
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :ref="'nezhaColorPenBorderColor'"
                  :isTopo="true"
                  :value-arr="[{name:'borderColor',value: pen.borderColor}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.borderWidth')}}
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :step="1"
                  :min="0"
                  :precision="0"
                  controls-position="right"
                  size="small"
                  name="globalAlpha"
                  class="input"
                  v-model.number="pen.borderWidth"
                  required
                  @change="change('borderWidth')"></el-input-number>
              </div>
            </div>
          </div>

          <!--        lineAnimate  -->
          <div class="form-row-title">
            {{$t('project.topology.animate')}}
            <i class="nz-icon nz-icon-arrow-down" @click="updateShow('lineAnimate')"/>
          </div>
          <div v-show="elements.lineAnimate" class="form-row-content">
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('overall.type')}}
              </div>
              <div class="form-row-value">
                <el-select
                  v-model="pen.lineAnimateType "
                  :popper-append-to-body="true"
                  popper-class="right-box-select-top right-public-box-dropdown-top"
                  @change="change('lineAnimateType')"
                  size="small">
                  <el-option
                    v-for="(item,index) in lineAnimateOptions"
                    :key="index"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.speed')}} (1 - 10)
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :step="1"
                  :min="1"
                  :max="10"
                  :precision="0"
                  controls-position="right"
                  size="small"
                  name="animateSpan"
                  class="input"
                  v-model.number="pen.animateSpan"
                  required
                  @change="change('animateSpan')"></el-input-number>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.color')}}
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :ref="'nezhaColorPenAnimateColor'"
                  :isTopo="true"
                  :value-arr="[{name:'animateColor',value: pen.animateColor}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                {{$t('project.topology.reverse')}}
              </div>
              <div class="form-row-value">
                <el-switch
                  v-model="pen.animateReverse"
                  :active-value="true"
                  :inactive-value="false"
                  @change="change('animateReverse')"
                ></el-switch>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--         valueMapping -->
      <div class="form-row-title">
        {{$t('dashboard.dashboard.chartForm.valueMapping')}}
        <span>
              <el-switch
                v-model="pen.data.enable.valueMapping"
                :active-value="true"
                :inactive-value="false"
                @change="change('data.enable.valueMapping')"
              ></el-switch>
              <i class="nz-icon nz-icon-arrow-down" :class="elements.valueMapping&& pen.data.enable.valueMapping?'':'is-rotate'" @click="updateShow('valueMapping')"/>
            </span>
      </div>
      <transition name="el-zoom-in-top">
        <div class="el-form" v-show="elements.valueMapping && pen.data.enable.valueMapping">
          <div  class="form-row-content">
            <div class="form-row-item form-row-item-full">
              <div class="form-row-key">
                {{$t('dashboard.dashboard.chartForm.legend')}}
              </div>
              <div class="form-row-value">
                <div style="display: inline-block;width: calc(30% - 3px)">
                  <el-select v-model="pen.data.parent" size="small">
                    <el-option v-for="item in queryValues.filter(query => query.type === 'title')" :key="item.id" :value="item.name" :label='item.name'></el-option>
                  </el-select>
                </div>
                <div style="display: inline-block;width: calc(70% - 13px);margin-left: 10px">
                  <el-select v-model="pen.data.legend" size="small">
                    <el-option v-for="item in queryValues.filter(query => (query.parent === pen.data.parent) && query.type === 'item')" :key="item.id" :value="item.name" :label='item.name'></el-option>
                  </el-select>
                </div>
              </div>
            </div>
            <div class="form-row-item form-row-item-full chart-config">
              <el-row class="el-form">
                <draggable
                  v-model="pen.data.valueMapping"
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
                    v-for="(item,index) in pen.data.valueMapping"
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
                        <div
                          v-if="item.type === 'value'"
                          :prop="'param.valueMapping.' + index + '.value'"
                          :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}"
                          class="thresholds-from-item"
                          style="display: flex"
                          key="value"
                        >
                          <el-input-number
                            :controls="false"
                            size="small"
                            v-model.number="item.value"
                            placeholder="value"
                            @change="change('valueMapping', index)"
                          ></el-input-number>
                        </div>
                        <div
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
                        </div>
                        <div
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
                        </div>
                        <div
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
                        </div>
                      </el-row>
                      <el-row v-show="item.show" :key="2" class="thresholds-item">
                        <div>
                          <div class='mapping-display'>{{$t('config.assetLabel.display')}}</div>
                        </div>
                        <div :prop="'param.valueMapping.' + index + '.display'" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" class="thresholds-from-item">
                          <el-input v-model="item.display" style="margin-right: 10px" :placeholder="$t('placeholder.chart.display')" size="small" @change="change('valueMapping', index)" class="mapping-display-input">
                            <!--                              <el-dropdown trigger="click" slot="prefix" placement="top-start">-->
                            <!--                                <div class="el-dropdown-link">-->
                            <!--                                  <i v-if="item.icon" class="mapping-icon" :class="item.icon" :style="{ color: item.color.icon }"></i>-->
                            <!--                                  <div v-else class="mapping-iconSelect" :title="$t('tip.add')">-->
                            <!--                                    <i class="nz-icon nz-icon-create-square"></i>-->
                            <!--                                  </div>-->
                            <!--                                </div>-->
                            <!--                                <el-dropdown-menu slot="dropdown" class="mapping-iconPop">-->
                            <!--                                  <ul class="mapping-iconList">-->
                            <!--                                    <li class="mapping-iconItem" :class="{active:item.icon===subItem.value}" v-for="subItem in mappingIconList" @click="iconActive(item,subItem,index)" :key="subItem.value">-->
                            <!--                                      <i :class="subItem.value"></i>-->
                            <!--                                    </li>-->
                            <!--                                  </ul>-->
                            <!--                                </el-dropdown-menu>-->
                            <!--                              </el-dropdown>-->
                          </el-input>
                        </div>
                        <nezhaColor
                          :color-val="item.color"
                          :single="false"
                          :value-arr="[{name:'bac',value:item.color.bac,key:'bac'},{name:'text',value:item.color.text,key:'text'},{name:'border',value:item.color.icon,key:'icon'}]"
                          @colorChange="(val,key)=>{valueMappingColorChange(val, key, index)}"
                        />
                      </el-row>
                    </transition-group>
                  </div>
                </draggable>
                <div @click="addMapping" class="thresholds-add">
                  {{$t('overall.addMapping')}}
                </div>
              </el-row>

            </div>
          </div>
        </div>
      </transition>

      <!--         tooltip -->
      <div class="form-row-title">
        {{$t('project.topology.tooltip')}}
        <span>
              <el-switch
                v-model="pen.data.enable.tooltip"
                :active-value="true"
                :inactive-value="false"
                @change="change('data.enable.tooltip')"
              ></el-switch>
              <i class="nz-icon nz-icon-arrow-down" :class="elements.tooltip&& pen.data.enable.tooltip?'':'is-rotate'" @click="updateShow('tooltip')"/>
            </span>
      </div>
      <transition name="el-zoom-in-top">
         <div v-show="elements.tooltip && pen.data.enable.tooltip" class="form-row-content" v-if="pen.type !== 1">
        <div class="form-row-item form-row-item-full">
          <div class="form-row-key">
            {{$t('project.topology.title')}}
          </div>
          <div class="form-row-value" style="display: flex">
            <el-input v-model="pen.data.tooltip.title" size="small" style="flex: 1"/>
            <!-- 显示头部 -->
            <div class="choose-header-btn" style="margin-left: 10px;" @click="pen.data.tooltip.titleShow = !pen.data.tooltip.titleShow" :title="$t('overall.visible')">
              <i class="nz-icon nz-icon-mimakejian" v-if="pen.data.tooltip.titleShow"></i>
              <i class="nz-icon nz-icon-mimabukejian" v-else></i>
            </div>
          </div>
        </div>
        <div class="form-row-item form-row-item-full">
          <div class="form-row-key">
            {{$t('overall.type')}}
          </div>
          <div class="form-row-value">
<!--            <el-input v-model="pen.data.tooltip.chartType" />-->
            <el-select v-model="pen.data.tooltip.chartType" size="small" style="width: 100%">
              <el-option v-for="item in chartType" :key="item.id" :value="item.id" :label='item.name'></el-option>
            </el-select>
          </div>
        </div>
        <div class="form-row-item form-row-item-full">
          <div class="form-row-key">
            {{$t('dashboard.dashboard.chartForm.content')}}
          </div>
          <div class="form-row-value">
            <el-input  maxlength="256" show-word-limit v-model="pen.data.tooltip.content" size="small" :rows="4" type="textarea"/>
          </div>
        </div>
        <div class="form-row-item form-row-item-full chart-config">
          <div class="form-row-key" style="margin-bottom: 5px">
            {{$t('project.topology.legends')}}
          </div>
          <div class="form-row-value" style="margin-bottom: 10px;display: flex;justify-content: space-between" v-for="legend in pen.data.tooltip.legends" :key="legend.parent + legend.legend">
            <div style="display: inline-block;width: calc(20% - 10px)">
              <el-select v-model="legend.parent" size="small" style="width: 100%">
                <el-option v-for="item in queryValues.filter(query => query.type === 'title')" :key="item.id" :value="item.name" :label='item.name'></el-option>
              </el-select>
            </div>
            <div style="display: inline-block;width: calc(40% - 10px)">
              <el-select v-model="legend.legend" size="small" style="width: 100%">
                <el-option v-for="item in queryValues.filter(query => (query.parent === legend.parent) && query.type === 'item')" :key="item.id" :value="item.name" :label='item.name'></el-option>
              </el-select>
            </div>
            <div style="display: inline-block;width: calc(40% - 10px)">
              <el-input v-model="legend.alias" size="small" style="width: 100%">
                <template slot="prepend">Alias</template>
              </el-input>
            </div>
          </div>
          <div @click="addTooltipLegend" class="thresholds-add">
           <i class="nz-icon nz-icon-add" /> {{$t('overall.addTooltipLegend')}}
          </div>
        </div>
      </div>
      </transition>
    </div>
  </div>
</template>

<script>
import nezhaColor from '@/components/common/nezhaColor'
import meta2dSelectImage from '@/components/common/project/meta2d/meta2dSelectImage'
import { imageTemp } from '@/components/common/project/L5/services/canvas'
import { dealImg, getUUID, topologyImg } from '@/components/common/js/common'
import imgDefault from '@/components/common/project/L5/services/img'
import { ColorReverse, randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import lodash from 'lodash'
import draggable from 'vuedraggable'
export default {
  name: 'meta2dElement', // node 和 line 所有组件均是分开创建的 修改相同属性时 需要同时修改
  components: {
    nezhaColor,
    meta2dSelectImage,
    draggable
  },
  props: {
    selectPens: {},
    elements: {},
    modules: {}
  },
  watch: {
    selectPens: {
      immediate: true,
      handler (n) {
        this.pen = n[0]
        this.nzColorUpdate()
        // todo 判断legend 是否还存在
        // this.$forceUpdate()
      }
    }
  },
  computed: {
    queryValues () {
      return this.$store.getters.getQueryValues
    }
  },
  data () {
    const theme = localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`) || 'light'
    return {
      theme: theme,
      pen: {},
      refsArr: ['nezhaColorPenColor', 'nezhaColorPenBackground', 'nezhaColorPenTextColor', 'nezhaColorPenBorderColor', 'nezhaColorPenAnimateColor'],
      chartType: [
        { id: 'line', name: 'Line' },
        { id: 'area', name: 'Area' },
        { id: 'text', name: 'Text' }
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
          name: this.$t('dashboard.dashboard.chartForm.alignList.right')
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
        { id: 3, name: this.$t('project.topology.flow') },
        { id: 1, name: this.$t('project.topology.beads') },
        { id: 2, name: this.$t('project.topology.dot') },
        // { id: 'comet', name: this.$t('project.topology.comet') },
        { id: 0, name: this.$t('project.topology.none') }
      ],
      statisticsList: this.$CONSTANTS.statisticsList,
      mappingTypeList: [
        {
          label: this.$t('overall.value'),
          value: 'value'
        }, {
          label: this.$t('dashboard.dashboard.chartForm.valMapping.range'),
          value: 'range'
        }, {
          label: this.$t('dashboard.dashboard.chartForm.valMapping.regx'),
          value: 'regx'
        }
      ]
    }
  },
  mounted () {
  },
  methods: {
    change (key) {
      if (key === 'lineDash') {
        const val = this.pen.borderType
        this.pen.lineDash = val ? (val == 1 ? [5, 5] : ((val == 2 ? [10, 10] : [10, 10, 2, 10]))) : []
      }
      if (key === 'text') {
        this.pen.data.text = this.pen.text
      }
      if (key === 'data.source') {
        key = 'text'
        if (this.pen.data.source === 'text') {
          this.pen.text = this.pen.data.text
        }
        if (this.pen.data.source === 'legend') {
          this.pen.text = this.pen.data.textValue
        }
      }
      if (key === 'lineAnimateType') {
        this.pen.autoPlay = false
      }
      this.$emit('change', key)
      this.$forceUpdate()
    },
    updateImage (image) {
      this.pen.imageId = image.id
      if (image.image) {
        this.pen.image = image.image
        this.pen.icon = ''
        this.change('image')
      }
      if (image.icon) {
        this.pen.icon = image.icon
        this.pen.image = ''
        this.change('icon')
      }
      if (!image.id) {
        this.pen.image = image.image
        this.pen.icon = ''
        this.change('image')
      }
    },
    colorChange (val, key) {
      this.pen.data.params[key] = val
      this.pen[key] = val
      this.change(key)
    },
    valueMappingColorChange (val, key, index) {
      if (key === 'thresholds') {
        this.pen.data.thresholds[index].color = val
      }
      if (key === 'bac') {
        this.pen.data.valueMapping[index].color.bac = val
        this.$set(this.pen.data.valueMapping, index, this.pen.data.valueMapping[index])
      }
      if (key === 'text') {
        this.pen.data.valueMapping[index].color.text = val
        this.$set(this.pen.data.valueMapping, index, this.pen.data.valueMapping[index])
      }
      if (key === 'icon') {
        this.pen.data.valueMapping[index].color.icon = val
        this.$set(this.pen.data.valueMapping, index, this.pen.data.valueMapping[index])
      }
    },
    updateShow (key) {
      this.elements[key] = !this.elements[key]
    },
    inputFocus (e) {
      e.path[2].children[0].setAttribute('tabindex', '-10')
      e.path[2].children[1].setAttribute('tabindex', '-11')
    },
    inputBlur (e) {
    },
    addMapping () {
      const bacColor = randomcolor()
      const obj = {
        type: 'value',
        show: true,
        value: undefined,
        display: '',
        color: {
          bac: bacColor + 'FF',
          text: ColorReverse(bacColor) + 'FF',
          border: randomcolor() + 'FF'
        },
        uid: getUUID()
      }
      this.pen.data.valueMapping.push(obj)
      this.change('data.valueMapping')
    },
    copyMapping (index) {
      const temp = lodash.cloneDeep(this.pen.data.valueMapping[index])
      temp.uid = getUUID()
      this.pen.data.valueMapping.push(temp)
    },
    removeMapping (index) {
      this.pen.data.valueMapping.splice(index, 1)
    },
    showMapping (index) {
      this.pen.data.valueMapping[index].show = !this.pen.data.valueMapping[index].show
    },
    mappingItemChange (index, type) {
      const mapping = this.pen.data.valueMapping[index]
      if (mapping.type === 'value') {
        this.pen.data.valueMapping[index] = {
          ...mapping,
          value: undefined
        }
      }
      if (mapping.type === 'range') {
        this.pen.data.valueMapping[index] = {
          ...mapping,
          from: undefined,
          to: undefined
        }
      }
      if (mapping.type === 'regx') {
        this.pen.data.valueMapping[index] = {
          ...mapping,
          regx: ''
        }
      }
      this.$set(this.pen.data.valueMapping, index, this.pen.data.valueMapping[index])
    },
    addTooltipLegend () {
      this.pen.data.tooltip.legends.push({
        parent: '',
        legend: '',
        alias: ''
      })
    },
    nzColorUpdate () {
      this.refsArr.forEach(item => {
        if (this.$refs[item]) {
          this.$refs[item].update()
        }
      })
    }

  }
}
</script>
