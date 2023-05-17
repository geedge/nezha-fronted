<template>
  <div class="pens-data right-box__container">
    <div class="form-row-box chart-config">
      <div class="form-row-item form-row-item-full">
        <div class="form-row-key">
          {{$t('project.topology.timeRange')}}
        </div>
        <div class="form-row-value">
          <el-select v-model="dataTimeType" size="small" style="width: 100%">
            <el-option v-for="item in timeData" :key="item.id" :value="item.value" :label="$t(item.text)"></el-option>
          </el-select>
        </div>
<!--        <el-row style="margin-top: 18px;display: flex">-->
<!--          <div class="form-row-item">-->
<!--            <div class="form-row-key">-->
<!--              Statistics-->
<!--            </div>-->
<!--            <div class="form-row-value">-->
<!--              <el-select v-model="dataStatistic" size="small">-->
<!--                <el-option v-for="item in statisticsList" :key="item.value" :value="item.value" :label='$t(item.label)'></el-option>-->
<!--              </el-select>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="form-row-item">-->
<!--            <div class="form-row-key">-->
<!--              Unit-->
<!--            </div>-->
<!--            <div class="form-row-value">-->
<!--              <el-cascader :id="'columns-unit'" v-model="dataUnit" :options="unitOptions" :props="{ expandTrigger: 'hover',emitPath:false }"  :show-all-levels="false" filterable-->
<!--                           placeholder=""-->
<!--                           popper-class="dc-dropdown right-box-select-top right-public-box-dropdown-top prevent-clickoutside chart-box-unit"-->
<!--                           size="small"-->
<!--                           style="flex: 1"-->
<!--                           @change="unitSelected"-->
<!--              >-->
<!--              </el-cascader>-->
<!--            </div>-->
<!--          </div>-->
<!--        </el-row>-->
      </div>
      <div class="form-row-item form-row-item-full">
        <div
          v-if="elements && elements.length"
          class="metrics-input-box"
        >
          <draggable
            v-model="elements"
            @start="start"
            @end="end"
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
            }"
            >
            <el-row
              class="element-item form-row-item form-row-item-full thresholds-from-item"
              style="margin-bottom: 10px !important"
              v-for="index of elements.length"
              :key="index"
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
                  <div :prop="'elements.' + (index -1) + '.expression'" :rules="{ required: true, message: $t('validate.required'), trigger: 'change'}">
                    <promql-input
                      :from-father-data="true"
                      :metricOptionsParent="metricOptions"
                      :expressionList="expressions"
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
                  </div>
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
                  <el-row style="margin-top: 18px;display: flex">
                    <div class="form-row-item">
                      <div class="form-row-key">
                        {{$t('dashboard.dashboard.chartForm.statistics')}}
                      </div>
                      <div class="form-row-value">
                        <el-select v-model="expressionsShow[index-1].statistic" size="small">
                          <el-option v-for="item in statisticsList" :key="item.value" :value="item.value" :label='$t(item.label)'></el-option>
                        </el-select>
                      </div>
                    </div>
                    <div class="form-row-item">
                      <div class="form-row-key">
                        {{$t('dashboard.dashboard.chartForm.unit')}}
                      </div>
                      <div class="form-row-value">
                        <el-cascader :id="'columns-unit'" v-model="expressionsShow[index-1].unit" :options="unitOptions" :props="{ expandTrigger: 'hover',emitPath:false }"  :show-all-levels="false" filterable
                                     placeholder=""
                                     popper-class="dc-dropdown right-box-select-top right-public-box-dropdown-top prevent-clickoutside chart-box-unit"
                                     size="small"
                                     style="flex: 1"
                                     @change="unitSelected"
                        >
                        </el-cascader>
                      </div>
                    </div>
                  </el-row>
                </el-row>
              </transition>
            </el-row>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import promqlInput from '@/components/page/dashboard/explore/promqlInput'
