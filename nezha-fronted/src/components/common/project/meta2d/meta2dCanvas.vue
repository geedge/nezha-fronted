<template>
  <div class="pens-data pens-canvas">
    <div class="form-row-box">
      <div>
        <!--         backGround -->
        <div class="form-row-title">
          {{$t('project.topology.bac')}}
          <i class="nz-icon nz-icon-arrow-down" :class="canvasProps.backGround?'':'is-rotate'" @click="updateShow('backGround')"/>
        </div>
        <div v-show="canvasProps.backGround" class="form-row-content">
          <div class="form-row-item">
            <div class="form-row-key">
              {{$t('project.topology.color')}}
            </div>
            <div class="form-row-value">
              <nezhaColor
                ref="backgroundNezhaColor"
                :isTopo="true"
                :value-arr="[{name:'bac',value: background}]"
                @colorChange="backgroundChange"/>
            </div>
          </div>
          <div class="form-row-item">
            <div class="form-row-key">
              {{$t('project.topology.image')}}
            </div>
            <div class="form-row-value">
              <meta2dSelectImage :selectImage="bkImage" :imgId="bkImageId" @updateImage="updateImage"/>
            </div>
          </div>
        </div>

        <!--         align -->
        <div class="form-row-title" v-if="selectPenArrId.length > 1">
          {{$t('project.topology.align')}}
        </div>
        <div v-if="selectPenArrId.length > 1" class="form-row-content">
          <div class="form-row-item form-row-item-full" style="display: flex">
            <label class="hover pointer mr10 iconLabel" v-for="item in nodesAlign" :title="item.desc" :key="item.value">
              <i class="nz-icon" :class="item.icon"
                 @click="onNodesAlign(item.value)"></i>
            </label>
          </div>
        </div>
        <div class="form-row-title">
          {{$t('project.topology.elements')}}
        </div>
      </div>
      <div class="form-row-content form-row-element">
        <div class="form-row-item form-row-item-full">
          <div v-for="(item, index) in elements" :key="item.id" @click.stop="penActive(item)">
            <div class="pen-tools pen-item" :class="selectPenArrId.indexOf(item.id) !== -1 ? 'is-active' : ''">
                <span class="hide-input">
                  <i v-if="item.type !== 1" class="nz-icon nz-icon-image" style="margin-right: 3px"/>
                  <i v-else class="nz-icon nz-icon-xiantiao" />
                  <el-input
                    :ref="'hideInput' + index"
                    v-if="editFlag[index]"
                    :title="item.nzName"
                    style="width: 290px"
                    @blur="blurName(index)"
                    @keydown.enter.native="blurName(index)"
                    v-model="item.nzName"
                    size="small"
                  >
                    <span slot="suffix">
                      {{$t('terminal.confirm')}}
                    </span>
                  </el-input>
                  <span class="hide-input-nzName text-ellipsis" v-if="!editFlag[index]">
                    {{item.nzName}}
                  </span>
                  <i @click="changeEditFlag(index)" v-if="!editFlag[index]"  class="nz-icon nz-icon-edit1"/>
                </span>
              <span>
                  <span @click.stop="penChange(item, 'locked')" class="pen-tools-item" :title="!item.locked?$t('overall.locked'): $t('overall.unlocked')">
                    <i  class="nz-icon nz-icon-lock" v-if="item.locked"/>
                    <i  class="nz-icon nz-icon-unlock" v-if="!item.locked"/>
                  </span>
                  <span @click.stop="penChange(item, 'visible')" class="pen-tools-item" :title="!item.visible?$t('overall.visible'): $t('overall.invisible')">
                    <i  class="nz-icon nz-icon-mimakejian1" v-if="item.visible"/>
                    <i  class="nz-icon nz-icon-mimabukejian" v-if="!item.visible"/>
                  </span>
                  <span @click.stop="copyPen(item)" class="pen-tools-item" :title="$t('overall.duplicate')">
                    <i  class="nz-icon nz-icon-override"/>
                  </span>
                  <span @click.stop="delPen(item)" class="pen-tools-item" :title="$t('overall.delete')">
                    <i  class="nz-icon nz-icon-minus"/>
                  </span>
                </span>
            </div>
          </div>
        </div>
      </div>
      <div style="display: flex;padding: 10px 0; justify-content: space-between">
        <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="addNode"
                style="margin-right: 20px">
          {{$t('project.topology.addNode')}}
        </button>
        <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" v-if="selectPenArrId.length" style="margin-right: 20px" @click="clearSelection">
          {{$t('project.topology.clearSelection')}}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getTopology } from '@/components/common/js/common'
