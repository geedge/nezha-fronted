<template>
  <el-popover :placement="placement" width="300" @hide="hidePop" ref="moduleListPop" v-model="popBox.show" popper-class="nz-pop">
    <div class="pop-top-btns">
      <button type="button" @click="show(false)" class="nz-btn nz-btn-size-alien nz-btn-size-small nz-btn-style-light nz-btn-min-width-35" id="dc-esc">
        <span class="pop-top-btn-icon"><i class="el-icon-close"></i></span>
        <span class="pop-top-btn-txt">{{$t('overall.esc')}}</span>
      </button>
    </div>
    <div class="pop-title">{{$t('project.module.module')}}</div>
    <div class="pop-item-wider">
      <el-input class="input-x-mini-22" v-model="pageObj.name" style="margin-bottom: 10px; width: calc(100% - 30px);"></el-input>
      <button @click="getModuleList" class="nz-btn nz-btn-size-small nz-btn-style-light" id="module-search"><i class="el-icon-search" ></i></button>
      <el-table
        :data="moduleList"
        border
        :show-header="false"
        height="513px"
        style="width: 100%;"
        class="module-box-table"
      >
        <el-table-column>
          <template slot-scope="scope" :column="item">
            <span class="link" @click="$emit('openModuleBox', scope.row)" :id="'module-openbox-'+scope.row.id">{{scope.row.name}}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template slot="reference">
      <div @click="getModuleList">
        <slot name="optionZone"><div class="tab-input-square link">0</div></slot>
      </div>
    </template>
  </el-popover>
</template>

<script>
export default {
  name: "moduleListPop",
  props:{
    assetId: {type: String},
    placement: {type: String}
  },
  data() {
    return {
      popBox: {show: false},
      moduleList: [],
      pageObj: {
        pageNo: 1,
        pageSize: 999,
        name: '',
        assetId: this.assetId
      }
    }
  },
  methods: {
    getModuleList() {
      this.$get('module', this.pageObj).then(response => {
        if (response.code === 200) {
          this.moduleList = response.data.list;
        }
      });
    },
    hidePop() {
      this.pageObj.name = '';
      this.moduleList = [];
    },
    show(show) {
      this.popBox.show = show;
    }
  },
  watch:{
    assetId:{
      immediate:true,
      handler(n,o){
        this.pageObj.assetId=n;
      }
    }
  }
}
</script>

<style scoped>
.pop-item-wider {
  height: 550px;
}
</style>
