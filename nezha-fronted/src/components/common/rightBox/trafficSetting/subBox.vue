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
            <span style="color: #F56C6C;font-size: 12px;" v-if="inputKeyErr[index]">{{$t('validate.key')}}</span>
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
import editRigthBox from '../../mixin/editRigthBox'
export default {
  name: 'subBox',
  mixins: [editRigthBox],
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

<style scoped>
  .right-sub-box {
    width: 170px;
    height: 225px;
    position: fixed;
    z-index: 2;
    padding: 0;
  }
  .sub-box .add-btn{
    width: 100%;
    text-align: center;
    height: 25px;
    line-height: 25px;
    position: absolute;
    bottom: 0px;
    left: 0px;
  }
  /* start--param*/
  .param-btn {
    float: right;
    height: 27px;
    margin-top: -3px;
  }
  .param-btn-active {
    background-color: #656565;
    color: white;
    border: 1px solid #656565;
  }
  .param-btn-active:hover, .param-btn-active:focus {
    background-color: #656565;
    color: white;
  }
  .param-btn-clear {
    background-color: #D4D4D4;
    border: 1px solid #D4D4D4;
    color: white;
  }
  .param-btn-clear:hover, .param-btn-clear:focus {
    background-color: #D4D4D4;
    color: white;
  }

  .param-box {
    height: 200px;
    overflow: auto;
    border: none;
  }
  .param-box-row {
    padding: 7px 10px 0 10px;
    position: relative;
  }
  .param-box-row:last-of-type {
    padding-bottom: 7px;
  }
  .param-box-row-key, .param-box-row-value {
    display: inline-block;
    width: 50px;
  }
  .param-box-row-eq {
    display: inline-block;
    width: 14px;
    text-align: center;
    height: 22px;
    line-height: 22px;
    color: #c4c7cF;
  }
  /* end--param*/
</style>
