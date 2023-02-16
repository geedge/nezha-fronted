<template>
  <div class="pens-data">
    <div v-if="pen.id">
<!--      <el-input-number v-model="pen.x" @change="change('x')"/>-->
<!--      node-->
      <div v-if="!pen.type">
        <div class="form-row-box">
          <!--        Position  -->
          <div class="form-row-title">
            Position
            <i class="nz-icon nz-icon-arrow-down" @click="updateShow('position')"/>
          </div>
          <div v-show="elements.position" class="form-row-content">
            <div class="form-row-item">
              <div class="form-row-key">
                X
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
                Y
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
                Width
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
                Height
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
                Lock aspect Ratio
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
                Rotate
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
            Border
            <i class="nz-icon nz-icon-arrow-down" @click="updateShow('border')"/>
          </div>
          <div v-show="elements.border" class="form-row-content">
            <div class="form-row-item ">
              <div class="form-row-key">
                Type
              </div>
              <div class="form-row-value">
                <el-select :popper-append-to-body="true" v-model="pen.borderType" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
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
                Width
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
                color
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :isTopo="true"
                  :value-arr="[{name:'color',value: pen.color}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                Radius
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
                  v-model.number="pen.borderRadius"
                  required
                  @change="change('borderRadius')"></el-input-number>
              </div>
            </div>
          </div>

          <!--         backGround -->
          <div class="form-row-title">
            BackGround
            <i class="nz-icon nz-icon-arrow-down" @click="updateShow('backGround')"/>
          </div>
          <div v-show="elements.backGround" class="form-row-content">
            <div class="form-row-item">
              <div class="form-row-key">
                color
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :isTopo="true"
                  :value-arr="[{name:'background',value: pen.background}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                opacity
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
                Image
              </div>
              <div class="form-row-value">
                <el-input  v-model="pen.image" size="small" @change="change('image')"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                是否保留长宽比
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
            text
            <i class="nz-icon nz-icon-arrow-down" @click="updateShow('text')"/>
          </div>
          <div v-show="elements.text" class="form-row-content">
            <div class="form-row-item">
              <div class="form-row-key">
                color
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :isTopo="true"
                  :value-arr="[{name:'textColor',value: pen.textColor}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                fontSize
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
                Align text
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
                Vertical text
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
            <div class="form-row-item  form-row-item-full">
              <div class="form-row-key">
               Content
              </div>
              <div class="form-row-value">
                <el-input  maxlength="256" show-word-limit v-model="pen.text" size="small" :rows="4" type="textarea" @change="change('text')"/>
              </div>
            </div>
          </div>

          <!--         valueMapping -->
          <div class="form-row-title">
            Value mappings
            <i class="nz-icon nz-icon-arrow-down" @click="updateShow('valueMapping')"/>
          </div>
          <div v-show="elements.valueMapping" class="form-row-content">
            <div class="form-row-item">
              <div class="form-row-key">
                color
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :isTopo="true"
                  :value-arr="[{name:'background',value: pen.background}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
          </div>

          <!--         tooltip -->
          <div class="form-row-title">
            tooltip
            <i class="nz-icon nz-icon-arrow-down" @click="updateShow('tooltip')"/>
          </div>
          <div v-show="elements.tooltip" class="form-row-content">
            <div class="form-row-item">
              <div class="form-row-key">
                color
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :isTopo="true"
                  :value-arr="[{name:'background',value: pen.background}]"
                  @colorChange="colorChange"/>
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
            Line
            <i class="nz-icon nz-icon-arrow-down" @click="updateShow('line')"/>
          </div>
          <div v-show="elements.line" class="form-row-content">
            <div class="form-row-item">
              <div class="form-row-key">
                style
              </div>
              <div class="form-row-value">
                <el-select :popper-append-to-body="true" v-model="pen.borderType" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
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
                Type
              </div>
              <div class="form-row-value">
                <el-select :popper-append-to-body="true" v-model="pen.lineName" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
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
                From
              </div>
              <div class="form-row-value">
                <el-select :popper-append-to-body="true" v-model="pen.fromArrow" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
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
                To
              </div>
              <div class="form-row-value">
                <el-select :popper-append-to-body="true" v-model="pen.toArrow" size="small" popper-class="right-box-select-top right-public-box-dropdown-top"
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
                color
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :isTopo="true"
                  :value-arr="[{name:'color',value: pen.color}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                width
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
                border color
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :isTopo="true"
                  :value-arr="[{name:'borderColor',value: pen.borderColor}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                borderWidth
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
            Animate
            <i class="nz-icon nz-icon-arrow-down" @click="updateShow('lineAnimate')"/>
          </div>
          <div v-show="elements.lineAnimate" class="form-row-content">
            <div class="form-row-item">
              <div class="form-row-key">
                Type
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
                Speed (0 - 10)
              </div>
              <div class="form-row-value">
                <el-input-number
                  @focus="inputFocus"
                  @blur="inputBlur"
                  :step="1"
                  :min="0"
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
                color
              </div>
              <div class="form-row-value">
                <nezhaColor
                  :isTopo="true"
                  :value-arr="[{name:'animateColor',value: pen.animateColor}]"
                  @colorChange="colorChange"/>
              </div>
            </div>
            <div class="form-row-item">
              <div class="form-row-key">
                Reverse
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
    </div>
  </div>
