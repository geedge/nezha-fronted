<template>
  <div>
    <Header ref="header"></Header>
    <!--<div class="content-box" >
      <router-view/>
    </div>-->
    <left-menu></left-menu>
    <web-ssh ref="webSsh" ></web-ssh>
  </div>

</template>

<script>
import Header from "./header";
import webSSH from "../cli/webSSH";
import leftMenu from "./leftMenu";
export default {
  name: "home",
  components: {
    Header,
    'web-ssh': webSSH,
    'left-menu': leftMenu
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
