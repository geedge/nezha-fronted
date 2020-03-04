<style lang="scss">
  @import './webSSH.scss';
</style>
<template>
  <div id="shell-service"  data-yunlog-scope="popup" :class="{'shell-service-max': isFullScreen}" v-show="consoleShow">
    <div id="shell-service-resize-mask"></div>
    <div id="shell-split" class="shell-split shell-iconfont" @mousedown="dragEagle" v-show="!isFullScreen">一</div>
    <div style='position: relative;border:solid 0px red;'>
      <el-menu  mode="horizontal" @select="handleSelect" style='position: absolute;left:0px;top:0px;border: 1px solid #DCDFE6;'>
        <el-submenu index="1"  style="width:40px;">
          <template slot="title" ><i class="el-icon-setting " style="position: absolute;left: 10px;top: 9px;"></i></template>
          <el-submenu index="1-1">
            <template slot="title">文字大小</template>
            <el-menu-item index="1-1-1">最小</el-menu-item>
            <el-menu-item index="1-1-2">小</el-menu-item>
            <el-menu-item index="1-1-3">中</el-menu-item>
            <el-menu-item index="1-1-4">大</el-menu-item>
          </el-submenu>
          <el-submenu index="1-2" >
            <template slot="title">字体</template>
            <el-menu-item index="1-2-1">Monosapace</el-menu-item>
            <el-menu-item index="1-2-2">Courier New</el-menu-item>
          </el-submenu>
        </el-submenu>
        <el-submenu index="2" style="width:50px;">
          <template slot="title" ><i class="el-icon-upload console-title-icon" style="position: absolute;left: 10px;top: 9px;"></i></template>
          <el-menu-item index="2-1" @click="download">下载</el-menu-item>
          <el-menu-item index="2-2" @click="upload">上传</el-menu-item>
        </el-submenu>
      </el-menu>

      <el-tabs v-model="editableTabsValue" @tab-click="handleClick" @tab-remove="removeTab"  closable style='width:100%' type="border-card">
        <el-tab-pane
          v-for="(item, index) in editableTabs"
          :key="item.name"
          :label="item.title"
          :name="item.name"
        >
          <!-- tab显示的内容 -->
          <span slot="label" > <i class="el-icon-aim"></i>{{item.title}}</span>
          <my-console :terminal="item.terminal"  :ref="'console'+index"    @closeConsole="removeTab" :idIndex="index" :isFullScreen="isFullScreen"></my-console>
        </el-tab-pane>
      </el-tabs>
      <i style='right:103px;' @click="minScreen" class="el-icon-minus console-title-icon"></i>
      <i style='right:70px;;' @click="fullScreen" class="el-icon-full-screen console-title-icon"></i>
      <i style='right:38px;' class="el-icon-copy-document console-title-icon" ></i>
      <i style='right:8px;' @click="closeConsole" class="el-icon-close console-title-icon"></i>
      <!--el-icon-setting  el-icon-minus  el-icon-full-screen  el-icon-copy-document-->
    </div>
  </div>
</template>

