<template>
  <span v-clickoutside="()=>{exitColor(false)}">
    <div class="color-show" v-if="single" ref="colorShow" @click.stop="changeColor">
      <div class="color-show-left" :style="{background:colors}"></div>
      <span class="color-text"> {{colors}}</span>
      <span class="color-arrows">
        <i class="nz-icon nz-icon-arrow-down" v-if="!showColorPicker"></i>
        <i class="nz-icon nz-icon-arrow-up" v-if="showColorPicker"></i>
      </span>
    </div>

    <div class="color-show" v-if="!single" ref="colorShow" @click.stop="changeColor">
      <div :style="{background:findColor('bac'),border:'2px solid '+findColor('line'),'line-height':'18px'}" class="color-show-left">
        <span :style="{color:findColor('text')}" style="line-height: 18px;">
                              T
        </span>
      </div>
    </div>

    <div v-if="showColorPicker" class="vue-color" :style="{top:position.y+'px',left:position.x+'px'}" ref="colorBox">
      <el-row v-if="!single" class="color-tab">
        <div v-for="item in valueArr" :key="item.key" :class="[keyName==item.name?'color-active':'']" @click="colorTabChange(item)">{{item.name}}</div>
      </el-row>
      <sketch v-model="colors" :disableAlpha="true" @input="updateValue" :presetColors="presetColors"/>
    </div>
  </span>
</template>

<script>

import { Sketch } from 'vue-color'
export default {
  name: 'nezhaColor',
  components: {
    Sketch
  },
  props: {
    valueArr: {
      type: Array,
      default () {
        return []
        /* ex
          * {
          *   {name:'name',value:value,key:'name'}
          * }
          * */
      }
    },
    colorVal: {

    },
    single: {
      type: Boolean,
      default () {
        return true
      }
    },
    presetColors: {
      type: Array,
      default () {
        return [
          '#19730E', '#37872D', '#73BF69',
          '#CC9D00', '#E0B400', '#FADE2A',
          '#AD0317', '#C4162A', '#F2495C',
          '#1250B0', '#1F60C4', '#5794F2',
          '#E55400', '#FA6400', '#FF9830',
          '#7C2EA3', '#8F3BB8', '#B877D9'
        ]
      }
    }
  },
  watch: {},
  data () {
    return {
      colors: '#ffffff',
      keyName: '',
      showColorPicker: false,
      position: {
        x: undefined,
        y: undefined
      },
      timer: null
    }
  },
  mounted () {
    this.colors = this.valueArr[0].value
    this.keyName = this.valueArr[0].name
  },
  methods: {
    updateValue (color) {
      this.colors = color.hex
      this.$emit('colorChange', color.hex, this.keyName)
    },
    changeColor () {
      this.showColorPicker = !this.showColorPicker
      if (this.showColorPicker) {
        window.addEventListener('mousewheel', this.mousewheel)
        setTimeout(() => {
          const position = this.$refs.colorShow.getBoundingClientRect()
          const colorBox = this.$refs.colorBox.getBoundingClientRect()
          const w = window.innerWidth
          const h = window.innerHeight
          // 确定x位置
          if (position.x + colorBox.width > w) {
            position.x = w - colorBox.width
          }
          // 确定Y位置

          if (position.y + colorBox.height > h) {
            position.y = position.y - colorBox.height
          } else {
            position.y = position.y + position.height
          }
          this.position.x = position.x
          this.position.y = position.y
        })
      } else {
        window.removeEventListener('mousewheel', this.mousewheel)
      }
      //
    },
    colorTabChange (item) {
      this.keyName = item.name
      this.colors = this.colorVal[item.name]
    },
    exitColor () {
      this.showColorPicker = false
    },
    mousewheel () {
      if (!this.$refs.colorBox) return
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          const position = this.$refs.colorShow.getBoundingClientRect()
          const colorBox = this.$refs.colorBox.getBoundingClientRect()
          const w = window.innerWidth
          const h = window.innerHeight
          // 确定x位置
          if (position.x + colorBox.width > w) {
            position.x = w - colorBox.width
          }
          // 确定Y位置

          if (position.y + colorBox.height > h) {
            position.y = position.y - colorBox.height
          } else {
            position.y = position.y + position.height
          }
          this.position.x = position.x
          this.position.y = position.y
          clearTimeout(this.timer)
          this.timer = null
        }, 200)
      } else {
        this.timer = setTimeout(() => {
          const position = this.$refs.colorShow.getBoundingClientRect()
          const colorBox = this.$refs.colorBox.getBoundingClientRect()
          const w = window.innerWidth
          const h = window.innerHeight
          // 确定x位置
          if (position.x + colorBox.width > w) {
            position.x = w - colorBox.width
          }
          // 确定Y位置

          if (position.y + colorBox.height > h) {
            position.y = position.y - colorBox.height
          } else {
            position.y = position.y + position.height
          }
          this.position.x = position.x
          this.position.y = position.y
          clearTimeout(this.timer)
          this.timer = null
        }, 200)
      }
    },
    findColor (key) {
      const findItem = this.valueArr.find(item => item.key == key)
      if (findItem) {
        return this.colorVal[findItem.name]
      } else {
        return '#000000'
      };
    }
  },
  destroyed () {
    window.removeEventListener('mousewheel', this.mousewheel)
  }
}
</script>

<style scoped>
  /deep/ .vc-sketch-field--single, /deep/ .vc-sketch-field .vc-input__label{
    display: none;
  }
  /deep/ .vc-sketch-color-wrap{
    margin-left: 16px;
  }
  /deep/ .vc-sketch-presets{
    line-height: 24px;
  }
  /deep/ .vc-sketch-presets-color {
    margin: 0 7px 0 0;
  }
  .vue-color{
    position: fixed;
    z-index: 1;
  }

  .color-content {
    height: 0;
    width: 0;
    overflow: hidden;
    position: absolute;
    top: 15px;
    left: 66px;
  }
  .color-tab{
    height: 28px;
    line-height: 28px;
    border-radius: 5px 5px 0 0;
    border: 1px solid #EBEEF5;
    border-bottom: none;
    background-color: #FFF;
    display: flex;
    justify-content: space-between;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    z-index: 2;
  }
  .color-tab div{
    text-align: center;
    flex: 1;
    color: #909399;
    transition: all .3s cubic-bezier(.645,.045,.355,1);
    background: #E4E7ED;
    cursor: pointer;
    border-top: 2px solid transparent;
  }
  /*.color-tab div:first-child{*/
  /*border-right-color: #DCDFE6;*/
  /*}*/
  .color-tab div:hover{
    color: var(--theme-color);
  }
  .color-tab .color-active{
    background-color: #FFF;
    font-size: 14px;
    color: var(--theme-color);
    font-weight: 700;
    border-color: var(--theme-color);
  }

  .color {
    position: relative;
  }

  .color-show {
    border: 1px solid #E7EAED;
    border-radius: 5px;
    display: flex;
    align-items: center;
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
    text-align: center;
  }

  .color-arrows {
    color: #C0C4CC;
    position: absolute;
    right: 12px;
  }

  .color-arrows .nz-icon {
    font-size: 12px;
  }
</style>
