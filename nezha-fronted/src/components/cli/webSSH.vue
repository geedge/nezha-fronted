<style lang="scss">
  @import './webSSH.scss';
</style>
<template>
    <div id="shell-service"  data-yunlog-scope="popup" :class="{'shell-service-max': isFullScreen,'shell-service':true}" v-show="consoleShow">
    <div id="shell-service-resize-mask"></div>
    <div id="shell-split" class="shell-split shell-iconfont" @mousedown="dragEagle" v-show="!isFullScreen">一</div>
    <div style='position: relative;'>
      <!--el-drawer 打开后会对第一个未隐藏的元素聚焦 所以添加一隐藏的input 防止聚焦-->
      <input style='width: 0;height: 0;opacity: 0;display: inherit;' />
      <el-menu  mode="horizontal" @select="handleSelect" style='position: absolute;left:0px;top:0px;border-top: 1px solid #DCDFE6;'>
        <el-submenu index="1"  style="width:40px;" popper-class="fontSizeBox">
          <template slot="title" ><i class="nz-icon nz-icon-728bianjiqi_zitidaxiao" style="position: absolute;left: 10px;top: 4px;"></i></template>
          <!--<el-submenu index="1-1">-->
            <!--<template slot="title">文字大小</template>-->
            <el-menu-item @click="changeFontSize(12)" :class="{fontSet:true,menuActive:fontSize==12, smallFont:true}" index="1-1">A</el-menu-item>
            <el-menu-item @click="changeFontSize(15)" :class="{fontSet:true,menuActive:fontSize==15, middleFont:true}" index="1-2">A</el-menu-item>
            <el-menu-item @click="changeFontSize(20)" :class="{fontSet:true,menuActive:fontSize==20, bigFont:true}" index="1-3">A</el-menu-item>
            <!--<el-menu-item class="fontSet" index="1-4">大</el-menu-item>-->
          <!--</el-submenu>-->
          <!--<el-submenu index="1-2" >-->
            <!--<template slot="title">字体</template>-->
            <!--<el-menu-item index="1-2-1">Monosapace</el-menu-item>-->
            <!--<el-menu-item index="1-2-2">Courier New</el-menu-item>-->
          <!--</el-submenu>-->
        </el-submenu>
        <el-submenu index="2" style="width:50px;">
          <template slot="title" ><i class="el-icon-upload console-title-icon" style="position: absolute;left: 10px;top: 4px;"></i></template>
          <el-menu-item index="2-1" @click="showUploadBox">
              <div>{{$t('webshell.upload')}}</div>
          </el-menu-item>
          <el-menu-item index="2-2" @click="showDownloadBox">
            <div>{{$t('webshell.download')}}</div>
          </el-menu-item>
        </el-submenu>
      </el-menu>

      <el-tabs v-model="editableTabsValue"
               @tab-click="handleClick"
               @tab-remove="removeTab"
               :before-leave="beforeLeave"
               style='width:100%; margin-left:0px;border-left:solid 1px black;border-bottom: 1px solid black;'
               type="border-card" >
        <el-tab-pane v-for="(item, index) in editableTabs"
          :key="item.name"
          :label="item.title"
          :name="item.name"
           closable
        >
          <!-- tab显示的内容 1 grey,2 green, 3 red-->
          <span slot="label" style="">
            <div :class="{'active-icon grey':item.circleColor == 1,'active-icon green':item.circleColor == 2,'active-icon red':item.circleColor == 3}"
                  style="margin-top: 0px;"></div>{{item.title}}
          </span>

          <my-console :terminal="item.terminal"    @refreshConsoleTitle="refreshTabTitle" :ref="'console'+index"    @closeConsole="removeTab" :idIndex="index" :isFullScreen="isFullScreen" :fontSize="fontSize"></my-console>

        </el-tab-pane>
        <el-tab-pane key="add" name="add">
          <span slot="label" style="padding:8px;font-size:20px;font-weight:bold;">+</span>
        </el-tab-pane>
      </el-tabs>
      <i style='right:70px;' @click="minScreen" class="el-icon-minus console-title-icon"></i>
      <i style='right:38px;' v-if="!isFullScreen" @click="fullScreen" class="el-icon-full-screen console-title-icon"></i>
      <i style='right:38px;' v-else @click="exitFullScreen" class="nz-icon nz-icon-exit-full-screen console-title-icon"></i>
      <i style='right:8px;' @click="closeConsole" class="el-icon-close console-title-icon"></i>
      <!--
      <i style='right:103px;' @click="minScreen" class="el-icon-minus console-title-icon"></i>
      <i style='right:70px;;' @click="fullScreen" class="el-icon-full-screen console-title-icon"></i>
      <i style='right:38px;' class="el-icon-copy-document console-title-icon" ></i>
      <i style='right:8px;' @click="closeConsole" class="el-icon-close console-title-icon"></i>
      -->
      <!--el-icon-setting  el-icon-minus  el-icon-full-screen  el-icon-copy-document-->
    </div>

    <div >
      <el-dialog :visible.sync="uploadBox.showUpload" :title="uploadBox.title" :modal-append-to-body='false' :show-close="true" width="500px" @close="closeDialog" class="nz-dialog" >
        <div >
          <div class="upload-body">

            <el-row >
              <el-col :span="24">
                <el-upload drag class="upload-demo"
                           ref="uploadFile" action=""
                           :file-list="uploadFileList"
                           :on-change="handleChange"
                           :auto-upload="false" >
                  <i class="el-icon-upload"></i>
                  <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
                  <!--<button type="button" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
                    <span class="top-tool-btn-txt" >{{$t('webshell.fileSelect')}}</span>
                  </button>-->
                </el-upload>
              </el-col>
            </el-row>
            <el-row style="margin-top: 20px;">
              <el-col :span="3" style="text-align:center;line-height: 24px;">
                <label>{{$t('webshell.filePath')}}</label>
              </el-col>
              <el-col :span="21">
                <el-input v-model="uploadFile.path" size="mini"></el-input>
              </el-col>
            </el-row>
          </div>
          <div slot="footer" class="footer">
            <div class="el-message-box__btns" style="text-align: right;margin-top: 20px;">
              <button  @click="upload"  class="el-button el-button--default el-button--small">
                <span>{{$t('webshell.uploadButtonTitle')}}</span>
              </button>
              <button @click="closeDialog"  class="el-button el-button--default el-button--small" >
                <span>{{$t('overall.cancel')}}</span>
              </button>
            </div>
          </div>
        </div>
      </el-dialog>
      <el-dialog :visible.sync="downloadBox.showDownload" :title="downloadBox.title" :modal-append-to-body='false' :show-close="true" width="500px" @close="closeDownloadDialog" class="nz-dialog" >
        <div>
          <div class="upload-body">
            <el-row style="margin-top: 20px;">
              <el-col :span="3" style="text-align:center;line-height: 24px;">
                <label>{{$t('webshell.filePath')}}</label>
              </el-col>
              <el-col :span="21">
                <el-input v-model="downloadFile.path" size="mini"></el-input>
              </el-col>
            </el-row>
          </div>
          <div slot="footer" class="footer">
            <div class="el-message-box__btns" style="text-align: right;margin-top: 20px;">
              <button @click="download"  class="el-button el-button--default el-button--small">
                <span>{{$t('webshell.downloadButtonTitle')}}</span>
              </button>
              <button  @click="closeDownloadDialog"  class="el-button el-button--default el-button--small">
                <span>{{$t('overall.cancel')}}</span>
              </button>
            </div>
          </div>
        </div>
      </el-dialog>
      <el-dialog :visible.sync="closeConfirmShow"  :modal-append-to-body='false' :show-close="true" width="500px" @close="cancleConfirm" class="nz-dialog" >
        <div >
          <div class="el-message-box__content">
            <div class="el-message-box__container">
              <div class="el-message-box__status el-icon-warning">
              </div>
              <div class="el-message-box__message">
                <p>{{$t('webshell.closeTip')}}</p>
              </div>
            </div>
          </div>
          <div slot="footer" class="footer">
            <div class="el-message-box__btns" style="text-align: unset; padding-left: 50px;">
              <el-checkbox v-model="closeRemember">{{$t('webshell.remember')}}</el-checkbox>
              <button @click="closeShellWindow" type="button" class="el-button el-button--default el-button--small el-button--primary float-right">
                <span>{{$t('tip.yes')}}</span>
              </button>
              <button @click="cancleConfirm" type="button" class="el-button el-button--default el-button--small float-right">
                <span>{{$t('tip.no')}}</span>
              </button>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import Console from './console'
  import uuidv1 from "uuid/v1";
  import axios from 'axios'

  export default {
    name: 'webSSH',
    components: {
      'my-console': Console
    },

    data() {
      let termFontSize=parseInt(localStorage.getItem("termFontSize"));
      return {
        consoleShow:false,
        isFullScreen:false,
        closeConfirmShow:false,
        closeRemember:false,
        initConsoleHeight:300,//只读,初始化高度
        consoleHeight:300,//console高度
        resizeConsoleHeight: 300, //resize后的高度，用于记录最大化、最小化前的高度
        currentTransform:0,
        editableTabsValue: '-1',//当前显示的console
        currentIndex:'-1',
        editableTabs: [ ],
        tabIndex: -1,//添加tab的时候使用
        //upoload-download

        currentUuid:'',
        uploadBox:{showUpload:false,title:this.$t('webshell.uploadTitle')},
        uploadFile: {file: '',path: '',uuid: ''},
        uploadFileList:[],
        uploadResult:null,
        downloadBox:{showDownload:false,title:this.$t('webshell.downloadTitle')},
        downloadFile:{path: '',uuid: ''},
        downloadFileList:[],
        downloadResult:null,
        // 字体大小
        fontSize:termFontSize?termFontSize:15,
      }
    },
    methods: {
      getUuid(){
        let uuid = uuidv1();
        let now = new Date().getTime();
        uuid = uuid+"-"+now+"-"+now;
        this.currentUuid = uuid;
        return uuid;
      },
      addConsole(id,host,accountId,port){
        if(!id){id=''}
        if(!host){host=''}
        if(!accountId){accountId=''}
        if(!port){port=''}
        let uuid = this.getUuid();
        let newTabName = ++this.tabIndex + '';
        let title = host;
        if(port){
          title = title+":"+port;
        }
        if(!title){
          title=this.$t("webshell.shellTitle");
        }
        let width = document.body.clientWidth;//可视宽度
        const console = {
          title:title,
          name:newTabName,
          circleColor:1,//1 grey,2 green, 3 red
          terminal: {
            name:newTabName,
            cols: 225,
            rows: 200,
            width:width,
            height:this.consoleHeight,
            assetId:id,
            accountId:accountId,
            uuid:uuid,
          },
        };
        this.editableTabsValue = newTabName;
        this.editableTabs.push(console);

        setTimeout(function(){
          let tabScroll = document.getElementsByClassName("el-tabs__nav is-top");
          let tabViewWidth = document.getElementsByClassName("el-tabs__nav-scroll");
          let scrollWidth = tabScroll[0].clientWidth;
          let viewWidth = tabViewWidth[0].clientWidth;//可视宽度

          if(viewWidth<scrollWidth){
            tabScroll[0].style.transform = "translateX(" + (viewWidth-scrollWidth) + "px) ";//71(
          }
        },10)

        //this.$store.commit('addConsole');

      },
      show(id,host,accountId,port){
        this.addConsole(id,host,accountId,port);
        this.consoleShow = true;
      },
      initDialog(){

      },

      //可以做最小化的处理，点击窗口外的空白处会调用此方法
      closeConsole(){
        //弹窗询问是否关闭所有链接，关闭窗口？复选框：记住我的选择（用户勾选且选择yes 后，保存到localstorage，之后关闭不再提醒）
        if(this.editableTabs.length<=1){
          this.closeShellWindow();
        }else {
          let remember = localStorage.getItem('close-shell-remember') ? localStorage.getItem('close-shell-remember') : false;
          if(remember){
            this.closeShellWindow();
          }else {
            this.closeConfirmShow = true;
          }
        }
      },
      cancleConfirm(){
        this.closeConfirmShow = false;
      },
      closeShellWindow(){
        if(this.closeRemember){// remember me
          localStorage.setItem('close-shell-remember', this.closeRemember);
        }
        //关闭所有连接
        this.editableTabs.forEach((tab, index) => {
          this.$refs['console' + index][0].closeSocket();
        });
        this.editableTabs = [];
        this.editableTabsValue= '-1',//当前显示的consol
          this.tabIndex = -1

        this.consoleShow = false;
        this.isFullScreen = false;

        let targetDiv= document.getElementById('shell-service');
        targetDiv.style.height=this.initConsoleHeight+'px';
        this.consoleHeight = this.initConsoleHeight;

        this.$store.commit('closeConsole');

        window.removeEventListener('resize',this.windowChange);
        this.closeConfirmShow = false;
      },
      handleClick(){

      },
      refreshTabTitle(connectResult){
          if (this.editableTabs && this.editableTabs.length > 0) {
            this.editableTabs.forEach((tab, index) => {
              if (tab.name === this.editableTabsValue) {
                if(connectResult.title && connectResult.title!=''){
                  tab.title = connectResult.title;
                }
                tab.circleColor = connectResult.color;
              }
            });
          }
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
        this.$store.commit('removeConsole');

        if(this.editableTabs.length<=0){
          this.closeConsole();
        }
      },
      /* 活动标签切换时触发 */
      beforeLeave(currentName,oldName) {
        var self=this;
        //重点，如果name是add，则什么都不触发
        if(currentName=="add"){
          this.addTab()
          return false
        }else{
          //切换tab
          this.$nextTick(() => {
            if (this.editableTabs && this.editableTabs.length > 0) {
              this.editableTabs.forEach((tab, index) => {
                if (tab.name === currentName) {
                  this.$refs['console' + index][0].focusConsole();
                  this.currentUuid = tab.terminal.uuid;
                }
              });
            }
          });
          this.currentIndex=currentName;
        }
      },
      addTab(targetName) {
        this.$store.commit('addConsoleNum');
        this.addConsole();
      },
      handleSelect(key, keyPath) {
        //alert(keyPath);
      },

      /*upload--download  start*/
      closeDialog:function(){
        this.uploadBox.showUpload=false;
        this.uploadResult=null;
        this.uploadFileList=[];
        this.uploadFile={file: '',path: '',uuid: ''};
      },
      closeDownloadDialog(){
        this.downloadBox.showDownload=false;
        this.downloadResult=null;
        this.downloadFileList=[];
        this.downloadFile={path: '',uuid: ''};
      },
      showUploadBox(){
        this.uploadBox.showUpload=true;
      },
      handleChange:function(file,fileList){
        if (fileList.length > 0) {
          this.uploadFileList = [fileList[fileList.length - 1]]
        }
        this.uploadFile.file = this.uploadFileList[0];
      },
      upload() {
          let form = new FormData();
          form.append("uuid", this.currentUuid);
          form.append("file", this.uploadFile.file.raw);
          form.append("path", this.uploadFile.path);
          this.$post('terminal/upload', form,{'Content-Type': 'multipart/form-data'}).then(res => {
            if(res.code ==  200 ){
              this.closeDialog();
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
            }else{
              this.$message.error(res.msg);
            }
          })
      },
      showDownloadBox(){
        this.downloadBox.showDownload=true;
      },
      download(){
        this.downloadFile.uuid = this.currentUuid;
        axios.post('terminal/download',this.downloadFile,{responseType:'blob'}).then(res => {
          let fileName= this.downloadFile.path.substring(this.downloadFile.path.lastIndexOf('/')+1);
          if(window.navigator.msSaveOrOpenBlob){
            // 兼容ie11
            let blobObject = new Blob([res.data]);
            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
          }else{
            let url = URL.createObjectURL(new Blob([res.data]));
            let a = document.createElement('a');
            document.body.appendChild(a); //此处增加了将创建的添加到body当中
            a.href = url;
            a.download = fileName;
            a.target = '_blank';
            a.click();
            a.remove(); //将a标签移除
          }
          this.closeDownloadDialog();
        })
      },
      /*upload--download  end*/
      minScreen(){
        this.consoleShow = false;
        this.$store.commit('minConsole');
      },
      fullScreen(isChange){
        this.resizeConsoleHeight = document.querySelector("#shell-service").offsetHeight; //记录全屏前主列表的高度
        //dialog全屏
        this.isFullScreen = !this.isFullScreen;

        //所有的console全屏
        this.editableTabs.forEach((tab, index) => {
          this.$refs['console'+index][0].fullScreenConsole(this.isFullScreen);
        });

        if(!this.isFullScreen){
          let targetDiv= document.getElementById('shell-service');
          targetDiv.style.height=this.initConsoleHeight+'px';
          this.consoleHeight=this.initConsoleHeight;
        }else {
          let targetDiv= document.getElementById('shell-service');
          targetDiv.style.height=`${100}%`;
          let height = document.body.clientHeight;//可视高度
          this.consoleHeight=height;
        }

        if (this.editableTabs && this.editableTabs.length > 0) {
          this.editableTabs.forEach((tab, index) => {
            if (tab.name === this.editableTabsValue) {
              this.$refs['console' + index][0].focusConsole();
            }
          });
        }
      },
      exitFullScreen() {
        this.isFullScreen = !this.isFullScreen;
        //所有的console全屏
        this.editableTabs.forEach((tab, index) => {
          this.$refs['console'+index][0].fullScreenConsole(this.isFullScreen, this.resizeConsoleHeight-30);
        });

        if(!this.isFullScreen){
          let targetDiv= document.getElementById('shell-service');
          targetDiv.style.height=this.resizeConsoleHeight+'px';
          this.consoleHeight=this.resizeConsoleHeight;
        }else {
          let targetDiv= document.getElementById('shell-service');
          targetDiv.style.height=`${100}%`;
          let height = document.body.clientHeight;//可视高度
          this.consoleHeight=height;
        }

        if (this.editableTabs && this.editableTabs.length > 0) {
          this.editableTabs.forEach((tab, index) => {
            if (tab.name === this.editableTabsValue) {
              this.$refs['console' + index][0].focusConsole();
            }
          });
        }
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
              targetDiv.style.height=20+'px';
            }

            _this.editableTabs.forEach((tab, index) => {
              _this.$refs['console'+index][0].resizeConsole(parseInt(targetDiv.style.height));
            });
          }

          document.onmouseup=function(){
            document.onmousemove=null;
            _this.editableTabs.forEach((tab, index) => {
             // _this.$refs['console'+index][0].resizeServiceConsole(parseInt(targetDiv.style.height));
              _this.$refs['console'+index][0].resizeServiceConsole();
            });

            _this.consoleHeight = parseInt(targetDiv.style.height);
            if(_this.consoleHeight===null || !_this.consoleHeight){_this.consoleHeight = _this.initConsoleHeight;}
          }
        },

        debounce(operate, delay) {
          let time = null
          let timer = null
          let newTime = null
          function task() {
            newTime = +new Date()
            if(newTime - time < delay){
              timer = setTimeout(task, delay)
            }else {
              operate()
              timer = null
            }
            time = newTime
          }
          return function () {
            // 更新时间戳
            time = +new Date()
            if(!timer){
              timer = setTimeout(task, delay)
            }
          }
        },
        windowChange(){
          //alert('winChange');
          if(this.editableTabs&&this.editableTabs.length>0){
            let width = document.body.clientWidth;//可视宽度
            var targetDiv= document.getElementById('shell-service'); //e.target.parentNode.parentNode;.children[0]
            var targetDivHeight=targetDiv.offsetHeight;
            this.editableTabs.forEach((tab, index) => {
              this.$refs['console'+index][0].resize(targetDivHeight,width);
            });
          }
        },
      //改变黑窗口字体大小
      changeFontSize(fontSize){
        // this.$refs['console'+this.index].setFontSize(fontSize);
        this.fontSize=fontSize;
        localStorage.setItem("termFontSize", fontSize);
        this.editableTabs.forEach((tab, index) => {
          this.$refs['console'+index][0].setFontSize(fontSize);
        });
      },
    },
    watch: {
      '$store.state.consoleShow':function(val){
        if(val){
          if(this.$store.state.isAddConsole){
            let id = this.$store.state.consoleParam.id;
            let host = this.$store.state.consoleParam.host;
            let accountId = this.$store.state.consoleParam.accountId;
            let port = this.$store.state.consoleParam.port;
            this.show(id,host,accountId,port);
          }else {
            this.consoleShow = true;
            //min后，从header区域打开，获得焦点
            this.$nextTick(() => {
              if (this.editableTabs && this.editableTabs.length > 0) {
                this.editableTabs.forEach((tab, index) => {
                  if (tab.name === this.editableTabsValue ) {
                    this.$refs['console' + index][0].focusConsole();
                  }
                });
              }
            });
          }
          this.$store.state.consoleShow = false;
        }
      }
    },
    created() {
      //window.addEventListener('resize',this.windowChange);
      window.addEventListener('resize',this.debounce(this.windowChange, 1000),false);
    },
    mounted() {

    },
  }
</script>
<style scoped>

</style>