</template>

<script>
import nezhaColor from '@/components/common/nezhaColor'
export default {
  name: 'meta2dElement', // node 和 line 所有组件均是分开创建的 修改相同属性时 需要同时修改
  components: {
    nezhaColor
  },
  props: {
    selectPens: {},
    elements: {}
  },
  watch: {
    selectPens: {
      immediate: true,
      handler (n) {
        console.log(n, 'selectPens')
        this.pen = n[0]
        // todo 判断legend 是否还存在
        // this.$forceUpdate()
      }
    }
  },
  data () {
    const theme = localStorage.getItem(`nz-user-${localStorage.getItem('nz-user-id')}-theme`) || 'light'
    return {
      theme: theme,
      pen: {},
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
        },
      ],
      lineAnimateOptions: [
        { id: 3, name: this.$t('project.topology.flow') },
        { id: 1, name: this.$t('project.topology.beads') },
        { id: 2, name: this.$t('project.topology.dot') },
        // { id: 'comet', name: this.$t('project.topology.comet') },
        { id: 0, name: this.$t('project.topology.none') }
      ],
    }
  },
  methods: {
    change (key) {
      if (key === 'lineDash') {
        const val = this.pen.borderType
        this.pen.lineDash = val ? (val == 1 ? [5, 5] : ((val == 2 ? [10, 10] : [10, 10, 2, 10]))) : []
      }
      this.$emit('change', key)
    },
    colorChange (val, key) {
      this.pen.data.params[key] = val
      this.pen[key] = val
      console.log(key, val)
      this.change(key)
    },
    updateShow (key) {
      this.elements[key] = !this.elements[key]
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

<style scoped lang="scss">
  .form-row-item{
    vertical-align: top;
    width: calc(50% - 15px);
    display: inline-block;
    box-sizing: border-box;
    padding: 0 5px;
    margin-bottom: 10px;
    .form-row-key{
      margin-bottom: 5px;
    }
  }
  .special-meta2d-select {
    /deep/ .el-input.el-input--prefix.el-input--suffix{
      border: 1px solid #E7EAED;
      height: 28px;
    }
    /deep/ .el-select--small{
      width: 100%;
    }
    /deep/ .el-input__inner{
      display: none;
    }
  }
  .form-row-item-full{
    width: 100%;
  }
  .form-row-item:nth-of-type(even) {
    /*margin-left: 10px;*/
  }
  .form-row-title{
    display: flex;
    justify-content: space-between;
    margin-bottom: 15px;
  }
  .form-row-content{
    margin-bottom: 5px;
  }
</style>
