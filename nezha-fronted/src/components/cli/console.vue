<style scoped>
  .console{
    height:270px;
    padding:5px 5px;
    background-color: black;
  }
</style>
<template>
    <div class="console" :id="'ternimalContainer'+idIndex">
        <div  :id="'terminal'+idIndex" ></div>
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
      termimalHeight:270,
      minRow:0,
      fontSize:15,
      fontSpaceHeight:2,//一行高度=fontSize+fontSpaceHeight
      obj:{
        id:2
      },
      successBackContent:'Connecting to',
      failBackContent:'Sorry',
      connectFailContent:'Connection failed',
      welcomeBackContent:'Welcome',
      psdCont:'password: ',
      conFinish:false,
      conSuccessNum:0,
      inputSecret:false,
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
    resize(consoleHeigt,consoleWidth){
      this.resizeConsole(consoleHeigt,consoleWidth);
      this.resizeServiceConsole();
    },
    resizeConsole(consoleHeigt,consoleWidth){
      //调整终端容器高度
      const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
      consoleBox.style.height = `${consoleHeigt}px`;
      //调整终端高度
      let rows = (consoleHeigt-38)/(this.fontSize+this.fontSpaceHeight);
      let cols = this.term.cols;
      if(consoleWidth){//需要调整宽度???
        cols = (consoleWidth-30)/(this.fontSize+this.fontSpaceHeight);
      }
      this.term.resize(parseInt(cols),(parseInt(rows)-this.minRow));
    },
    resizeServiceConsole(){
      const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
      let width = document.body.clientWidth;//可视宽度
      let height = parseInt(consoleBox.style.height);
      if(height==null||!height){height=this.termimalHeight;}
      const winStyle={
        width:width,
        height:height,
        cols:this.term.cols,//cols和rows在resizeConsole方法已经设置
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
      let height = document.body.clientHeight-30;//可视高度
      let width = document.body.clientWidth;//可视宽度
      let rows = height/(this.fontSize+this.fontSpaceHeight);
      rows = parseInt(rows);
      if(isFullScreen){
        //容器高度设置100%
        const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
        consoleBox.style.height = `${height}px`;//减去菜单的高度
      }else {
        //rows = this.termimalRows-this.minRow;
        height = this.termimalHeight;
        //容器高度设置
        const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
        consoleBox.style.height = `${this.termimalHeight+30}px`;
        rows = (height-10)/(this.fontSize+this.fontSpaceHeight);//padding  5*2
        rows = parseInt(rows);
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
        let height = document.body.clientHeight;//高度
        consoleBox.style.height = `${100}%`;
        rows = (height-30)/(this.fontSize+this.fontSpaceHeight);
        rows = parseInt(rows);
      }else{
        //容器高度设置100%
        const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
        let height = this.terminal.height;//可视高度
        consoleBox.style.height = `${height}px`;
        rows = (height-38)/(this.fontSize+this.fontSpaceHeight);//menu 30 ,drag  8
        rows = parseInt(rows);
      }
      let terminalContainer = document.getElementById('terminal'+this.idIndex);
      this.term = new Terminal({
        rows:rows,//15行大概300px高，无法设置heigh，只能设置rows
        //cursorBlink:true,//光标闪烁
        cursorStyle:'block', // 光标样式  null | 'block' | 'underline' | 'bar'
        //bellStyle:'sound',
        disableStdin:false,//是否应禁用输入
        fontSize:this.fontSize,
        //lineHeight:1,
        //fontFamily: 'NotoSans',
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
/*
      alert(this.term.getOption('fontSize'));
      alert(this.term.getOption('lineHeight'));
      alert(this.term.getOption('fontWeight'));
      alert(this.term.getOption('fontFamily'));
*/
      //连接成功
      this.terminalSocket.onopen = () =>{
        //alert('open');
        //this.term.write("22222*444555*************"+this.terminal.assetId);
      };
      //登录后，你输入的内容从后台服务返回
      this.term.on("data", function(data) {
        //alert("data="+data);
        //alert("data"+ data.charCodeAt(0)+"==");
        let code = data.charCodeAt(0);

        if(code==13){
          //that.term.clear();
          //alert("data="+data);
          //that.prompt(that.term);
        }else {
          //that.term.write(data);
        }

        //this.terminalSocket.send(new TextEncoder().encode("\x00" + data));

      });
      //返回
      this.terminalSocket.onmessage = function(evt) {
        //let successBackContent = 'Connecting to';
        let backContent = evt.data;
        //alert(backContent+ backContent.charCodeAt(0)+"==");
        /*
        if(that.inputSecret){//当前为密码输入状态
        }
        if(backContent.length>1){
          let pwdInput = backContent.endsWith(that.psdCont);
          if(pwdInput){//输入密码
            that.inputSecret = true;
          }
        }*/

        let welComIndex = backContent.indexOf(that.welcomeBackContent);
        if(welComIndex>-1){//无服务器信息（只与nezha进行了连接）
          const connectResult = {
            title:'',
            color:1,
          };
          that.$emit("refreshConsoleTitle",connectResult);//1:grey 2 green 3 red
        }else {
            let successContentIndex = backContent.indexOf(that.successBackContent);
            if(successContentIndex>-1 ){
              //that.conFinish = true;
              let startIndex = successContentIndex+that.successBackContent.length+1;
              backContent = backContent.substring(startIndex);
              let endIndex = backContent.indexOf('\r\n');
              let title = backContent.substring(0,endIndex);
              const connectResult = {
                title:title,
                color:2,
              };
              that.$emit("refreshConsoleTitle",connectResult);//1:grey 2 green 3 red
            }else {//失败
              let failContentIndex = backContent.indexOf(that.failBackContent);
              let connectFailIndex = backContent.indexOf(that.connectFailContent);
              if(failContentIndex>-1 ){
                //that.conFinish = true;
                const connectResult = {
                  title:'',
                  color:3,
                };
                that.$emit("refreshConsoleTitle",connectResult);//1:grey 2 green 3 red
              }else if(connectFailIndex>-1){
                let startIndex = successContentIndex+that.successBackContent.length+1;
                backContent = backContent.substring(startIndex);
                let endIndex = backContent.indexOf('\r\n');
                let title = backContent.substring(0,endIndex);
                const connectResult = {
                  title:'',
                  color:3,
                };
                that.$emit("refreshConsoleTitle",connectResult);//1:grey 2 green 3 red
              }
            }
        }
        //alert('socketmessage='+evt.data);
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
        //if (this.term.hasSelection()) {
          //this.copy = this.term.getSelection();
        //}
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
      this.conFinish = false;
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
