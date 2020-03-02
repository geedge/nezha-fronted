<style lang="scss">
  @import './webSSH.scss';
</style>
<template>
  <el-dialog class="console-dialog"
             :visible.sync="consoleShow"
             width="70%"
             :customClass="{'dailog-custom' :isFullScreen == true}"
             @close="closeDailog"
             @opened="initDialog">

    <div style='position: relative;border:solid 0px red;'>
      <el-menu  mode="horizontal" @select="handleSelect" style='position: absolute;left:0px;top:0px;'>
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
          <my-console :terminal="item.terminal"  :ref="'console'+index"    :idIndex="index"></my-console>
        </el-tab-pane>

      </el-tabs>
<!--
      <el-button size='mini' style='position: absolute;right:50px;top:5px;'>设置</el-button>

      <button type="button" aria-label="Close" class="el-dialog__headerbtn"><i class="el-dialog__close el-icon el-icon-close"></i></button>
      -->
      <i style='right:103px;' class="el-icon-minus console-title-icon"></i>
      <i style='right:70px;;' @click="fullScreen" class="el-icon-full-screen console-title-icon"></i>
      <i style='right:38px;' class="el-icon-copy-document console-title-icon" ></i>
      <i style='right:8px;' @click="closeConsole" class="el-icon-close console-title-icon"></i>
      <!--el-icon-setting  el-icon-minus  el-icon-full-screen  el-icon-copy-document-->
    </div>
  </el-dialog>
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
        const console = {
          title:title,
          name:newTabName,
          terminal: {
            cols: 825,
            rows: 800,
            width:500,
            height:400,
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
      fullScreen(){
        isFullScreen = true;

        //const dailog = document.getElementById("consoleDailog");
        //dailog.style.width = `${100}%`;
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