import draggable from 'vuedraggable'
import bus from '@/libs/bus'
import { deepClone, s8 } from '@meta2d/core'
import nezhaColor from '@/components/common/nezhaColor'
import meta2dSelectImage from '@/components/common/project/meta2d/meta2dSelectImage'
export default {
  name: 'meta2dCanvas',
  props: {
    canvasProps: {},
    meta2dId: {},
    params: {}
  },
  components: {
    draggable,
    nezhaColor,
    meta2dSelectImage
  },
  computed: {
    selectPenArrId () {
      return this.selectPenArr.active.map(item => item.id)
    }
  },
  data () {
    return {
      elements: [],
      background: '#ffffff00',
      bkImage: '',
      bkImageId: '',
      selectPenArr: {
        active: []
      },
      nodesAlign: [// 对齐方式
        {
          value: 'left',
          desc: this.$t('overall.left'),
          icon: 'nz-icon-zuoduiqi'
        }, {
          value: 'right',
          desc: this.$t('dashboard.dashboard.chartForm.alignList.right'),
          icon: 'nz-icon-youduiqi'
        }, {
          value: 'top',
          desc: this.$t('project.topology.topOffsetY'),
          icon: 'nz-icon-dingbuduiqi'
        }, {
          value: 'bottom',
          desc: this.$t('project.topology.bottomOffsetY'),
          icon: 'nz-icon-dibuduiqi'
        }, {
          value: 'center',
          desc: this.$t('project.topology.center'),
          icon: 'nz-icon-shuxiangjuzhongduiqi'
        }, {
          value: 'middle',
          desc: this.$t('project.topology.middleOffsetY'),
          icon: 'nz-icon-hengxiangjuzhongduiqi'
        }, {
          value: 'same',
          desc: '相同大小',
          icon: 'nz-icon-paichudingcengtuxing'
        }, {
          value: 'rectCenter',
          desc: '水平等距分布',
          icon: 'nz-icon-hengxiangfenbu'
        }, {
          value: 'rectMiddle',
          desc: '垂直等距分布',
          icon: 'nz-icon-shuxiangfenbu'
        }
      ],
      editFlag: []
    }
  },
  mounted () {
    getTopology(this.meta2dId).store.data.pens.forEach((pen, index) => {
      if (!pen.nzName) {
        pen.nzName = 'element - ' + index
      }
    })
    this.selectPenArr = getTopology(this.meta2dId).store
    this.elements = getTopology(this.meta2dId).store.data.pens
    this.background = getTopology(this.meta2dId).store.data.background || '#ffffff00'
    this.bkImage = getTopology(this.meta2dId).store.data.bkImage || ''
    this.bkImageId = this.params.bkImageId || ''
    this.$refs.backgroundNezhaColor.colors = this.background
  },
  methods: {
    updateShow (key) {
      this.canvasProps[key] = !this.canvasProps[key]
    },
    penActive (item) {
      // bus.$emit('changeSelectPens', [])
      this.$emit('changeActiveName')
      this.$nextTick(() => {
        getTopology(this.meta2dId).active([item])
        getTopology(this.meta2dId).render()
        // getTopology(this.meta2dId).setValue(item)
        bus.$emit('changeSelectPens', [item])
      })
    },
    penChange (item, key) {
      const obj = {
        id: item.id
      }
      if (key === 'visible') {
        obj.visible = !item.visible
        if (item.visible) {
          if (getTopology(this.meta2dId).store.active.length && item.id === getTopology(this.meta2dId).store.active[0].id) {
            bus.$emit('changeSelectPens', [])
          }
        } else {
          this.$emit('changeActiveName')
          getTopology(this.meta2dId).active([item])
          getTopology(this.meta2dId).render()
          // getTopology(this.meta2dId).setValue(item)
          bus.$emit('changeSelectPens', [item])
        }
      }
      if (key === 'locked') {
        if (!item.locked) {
          obj.locked = 10
          if (getTopology(this.meta2dId).store.active.length && item.id === getTopology(this.meta2dId).store.active[0].id) {
            bus.$emit('changeSelectPens', [])
          }
        } else {
          obj.locked = 0
          this.$emit('changeActiveName')
          getTopology(this.meta2dId).active([item])
          getTopology(this.meta2dId).render()
          // getTopology(this.meta2dId).setValue(item)
          bus.$emit('changeSelectPens', [item])
        }
      }
      getTopology(this.meta2dId).setValue(obj)
    },
    copyPen (item) {
      const obj = deepClone(item)
      obj.id = s8()
      obj.x += item.width / 2
      obj.y += item.height / 2
      getTopology(this.meta2dId).addPen(obj, true)
    },
    delPen (item) {
      if (getTopology(this.meta2dId).store.active.length && item.id === getTopology(this.meta2dId).store.active[0].id) {
        bus.$emit('changeSelectPens', [])
      }
      getTopology(this.meta2dId).delete([item])
    },
    backgroundChange (val) {
      this.background = val
      getTopology(this.meta2dId).setBackgroundColor(val)
      getTopology(this.meta2dId).render()
    },
    updateImage (image) {
      this.bkImage = image.image
      this.bkImageId = image.id
      getTopology(this.meta2dId).setBackgroundImage(image.image)
    },
    blurName (index) {
      this.editFlag[index] = false
      this.$set(this.editFlag, index, false)
      // console.log(event)
    },
    changeEditFlag (index) {
      this.editFlag[index] = true
      this.$set(this.editFlag, index, true)
      this.$nextTick(() => {
        if (this.$refs['hideInput' + index] && this.$refs['hideInput' + index][0]) {
          this.$refs['hideInput' + index][0].focus()
        }
      })
    },
    onNodesAlign (value) {
      const pens = getTopology(this.meta2dId).store.active
      switch (value) {
        case 'left' :
        case 'right' :
        case 'top' :
        case 'bottom' :
        case 'center' :
        case 'middle' :
          getTopology(this.meta2dId).alignNodes(value, pens)
          break
        case 'rectCenter' :
          getTopology(this.meta2dId).spaceBetween(pens)
          break
        case 'rectMiddle' :
          getTopology(this.meta2dId).spaceBetweenColumn(pens)
          break
        case 'same' :
          const findPen = getTopology(this.meta2dId).getPenRect(pens[0])
          const height = findPen.height
          const width = findPen.width
          pens.forEach(item => {
            const obj = {
              id: item.id,
              width: width,
              height: height
            }
            getTopology(this.meta2dId)._setValue(obj)
          })
          getTopology(this.meta2dId).render()
          break
      }
    },
    addNode () {
      const data = getTopology(this.meta2dId).data()
      const offestX = data.x
      const offestY = data.y
      const pen = {
        name: 'rectangle',
        text: 'rectangle',
        width: 100,
        height: 100,
        x: 100 - offestX,
        y: 100 - offestY
      }
      getTopology(this.meta2dId).addPen(pen, true)
    },
    clearSelection () {
      // getTopology(this.meta2dId).active([])
      getTopology(this.meta2dId).inactive()
      getTopology(this.meta2dId).render()
      bus.$emit('changeSelectPens', [])
    }
  },
  watch: {
    elements: {
      handler () {
        this.editFlag = []
        this.elements.forEach(() => {
          this.editFlag.push(false)
        })
      }
    }
  }
}
</script>
