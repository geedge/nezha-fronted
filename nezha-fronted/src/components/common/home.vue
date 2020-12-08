<template>
  <div>
    <Header ref="header"></Header>
    <!--<div class="content-box" >
      <router-view/>
    </div>-->
    <left-menu ></left-menu>
    <menus v-if="isMenuPage"></menus>
    <web-ssh ref="webSsh" ></web-ssh>
  </div>

</template>

<script>
import Header from "./header";
import webSSH from "../cli/webSSH";
import leftMenu from "./leftMenu";
import menus from "../page/config/menus";
export default {
  name: "home",
  components: {
    Header,
    'web-ssh': webSSH,
    'left-menu': leftMenu,
    menus
  },
  computed:{
    isMenuPage:function(){
      console.log(this.$route.path )
      return this.$route.path == '/menu'
    }
  }
}
</script>

<style scoped>
/*@media screen and (max-width: 1600px) {
    .content-box {
        background: #a0eea6;
    }
}
@media screen and (max-width: 700px) {
    .content-box {
        background: #b94b7e;
    }
}*/
</style>
