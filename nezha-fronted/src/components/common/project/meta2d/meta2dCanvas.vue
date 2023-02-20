<template>
  <div class="pens-data">
    <div class="form-row-box">
      <!--         backGround -->
      <div class="form-row-title">
        BackGround
        <i class="nz-icon nz-icon-arrow-down" @click="updateShow('backGround')"/>
      </div>
      <div v-show="canvasProps.backGround" class="form-row-content">
      </div>
      <div class="form-row-title">
        Elements
      </div>
      <div class="form-row-content">
        <div class="form-row-item form-row-item-full">
          <draggable
            v-model="elements"
            :scroll-sensitivity="150"
            :options="{
                    dragClass:'drag-valueMapping-class',
                    fallbackClass:'fallback-class',
                    forceFallback:true,
                    ghostClass:'chart-ghost',
                    chosenClass:'choose-class',
                    scroll:true,
                    animation: 150,
                  }">
            <div v-for="item in elements" :key="item.id">
            <div class="pen-tools" style="background: #999;margin-bottom: 10px;border-radius: 2px;display: flex;justify-content: space-between;padding: 3px 10px" @click="penActive(item)">
              <i v-if="item.type !== 1" class="nz-icon nz-icon-zhengfangxing" />
              <i v-else class="nz-icon nz-icon-compare" />
              <span>
                123123123
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

export default {
  name: 'meta2dCanvas',
  props: {
    canvasProps: {},
    meta2dId: {}
  },
  components: {
    draggable
  },
  data () {
    return {
      elements: []
    }
  },
  mounted () {
    this.elements = getTopology(this.meta2dId).store.data.pens
  },
  methods: {
    updateShow (key) {
      this.canvasProps[key] = !this.canvasProps[key]
    },
    penActive (item) {
      console.log(item.id)
      getTopology(this.meta2dId).active(item)
    }
  }
}
</script>

<style scoped>

</style>
