<template>
  <el-popover :placement="placement" width="487" ref="selectAreaPopBox" v-model="popBox.show" popper-class="nz-pop nz-pop-select-area" transition="slide">
    <div>
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
      mounted() {
        /*this.$nextTick(() => {
          console.info(this.$refs)
          this.$refs.areaTree.setCurrentKey(this.currentArea);
        });*/
        setTimeout(() => {
          console.info(this.$refs)
          this.$refs.areaTree.setCurrentKey(this.currentArea);
        }, 100);
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
