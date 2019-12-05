<template>
    <div class="header">
        <div class="submenu">
            <el-menu
                    class="el-menu-demo"
                    mode="horizontal"
                    background-color="#ffffff"
                    unique-opened
            >
                <el-menu-item index="1" @click="jumpTo('dashboard')">
                    <div>
                        {{$t('overall.dashboard')}}
                    </div>
                </el-menu-item>
                <el-submenu index="2">
                    <template slot="title">
                        <div @click="jumpTo('project')">{{$t('overall.project')}}</div>
                    </template>
                </el-submenu>
                <el-submenu index="3">
                    <template slot="title">
                        <div @click="jumpTo('asset')">{{$t('overall.asset')}}</div>
                    </template>
                    <template v-for="(item, index) in assetData">
                        <el-menu-item :index="index.toString()">
                            <div @click="jumpTo('asset',item.id)">{{item.name}}</div>
                        </el-menu-item>
                    </template>
                </el-submenu>
                <el-submenu index="4">
                    <template slot="title">
                        <div @click="jumpTo('alarm')">{{$t('overall.alarm')}}</div>
                    </template>
                </el-submenu>
            </el-menu>

        </div>
        <div class="header-right">
            <div class="header-user-con">
                <div class="flagselect">
                </div>
                <el-popover
                        placement="bottom"
                        title=""
                        width="200"
                        trigger="hover"
                >
                    <div class="userout">
                        <div :style="language!='en'?'color:#a6a6a6':''" @click="changeLocal('en')">
                            <p>English</p>
                        </div>
                        <div :style="language=='cn'?'':'color:#a6a6a6'" @click="changeLocal('cn')">
                            <p>简体</p>
                        </div>
                        <div style="cursor:no-drop;color:#a6a6a6">
                            <p>русский</p>
                        </div>
                    </div>
                    <div class="SignOut" @click="jumpTo('')">
                        退出登录
                    </div>
                    <div slot="reference" class="user-avator">
                        <span>用户名</span>
                        <i class="el-submenu__icon-arrow el-icon-arrow-down header-name-jiantou"></i>
                    </div>
                </el-popover>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: "Header",
  data() {
    return {
      language: localStorage.getItem("language"),
      assetData: []
    }
  },
  methods: {
    jumpTo(data,id) {
      this.$store.state.assetSelect = id
      this.$router.push({
        path: "/" + data,
        query: {
          t: +new Date()
        }
      });
    },
    changeLocal(lang) {
      localStorage.setItem("language", lang);
      window.location.reload();
    },
    getAssetData() {
      this.$get('idc', this.pageObj).then(response => {
        if (response.code == 200) {
          this.assetData = response.data.list
        }
      })
    },
  },
  mounted() {
    this.getAssetData()
  }
}
</script>

<style>
.el-submenu__title .el-submenu__icon-arrow {
    display: none;
}
.el-menu--horizontal>.el-menu-item.is-active{
    border-bottom:0px
}
.el-menu--horizontal>.el-submenu.is-active .el-submenu__title{
    border-bottom:0px
}
</style>

<style scoped>
.submenu {
    padding-left: 50%;
    width: 400px;
    float: left;
}

.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 60px;
    font-size: 22px;
    background-color: #ffffff;
    z-index: 500;
    box-shadow: 0px 20px 13px -19px #5E5E5E;
}

.header-right {
    float: right;
    padding-right: 5px;
}

.header-user-con {
    display: flex;
    height: 50px;
    align-items: center;
}

.user-avator {
    padding: 0 5px 3px 0;
    margin-left: 20px;
    line-height: 30px;
    cursor: pointer;
}

.user-avator:hover {
    border-radius: 2px;
    background: rgba(255, 255, 255, .3);
}

.user-avator span {
    font-size: 16px;
    margin: 0 5px;
}

.user-avator i.iconfont {
    color: #fff;
    font-size: 25px;
    transform: translateY(2.5px);
    display: inline-block;
    line-height: 30px;
}

.userout {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.userout > div {
    width: 33.3%;
    color: rgba(51, 137, 185, 1);
    cursor: pointer;
    text-align: center;
}

.SignOut {
    width: 100%;
    height: 30px;
    color: #fff;
    text-align: center;
    line-height: 30px;
    background: rgba(51, 137, 185, 1);
    margin-top: 20px;
    cursor: pointer;
}

.SignOut:hover {
    opacity: .8;
}

.header-name-jiantou {
    position: static !important;
}
</style>