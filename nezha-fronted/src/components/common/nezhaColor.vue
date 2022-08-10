<template>
  <span v-clickoutside="()=>{exitColor(false)}" class="nz-color">
    <div class="color-show" v-if="single" ref="colorShow" @click.stop="changeColor">
      <div class="color-show-left" :style="{background:colors}"></div>
      <span class="color-text" v-show="showText"> {{colors}}</span>
      <span class="color-arrows" v-show="showText">
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

    <div v-if="showColorPicker" class="vue-color right-box-select-top" :style="{top:position.y+'px',left:position.x+'px'}" ref="colorBox">
      <el-row v-if="!single" class="color-tab">
        <div v-for="item in valueArr" :key="item.key" :class="[keyName==item.name?'color-active':'']" @click="colorTabChange(item)">{{item.name}}</div>
      </el-row>
      <sketch v-model="colors" :disableAlpha="disableAlpha" @input="updateValue" :presetColors="presetColors"/>
    </div>
  </span>
</template>

<script>
import { randomcolor } from '@/components/common/js/radomcolor/randomcolor'
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
    },
    disableAlpha: {
      type: Boolean,
      default: false
    },
    showText: {
      type: Boolean,
      default: true
    },
    isTopo: {
      type: Boolean,
      default: false
    }
  },
  watch: {

  },
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
    if (!this.isTopo) {
      this.keyName = this.valueArr[0].name
      this.colors = this.valueArr[0].value || randomcolor() + 'FF'
      this.$emit('colorChange', this.colors, this.keyName)
    } else {
      this.keyName = this.valueArr[0].name
      this.colors = this.valueArr[0].value
    }
  },
  methods: {
    updateValue (color) {
      this.colors = color.hex
      if (!this.disableAlpha) {
        this.colors = color.hex8
        this.$emit('colorChange', color.hex8, this.keyName)
      } else {
        this.$emit('colorChange', color.hex, this.keyName)
      }
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
      if (!this.isTopo) {
        this.keyName = item.name
        this.colors = this.colorVal[item.name] || randomcolor() + 'FF'
      } else {
        this.keyName = item.name
        this.colors = this.colorVal[item.name]
      }
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
