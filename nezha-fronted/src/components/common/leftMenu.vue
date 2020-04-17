<template>
    <div class="content">
      <div class="content-left left-slot" :class="{'left-slot-shrink':isShrink}">
        <slot name="content-left"></slot>
        <div  @click="toggleStat" class="bottom-icon">
          <div class="bottom-divider"></div>
          <div style="display: inline-block;float: right;margin-right:15px;"><i style="font-size: 24px;" :class="{'nz-icon nz-icon-push-pin-line':isShrink,'nz-icon nz-icon-push-pin-fill':!isShrink}" :style="{color:!isShrink?'#EE9D3F':''}"></i></div>
        </div>
      </div>
      <div class="content-right right-slot" :class="{'right-slot-open':isShrink}">
        <slot name="content-right" ></slot>
      </div>
    </div>
</template>

<script>
    export default {
      name: "leftMenu",
      props:{
        resizeFunc:{type:Function}
      },
      data(){
        return{
          isShrink:false,
        }
      },
      methods:{
        toggleStat:function(){
          this.isShrink=!this.isShrink;
          this.$store.commit('setLeftMenuStat',this.isShrink);
          if(this.resizeFunc){
            this.resizeFunc();
          }
        }
      },
      mounted() {
        this.isShrink=this.$store.state.leftMenuStat ;
      }
    }
</script>

<style scoped lang="scss">
  .content{
    height: 100%;
    position:relative;
  }
  .slot-content{
    height: 100%;
  }
  .content .left-slot{
    position: relative;
    background-color: $left-menu-bgcolor;
    /*border-bottom: 1px solid #eeeeee;*/
    /*transition: all 100ms;*/
  }
  .content .right-slot{
    margin-left: unset !important;
    width: calc(100% - 210px);
    float: right;
  }
  .content .left-slot-shrink{
    width: 25px;
    padding: 0px;
    .bottom-icon .bottom-divider{
      width: 0px;
    }
    .slot-content{
      visibility: hidden;
    }
  }
  .content .right-slot-open{
    width:calc(100% - 35px);
  }
  .left-slot .bottom-icon{
    position:absolute;
    bottom: 15px;
    left: 0px;
  }
  .left-slot .bottom-icon i{
    visibility: hidden;
  }
  .left-slot:hover{
    i{
      visibility: visible;
    }
  }
  .left-slot .bottom-icon i:hover{
    cursor: pointer;
  }

  .bottom-icon .bottom-divider{
    display: inline-block;
    height: 1px;
    width: 175px;
    border-top: 1px solid lightgrey;
    vertical-align: middle;
    visibility: hidden;
  }
  .content .left-slot-shrink:hover{
    width: 200px;
    padding: 0px 0px 0px 15px;
    position: absolute;
    z-index: 100;
    .slot-content{
      visibility: visible;
    }
    .bottom-icon{
      z-index: 101;
    }
    .bottom-icon .bottom-divider{
      width: 175px;
    }
  }
</style>
<style lang="scss">

</style>
