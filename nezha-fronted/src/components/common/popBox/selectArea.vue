<template>
  <el-popover :placement="placement" width="250" ref="selectAreaPopBox" v-model="popBox.show" popper-class="nz-pop">
    <div>
      <!-- begin--顶部按钮-->
      <div class="pop-top-btns">
        <button type="button" @click="esc" class="nz-btn nz-btn-size-alien nz-btn-size-small nz-btn-style-light nz-btn-min-width-35" id="dc-esc">
          <span class="pop-top-btn-icon"><i class="el-icon-close"></i></span>
          <span class="pop-top-btn-txt">{{$t('overall.esc')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <div class="pop-title">{{$t('config.dc.selectArea')}}</div>
      <div class="pop-item-wider">
        <el-tree
          ref="areaTree"
          node-key="id"
          class="select-area-tree"
          :props="{label: 'name', children: 'children'}"
          show-checkbox
          :data="areaData"
          default-expand-all
          check-strictly
          :check-on-click-node="false"
          @check-change="clearOthers">
        </el-tree>
      </div>
      <div class="">
        <button class="float-right nz-btn nz-btn-size-small nz-btn-style-normal nz-btn-min-width-60" type="button" @click="selectArea">{{$t('overall.ok')}}</button>
      </div>
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
        areaData: {type: Array}
      },
      created() {
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
        selectArea() {
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

<style>
.select-area-tree {
  height: 300px;
}
</style>
