<template>
  <el-popover :placement="placement" width="367" ref="selectWalkPopBox" v-model="popBox.show" popper-class="nz-pop nz-pop-select-area" transition="slide">
    <div>
      <div class="pop-item-wider">
        <el-scrollbar class="select-area-tree">
          <el-tree
            ref="walkTree"
            node-key="id"
            :props="{label: 'name', children: 'children'}"
            :data="walkData"
            default-expand-all
            :expand-on-click-node="false"
            check-on-click-node
            check-strictly
            highlight-current
            @node-click="selectWalk"
            @check-change="clearOthers">
          </el-tree>
        </el-scrollbar>
      </div>
      <!--<div class="">
        <button class="float-right nz-btn nz-btn-size-small nz-btn-style-normal nz-btn-min-width-60" type="button" @click="selectWalk">{{$t('overall.ok')}}</button>
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
      name: "selectWalk",
      props:{
        placement: {type: String},
        isEdit: {type: Boolean, default: true},
        walkData: {type: Array},
        currentWalk: {type: Array}
      },
      created() {
      },
      mounted() {
        this.$nextTick(() => {
          //this.$refs.walkTree.setCurrentKey(this.currentArea);
        });
      },
      data(){
        return {
          popBox: {show: false},
          walk: ''
        }
      },
      methods:{
        openBox(walk){
          if (walk) {
            this.walk = walk;
            //this.$refs.walkTree.setChecked(this.area.id, true, false);
          }
        },
        esc(){
          this.popBox.show = false;
        },
        //确认选择某个节点，与父组件交互
        selectWalk(data, checked, child) {
          this.walk = data;
          this.$emit('selectWalk', this.walk);
          this.esc();
        },
        //tree设为单选
        clearOthers(data, checked, child) {
          if (checked) {
            this.walk = data;
            //this.$refs.walkTree.setCheckedKeys();
          } else {
            this.walk = "";
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
