<template>
    <div>
        <Header></Header>
        <sideBar></sideBar>
        <div class="content-box">
            <router-view/>
        </div>
    </div>

</template>

<script>
import Header from "./header";
import sideBar from "./sideBar";
export default {
  name: "home",
  components: {Header,sideBar}
}

</script>

<style scoped>


.content-box {
    position: absolute;
    left: 370px;
    right: 30px;
    top: 60px;
    bottom: 0;
    -webkit-transition: left .3s ease-in-out;
    transition: left .3s ease-in-out;
    background: #ffffff;
    height: calc(100% - 50px);
    box-sizing: border-box;
    transform: translateY(0);
    padding: 20px
}
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