<template>
  <div class="pop-custom" v-clickoutside="esc">
    <div class="pop-title">{{$t('overall.select')}}</div>
    <div class="pop-box custom-labels">
      <el-scrollbar style="height: 100%;">
        <!--NotSet 为true不可设置-->
        <div
          v-for="(item,index) in custom"
          :key="index"
          class="custom-label"
          @click="handler(item,index)"
          :id="'element-set-el-'+index"
          :class="{'custom-title orange-font':item.type == 'title','custom-label-disabled':!allowedAll&&!item.allowed && (index==0 || index == 1 || item.NotSet)}"
        >
          <i class="el-icon-check" v-if="!allowedAll&&!item.allowed&&(index==0||index==1||item.visibility=='disabled')"></i>
          <i v-else class="el-icon-check" v-show="item.show"></i>
          <span>{{item.label}}</span>
        </div>



      </el-scrollbar>
    </div>
    <div class="custom-bottom-btns">
      <button v-if="isCancel" type="button" @click="batchHandler(false)" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-min-width-35 is-cancel">
        <span class="top-tool-btn-txt">{{$t('overall.clear')}}</span>
      </button>
      <button v-if="!isCancel" type="button" @click="batchHandler(true)" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-min-width-35">
        <span class="top-tool-btn-txt">{{$t('overall.all')}}</span>
      </button>
      <div>
        <button type="button" @click="esc" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-min-width-35">
          <span class="top-tool-btn-txt">{{$t('overall.esc')}}</span>
        </button>
        <button type="button" @click="save" class="nz-btn nz-btn-size-small nz-btn-style-normal nz-btn-min-width-35">
          <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props:{
    customTableTitle: Array, //自定义的title
    originalTableTitle: Array, //原始title
    path: String,
    allowedAll: {default: false},
  },
  data() {
    return {
      custom: [],
    };
  },
  created() {
    let localStorageTitle = JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path));
    if (localStorageTitle ){
      for (let title of this.originalTableTitle) {
        for (let lsTitle of localStorageTitle) {
          if (lsTitle.prop === title.prop){
            lsTitle.label = title.label;
          }
        }
      }
      localStorage.setItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path, JSON.stringify(localStorageTitle))
    }

  },
  watch: {
    customTableTitle: {
      immediate: true,
      deep: true,
      handler(n) {
        this.custom = JSON.parse(JSON.stringify(n));
      },
    },
  },
  methods: {
    //悬浮点击空白隐藏
    esc() {
      this.$emit('close');
    },
    //全选all true 或者全取消cancel false按钮
    batchHandler(state) {
      for (let index = 0; index < this.custom.length; index++) {
        if (index == 0 || index == 1 || this.custom[index].NotSet) {
          this.custom[index].show = true;
        } else {
          this.custom[index].show = state;
        }
      }
    },
    //单选
    handler(val, index) {
      if (!this.allowedAll&&!val.allowed && (index == 0 || index == 1 || val.NotSet)) {
        // this.custom[index].show = true;
      } else {
        this.custom[index].show = !this.custom[index].show;
      }
    },
    //点击第二个cancel
    save() {
      this.$emit('update:customTableTitle', this.custom);
      localStorage.setItem(
        "nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + ((typeof this.path != 'undefined') ? this.path : this.$route.path),
        JSON.stringify(this.custom)
      );
      this.esc();
    },
  },
  computed: {
    //点击all是否是全部取消选中，true为是
    isCancel() {
      let isCancel = true;
      for (let i = 0; i < this.custom.length; i++) {
        if (!this.custom[i].show) {
          isCancel = false;
          break;
        }
      }
      return isCancel;
    }
  }
};
</script>

<style lang="scss">
.pop-custom {
  padding: 0 12px 12px 12px;
  border: 1px solid #EBEEF5;
  box-shadow: $pop-box-shadow;
  position: absolute;
  top: 83px;
  right: 0;
  width: 200px;
  color: #606266;
  background: #fff;
  border-radius: 4px;
  z-index: 999999;
}
.pop-custom-explore {
  top: 33px;
}
.relative-position .pop-custom {
  top: 33px;
}
.custom-labels {
  margin-top: 12px;
  width: 100%;
  height: 300px;
}
.custom-labels i {
  color: #04b330;
  font-size: 14px;
  position: absolute;
  left: 5px;
  top: 6px;
}
.custom-label {
  padding: 2px 0 2px 25px;
  position: relative;
  cursor: default;
  font-size: 14px;
}
.custom-title{
  padding: 2px 0 2px 2px;
}
.custom-label-disabled {
  cursor: not-allowed;
  background: #f1f3f4;
  opacity: 0.7;
}
.custom-bottom-btns {
  margin-top: 7px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.unshow {
  display: none;
}
</style>
