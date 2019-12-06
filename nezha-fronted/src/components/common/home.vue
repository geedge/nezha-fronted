<template>
    <div>
        <Header ref="header"></Header>
        <div class="content-box" >
            <router-view/>
        </div>
    </div>

</template>

<script>
import Header from "./header";
import sideBar from "./sideBar";
export default {
  name: "home",
  components: {Header}
}
</script>

<style scoped>
@media screen and (max-width: 1600px) {
    .content-box {
        background: #a0eea6;
    }
}
@media screen and (max-width: 700px) {
    .content-box {
        background: #b94b7e;
    }
}
</style>
