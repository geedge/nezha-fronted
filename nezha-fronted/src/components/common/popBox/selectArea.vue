<template>
  <el-popover :placement="placement" width="487" ref="selectAreaPopBox" v-model="popBox.show" popper-class="nz-pop nz-pop-select-area" transition="slide">
    <div>
      <!-- begin--顶部按钮-->
      <!--<div class="pop-top-btns">
        <button type="button" @click="esc" class="nz-btn nz-btn-size-alien nz-btn-size-small nz-btn-style-light nz-btn-min-width-35" id="dc-esc">
          <span class="pop-top-btn-icon"><i class="el-icon-close"></i></span>
          <span class="pop-top-btn-txt">{{$t('overall.esc')}}</span>
        </button>
      </div>-->
      <!-- end--顶部按钮-->

      <!--<div class="pop-title">{{$t('config.dc.selectArea')}}</div>-->
      <div class="pop-item-wider">
        <el-scrollbar class="select-area-tree">
          <el-tree
            ref="areaTree"
            node-key="id"
            :props="{label: 'name', children: 'children'}"
            :data="areaData"
            default-expand-all
            :expand-on-click-node="false"
            check-on-click-node
            check-strictly
            highlight-current
            @node-click="selectArea"
            @check-change="clearOthers">
          </el-tree>
        </el-scrollbar>
      </div>
      <!--<div class="">
        <button class="float-right nz-btn nz-btn-size-small nz-btn-style-normal nz-btn-min-width-60" type="button" @click="selectArea">{{$t('overall.ok')}}</button>
      </div>-->
    </div>
    <div slot="reference">
      <slot name="trigger">
      </slot>
    </div>
  </el-popover>
</template>

<script>
    export default {
      name: "selectArea",
      props:{
        placement: {type: String},
        isEdit: {type: Boolean, default: true},
        areaData: {type: Array},
        currentArea: {type: Number}
      },
      created() {
      },
      mounted() {
        this.$nextTick(() => {
          this.$refs.areaTree.setCurrentKey(this.currentArea);
        });
      },
      data(){
        return {
          popBox: {show: false},
          area: {id: '', name: ''}
        }
      },
      methods:{
        openBox(area){
          if (area) {
            this.area = area;
            this.$refs.areaTree.setChecked(this.area.id, true, false);
          }
        },
        esc(){
          this.popBox.show = false;
        },
        //确认选择某个节点，与父组件交互
        selectArea(data, checked, child) {
          this.area = data;
          this.$emit('selectArea', this.area);
          this.esc();
        },
        //tree设为单选
        clearOthers(data, checked, child) {
          if (checked) {
            this.area = data;
            this.$refs.areaTree.setCheckedKeys([data.id]);
          } else {
            this.area = {id: '', name: ''};
          }
        }
      },
      watch:{
      }
    }
</script>

<style lang="scss">
.select-area-tree {
  height: 350px;
}
.select-area-tree .el-tree-node__content {
  height: 34px;
  line-height: 34px;
}
.select-area-tree .el-tree-node__content:hover {
  color: $global-text-color-active;
}
.select-area-tree .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
  background-color: #F5F7FA;
  font-weight: bold;
  color: $global-text-color-active;
}
</style>
