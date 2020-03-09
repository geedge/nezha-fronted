<template>
    <div>
        <Header ref="header"></Header>
        <div class="content-box" >
            <router-view/>
        </div>
        <web-ssh ref="webSsh" ></web-ssh>
    </div>

</template>

<script>
import Header from "./header";
import webSSH from "../cli/webSSH";
export default {
  name: "home",
  components: {
    Header,
    'web-ssh':webSSH,
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
