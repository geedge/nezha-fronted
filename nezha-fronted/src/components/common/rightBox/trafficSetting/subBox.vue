<template>
  <transition name="right-sub-box">
    <div class="right-sub-box sub-box" v-if="editTagsBox.show" :style="'top: ' + editTagsBox.top + 'px; left: ' + editTagsBox.left + 'px;'" >
      <div class="param-box" style="height: calc(100% - 25px)">
        <div style="height: 100%; overflow: auto;">
          <div class="param-box-row" v-for="(item, index) in tempTagsObj" :key="index" id="traffic-setting-tags">
            <el-input placeholder="key" class="param-box-row-key input-x-mini-22" v-model="item.key" @input="validateInput(item.key,index)" :class="{'input-error':inputKeyErr[index]}"></el-input>
            <span class="param-box-row-eq">=</span>
            <el-input placeholder="value" class="param-box-row-value input-x-mini-22" v-model="item.value"></el-input>
            <span class="param-box-row-symbol" :id="'remove-param-'+index" @click="removeTags(index)"><i class="nz-icon nz-icon-shanchu1"></i></span>
            <span style="color: #F56C6C;font-size: 12px;" v-if="inputKeyErr[index]">{{$t('overall.ASCIIKey')}}</span>
          </div>
        </div>
      </div>
      <div class="add-btn">
        <el-button @click="addTags" id="add-param" style="height: 18px; line-height: 18px; padding-top: 0; padding-bottom: 0;" size="mini"><i class="nz-icon nz-icon-plus"></i></el-button>
        <el-button @click="showEditTagsBox(false)"  style="height: 18px; line-height: 18px; padding-top: 0; padding-bottom: 0;" size="mini"><i class="nz-icon nz-icon-check"></i></el-button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'subBox',
  data () {
    return {
      editTagsBox: { show: false, top: 0, left: 0 },
      tempTagsObj: [],
      rowIndex: 0,
      curConfigs: null,
      inputKeyErr: []
    }
  },
  methods: {
    showEditTagsBox: function (show, configs, index, e) {
      if (show) {
        this.rowIndex = index
        this.curConfigs = configs
        const position = e.target.getBoundingClientRect()
        this.editTagsBox.top = position.top + 25
        this.editTagsBox.left = position.left + 80
        this.tempTagsObj = []
        this.inputKeyErr = []
        let obj = null
        try {
          obj = configs[index].tags
        } catch (e) {

        }
        if (obj) {
          for (const key in obj) {
            this.tempTagsObj.push({ key: key, value: obj[key] })
            this.inputKeyErr.push(false)
          }
        }
      } else {
        if (!this.editTagsBox.show) {
          return
        }
        const temp = this.inputKeyErr.find(item => {
          return item == true
        })
        if (typeof temp !== 'undefined') {
          return
        }
        const tempObj = {}
        for (let i = 0; i < this.tempTagsObj.length; i++) {
          const obj = this.tempTagsObj[i]
          if (obj.key && obj.value) {
            tempObj[obj.key] = obj.value
          }
        }
        this.curConfigs[this.rowIndex].tags = Object.assign({}, tempObj)
      }
      this.$emit('after')
      this.editTagsBox.show = show
    },
    addTags: function () {
      this.tempTagsObj.push({ key: '', value: '' })
      this.inputKeyErr.push(false)
    },
    validateInput: function (value, index) {
      if (!/[a-zA-Z_:][a-zA-Z0-9_:]*/.test(value)) {
        this.inputKeyErr.splice(index, 1, true)
      } else {
        this.inputKeyErr.splice(index, 1, false)
      }
    },
    removeTags: function (index) {
      this.tempTagsObj.splice(index, 1)
    }
  }
}
</script>
