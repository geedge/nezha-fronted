<template>
  <el-popover v-if="popBox.show" :placement="placement" width="367" ref="selectWalkPopBox" popper-class="nz-pop nz-pop-select-walk" transition="slide">
    <div>
      <div class="pop-item-wider">
        <el-scrollbar class="select-walk-tree" ref="scrollbar">
          <el-tree
            ref="walkTree"
            node-key="objectID"
            :props="{label: 'name', children: 'subTree', disabled: disabledNode}"
            :data="walkData"
            :default-expanded-keys="expandedWalk"
            :expand-on-click-node="false"
            check-on-click-node
            check-strictly
            show-checkbox
            @check="change"
            :default-checked-keys="currentWalk"
          >
            <span slot-scope="{node, data}" :class="getClass(data.objectID)">
              <span v-if="!data.type"><i class="el-icon-reading"></i></span>
              <span v-else>
                <i v-if="data.type.toUpperCase() == 'IDENTIFIER'" class="el-icon-folder-opened"></i>
                <i v-if="data.type.toUpperCase() == 'OBJECT' && data.subTree.length > 0" class="el-icon-folder-opened"></i>
                <i v-if="data.type.toUpperCase() == 'OBJECT' && data.subTree.length == 0" class="nz-icon nz-icon-leaf"></i>
                <i v-if="data.type.toUpperCase() == 'ENTRY'" class="nz-icon nz-icon-table-edit"></i>
                <i v-if="data.type.toUpperCase() == 'TABLE'" class="nz-icon nz-icon-table"></i>
                <el-popover ref="walkDetail" trigger="click" placement="left" popper-class="nz-pop nz-pop-walk-detail">
                  <div>
                    <ul>
                      <li><span class="metirc-tip-list">Name&nbsp;:&nbsp;</span><span>{{data.name}}</span></li>
                      <li><span class="metirc-tip-list">OID&nbsp;:&nbsp;</span><span>{{data.objectID}}</span></li>
                      <li><span class="metirc-tip-list">MIB&nbsp;:&nbsp;</span><span>{{mibName(node)}}</span></li>
                    </ul>
                  </div>
                  <span @click.stop slot="reference"><i class="nz-icon nz-icon-info-normal metric-tip-icon"></i></span>
                </el-popover>
              </span>
              {{data.name}}
            </span>
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
      name: "selectWalk",
      props:{
        placement: {type: String},
        walkData: {type: Array},
        currentWalk: {type: Array},
        expandedWalk: {type: Array}
      },
      data() {
        return {
          popBox: {show: false},
        }
      },
      computed: {
        getClass() {
          return (value) => {
            return this.currentWalk.indexOf(value) == -1 ? '' : 'walk-active';
          }
        },
        mibName() {
          return (value) => {
            return this.getMibName(value);
          }
        }
      },
      methods:{
        getMibName(node) {
          let mibName = getMibName(node);
          function getMibName(n) {
            if (n.parent && n.parent.parent) {
              return getMibName(n.parent);
            } else if (n.parent) {
              return n.data.name;
            } else {
              return "";
            }
          }
          if (mibName) {
            return mibName;
          } else {
            return "";
          }
        },
        change(data, tree) {
          this.$emit("selectWalk", data.objectID);
        },
        show() {
          this.popBox.show = true;
        },
        disabledNode(data) {
          if (data.objectID) {
            return false;
          }
          return true;
        }
      },
    }
</script>

<style lang="scss">
.select-walk-tree {
  height: 350px;
}
.select-walk-tree .el-tree-node__content {
  height: 34px;
  line-height: 34px;
}
.select-walk-tree .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
  background-color: #F5F7FA;
  font-weight: bold;
  color: $global-text-color-active;
}
.select-walk-tree .el-tree .el-checkbox {
  display: none;
}
.nz-pop-select-walk {
  padding: 0 !important;
}
.walk-active {
  color: $global-text-color-active;
}
.walk-detail {
  z-index: 10000 !important;
}
</style>
