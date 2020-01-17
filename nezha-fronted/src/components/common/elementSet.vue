<template>
  <div
    class="pop-elementset"
    v-clickoutside="elementsetHide"
    :style="{opacity:(eventfixedVal.shezhi==1),left:(eventfixedVal.shezhi==1 ? event_positionx : -2000)+'px',top:(event_positiony)+'px'}"
  >
    <div class="pop-top-btns">
      <button type="button" @click="shezhiControl('ok')" class="nz-btn nz-btn-size-alien nz-btn-size-small nz-btn-style-light nz-btn-min-width-35" id="element-set-ok">
        <span class="pop-top-btn-icon"><i class="nz-icon nz-icon-edit"></i></span>
        <span class="pop-top-btn-txt">{{$t('overall.save')}}</span>
      </button>
      <button type="button" @click="shezhiControl('cancel')" class="nz-btn nz-btn-size-alien nz-btn-size-small nz-btn-style-light nz-btn-min-width-35" id="element-set-esc">
        <span class="pop-top-btn-icon"><i class="el-icon-close"></i></span>
        <span class="pop-top-btn-txt">{{$t('overall.esc')}}</span>
      </button>
    </div>
    <div class="pop-title">{{$t('overall.select')}}</div>
    <div class="pop-box elementset-labels">
      <el-scrollbar style="height: 100%;">
        <div
          v-for="(item,index) in dropColRes"
          :key="index"
          class="elementset-label"
          :class="index==0 || index == 1 ? 'elementset-label-disabled' : ''"
          :title="item.visibility == 'disabled' ? other.inDevelopment : ''"
          @click="addcol(item,index)"
          :id="'element-set-el-'+index"
        >
          <i class="el-icon-check" v-if="index==0||index==1||item.visibility=='disabled'"></i>
          <i v-else class="el-icon-check" v-show="item.show"></i>
          <span>{{item.label}}</span>
        </div>
      </el-scrollbar>
    </div>
    <div class="elementset-bottom-btns">
      <button type="button" @click="dropAll(true)" class="nz-btn nz-btn-size-normal nz-btn-style-light">
        <span class="top-tool-btn-txt">{{$t('overall.all')}}</span>
      </button>
      <button type="button" @click="dropAll(false)" class="nz-btn nz-btn-size-normal nz-btn-style-light">
        <span class="top-tool-btn-txt">{{$t('overall.cancel')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["dropCol","tableTitle"],
  data() {
    return {
      other: this.$t("overall.other"),
      event_positiony: 0,
      event_positionx: 0,
      eventfixedVal: {},
      dropColRes: JSON.parse(JSON.stringify(this.dropCol)),
      titles: JSON.parse(JSON.stringify(this.tableTitle))
    };
  },
  mounted() {},
  created() {
    let localStorageTitle=JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path));
    if(localStorageTitle){
      for(let title of this.titles){
        for(let lsTitle of localStorageTitle){
          if(lsTitle.prop === title.prop){
            lsTitle.label=title.label;
          }
        }
      }
      localStorage.setItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path,JSON.stringify(localStorageTitle))
    }

  },
  watch: {
    dropCol: {
      immediate: true,
      deep: true,
      handler(data) {
        this.dropColRes = JSON.parse(JSON.stringify(data));
      },
    },
    position: {
      //监听设置icon的显示位置
      handler(data) {
        this.event_positiony = data.positiony;
        this.event_positionx = data.positionx;
      },
      immediate: true
    },
    eventfixed: {
      handler(data) {
        if (data)
        this.eventfixedVal = data;
      },
      immediate: true
    }
  },
  methods: {
    //悬浮点击空白隐藏
    elementsetHide() {
      this.eventfixedVal.shezhi = 0;
    },
    //点击全选all或者cancel按钮
    dropAll(state) {
      for (let index = 0; index < this.dropColRes.length; index++) {
        if (index == 0 || index == 1) {
          this.dropColRes[index].show = true;
        } else {
          this.dropColRes[index].show = state;
        }
      }
    },
    //下拉选项选择
    addcol(val, index) {
      if (index == 0 || index == 1) {
        this.dropColRes[index].show = true;
      } else {
        this.dropColRes[index].show = !this.dropColRes[index].show;
      }
    },
    //点击第二个cancel
    shezhiControl(t) {
      if (t == "ok") {
        this.$emit("tablelable", JSON.parse(JSON.stringify(this.dropColRes)));
        localStorage.setItem(
          "nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path,
          JSON.stringify(this.tablelable)
        );
      } else {
        this.dropColRes = JSON.parse(JSON.stringify(this.tablelable));
      }

      this.elementsetHide();
    },
  },
  computed: {
    eventfixed() {
      return this.$store.state.eventfixed;
    },
    position() {
      return this.$store.state.position;
    },
    tablelable() {
      return this.$store.state.tablelable;
    },
  }
};
</script>

<style lang="scss" scoped>
.pop-elementset {
  padding: 0 12px 12px 12px;
  border: 1px solid #EBEEF5;
  box-shadow: $pop-box-shadow;
  position: fixed;
  top: 0;
  left: 10px;
  width: 200px;
  color: #606266;
  background: #fff;
  border-radius: 4px;
  z-index: 999;
}

.elementset-labels {
  margin-top: 30px;
  width: 100%;
  height: 300px;
}
.elementset-labels i {
  color: #04b330;
  font-size: 14px;
  position: absolute;
  left: 5px;
  top: 6px;
}
.elementset-label {
  padding: 2px 0 2px 25px;
  position: relative;
  cursor: default;
  font-size: 14px;
}
.elementset-label-disabled {
  cursor: not-allowed;
  background: #f1f3f4;
  opacity: 0.7;
}
.elementset-bottom-btns {
  margin-top: 7px;
}
.unshow {
  display: none;
}
</style>
