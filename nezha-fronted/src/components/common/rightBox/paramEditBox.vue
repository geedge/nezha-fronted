<template>
  <!--start--param编辑框-->
  <transition name="right-sub-box">
    <div @click.stop class="right-sub-box" v-if="editParamBox.show" :style="'top: ' + editParamBox.top + 'px; left: ' + editParamBox.left + 'px;'">
      <div class="param-box">
        <div v-for="(item, index) in currentModule.paramObj" :key="index" class="param-box-row">
          <el-input placeholder="key" class="param-box-row-key" size="mini" v-model="item.key"></el-input>
          <span class="param-box-row-eq">=</span>
          <el-input placeholder="value" class="param-box-row-value" size="mini" v-model="item.value"></el-input>
          <span class="param-box-row-symbol" @click="removeParam(index)"><i class="nz-icon nz-icon-minus"></i></span>
        </div>
      </div>
      <div style="width: 100%; text-align: center; height: 25px;">
        <el-button @click="addParam" style="height: 18px; line-height: 18px; padding-top: 0; padding-bottom: 0;" size="mini"><i class="nz-icon nz-icon-plus"></i></el-button>
      </div>
    </div>
  </transition>
  <!--end--param编辑框-->
</template>

<script>
export default {
  name: 'paramEditBox',
  props: {
    editParamBox: Object,
    paramObj: Array
  },
  data () {
    return {

    }
  },
  methods: {

  }
}
</script>

<style scoped>
  /* begin--子弹框*/
  .right-sub-box {
    width: 170px;
    height: 225px;
    position: fixed;
    z-index: 2;
    padding: 0 0 0 10px;
  }
  .param-box {
    height: 200px;
    overflow: auto;
  }
  .param-box-row {
    padding: 7px 0 0 0;
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
    width: 18px;
    text-align: center;
    height: 22px;
    line-height: 22px;
    color: #c4c7cF;
  }
  .param-box-row-symbol:first-of-type {
    font-size: 18px;
    color: #bbbbbb;
    text-align: center;
    display: inline-block;
    position: absolute;
    top: 7px;
    right: 34px;
    cursor: pointer;
  }
  .param-box-row-symbol:last-of-type {
    font-size: 12px;
    color: #bbbbbb;
    border: 1px solid #bbbbbb;
    text-align: center;
    height: 12px;
    width: 14px;
    display: inline-block;
    position: absolute;
    top: 12px;
    left: 135px;
    cursor: pointer;
  }
  .param-box-row-symbol>i {
    position: absolute;
    top: 1px;
    right: 1px;
  }
  /* end--param*/
</style>