<script>
  import Console from './console'
  import uuidv1 from "uuid/v1";

  export default {
    name: 'webSSH',
    components: {
      'my-console': Console
    },

    data() {
      return {
        consoleShow:false,
        isFullScreen:false,
        /*
        terminal: {
          //pid: 1,
          //name: 'terminal',
          cols: 400,
          rows: 400,
          assetId:'',
          uuid:'',
        },
        */
        //activeName:'',
        editableTabsValue: '-1',//当前显示的console
        editableTabs: [/*
          {
          title: '用户管理',
          name: '1',
          content: '用户管理内容',
          terminal: {
            cols: 400,
            rows: 400,
            width:'',
            height:'',
            assetId:0,
            accountId:0,
            uuid:'aaadwdwd',
          },
        }, {
          title: '角色管理',
          name: '2',
          content: '角色管理内容'
        },*/ ],
        tabIndex: -1,//添加tab的时候使用，暂留
      }
    },
    methods: {
      getUuid(){
        let uuid = uuidv1();
        let now = new Date().getTime();
        uuid = uuid+"-"+now+"-"+now;
        return uuid;
      },
      addConsole(id,host,accountId,port){
        let uuid = this.getUuid();
        let newTabName = ++this.tabIndex + '';
        let title = host;
        if(port){
          title = title+":"+port;
        }
        let width = document.body.clientWidth;//可视宽度
        const console = {
          title:title,
          name:newTabName,
          terminal: {
            name:newTabName,
            cols: 225,
            rows: 200,
            width:width,
            height:300,
            assetId:id,
            accountId:accountId,
            uuid:uuid,
          },
        };
        this.editableTabsValue = newTabName;
        this.editableTabs.push(console);
      },
      show(id,host,accountId,port){
        this.addConsole(id,host,accountId,port);
        this.consoleShow = true;
      },
      initDialog(){

      },

      //可以做最小化的处理，点击窗口外的空白处会调用此方法
      closeDailog(){
        //alert('closeDailog');
      },
      closeConsole(){
        //关闭所有连接
        this.editableTabs.forEach((tab, index) => {
          this.$refs['console'+index][0].closeSocket();
        });

        this.editableTabs = [];
        this.editableTabsValue= '-1',//当前显示的consol
        this.tabIndex = -1

        this.consoleShow = false;
        this.isFullScreen = false;
      },
      handleClick(){

      },
      removeTab(targetName) {
        let tabs = this.editableTabs;
        let activeName = this.editableTabsValue;
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1];
              if (nextTab) {
                activeName = nextTab.name;
              }
            }
          });
        }
        this.editableTabsValue = activeName;
        this.editableTabs = tabs.filter(tab => tab.name !== targetName);
        //关闭此console的链接
        //?????????????????

        if(this.editableTabs.length<=0){
          this.closeConsole();
        }
      },
      handleSelect(key, keyPath) {
        //alert(key, keyPath);
      },
      download(){

      },
      upload(){
        //alert('upload');
      },
      minScreen(){
        this.consoleShow = false;
      },
      fullScreen(){
        //dialog全屏
        this.isFullScreen = !this.isFullScreen;

        //所有的console全屏
        this.editableTabs.forEach((tab, index) => {
          this.$refs['console'+index][0].fullScreenConsole(this.isFullScreen);
        });

        if(this.isFullScreen){
          let targetDiv= document.getElementById('shell-service');
          targetDiv.style.height='300px';
        }

        //const dailog = document.getElementById("consoleDailog");
        //dailog.style.width = `${100}%`;
      },

      dragEagle:function(e){
          var targetDiv= document.getElementById('shell-service'); //e.target.parentNode.parentNode;.children[0]

          //得到点击时该容器的宽高：
          var targetDivHeight=targetDiv.offsetHeight;
          var startY=e.clientY;
          var _this=this;

          document.onmousemove=function(e){
            e.preventDefault();
            //得到鼠标拖动的宽高距离：取绝对值
            var distY=Math.abs(e.clientY-startY);

            //往上方拖动：
            if( e.clientY < startY){
              targetDiv.style.height=targetDivHeight+distY+'px';
            }
            //往下方拖动：
            if (e.clientY > startY) {
              targetDiv.style.height=(targetDivHeight-distY)+'px';
            }
            let height = document.body.clientHeight;//可视高度
            if(parseInt(targetDiv.style.height)>=height){
              targetDiv.style.height=height+'px';
            }
            if(parseInt(targetDiv.style.height)<=10){
              targetDiv.style.height=10+'px';
            }
            _this.editableTabs.forEach((tab, index) => {
              _this.$refs['console'+index][0].resizeConsole(parseInt(targetDiv.style.height));
            });
          }

          document.onmouseup=function(){
            document.onmousemove=null;
            _this.editableTabs.forEach((tab, index) => {
              _this.$refs['console'+index][0].resizeServiceConsole(parseInt(targetDiv.style.height));
            });
          }
        },
      /*
      addTab(targetName) {
        let newTabName = ++this.tabIndex + '';
        this.editableTabs.push({
          title: 'New Tab',
          name: newTabName,
          content: 'New Tab content'
        });
        this.editableTabsValue = newTabName;
      },
      */


    },
    watch: {

    },
    created() {

    },
    mounted() {

    },
  }
</script>

