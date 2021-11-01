<template>
  <div class="pop-custom" :class="{'pop-custom-top' : tableClass || operationTrue}" v-clickoutside="esc">
    <div class="pop-title">{{$t('overall.select')}}</div>
    <div class="pop-box custom-labels">
      <div style="height: 100%; overflow: auto;">
        <!--NotSet 为true不可设置-->
        <div
          v-for="(item,index) in custom"
          :key="index"
          class="custom-label"
          @click="handler(item,index)"
          :id="'element-set-el-'+index"
          :class="{'custom-title orange-font':item.type == 'title','custom-label-disabled':!allowedAll&&!item.allowed && (index==0 || index == 1 || item.NotSet)}"
        >
          <i class="nz-icon nz-icon-check" v-if="!allowedAll&&!item.allowed&&(index==0||index==1||item.visibility=='disabled')"></i>
          <i v-else class="nz-icon nz-icon-check" v-show="item.show"></i>
          <span>{{item.label}}</span>
        </div>

      </div>
    </div>
    <div class="custom-bottom-btns">
      <button v-if="isCancel" :id="tableId+'-element-set-none'" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new is-cancel" type="button" @click="batchHandler(false)">
        <span class="top-tool-btn-txt">{{$t('overall.clear')}}</span>
      </button>
      <button v-if="!isCancel" :id="tableId+'-element-set-all'" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new" type="button" @click="batchHandler(true)">
        <span class="top-tool-btn-txt">{{$t('overall.all')}}</span>
      </button>
      <div>
        <button :id="tableId+'-element-set-esc'" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new" type="button" @click="esc">
          <span class="top-tool-btn-txt">{{$t('overall.esc')}}</span>
        </button>
        <button :id="tableId+'-element-set-save'" class="nz-btn nz-btn-size-small-new nz-btn-style-normal-new" type="button" @click="save">
          <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    customTableTitle: Array, // 自定义的title
    originalTableTitle: Array, // 原始title
    tableId: String,
    allowedAll: { default: false },
    tableClass: Boolean,
    operationTrue: Boolean
  },
  data () {
    return {
      custom: []
    }
  },
  created () {
    const localStorageTitle = JSON.parse(localStorage.getItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.tableId))
    if (localStorageTitle) {
      localStorage.setItem('nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.tableId, JSON.stringify(localStorageTitle))
    }
  },
  watch: {
    customTableTitle: {
      immediate: true,
      deep: true,
      handler (n) {
        this.custom = JSON.parse(JSON.stringify(n))
      }
    }
  },
  methods: {
    // 悬浮点击空白隐藏
    esc () {
      this.$emit('close')
    },
    // 全选all true 或者全取消cancel false按钮
    batchHandler (state) {
      for (let index = 0; index < this.custom.length; index++) {
        if (this.custom[index].type != 'title') {
          if ((index == 0 || index == 1 || this.custom[index].NotSet)) {
            this.custom[index].show = true
          } else {
            this.custom[index].show = state
          }
        }
      }
    },
    // 单选
    handler (val, index) {
      if (!this.allowedAll && !val.allowed && (index == 0 || index == 1 || val.NotSet)) {
        // this.custom[index].show = true;
      } else {
        this.custom[index].show = !this.custom[index].show
      }
    },
    // 点击第二个cancel
    save () {
      if (this.tableId == 'assetTable') {
        let customAssetLabel = false
        this.custom.forEach(item => {
          if (customAssetLabel) {
            item.minWidth = item.label.length * 16 + 20
            return
          }
          if (item.label === 'Label' && item.type == 'title') {
            customAssetLabel = true
          }
        })
      }
      this.$emit('update', this.custom)
      localStorage.setItem(
        'nz-tableTitle-' + localStorage.getItem('nz-username') + '-' + this.tableId,
        JSON.stringify(this.custom)
      )
      this.esc()
    }
  },
  computed: {
    // 点击all是否是全部取消选中，true为是
    isCancel () {
      let isCancel = true
      for (let i = 0; i < this.custom.length; i++) {
        if (!this.custom[i].show && this.custom[i].type != 'title') {
          isCancel = false
          break
        }
      }
      return isCancel
    }
  }
}
</script>
