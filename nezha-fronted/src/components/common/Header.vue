<template>
    <div class="header">
        <div class="submenu">
            <el-menu
                    class="el-menu-demo"
                    mode="horizontal"
                    background-color="#ffffff"
                    unique-opened
            >
                <el-menu-item index="1" @rou><div @click="jumpadd">dashboard</div></el-menu-item>
                <el-submenu index="2">
                    <template slot="title" router="../dashboard">project</template>
                    <el-menu-item index="2-1">选项1</el-menu-item>
                    <el-menu-item index="2-2">选项2</el-menu-item>
                    <el-menu-item index="2-3">选项3</el-menu-item>
                </el-submenu>
                <el-submenu index="3">
                    <template slot="title">asset</template>
                    <el-menu-item index="2-1">选项1</el-menu-item>
                    <el-menu-item index="2-2">选项2</el-menu-item>
                    <el-menu-item index="2-3">选项3</el-menu-item>
                </el-submenu>
            </el-menu>
        </div>
    </div>
</template>

<script>
export default {
  name: "Header",
  methods:{
    jumpadd(){
      this.$router.push({
        path: "/dashboard",
      });
    },
    jump() {
      this.$router.push({
        path: "/project",
      });
    },
  }
}
</script>

<style scoped>
.submenu{
    padding-left: 50%;
}
.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 60px;
    font-size: 22px;
    background-color: #ffffff;
    position: relative;
    z-index: 999;
    box-shadow: 0px 20px 13px -19px #5E5E5E;
}
</style>