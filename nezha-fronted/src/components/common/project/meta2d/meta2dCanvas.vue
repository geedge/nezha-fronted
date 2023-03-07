<template>
  <div class="pens-data">
    <div class="form-row-box">
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
      <div class="form-row-title">
        {{$t('project.topology.elements')}}
      </div>
      <div class="form-row-content">
        <div class="form-row-item form-row-item-full">
          <draggable
            v-model="elements"
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
            }">
            <div v-for="(item, index) in elements" :key="item.id" @click.stop="penActive(item)">
              <div class="pen-tools pen-item" style="">
                <span class="hide-input">
                  <i v-if="item.type !== 1" class="nz-icon nz-icon-juxing" style="margin-right: 3px"/>
                  <i v-else class="nz-icon nz-icon-xiantiao" />
                  <el-input
                    :title="item.nzName"
                    style="width: 120px"
                    @focus="focusName"
                    v-model="item.nzName"
                    size="small"/>
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
          </draggable>
        </div>
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
  data () {
    return {
      elements: [],
      background: '#ffffff00',
      bkImage: '',
      bkImageId: ''
    }
  },
  mounted () {
    getTopology(this.meta2dId).store.data.pens.forEach((pen, index) => {
      if (!pen.nzName) {
        pen.nzName = 'element - ' + index
      }
    })
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
    focusName (event) {
      console.log(event)
    }
  }
}
</script>

<style scoped lang="scss">
.pen-tools-item {
  margin-right: 5px;
  fontSize:17px;
  cursor: pointer;
}
</style>