import promqlInputMixin from '@/components/common/mixin/promqlInput.js'
import { isStat } from '@/components/chart/chart/tools'
import { ColorReverse, randomcolor } from '@/components/common/js/radomcolor/randomcolor'
import { getUUID, resetZIndex } from '@/components/common/js/common'
import lodash from 'lodash'
import draggable from 'vuedraggable'
import chartDataFormat from '@/components/chart/chartDataFormat'
const rz = {
  methods: {
    rz (e) {
      resetZIndex(e)
    }
  }
}
export default {
  name: 'meta2dData',
  mixins: [promqlInputMixin, rz],
  props: {
    querysArray: {},
    params: {}
  },
  components: {
    draggable,
    promqlInput
  },
  data () {
    return {
      language: localStorage.getItem('nz-language') || 'en',
      elements: [],
      promqlType: 'metrics',
      expressions: [],
      expressionName: [],
      expressionsShow: [],
      letter: [
        'A', 'B', 'C', 'D', 'E', 'F', 'G',
        'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z'
      ],
      dataTimeType: 5,
      dataStatistic: 'last',
      dataUnit: 1,
      statisticsList: this.$CONSTANTS.statisticsList,
      unitOptions: chartDataFormat.unitOptions(),
      timeData: [
        {
          id: 1,
          text: this.$t('dashboard.dashboard.lastFiveMin'),
          type: 'minute',
          value: 5
        },
        {
          id: 2,
          text: this.$t('dashboard.dashboard.lastFifteenMin'),
          type: 'minute',
          value: 15
        },
        {
          id: 3,
          text: this.$t('dashboard.dashboard.lastThirtyMin'),
          type: 'minute',
          value: 30
        },
        {
          id: 4,
          text: this.$t('dashboard.dashboard.lastOneHour'),
          type: 'hour',
          value: 60
        },
        {
          id: 5,
          text: this.$t('dashboard.dashboard.lastThreeHour'),
          type: 'hour',
          value: 3 * 60
        },
        {
          id: 6,
          text: this.$t('dashboard.dashboard.lastSixHour'),
          type: 'hour',
          value: 6 * 60
        },
        {
          id: 7,
          text: this.$t('dashboard.dashboard.lastTwelveHour'),
          type: 'hour',
          value: 12 * 60
        },
        {
          id: 8,
          text: this.$t('dashboard.dashboard.lastTwentyFourHour'),
          type: 'hour',
          value: 24 * 60
        },
        {
          id: 9,
          text: this.$t('dashboard.dashboard.lastTwoDay'),
          type: 'date',
          value: 2 * 24 * 60
        },
        {
          id: 10,
          text: this.$t('dashboard.dashboard.lastSevenDay'),
          type: 'date',
          value: 7 * 24 * 60
        }
      ]
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    expressionChange: function () {
      if (this.expressions.length) {
        this.elements = []
        this.expressions.forEach((expr, i) => {
          this.elements.push({
            id: this.expressionsShow[i].elementId,
            expression: expr,
            type: 'expert',
            legend: this.expressionsShow[i].legend,
            unit: this.expressionsShow[i].unit || 1,
            statistic: this.expressionsShow[i].statistic || 'last',
            name: this.expressionName[i],
            state: this.expressionsShow[i].state,
            orderNum: i
          })
        })
      } else {
        this.elements = []
      }
      this.change()
    },
    switchExpression (index, flag) {
      if (flag === 1) {
        this.$set(this.expressionsShow[index], 'state', 0)
      } else {
        this.$set(this.expressionsShow[index], 'state', 1)
      }
      this.expressionChange()
    },
    expressionNameChange (index) {
      if (this.expressionsShow[index].error) {
        this.expressionName[index] = this.expressionsShow[index].oldName
        this.expressionsShow[index].error = ''
      } else if (!this.expressionName[index]) {
        this.expressionName[index] = this.expressionsShow[index].oldName
      } else {
        this.expressionsShow[index].oldName = this.expressionName[index]
      }
      this.expressionChange()
    },
    expressionNameInput (val, index) {
      const findIndex = this.expressionName.indexOf(val)
      const lastIndex = this.expressionName.lastIndexOf(val)
      if (findIndex !== -1 && lastIndex != -1 && lastIndex !== findIndex) {
        this.expressionsShow[index].error = this.$t('error.nameDuplicate')
      } else if (!val) {
        this.expressionsShow[index].error = this.$t('validate.required')
      } else {
        this.expressionsShow[index].error = ''
      }
    },
    showInput (index, flag) {
      this.expressionsShow[index].hideInput = flag
    },
    transformNumToLetter (num) { // 相当于26进制 获取idaddExpression
      const self = this
      let letter = ''
      const loopNum = parseInt(num / 26)
      if (loopNum > 0) {
        letter += this.transformNumToLetter(loopNum - 1)
      }
      letter += self.letter[num % 26]
      return letter
    },
    getExpressionName () {
      let name = ''
      for (let i = 0; i <= this.expressionName.length; i++) {
        name = this.transformNumToLetter(i)
        if (this.expressionName.indexOf(name) === -1) { // 判断当前id是否存在 必须走了break 返回的id才是对的
          break
        }
      }
      return name
    },
    addExpression (item) {
      if (!item) {
        this.expressions.push('')
        const expressionName = this.getExpressionName()
        this.expressionName.push(expressionName)
        this.expressionsShow.push({
          show: true,
          hideInput: true,
          oldName: expressionName,
          error: '',
          legend: '',
          unit: 1,
          statistic: 'last',
          elementId: '',
          state: 1
        })
        this.expressionChange()
      } else {
        this.expressions.push(item.expression)
        this.expressionName.push(item.name)
        this.expressionsShow.push({
          show: true,
          hideInput: true,
          oldName: item.name,
          error: '',
          elementId: item.id,
          legend: item.legend,
          unit: item.unit || 1,
          statistic: item.statistic || 'last',
          state: item.state
        })
      }
    },
    copyExpression (index) {
      this.expressions.push(this.expressions[index])
      const expressionName = this.getExpressionName()
      this.expressionName.push(expressionName)
      this.expressionsShow.push(
        {
          ...this.expressionsShow[index],
          show: true,
          hideInput: true,
          oldName: expressionName,
          error: '',
          elementId: ''
        }
      )
      this.$nextTick(() => {
        this.expressions.forEach((ex, index) => {
          this.$refs[`promql-${index}`][0].metricChange(ex)
          this.$refs[`promql-${index}`][0].promqlInputChange(ex)
        })
      })
      this.expressionChange()
    },
    removeExpression (index) {
      if (this.expressionsShow.length > 1) {
        this.expressions.splice(index, 1)
        this.expressionName.splice(index, 1)
        this.expressionsShow.splice(index, 1)
        this.$nextTick(() => {
          this.expressions.forEach((ex, index) => {
            this.$refs[`promql-${index}`][0].metricChange(ex)
            this.$refs[`promql-${index}`][0].promqlInputChange(ex)
          })
        })
        this.expressionChange()
      }
    },
    showExpression (index) {
      this.expressionsShow[index - 1].show = !this.expressionsShow[index - 1].show
      this.$set(this.expressionsShow, index - 1, this.expressionsShow[index - 1])
    },
    unitSelected: function (value) {
      // this.unit=value[value.length-1];
      this.change()
    },
    change (key, index) {
      this.$nextTick(() => {
        if (key) {
          this.hideError(key, index)
        }
        this.$emit('change', this)
      })
    },
    showError () {
    },
    hideError (key, index) {
      this.$forceUpdate()
    },
    start () {
      document.body.classList.add('isDrag')
    },
    end (event) {
      this.expressions = []
      this.expressionName = []
      if (!this.elements.length) {
        this.addExpression()
      } else {
        const expressionsShow = this.$loadsh.cloneDeep(this.expressionsShow)
        this.elements.forEach((item, index) => {
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
              this.$set(this.expressionsShow, index, this.$loadsh.cloneDeep(subItem))
            }
          })
        })
      }
      this.change()
      document.body.classList.remove('isDrag')
    },
    init () {
      // 重置相关属性
      this.expressions = []
      this.expressionsShow = []
      this.expressionName = []
      this.elements = this.$loadsh.cloneDeep(this.querysArray)
      this.dataTimeType = this.params.timeType || 1
      this.dataStatistic = this.params.statistic || 'last'
      this.dataUnit = this.params.unit || 1
      if (!this.elements.length) {
        this.addExpression()
      } else {
        // 根据orderNum排序
        this.elements = this.elements.sort((a, b) => a.orderNum - b.orderNum)
        this.elements.forEach(item => {
          this.addExpression(item)
        })
        this.expressionChange()
      }
    }
  }
}
</script>
