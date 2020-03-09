<style scoped>
  .console{
    height:305px;
    padding:5px 5px;
    background-color: black;
  }
</style>
<template>
    <div class="console" :id="'ternimalContainer'+idIndex">
        <div  :id="'terminal'+idIndex"></div>
    </div>
</template>
<script>
import Terminal from '../common/js/Xterm'
export default {
  name: 'console',
  props:{
    terminal:{/*
      cols: 400,
      rows: 400,
      width:'',
      height:'',
      assetId:0,
      accountId:0,
      uuid:'aaadwdwd',*/
    },
    idIndex:{
      type: Number,
      default: 0,
    },
    isFullScreen:{
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      term: null,
      terminalSocket: null,
      termimalRows:15,
      termimalHeight:300,
      fontSize:18,
      obj:{
        id:2
      },
    }
  },
  watch:{
    /*
    token: {
      immediate:true,
      handler(val){
        if(val){
          this.create()
        }
      }
    },
    */
  },
  methods: {
    prompt(term) {
      term.write('\r\n ');//term.write('\r\n~$ ');
    },
    resizeConsole(consoleHeigt){
      //调整终端容器高度
      const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
      consoleBox.style.height = `${consoleHeigt}px`;
      //调整终端高度
      let rows = (consoleHeigt-30)/this.fontSize;
      rows = parseInt(rows);
      this.term.resize(this.term.cols,rows);
    },
    resizeServiceConsole(consoleHeigt){
      const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
      let width = document.body.clientWidth;//可视宽度
      let height = parseInt(consoleBox.style.height);
      if(height==null||!height){height=this.termimalHeight;}
      const winStyle={
        width:width,
        height:height,
        cols:this.term.cols,
        rows:this.term.rows,
      };
      //alert(JSON.stringify(winStyle));
      this.$post('/terminal/resize?',winStyle).then(response => {
        if (response.code === 200) {
          //this.term.fit();
          //this.term.scrollToBottom();
        } else {
          this.$message.error(response.msg);
        }
      });
    },
    fullScreenConsole(isFullScreen){
      this.isFullScreen = isFullScreen;
      //this.term.toggleFullScreen(isFullScreen);//全屏后无法显示顶部菜单和tab
      let height = document.body.clientHeight;//可视高度
      let width = document.body.clientWidth;//可视宽度
      let rows = height/this.fontSize;
      rows = parseInt(rows);
      if(isFullScreen){
        //容器高度设置100%
        const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
        consoleBox.style.height = `${100}%`;
      }else {
        rows = this.termimalRows;
        height = this.termimalHeight;
        //容器高度设置
        const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
        consoleBox.style.height = `${this.termimalHeight}px`;
      }
      this.term.resize(this.term.cols,rows);//this.term.setOption('rows', rows);
      const winStyl={
        width:width,
        height:height,
        cols:this.term.cols,
        rows:parseInt(rows),
      };
      //alert("full="+JSON.stringify(winStyl));
      this.$post('/terminal/resize?',winStyl).then(response => {
        //alert(JSON.stringify(response));
        if (response.code === 200) {
          //this.term.fit();
          //this.term.scrollToBottom();
        } else {
          this.$message.error(response.msg);
        }
      });
      /*
      import 'xterm/dist/addons/fullscreen/fullscreen.css'//如果不成功，请检查路径

import * as fullscreen from 'xterm/lib/addons/fullscreen/fullscreen';
Terminal.applyAddon(fullscreen);  // Apply the `fullscreen` addon

//调用
term.toggleFullScreen();//全屏
term.toggleFullScreen();//正常
term.toggleFullScreen();//全屏
       */

      //----------2
      /*
      window.addEventListener('resize',this.windowChange)

      windowChange(){
        this.term.fit();
        this.term.scrollToBottom();
      }

// 关闭时,取消监听
      websocket.onclose = function(evt) {
        console.log("close", evt);
        window.removeEventListener('resize',this.windowChange)
      }; */
    },
    focusConsole(){
      this.term.focus();
    },
    create(){
      let that = this;
      let rows = this.termimalRows;
      if(this.isFullScreen){
        //容器高度设置100%
        const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
        consoleBox.style.height = `${100}%`;
        let height = document.body.clientHeight;//可视高度
        rows = height/this.fontSize;
        rows = parseInt(rows);
      }else{
        //容器高度设置100%
        const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
        let height = this.terminal.height;//可视高度
        consoleBox.style.height = `${height+5}px`;
        rows = (height-30)/this.fontSize;
        rows = parseInt(rows);
      }
      let terminalContainer = document.getElementById('terminal'+this.idIndex);
      this.term = new Terminal({
        rows:rows,//15行大概300px高，无法设置heigh，只能设置rows
        //cursorBlink:true,//光标闪烁
        cursorStyle:'block', // 光标样式  null | 'block' | 'underline' | 'bar'
        //bellStyle:'sound',
        disableStdin:false,//是否应禁用输入
        //scrollback: 800, //回滚
        //tabStopWidth: 8, //制表宽度
        //screenKeys: true//
        /*
        theme:{
          foreground:'yellow',//字体
          background:'#060101',//背景色
          cursor:'help',//鼠标
        }*/
      });
      this.term.open(terminalContainer);
      //this.term.write("**************"+this.terminal.assetId);
      this.term.focus();
      let token = sessionStorage.getItem('nz-token');
      let baseUrl = this.$axios.defaults.baseURL.replace('http','ws');
      let url = baseUrl+"/terminal.ws?width="+this.terminal.width+"&height="+this.terminal.height+"&cols="+this.terminal.cols+"&rows="+this.terminal.rows+"&token="+token+"&assetId="+this.terminal.assetId+"&accountId="+this.terminal.accountId+"&uuid="+this.terminal.uuid;
      //alert(url);
      this.terminalSocket = new WebSocket(url);

      //连接成功
      this.terminalSocket.onopen = () =>{
        //alert('open');
        //this.term.write("22222*444555*************"+this.terminal.assetId);
      };
      //返回
      this.terminalSocket.onmessage = function(evt) {
       //alert('socketmessage='+evt.data);
        //alert('back='+evt.data);
        //let str = new TextDecoder().decode(evt.data);

        //let str = new TextDecoder().decode(evt.data);
        //this.term.write(evt.data);
        //that.term.write("666622222*444555*************"+evt.data);
      };
      //关闭
      this.terminalSocket.onclose = () =>{
        //alert('closeSocket');
        //this.$emit.closeSocket();
        //????????????报错sorry的，还没来得及看信息就给关闭了？？？？？？？？？？？？？？？？？？？？？？？
        //this.$emit("closeConsole",this.terminal.name);//应该调用父窗口
      };


      //错误
      this.terminalSocket.onerror = (e) =>{
        //alert('error'+e);
      };
      //选中 复制
      this.term.on("selection", function() {
        if (this.term.hasSelection()) {
          //this.copy = this.term.getSelection();
        }
      });
      this.term.attachCustomKeyEventHandler(function(ev) {
        //粘贴 ctrl+v
        //if (ev.keyCode == 86 && ev.ctrlKey) {
          //this.terminalSocket.send(new TextEncoder().encode("\x00" + this.copy));
        //}
      });

      this.term.attach(this.terminalSocket);
      this.term._initialized = true;
      this.term.fit();//自适应大小(使终端的尺寸和几何尺寸适合于终端容器的尺寸) 只是width


      //输入
      /*
      this.term.onData = (data) =>{
        //alert('data:'+data);
      };*/
      //登录后，你输入的内容从后台服务返回容
      this.term.on("data", function(data) {
        //alert("data"+ data.charCodeAt(0)+"==");
         let code = data.charCodeAt(0);
         if(code==13){
           //that.prompt(that.term);
         }else {
           //that.term.write(data);
         }

        //this.terminalSocket.send(new TextEncoder().encode("\x00" + data));

      });
      //this.term.on('key', function(key, ev) {
        //alert("key=========="+key);
        //this.term.write(key)//输入
        //this.term.write("**************"+this.terminal.assetId);
        //term.writeln(key)//输入并换行
      //});

/*
      this.term.prompt = () => {
        this.term.write('\r\n$ ');
      };
      this.term.onKey(e => {
        const printable = !e.domEvent.altKey && !e.domEvent.altGraphKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;

        if (e.domEvent.keyCode === 13) {
          this.prompt(term);
        } else if (e.domEvent.keyCode === 8) {
          // Do not delete the prompt
          if (this.term._core.buffer.x > 2) {
            this.term.write('\b \b');
          }
        } else if (printable) {
          this.term.write(e.key);
        }
      });*/

    },

    closeSocket(){
      if(this.terminalSocket){
        this.terminalSocket.close();
      }
      if(this.term) {
        this.term.destroy();
      }
      //初始化console的高度
      const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
      if(consoleBox){
        consoleBox.style.height = `${this.termimalHeight}px`;
      }
    },
  },
  mounted () {
    this.create();
  },
  created(){

  },
  beforeCreate(){

  },
  beforeDestroy () {
    this.closeSocket();
    //this.terminalSocket.close()
    //this.term.destroy()
  }
}
</script>
